import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { createGame, applyCommand, observe, canonicalHash } from '../src/core/game';
import { chooseAction } from '../src/core/ai';
import { serializeGame, deserializeGame, exportReplay, replayGame } from '../src/core/persistence';
import type { Action, Command, GameState } from '../src/core/types';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const positive = (value: string | undefined, fallback: number): number => {
  const n = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new Error('QA上限必須是正整數');
  return n;
};
const count = positive(process.env.PROJECT4X_QA_GAMES, 100);
const firstSeed = positive(process.env.PROJECT4X_QA_START_SEED, 1);
if (!Number.isSafeInteger(firstSeed + count - 1)) throw new Error('QA種子範圍超出安全整數');
const seedRange = { first: firstSeed, last: firstSeed + count - 1 };
const maxTurns = positive(process.env.PROJECT4X_QA_MAX_TURNS, 800);
const maxCommands = positive(process.env.PROJECT4X_QA_MAX_COMMANDS, 40000);
const reportPath = resolve(process.env.PROJECT4X_QA_OUTPUT ?? resolve(root, '證據/headless.json'));
const methodFingerprint = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex');
const sourcePaths = ['src/core/types.ts', 'src/core/game.ts', 'src/core/ai.ts', 'src/core/persistence.ts', 'package-lock.json'];
const fingerprints = () => Object.fromEntries(sourcePaths.map(path => [path, createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')]));
const sourceStart = fingerprints();
const started = performance.now();
const branchNames = ['Move', 'Attack', 'Capture', 'Recruit', 'Research', 'ResolveRelic', 'EstablishCapital', 'EndTurn'] as const;
const metrics = () => ({ actions: Object.fromEntries(branchNames.map(x => [x, 0])) as Record<Action['type'], number>, relicGold: 0, relicIntel: 0, exileEntries: 0, centersEstablished: 0, eliminations: 0, maxUnits: 4 });
type Metrics = ReturnType<typeof metrics>;
function updateMetric(m: Metrics, before: GameState, after: GameState, action: Action): void {
  m.actions[action.type]++;
  if (action.type === 'ResolveRelic') action.choice === 'gold' ? m.relicGold++ : m.relicIntel++;
  if (action.type === 'EstablishCapital') m.centersEstablished++;
  m.maxUnits = Math.max(m.maxUnits, after.units.length);
  for (const f of after.factions) {
    if (f.life === 'exiled' && before.factions[f.id].life !== 'exiled') m.exileEntries++;
    if (f.life === 'eliminated' && before.factions[f.id].life !== 'eliminated') m.eliminations++;
  }
}
function submit(s: GameState, action: Action, prefix: string): GameState {
  const result = applyCommand(s, { actor: s.active, expectedVersion: s.version, requestId: `${prefix}-${s.version}`, action });
  assert.equal(result.ok, true, result.error ?? '合法fixture指令被拒絕');
  return result.state;
}
function fixtures() {
  const rows: Array<Record<string, unknown>> = [];
  let s = createGame('QA-fixture-立即遺跡');
  s = submit(s, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } }, 'fixture-relic');
  assert.ok(s.pendingRelic);
  const view = observe(s, s.active);
  const choice = chooseAction(view);
  assert.ok(choice && choice.type === 'ResolveRelic');
  const before = s;
  s = submit(s, choice, 'fixture-relic');
  assert.equal(s.relics[0].resolved, true);
  assert.equal(s.pendingRelic, null);
  assert.deepEqual(deserializeGame(serializeGame(s)), s);
  rows.push({ id: 'AI-立即遺跡', status: 'PASS', seed: s.seed, action: choice, hash: canonicalHash(s), observationOnly: true, savedContinuation: true, gainGold: s.factions[0].gold - before.factions[0].gold });

  s = createGame('QA-fixture-流亡與建都');
  s.terrain.fill('plain'); s.relics = [];
  const old = s.sites.find(site => site.id === s.factions[0].originalCapitalId)!;
  const village = s.sites.find(site => site.kind === 'village')!;
  old.owner = 1; village.owner = 0; village.heldSince = 0;
  s.factions[0].centerId = null; s.factions[0].life = 'exiled'; s.factions[0].gold = 0;
  s = submit(s, { type: 'EndTurn' }, 'fixture-exile');
  s = submit(s, { type: 'EndTurn' }, 'fixture-exile');
  assert.equal(s.winner, null);
  assert.equal(s.factions[0].life, 'exiled');
  s.units.filter(u => u.owner === 0).forEach(u => { u.moved = true; u.acted = true; });
  const flags = structuredClone(s.units), gold = s.factions[0].gold;
  const action = chooseAction(observe(s, 0));
  assert.ok(action && action.type === 'EstablishCapital');
  s = submit(s, action, 'fixture-exile');
  assert.equal(s.factions[0].centerId, village.id);
  assert.equal(s.factions[0].life, 'active');
  assert.equal(s.factions[0].gold, gold);
  assert.equal(s.sites.find(site => site.id === old.id)!.owner, 1);
  assert.deepEqual(s.units, flags);
  rows.push({ id: 'AI-流亡主動建中心', status: 'PASS', setup: 'controlled fixture, not generated-match completion or persistence provenance', observationOnly: true, action, preservesFlags: true, originalCapitalRestored: false });
  return rows;
}

function runMatch(number: number): Record<string, unknown> {
  const seed = `獨立QA-${String(number).padStart(3, '0')}`;
  let s = createGame(seed);
  const m = metrics();
  let failure: string | null = null;
  let commands = 0;
  let observeMs = 0, aiMs = 0, applyMs = 0;
  const gameStart = performance.now();
  try {
    while (s.winner === null && s.turn <= maxTurns && commands < maxCommands) {
      let clock = performance.now();
      const view = observe(s, s.active);
      observeMs += performance.now() - clock;
      clock = performance.now();
      const action = chooseAction(view);
      aiMs += performance.now() - clock;
      if (!action) throw new Error('ongoing遊戲的AI沒有回傳行動');
      const cmd: Command = { actor: s.active, expectedVersion: s.version, requestId: `headless-${number}-${commands}`, action };
      clock = performance.now();
      const result = applyCommand(s, cmd);
      applyMs += performance.now() - clock;
      if (!result.ok) throw new Error(`AI送出非法指令：${result.error}; ${JSON.stringify(cmd)}`);
      if (result.state.version !== s.version + 1) throw new Error('成功指令未推進一個版本');
      updateMetric(m, s, result.state, action);
      s = result.state; commands++;
      if (commands % 100 === 0) {
        const progress = { status: 'RUNNING_NOT_PASS', seed, turn: s.turn, commands, units: s.units.length, observeMs: Math.round(observeMs), aiMs: Math.round(aiMs), applyMs: Math.round(applyMs), metrics: m, limits: { maxTurns, maxCommands, harnessOnly: true } };
        parentPort?.postMessage({ type: 'progress', number, progress });
      }
    }
    if (s.winner === null) failure = s.turn > maxTurns ? 'HARNESS_TURN_LIMIT_NOT_A_DRAW_OR_VICTORY' : 'HARNESS_COMMAND_LIMIT_NOT_A_DRAW_OR_VICTORY';
    if (s.winner !== null && number % 10 === 0) {
      assert.deepEqual(deserializeGame(serializeGame(s)), s);
      assert.deepEqual(replayGame(exportReplay(s)), s);
    }
  } catch (e) { failure = e instanceof Error ? e.stack ?? e.message : String(e); }
  const row = { seed, status: failure ? 'FAIL' : 'COMPLETE', winner: s.winner, turns: s.turn, fullRounds: Math.floor((s.turn - 1) / 2), commands, hash: canonicalHash(s), milliseconds: Math.round(performance.now() - gameStart), metrics: m, timing: { observeMs: Math.round(observeMs), aiMs: Math.round(aiMs), applyMs: Math.round(applyMs) }, terminalSaveReplayChecked: s.winner !== null && number % 10 === 0 && !failure, finalLife: s.factions.map(f => f.life), failure, ...(failure ? { lastCommands: s.history.slice(-20), units: s.units, sites: s.sites } : {}) };
  return row;
}

if (!isMainThread) {
  if ((workerData as { injectFailure?: boolean }).injectFailure) throw new Error('QA_TEST_INJECTED_WORKER_FAILURE');
  for (const number of (workerData as { numbers: number[] }).numbers) {
    parentPort!.postMessage({ type: 'complete', number, row: runMatch(number) });
  }
} else {
  const workers = Math.min(count, positive(process.env.PROJECT4X_QA_WORKERS, 4));
  const collected = new Map<number, Record<string, unknown>>();
  const progressBySeed = new Map<number, Record<string, unknown>>();
  const aggregate = metrics();
  let fixtureResults: Array<Record<string, unknown>> = [];
  let fixtureFailure: string | null = null;
  try { fixtureResults = fixtures(); } catch (e) { fixtureFailure = e instanceof Error ? e.stack ?? e.message : String(e); }
  const settled = await Promise.allSettled(Array.from({ length: workers }, (_, index) => new Promise<void>((resolveWorker, rejectWorker) => {
      const numbers = Array.from({ length: count }, (_, i) => firstSeed + i).filter(n => (n - firstSeed) % workers === index);
      const worker = new Worker(new URL(import.meta.url), { workerData: { numbers, injectFailure: process.env.PROJECT4X_QA_TEST_WORKER_FAILURE === '1' && index === 0 } });
      let workerError: Error | null = null;
      worker.on('message', (message: { type: 'progress' | 'complete'; number: number; progress?: Record<string, unknown>; row?: Record<string, unknown> }) => {
        if (message.type === 'complete') {
          const row = message.row!;
          collected.set(message.number, row);
          progressBySeed.delete(message.number);
          console.log(`${collected.size}/${count} ${row.seed} ${row.status} turns=${row.turns} commands=${row.commands} winner=${row.winner} ${row.milliseconds}ms`);
        } else progressBySeed.set(message.number, message.progress!);
        writeFileSync(reportPath, JSON.stringify({ status: 'RUNNING_NOT_PASS', methodFingerprint, sourceStart, seedRange, requestedGames: count, finishedGames: collected.size, completedGames: [...collected.values()].filter(g => g.status === 'COMPLETE').length, workers, progress: [...progressBySeed.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p), results: [...collected.entries()].sort((a,b) => a[0]-b[0]).map(([,row]) => row) }, null, 2) + '\n');
      });
      worker.once('error', error => { workerError = error instanceof Error ? error : new Error(String(error)); });
      worker.once('exit', code => workerError ? rejectWorker(workerError) : code === 0 ? resolveWorker() : rejectWorker(new Error(`headless worker ${index + 1} exit ${code}`)));
    })));
  const errors = settled.flatMap((result, index) => result.status === 'rejected' ? [`worker ${index + 1}: ${result.reason instanceof Error ? result.reason.stack ?? result.reason.message : String(result.reason)}`] : []);
  const workerFailure = errors.length ? errors.join('\n') : null;
  const games = [...collected.entries()].sort((a,b) => a[0]-b[0]).map(([,row]) => row);
  for (const game of games) {
    const m = game.metrics as Metrics;
    for (const name of branchNames) aggregate.actions[name] += m.actions[name];
    for (const key of ['relicGold', 'relicIntel', 'exileEntries', 'centersEstablished', 'eliminations'] as const) aggregate[key] += m[key];
    aggregate.maxUnits = Math.max(aggregate.maxUnits, m.maxUnits);
  }
  const completed = games.filter(g => g.status === 'COMPLETE').length;
  const sourceEnd = fingerprints();
  const sourceUnchanged = JSON.stringify(sourceStart) === JSON.stringify(sourceEnd);
  const methodEnd = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex');
  const methodUnchanged = methodFingerprint === methodEnd;
  const report = { schema: 'project4x-qa-headless-1', generatedAt: new Date().toISOString(), status: completed === count && !fixtureFailure && !workerFailure && sourceUnchanged && methodUnchanged ? count === 100 && firstSeed === 1 ? 'PASS' : 'PARTIAL' : 'FAIL', ruleset: 'g1-ccts-1', node: process.version, seedRange, requestedGames: count, finishedGames: games.length, completedGames: completed, failedGames: games.filter(g => g.status === 'FAIL').length, unfinishedGames: count - games.length, workers, integrationOrder: 'independent snapshots, final report sorted by fixed seed number', milliseconds: Math.round(performance.now() - started), inputBoundary: 'chooseAction receives only observe(state, active); command always goes through applyCommand', limits: { maxTurns, maxCommands, harnessOnly: true, noGameClockOrSyntheticWinner: true }, methodFingerprint, methodEnd, methodUnchanged, invocation: { execPath: process.execPath, execArgv: process.execArgv, argv: process.argv, env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('PROJECT4X_QA_'))) }, sourceStart, sourceEnd, sourceUnchanged, metrics: aggregate, fixtures: fixtureResults, fixtureFailure, workerFailure, games, humanPlayability: 'NOT_VERIFIED', physicalMobile: 'NOT_VERIFIED', diagnosticsScope: 'local private; failure payloads include authoritative world data' };
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, completedGames: completed, failedGames: report.failedGames, milliseconds: report.milliseconds, metrics: aggregate }));
  if (report.status === 'FAIL') process.exitCode = 1;
}
