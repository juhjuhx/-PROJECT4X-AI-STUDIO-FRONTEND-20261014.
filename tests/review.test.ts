import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createGame, applyCommand, observe, canonicalHash } from '../src/core/game';
import { serializeGame, deserializeGame, exportReplay, replayGame } from '../src/core/persistence';
import { chooseAction } from '../src/core/ai';
import type { Action, Actor, Command, GameState } from '../src/core/types';

// Independent contract oracles: do not reproduce reducer branches.
function command(s: GameState, action: Action, requestId = `review-${s.version}`): Command {
  return { actor: s.active, expectedVersion: s.version, requestId, action };
}
function play(s: GameState, action: Action): GameState {
  const result = applyCommand(s, command(s, action));
  assert.equal(result.ok, true, result.error ?? '合法命令遭拒絕');
  return result.state;
}
function rejectedWithoutEffect(s: GameState, raw: unknown): void {
  const before = structuredClone(s);
  const result = applyCommand(s, raw as Command);
  assert.equal(result.ok, false);
  assert.strictEqual(result.state, s);
  assert.deepEqual(s, before, 'rejection must preserve all state, protocol ledger and knowledge');
  assert.deepEqual(result.events, []);
}
function fixture(seed: string): GameState {
  const s = createGame(seed);
  s.terrain.fill('plain');
  s.relics = [];
  return s;
}

test('獨立協定：格式／權限／版本／越界拒絕，含完整ledger而非只比hash', () => {
  const s = createGame('QA-協定');
  const good = command(s, { type: 'EndTurn' }, '__proto__');
  for (const raw of [null, {}, { ...good, actor: 2 }, { ...good, actor: 1 },
    { ...good, expectedVersion: -1 }, { ...good, expectedVersion: 1 },
    { ...good, requestId: '' }, { ...good, injected: true },
    { ...good, action: { type: 'Move', unitId: '兵-0', to: { x: 100, y: 3 } } },
    { ...good, action: { type: 'Move', unitId: '兵-0', to: { x: 3.5, y: 3 } } },
    { ...good, action: { type: 'Research', tech: '免費科技' } }]) rejectedWithoutEffect(s, raw);
  const accepted = applyCommand(s, good);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.state.version, 1);
  const retry = applyCommand(accepted.state, good);
  assert.equal(retry.ok, true);
  assert.strictEqual(retry.state, accepted.state);
  assert.equal(retry.state.history.length, 1);
  rejectedWithoutEffect(accepted.state, { ...good, expectedVersion: 1, actor: 1 });
  rejectedWithoutEffect(accepted.state, { ...good, action: { type: 'Research', tech: 'farm' } });
});

test('獨立fog：遠方敵軍移位／科技／金幣改變不影響玩家payload；observations無可寫共享引用', () => {
  const a = createGame('QA-迷霧');
  const b = structuredClone(a);
  b.units.find(u => u.owner === 1)!.x = 18;
  b.factions[1].gold = 999;
  b.factions[1].techs = ['archery'];
  assert.deepEqual(observe(a, 0), observe(b, 0));
  const view = observe(a, 0);
  view.tiles[0].terrain = 'water';
  view.legalActions.length = 0;
  view.faction.techs.push('farm');
  assert.deepEqual(a, createGame('QA-迷霧'));
});

test('獨立情報：0格只能選金幣；1/2/3格情報不增加surveyed或附敵軍／據點', () => {
  for (const remaining of [0, 1, 2, 3]) {
    let s = createGame(`QA-情報-${remaining}`);
    s = play(s, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } });
    assert.ok(s.pendingRelic);
    s.explored[0].fill(true);
    const points = [{ x: 20, y: 20 }, { x: 20, y: 19 }, { x: 19, y: 19 }].slice(0, remaining);
    for (const p of points) { s.explored[0][p.y * s.width + p.x] = false; s.surveyed[0][p.y * s.width + p.x] = false; }
    const beforeSurvey = [...s.surveyed[0]];
    assert.equal(observe(s, 0).pendingRelic!.intelCount, remaining);
    rejectedWithoutEffect(s, command(s, { type: 'EndTurn' }, '立即選擇不可跳過'));
    if (!remaining) {
      rejectedWithoutEffect(s, command(s, { type: 'ResolveRelic', choice: 'intel' }, '沒有未知情報'));
      const gold = s.factions[0].gold;
      s = play(s, { type: 'ResolveRelic', choice: 'gold' });
      assert.equal(s.factions[0].gold, gold + 4);
    } else {
      s = play(s, { type: 'ResolveRelic', choice: 'intel' });
      assert.deepEqual(s.surveyed[0], beforeSurvey);
      const view = observe(s, 0);
      for (const p of points) {
        const tile = view.tiles[p.y * s.width + p.x];
        assert.equal(tile.visibility, 'explored');
        assert.notEqual(tile.terrain, null);
        assert.equal(tile.site, null);
        assert.equal(tile.relic, null);
      }
      assert.ok(view.units.every(u => u.owner === 0));
    }
    assert.equal(s.pendingRelic, null);
    rejectedWithoutEffect(s, command(s, { type: 'ResolveRelic', choice: 'gold' }, '禁止重領'));
  }
});

