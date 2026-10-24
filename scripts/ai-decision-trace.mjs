// Private QA only. Instrument a temporary policy copy, then compare EVERY
// decision with the real policy. This is never a second gameplay engine.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, openSync, writeSync, closeSync, realpathSync } from 'node:fs';
import { dirname, basename, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createGame, observe, applyCommand } from '../src/core/game.ts';
import { chooseAction } from '../src/core/ai.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = process.argv[2];
assert.ok(output && isAbsolute(output), '需明確指定專案外、尚不存在的私有輸出絕對路徑');
const outside = relative(realpathSync(root), resolve(realpathSync(dirname(output)), basename(output)));
assert.ok(outside === '..' || outside.startsWith('../'), '完整 trace 不得輸出到公開專案內');
mkdirSync(output, { mode: 0o700 }); // exclusive: preserve previous evidence
const policyPath = resolve(root, 'src/core/ai.ts');
const hash = () => createHash('sha256').update(readFileSync(policyPath)).digest('hex');
const source = readFileSync(policyPath, 'utf8'), sourceStart = hash();
const replaceOnce = (s, marker, replacement) => {
  assert.equal(s.split(marker).length, 2, `診斷 seam 已改變：${marker}`);
  return s.replace(marker, replacement);
};
let instrumented = source.replaceAll("'./types'", JSON.stringify(resolve(root, 'src/core/types.ts')));
instrumented = replaceOnce(instrumented, 'export function chooseAction(view: Observation): Action | null {', `export function chooseActionTraced(view: Observation): any {
  const trace: any = { attacks: [], moves: [] };
  const finish = (action: Action | null) => ({ action: action && structuredClone(action), trace });`);
instrumented = replaceOnce(instrumented, 'if (!legal.length) return null;', 'if (!legal.length) return finish(null);');
assert.ok(instrumented.includes('return copyAction('));
instrumented = instrumented.replaceAll('return copyAction(', 'return finish(');
instrumented = replaceOnce(instrumented, '    if (score(attacks[0]) >= 0)', `    trace.reserved = [...reserved]; trace.siegeTargets = [...siegeTargets];
    trace.attacks = attacks.map(a => ({ action: a, score: score(a), damage: damageFor(a) }));
    if (score(attacks[0]) >= 0)`);
instrumented = replaceOnce(instrumented, '    // Keep real obstacle detours', `    trace.moves = movable.map(a => {
      const unit = owned.find(u => u.id === a.unitId)!, goal = unitGoals.get(unit.id);
      const terrain = goal && terrainDistances.get(goal.sources);
      const start = unit.y * view.width + unit.x, end = a.to.y * view.width + a.to.x;
      return { action: a, score: scores.get(a), forward: forward.includes(a),
        target: goal && { tile: goal.tile, purpose: goal.purpose, weight: goal.weight,
          trafficStart: goal.distances[start], trafficEnd: goal.distances[end],
          terrainStart: terrain?.[start], terrainEnd: terrain?.[end] } };
    });
    // Keep real obstacle detours`);
const privateWrite = (name, value) => writeFileSync(resolve(output, name), value, { mode: 0o600, flag: 'wx' });
privateWrite('ai-traced.ts', instrumented);
const { chooseActionTraced } = await import(pathToFileURL(resolve(output, 'ai-traced.ts')).href);
const log = openSync(resolve(output, 'decisions.jsonl'), 'wx', 0o600);
const started = performance.now();
const seed = '獨立QA-010', maxTurns = 100, maxCommands = 4000;
let state = createGame(seed), commands = 0;
const actions = {}, captures = [], unusedAttackTurns = [];
const encode = value => JSON.stringify(value, (_key, v) => typeof v === 'number' && !Number.isFinite(v) ? String(v) : v);
try {
  while (state.turn <= maxTurns && state.winner === null && commands < maxCommands) {
    assert.ok(performance.now() - started < 60_000, '診斷超時：不能視為終局');
    const view = observe(state, state.active), before = structuredClone(view);
    const { action, trace } = chooseActionTraced(view);
    assert.deepEqual(view, before, '診斷 policy 不可改寫觀測');
    assert.deepEqual(action, chooseAction(view), '診斷輸出與正式 policy 不同');
    assert.ok(action);
    const own = view.units.filter(u => u.owner === view.actor);
    const enemies = view.units.filter(u => u.owner !== view.actor);
    const sites = view.tiles.filter(t => t.site);
    const enemySites = sites.filter(t => t.site.owner !== undefined && t.site.owner !== null && t.site.owner !== view.actor);
    const selectedMove = trace.moves.find(m => JSON.stringify(m.action) === JSON.stringify(action));
    const target = action.type === 'Attack' && enemies.find(u => u.id === action.targetId);
    const targetCategory = selectedMove?.target?.purpose ?? (target ?
      (enemySites.some(t => t.x === target.x && t.y === target.y) ? 'siege' : 'visible-enemy') : action.type);
    writeSync(log, encode({ command: commands, turn: view.turn, actor: view.actor,
      observation: view, summary: { ownUnits: own.length, ownSites: sites.filter(t => t.site.owner === view.actor).length,
        knownEnemies: enemies.length, knownEnemySites: enemySites.length,
        unknown: view.tiles.filter(t => t.visibility === 'unknown').length },
      legalActionCount: view.legalActions.length, candidates: view.legalActions,
      selected: action, targetCategory, evaluated: trace, unscoredMeaning: 'branch not evaluated, not zero score',
      knownEnemySites: enemySites, knownEnemyUnits: enemies, ownUnits: own,
      ownSites: sites.filter(t => t.site.owner === view.actor),
      recruitmentOpportunity: view.legalActions.filter(a => a.type === 'Recruit'),
      captureOpportunity: view.legalActions.filter(a => a.type === 'Capture'),
      blockedPathIndications: trace.moves.filter(m => !m.target || m.target.trafficStart > m.target.terrainStart).map(m => m.action),
    }) + '\n');
    actions[action.type] = (actions[action.type] ?? 0) + 1;
    if (action.type === 'Capture') captures.push({ command: commands, turn: view.turn, actor: view.actor });
    if (action.type === 'EndTurn' && view.legalActions.some(a => a.type === 'Attack')) unusedAttackTurns.push(view.turn);
    const result = applyCommand(state, { actor: state.active, expectedVersion: state.version, requestId: `headless-10-${commands}`, action });
    assert.equal(result.ok, true, result.error ?? '合法行動遭拒絕');
    assert.equal(result.state.version, state.version + 1);
    state = result.state; commands++;
  }
} finally { closeSync(log); }
assert.equal(hash(), sourceStart, '執行中 policy source 不可變');
const summary = { schema: 'project4x-private-ai-trace-1', sourceStart, sourceEnd: hash(), seed,
  inputBoundary: 'same actor Observation only; no canonical/history supplied to policy',
  maxTurns, maxCommands, commands, turn: state.turn, winner: state.winner, actions, captures, unusedAttackTurns,
  milliseconds: Math.round(performance.now() - started), decisionParity: true,
  scope: 'bounded diagnostic, not a completion or playability gate' };
privateWrite('summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary));