test('獨立流亡：零單位但仍有據點不淘汰、零金仍續玩且可招募', () => {
  let s = fixture('QA-流亡據點');
  s.units = [s.units.find(u => u.owner === 0)!];
  s.factions[1].gold = 0;
  const village = s.sites.find(site => site.kind === 'village')!;
  village.owner = 1;
  const old = s.sites.find(site => site.id === s.factions[1].centerId)!;
  s.units[0].x = old.x; s.units[0].y = old.y;
  s = play(s, { type: 'Capture', unitId: s.units[0].id });
  assert.equal(s.factions[1].life, 'exiled');
  assert.equal(s.winner, null);
  assert.equal(s.factions[1].gold, 0);
  s = play(s, { type: 'EndTurn' });
  s = play(s, { type: 'EndTurn' });
  s = play(s, { type: 'EndTurn' });
  assert.equal(s.factions[1].gold, 2);
  assert.equal(s.winner, null);
  s = play(s, { type: 'EndTurn' });
  s = play(s, { type: 'EndTurn' });
  assert.equal(s.factions[1].gold, 4);
  assert.ok(observe(s, 1).legalActions.some(a => a.type === 'Recruit' && a.siteId === village.id));
});

test('獨立重建：跨完整敵方回合才能免費主動建中心，不復辟／重置旗標或招募', () => {
  let s = fixture('QA-另建中心');
  const ownedVillage = s.sites.find(site => site.kind === 'village')!;
  ownedVillage.owner = 0;
  ownedVillage.heldSince = 0;
  ownedVillage.recruited = true;
  const f = s.factions[0], old = s.sites.find(site => site.id === f.originalCapitalId)!;
  old.owner = 1; f.life = 'exiled'; f.centerId = null; f.gold = 0;
  s.units.filter(u => u.owner === 0).forEach(u => { u.moved = true; u.acted = true; });
  rejectedWithoutEffect(s, command(s, { type: 'EstablishCapital', siteId: ownedVillage.id }, '未跨敵回合'));
  s = play(s, { type: 'EndTurn' });
  s = play(s, { type: 'EndTurn' });
  s.units.filter(u => u.owner === 0).forEach(u => { u.moved = true; u.acted = true; });
  s.sites.find(site => site.id === ownedVillage.id)!.recruited = true;
  const before = structuredClone(s);
  s = play(s, { type: 'EstablishCapital', siteId: ownedVillage.id });
  assert.equal(s.factions[0].life, 'active');
  assert.equal(s.factions[0].centerId, ownedVillage.id);
  assert.equal(s.sites.find(site => site.id === old.id)!.owner, 1);
  assert.equal(s.factions[0].gold, before.factions[0].gold);
  assert.equal(s.factions[0].identityId, before.factions[0].identityId);
  assert.equal(s.factions[0].lineageId, before.factions[0].lineageId);
  assert.deepEqual(s.units, before.units);
  assert.deepEqual(s.sites, before.sites);
  rejectedWithoutEffect(s, command(s, { type: 'EstablishCapital', siteId: old.id }, '不能暗恢復故土'));
});

test('獨立淘汰：單位和據點都零才terminal；全玩法命令拒絕', () => {
  let s = fixture('QA-最後存續');
  s.units = [s.units.find(u => u.owner === 0)!, { ...s.units.find(u => u.owner === 1)!, x: 4, y: 3, hp: 1 }];
  s.sites.forEach(site => { if (site.owner === 1) site.owner = 0; });
  s.factions[1].life = 'exiled'; s.factions[1].centerId = null;
  s = play(s, { type: 'Attack', unitId: s.units[0].id, targetId: s.units[1].id });
  assert.equal(s.factions[1].life, 'eliminated');
  assert.equal(s.winner, 0);
  for (const action of [{ type: 'EndTurn' }, { type: 'Research', tech: 'farm' },
    { type: 'ResolveRelic', choice: 'gold' }, { type: 'Move', unitId: s.units[0].id, to: { x: 3, y: 4 } }] as Action[]) rejectedWithoutEffect(s, command(s, action));
  assert.equal(observe(s, 0).legalActions.length, 0);
  assert.equal(chooseAction(observe(s, 0)), null);
});

test('獨立保存：拒絕語意錯誤、版本錯誤、snapshot/log錯配，保留原輸入局', () => {
  const s = createGame('QA-保存負例');
  const encoded = serializeGame(s);
  const dto = JSON.parse(encoded) as Record<string, unknown>;
  // Locate the actual state section without assuming a DTO nesting choice.
  const candidate = Object.values(dto).find(v => v && typeof v === 'object' && 'units' in v) as GameState | undefined;
  const statePath = candidate ? Object.keys(dto).find(k => dto[k] === candidate)! : null;
  const mutations: Array<(x: GameState) => void> = [
    x => { x.units[1].x = x.units[0].x; x.units[1].y = x.units[0].y; },
    x => { x.units[0].hp = 11; },
    x => { x.units[0].owner = 2 as Actor; },
    x => { x.factions[0].centerId = '不存在'; },
    x => { x.units[0].x = 24; },
    x => { x.factions[0].gold = -1; },
    x => { x.schema = 'project4x-save-0' as GameState['schema']; },
    x => { x.ruleset = 'g1-capital-instant' as GameState['ruleset']; },
  ];
  for (const mutate of mutations) {
    const raw = JSON.parse(encoded) as Record<string, unknown>;
    mutate((statePath ? raw[statePath] : raw) as unknown as GameState);
    assert.throws(() => deserializeGame(JSON.stringify(raw)));
    assert.deepEqual(s, createGame('QA-保存負例'));
  }
  const evolved = play(s, { type: 'EndTurn' });
  const mixed = JSON.parse(serializeGame(evolved)) as Record<string, unknown>;
  const mixedState = (statePath ? mixed[statePath] : mixed) as unknown as GameState;
  mixedState.history = [];
  mixedState.requests = {};
  assert.throws(() => deserializeGame(JSON.stringify(mixed)));
});

test('獨立續局：移動／必答遺跡保存後相同後綴，request重送與replay一致', () => {
  const initial = createGame('QA-保存續局');
  const move = command(initial, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } }, 'saved-command');
  let direct = applyCommand(initial, move).state;
  let loaded = deserializeGame(serializeGame(direct));
  assert.deepEqual(loaded, direct);
  assert.ok(loaded.pendingRelic);
  assert.strictEqual(applyCommand(loaded, move).state, loaded);
  const suffix: Action[] = [{ type: 'ResolveRelic', choice: 'intel' }, { type: 'Research', tech: 'farm' }, { type: 'EndTurn' }, { type: 'EndTurn' }];
  for (const action of suffix) {
    direct = play(direct, action);
    loaded = play(loaded, action);
    assert.deepEqual(loaded, direct);
    assert.equal(canonicalHash(loaded), canonicalHash(direct));
  }
  assert.deepEqual(replayGame(exportReplay(direct)), direct);
  assert.equal(direct.factions[0].gold, 6, '8 - farm5 + one owned-site income3');
});

test('獨立動態fog：最後視野來源死亡後只留靜態記憶，不跟蹤敵軍', () => {
  let s = fixture('QA-視野撤回');
  s.units = [
    { ...s.units[0], x: 6, y: 5 },
    { ...s.units[3], x: 5, y: 5, hp: 3 },
  ];
  s = play(s, { type: 'EndTurn' });
  s = play(s, { type: 'EndTurn' });
  const before = observe(s, 1);
  assert.ok(before.units.some(u => u.owner === 0));
  assert.equal(before.tiles[5 * s.width + 6].visibility, 'visible');
  s = play(s, { type: 'Attack', unitId: '兵-0', targetId: '兵-3' });
  const after = observe(s, 1);
  assert.equal(after.tiles[5 * s.width + 6].visibility, 'explored');
  assert.equal(after.tiles[5 * s.width + 6].terrain, 'plain');
  assert.ok(after.units.every(u => u.owner === 1));
  assert.ok(before.units.some(u => u.owner === 0), '合法歷史快照不被更新後資料覆寫');
});

test('獨立hash：合法移動旗標／玩家知識／政治中心差異必須改變遊戲hash', () => {
  const s = createGame('QA-hash敏感度');
  const moved = structuredClone(s); moved.units[0].moved = true;
  assert.notEqual(canonicalHash(s), canonicalHash(moved));
  const knowledge = structuredClone(s); knowledge.explored[0][0] = true;
  assert.notEqual(canonicalHash(s), canonicalHash(knowledge));
  const exiled = structuredClone(s); exiled.factions[0].life = 'exiled'; exiled.factions[0].centerId = null; exiled.sites[0].owner = 1;
  assert.notEqual(canonicalHash(s), canonicalHash(exiled));
});

test('獨立replay：拒絕錯actor、重複request、snapshot/log不一致，proto請求正常roundtrip', () => {
  const s = createGame('QA-replay負例');
  const cmd = command(s, { type: 'EndTurn' }, '__proto__');
  const next = applyCommand(s, cmd).state;
  assert.deepEqual(deserializeGame(serializeGame(next)), next);
  const raw = JSON.parse(exportReplay(next));
  const wrongActor = structuredClone(raw); wrongActor.commands[0].actor = 1;
  assert.throws(() => replayGame(JSON.stringify(wrongActor)));
  const duplicate = structuredClone(raw); duplicate.commands.push({ ...cmd, expectedVersion: 1, actor: 1 });
  assert.throws(() => replayGame(JSON.stringify(duplicate)));
  const wrongHash = structuredClone(raw); wrongHash.hash = '0000000000000000';
  assert.throws(() => replayGame(JSON.stringify(wrongHash)));
});

test('獨立AI整合：射手清空守軍後，保留鄰城新鮮步兵同回合進格佔領', () => {
  let s = fixture('QA-AI佔城窗口');
  s.factions[0].techs = ['archery'];
  s.units = [
    { id: '兵-0', owner: 0, kind: 'infantry', x: 19, y: 20, hp: 10, moved: false, acted: false },
    { id: '兵-4', owner: 0, kind: 'archer', x: 20, y: 18, hp: 7, moved: false, acted: false },
    { id: '兵-2', owner: 1, kind: 'infantry', x: 20, y: 20, hp: 1, moved: false, acted: false },
    { id: '兵-3', owner: 1, kind: 'scout', x: 18, y: 20, hp: 7, moved: false, acted: false },
  ];
  s.nextUnitId = 5;
  const startingActor = s.active;
  for (let attempt = 0; attempt < 6 && s.sites[1].owner !== 0; attempt++) {
    const action = chooseAction(observe(s, s.active));
    assert.ok(action, 'ongoing戰術fixture必須有行動');
    assert.notEqual(action.type, 'EndTurn', '可同回合佔城，不應提前交回合讓守軍補招');
    s = play(s, action);
    assert.equal(s.active, startingActor);
  }
  assert.equal(s.sites[1].owner, 0);
  assert.equal(s.factions[1].life, 'exiled');
  assert.equal(s.winner, null, '殘存斥候仍可續玩，不能以首都直接判勝');
});

test('獨立harness：一個worker錯誤仍收齊其他worker，最後報告保持FAIL', () => {
  const directory = mkdtempSync(join(tmpdir(), 'project4x-worker-error-'));
  const output = join(directory, 'report.json');
  try {
    const child = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/headless.ts'], {
      cwd: resolve(dirname(fileURLToPath(import.meta.url)), '..'),
      env: { ...process.env, PROJECT4X_QA_START_SEED: '4', PROJECT4X_QA_GAMES: '2', PROJECT4X_QA_WORKERS: '2', PROJECT4X_QA_MAX_TURNS: '1', PROJECT4X_QA_MAX_COMMANDS: '100', PROJECT4X_QA_TEST_WORKER_FAILURE: '1', PROJECT4X_QA_OUTPUT: output },
      encoding: 'utf8', timeout: 15000,
    });
    assert.equal(child.error, undefined, String(child.error));
    assert.equal(child.status, 1, child.stderr + child.stdout);
    const report = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(report.status, 'FAIL');
    assert.match(report.workerFailure, /QA_TEST_INJECTED_WORKER_FAILURE/);
    assert.equal(report.finishedGames, 1);
    assert.equal(report.completedGames, 0);
    assert.equal(report.failedGames, 1);
    assert.equal(report.unfinishedGames, 1);
    assert.deepEqual(report.seedRange, { first: 4, last: 5 });
    assert.equal(report.games[0].seed, '獨立QA-005');
    assert.equal(report.games[0].winner, null);
    assert.match(report.games[0].failure, /HARNESS_TURN_LIMIT/);
    assert.equal(report.methodUnchanged, true);
    assert.match(report.methodFingerprint, /^[a-f0-9]{64}$/);
  } finally { rmSync(directory, { recursive: true }); }
});

test('獨立AI補給：富有的四據點方不因16兵舊上限停止補充遠距戰線', () => {
  const s = fixture('QA-遠距補給');
  s.factions[0].gold = 1000;
  s.factions[0].techs = ['farm', 'archery', 'pathfinding'];
  s.sites.forEach((site, i) => { site.owner = i < 4 ? 0 : 1; });
  s.units = Array.from({ length: 16 }, (_, i) => ({ id: `兵-${i + 4}`, owner: 0 as const, kind: 'infantry' as const, x: 5 + i % 8, y: 5 + Math.floor(i / 8), hp: 10, moved: true, acted: true }));
  s.units.push({ id: '兵-30', owner: 1, kind: 'infantry', x: 22, y: 22, hp: 10, moved: true, acted: true });
  s.nextUnitId = 31;
  const view = observe(s, 0);
  assert.equal(view.tiles.filter(t => t.site?.owner === 0).length, 4);
  assert.ok(view.legalActions.some(a => a.type === 'Recruit'));
  const action = chooseAction(view);
  assert.equal(action?.type, 'Recruit', '需要使用經濟優勢補兵，不能提前EndTurn');
  const next = play(s, action!);
  assert.equal(next.units.filter(u => u.owner === 0).length, 17);
  assert.ok(next.factions[0].gold < s.factions[0].gold);
});

test('獨立AI補給：前沿空據點優先於陣列中第一座後方首都', () => {
  const s = fixture('QA-前沿招募');
  s.factions[0].gold = 100;
  s.factions[0].techs = ['farm', 'archery', 'pathfinding'];
  s.units[0].y = 4;
  s.units[1].y = 4;
  s.units.filter(u => u.owner === 0).forEach(u => { u.moved = true; u.acted = true; });
  s.sites.filter(site => site.kind === 'village').slice(0, 3).forEach(site => { site.owner = 0; });
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  const view = observe(s, 0);
  const action = chooseAction(view);
  assert.ok(action?.type === 'Recruit');
  assert.equal(action.siteId, '村莊-2', '應從靠近已知敵方據點的前沿補兵');
  const next = play(s, action);
  const born = next.units.at(-1)!;
  assert.equal(born.x, 12); assert.equal(born.y, 11);
  assert.equal(born.moved, true); assert.equal(born.acted, true);
});

test('獨立AI戰線：近距離敵方補給據點不能被遠方歷史首都蓋過', () => {
  const s = fixture('QA-近距補給目標');
  s.factions[0].gold = 0;
  s.units = [
    { ...s.units[0], x: 6, y: 11 },
    { ...s.units[1], x: 8, y: 13, moved: true, acted: true },
    { ...s.units[2], x: 6, y: 14 },
  ];
  const village = s.sites.find(site => site.id === '村莊-1')!;
  village.owner = 1; village.y = 14;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  const action = chooseAction(observe(s, 0));
  assert.deepEqual(action, { type: 'Move', unitId: '兵-0', to: { x: 6, y: 12 } }, '先壓迫眼前的補給來源，避免整支部隊繞過戰線追逐遠方首都');
  const next = play(s, action!);
  assert.equal(next.units.find(u => u.id === '兵-0')!.y, 12);
});

test('獨立AI攻城：合擊剛好擊殺時先磨低守軍，保留下一回合的占領者', () => {
  let s = fixture('QA-守軍三血');
  s.factions[0].gold = 0;
  s.units = [
    { ...s.units[0], x: 5, y: 13 },
    { ...s.units[1], kind: 'archer', x: 4, y: 13 },
    { ...s.units[2], x: 6, y: 13, hp: 3 },
  ];
  s.sites.find(site => site.id === '村莊-1')!.owner = 1;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  const first = chooseAction(observe(s, 0));
  assert.deepEqual(first, { type: 'Attack', unitId: '兵-1', targetId: '兵-2' }, '步兵2傷＋弓兵1傷若全打完，無人能占領，對手會在空城補兵');
  s = play(s, first!);
  assert.equal(s.units.find(u => u.id === '兵-2')!.hp, 2);
  assert.equal(s.units.find(u => u.id === '兵-0')!.acted, false);
  assert.equal(chooseAction(observe(s, 0))?.type, 'EndTurn', '射手已開火也必須保留占領者，不能在同回合補上最後一擊');
  s = play(s, { type: 'EndTurn' }); s = play(s, { type: 'EndTurn' });
  s = play(s, chooseAction(observe(s, 0))!);
  assert.equal(s.units.find(u => u.id === '兵-2')!.hp, 1);
  s = play(s, { type: 'EndTurn' }); s = play(s, { type: 'EndTurn' });
  s = play(s, chooseAction(observe(s, 0))!);
  assert.equal(s.units.some(u => u.id === '兵-2'), false);
  s = play(s, chooseAction(observe(s, 0))!);
  s = play(s, chooseAction(observe(s, 0))!);
  assert.equal(s.sites.find(site => site.id === '村莊-1')!.owner, 0);
});

test('獨立AI追捕：地形全知仍巡查視野外存活者，不提前宣告終局', () => {
  const s = fixture('QA-視野外存活者');
  s.units = [s.units[1], { ...s.units[2], x: 20, y: 16 }];
  s.sites.forEach(site => { site.owner = 0; site.recruited = true; });
  s.factions[0].gold = 0; s.factions[0].techs = ['farm', 'archery', 'pathfinding'];
  s.factions[1].centerId = null; s.factions[1].life = 'exiled';
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  const view = observe(s, 0);
  assert.equal(view.units.filter(u => u.owner === 1).length, 0);
  assert.equal(s.winner, null);
  const action = chooseAction(view);
  assert.equal(action?.type, 'Move', '已探索並不等於現在可見，仍須搜尋最後的流亡部隊');
  const hiddenElsewhere = structuredClone(s); hiddenElsewhere.units[1].x = 1; hiddenElsewhere.units[1].y = 18;
  assert.deepEqual(observe(hiddenElsewhere, 0), view);
  assert.deepEqual(chooseAction(observe(hiddenElsewhere, 0)), action);
  const next = play(s, action!);
  assert.equal(next.winner, null);
  assert.equal(next.factions[1].life, 'exiled');
  let pursuing = next;
  for (let n = 0; n < 300 && pursuing.winner === null; n++) {
    const follow = pursuing.active === 0 ? chooseAction(observe(pursuing, 0)) : { type: 'EndTurn' as const };
    assert.ok(follow); pursuing = play(pursuing, follow);
  }
  assert.equal(pursuing.winner, 0, '合法巡查及戰鬥必須能找到並淘汰停止移動的視野外部隊');
  assert.equal(pursuing.factions[1].life, 'eliminated');
});

test('獨立AI遺跡：視野外未確認的舊標記不覆蓋存活者搜尋', () => {
  const s = fixture('QA-過時遺跡目標');
  s.units = [{ ...s.units[0], x: 12, y: 12 }, { ...s.units[2], x: 20, y: 16 }];
  s.sites.forEach(site => { site.owner = 0; site.recruited = true; });
  s.factions[0].gold = 0; s.factions[0].techs = ['farm', 'archery', 'pathfinding'];
  s.factions[1].centerId = null; s.factions[1].life = 'exiled';
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  const withoutMarker = chooseAction(observe(s, 0));
  s.relics = [{ id: '遺跡-3', x: 9, y: 17, claimedBy: 1, resolved: true }];
  const view = observe(s, 0);
  assert.equal(view.tiles[17 * 24 + 9].relic?.resolved, undefined, '不能洩露敵方在視野外處置的結果');
  assert.equal(view.units.filter(u => u.owner === 1).length, 0);
  assert.deepEqual(chooseAction(view), withoutMarker, 'resolved未知不能當成尚未取用，否則會在舊遺跡之間來回');
});
