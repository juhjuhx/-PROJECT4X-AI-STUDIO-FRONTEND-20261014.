import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, applyCommand, observe, canonicalHash } from '../src/core/game';
import type { Action, GameState } from '../src/core/types';
import { deserializeGame, exportReplay, replayGame, serializeGame } from '../src/core/persistence';
import { chooseAction } from '../src/core/ai';

function play(state: GameState, action: Action): GameState {
  const result = applyCommand(state, { actor: state.active, expectedVersion: state.version, requestId: `t-${state.version}`, action });
  assert.equal(result.ok, true, result.error ?? '合法指令應成功');
  return result.state;
}

test('相同 seed 初始地圖、合法四出生點與 hash 完全確定', () => {
  const a = createGame('測試世界');
  assert.deepEqual(a, createGame('測試世界'));
  assert.equal(a.width, 24);
  assert.equal(a.units.length, 4);
  assert.equal(a.pendingRelic, null);
  assert.equal(a.factions[0].gold, 8);
  assert.equal(canonicalHash(a), canonicalHash(createGame('測試世界')));
  for (const unit of a.units) assert.ok(!['mountain', 'water'].includes(a.terrain[unit.y * 24 + unit.x]));
});

test('非法與過期命令保持同一引用及所有資料', () => {
  const state = createGame('非法');
  const before = JSON.stringify(state);
  const result = applyCommand(state, { actor: 1, expectedVersion: 0, requestId: 'invalid', action: { type: 'EndTurn' } });
  assert.equal(result.ok, false);
  assert.equal(result.state, state);
  assert.equal(JSON.stringify(state), before);
});

test('首己方回合無收入、下一己方回合各據點2金且重設一次', () => {
  let state = createGame('收入');
  state = play(state, { type: 'EndTurn' });
  assert.equal(state.factions[1].gold, 8);
  state = play(state, { type: 'EndTurn' });
  assert.equal(state.factions[0].gold, 10);
  assert.equal(state.factions[0].ownTurns, 2);
});

test('observation 是副本、未知格與不可見敵兵不外洩', () => {
  const state = createGame('迷霧');
  const view = observe(state, 0);
  assert.equal(view.units.filter(u => u.owner === 1).length, 0);
  assert.ok(view.tiles.filter(t => t.visibility === 'unknown').every(t => t.terrain === null && t.site === null && t.relic === null));
  view.units[0].hp = 1;
  view.faction.gold = 999;
  assert.equal(state.units[0].hp, 10);
  assert.equal(state.factions[0].gold, 8);
});

test('成功request同payload重送無副作用，不同payload与stale拒絕', () => {
  const state = createGame('協定');
  const command = { actor: 0 as const, expectedVersion: 0, requestId: 'request', action: { type: 'EndTurn' as const } };
  const once = applyCommand(state, command);
  assert.equal(once.ok, true);
  const again = applyCommand(once.state, command);
  assert.equal(again.ok, true);
  assert.equal(again.state, once.state);
  assert.equal(again.state.history.length, 1);
  assert.equal(applyCommand(once.state, { ...command, action: { type: 'Research', tech: 'farm' } }).ok, false);
  assert.equal(applyCommand(once.state, { ...command, requestId: 'stale', actor: 1 }).ok, false);
});

test('斥候移動發現遺跡立即必答；情報依distance/y/x探索最多3地形格', () => {
  let state = createGame('遺跡');
  state = play(state, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } });
  assert.equal(state.pendingRelic?.relicId, '遺跡-0');
  assert.deepEqual(observe(state, 0).legalActions.map(a => a.type), ['ResolveRelic', 'ResolveRelic']);
  assert.equal(applyCommand(state, { actor: 0, expectedVersion: state.version, requestId: 'blocked', action: { type: 'EndTurn' } }).ok, false);
  const before = [...state.explored[0]];
  state = play(state, { type: 'ResolveRelic', choice: 'intel' });
  assert.equal(state.explored[0].filter((v, i) => v && !before[i]).length, 3);
  assert.equal(state.relics[0].resolved, true);
});

test('Move一次但可接Attack；不可穿人、擊殺不自動進格，攻擊結束兵行動', () => {
  let state = createGame('戰鬥');
  state.relics = [];
  state.terrain.fill('plain');
  state.units = [state.units[0], { ...state.units[2], x: 5, y: 3, hp: 2 }];
  state = play(state, { type: 'Move', unitId: '兵-0', to: { x: 4, y: 3 } });
  const target = state.units[1].id;
  state = play(state, { type: 'Attack', unitId: '兵-0', targetId: target });
  assert.equal(state.units.length, 1);
  assert.equal(state.units[0].x, 4);
  assert.equal(state.units[0].acted, true);
  assert.equal(observe(state, 0).legalActions.some(a => 'unitId' in a && a.unitId === '兵-0'), false);
});

test('中心失守仍流亡；持續據點跨完整敵方EndTurn才可免費建都，不重設兵旗標', () => {
  let state = createGame('流亡');
  state.relics = [];
  state.terrain.fill('plain');
  state.units[0].x = 20; state.units[0].y = 20;
  state.units[2].x = 20; state.units[2].y = 19;
  state = play(state, { type: 'Capture', unitId: '兵-0' });
  assert.equal(state.factions[1].life, 'exiled');
  assert.equal(state.factions[1].centerId, null);
  assert.equal(state.winner, null);
  state = play(state, { type: 'EndTurn' });
  const village = state.sites.find(s => s.kind === 'village')!;
  state.units[2].x = village.x; state.units[2].y = village.y;
  state = play(state, { type: 'Capture', unitId: '兵-2' });
  assert.equal(observe(state, 1).legalActions.some(a => a.type === 'EstablishCapital'), false);
  state = play(state, { type: 'EndTurn' });
  state = play(state, { type: 'EndTurn' });
  state.units[2].moved = true;
  const gold = state.factions[1].gold;
  state = play(state, { type: 'EstablishCapital', siteId: village.id });
  assert.equal(state.factions[1].life, 'active');
  assert.equal(state.factions[1].centerId, village.id);
  assert.equal(state.units[2].moved, true);
  assert.equal(state.factions[1].gold, gold);
});

test('正常保存與重播完整資料相同，保存拒絕格式、佔位、ledger與未經歷史的竄改', () => {
  let state = createGame('持久化');
  state = play(state, { type: 'Research', tech: 'farm' });
  state = play(state, { type: 'EndTurn' });
  assert.deepEqual(deserializeGame(serializeGame(state)), state);
  assert.deepEqual(replayGame(exportReplay(state)), state);
  for (const mutate of [
    (s: GameState) => { s.factions[0].gold++; },
    (s: GameState) => { s.units[1].x = s.units[0].x; s.units[1].y = s.units[0].y; },
    (s: GameState) => { s.units[0].hp = 999; },
    (s: GameState) => { s.requests.fake = 'abc'; },
    (s: GameState) => { s.pendingRelic = { actor: s.active, relicId: 'missing' }; },
  ]) { const damaged = structuredClone(state); mutate(damaged); assert.throws(() => deserializeGame(JSON.stringify(damaged))); }
  const broken = JSON.parse(exportReplay(state)); broken.commands[0].action = { type: 'Recruit', siteId: 'missing', kind: 'infantry' };
  assert.throws(() => replayGame(JSON.stringify(broken)), /第1筆/);
});

test('遺跡情報不暴露未曾正常看見的據點與遺跡，已探索格不帶敵方owner', () => {
  let state = createGame('只有地形');
  state = play(state, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } });
  const relic = state.relics[0];
  const targets = state.explored[0].flatMap((known, i) => known ? [] : [{ x: i % 24, y: Math.floor(i / 24) }]).sort((a, b) => Math.abs(a.x - relic.x) + Math.abs(a.y - relic.y) - Math.abs(b.x - relic.x) - Math.abs(b.y - relic.y) || a.y - b.y || a.x - b.x).slice(0, 3);
  state.sites.push({ id: '情報旁城', name: '不應揭露', kind: 'village', owner: 1, ...targets[0], recruited: false, heldSince: 0 });
  state = play(state, { type: 'ResolveRelic', choice: 'intel' });
  const tile = observe(state, 0).tiles[targets[0].y * 24 + targets[0].x];
  assert.equal(tile.visibility, 'explored');
  assert.notEqual(tile.terrain, null);
  assert.equal(tile.site, null);
  assert.equal(tile.relic, null);
});

test('100種seed：四spawn、全部據點與早期遺跡同連通；雙方初始視野無必答', () => {
  for (let n = 0; n < 100; n++) {
    const state = createGame(`地圖-${n}`);
    const open = new Set<number>(), queue = [state.units[0].y * 24 + state.units[0].x];
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q]; if (open.has(i)) continue; open.add(i);
      const x = i % 24, y = Math.floor(i / 24);
      for (const j of [y > 0 ? i - 24 : -1, x > 0 ? i - 1 : -1, x < 23 ? i + 1 : -1, y < 23 ? i + 24 : -1]) if (j >= 0 && !['water', 'mountain'].includes(state.terrain[j]) && !open.has(j)) queue.push(j);
    }
    for (const p of [...state.units, ...state.sites, ...state.relics]) assert.ok(open.has(p.y * 24 + p.x));
    for (const actor of [0, 1] as const) assert.ok(observe(state, actor).tiles.filter(t => t.visibility === 'visible').every(t => !t.relic));
  }
});

test('尋路不穿越友軍或不可通行地形；完整非法拒絕不留request', () => {
  const state = createGame('路徑'); state.relics = []; state.terrain.fill('mountain');
  state.units = [{ ...state.units[1], x: 3, y: 3 }, { ...state.units[0], x: 4, y: 3 }];
  for (const x of [3, 4, 5]) state.terrain[3 * 24 + x] = 'plain';
  const cmd = { actor: 0 as const, expectedVersion: 0, requestId: 'no-cross', action: { type: 'Move' as const, unitId: '兵-1', to: { x: 5, y: 3 } } };
  const result = applyCommand(state, cmd);
  assert.equal(result.ok, false); assert.equal(result.state, state); assert.equal(Object.hasOwn(state.requests, 'no-cross'), false);
});

test('守方己有據點cover1與terraincover1不疊加；敵方據點不給掩護', () => {
  for (const owner of [0, 1] as const) for (const terrain of ['plain', 'hill'] as const) {
    let state = createGame('掩護'); state.relics = [];
    state.units = [{ ...state.units[0], x: 19, y: 20 }, { ...state.units[2], x: 20, y: 20 }];
    state.terrain[20 * 24 + 20] = terrain; state.sites[1].owner = owner;
    state = play(state, { type: 'Attack', unitId: '兵-0', targetId: '兵-2' });
    const cover = owner === 1 || terrain === 'hill' ? 1 : 0;
    assert.equal(state.units[1].hp, 10 - (4 - 1 - cover));
  }
});

test('據點招募需空格、每回合一次；新兵不能行動；科技費用精確且Farm下次收入', () => {
  let state = createGame('招募'); state.relics = [];
  assert.equal(observe(state, 0).legalActions.some(a => a.type === 'Recruit'), false);
  state.units[0].x = 3; state.units[0].y = 4;
  state = play(state, { type: 'Recruit', siteId: '首都-0', kind: 'infantry' });
  assert.equal(state.factions[0].gold, 4); assert.equal(state.sites[0].recruited, true);
  const recruit = state.units.find(u => u.id === '兵-4')!;
  assert.equal(recruit.acted, true); assert.equal(recruit.moved, true);
  recruit.x = 2; recruit.y = 3;
  assert.equal(observe(state, 0).legalActions.some(a => a.type === 'Recruit'), false);
  state = play(state, { type: 'EndTurn' }); state = play(state, { type: 'EndTurn' });
  assert.equal(state.sites[0].recruited, false); assert.equal(state.units.find(u => u.id === '兵-4')!.acted, false);
  state.factions[0].gold = 10;
  state = play(state, { type: 'Research', tech: 'farm' }); assert.equal(state.factions[0].gold, 5);
  state = play(state, { type: 'EndTurn' }); state = play(state, { type: 'EndTurn' });
  assert.equal(state.factions[0].gold, 8);
  state = play(state, { type: 'Research', tech: 'archery' }); assert.equal(state.factions[0].gold, 2);
  assert.equal(observe(state, 0).legalActions.some(a => a.type === 'Research' && a.tech === 'pathfinding'), false);
});

test('收回歷史首都仍流亡、不可自動復辟；新中心須主動且不resetrecruited', () => {
  let state = createGame('復辟'); state.relics = []; state.factions[0].centerId = null; state.factions[0].life = 'exiled';
  state.sites[0].owner = 1;
  state = play(state, { type: 'Capture', unitId: '兵-0' });
  assert.equal(state.factions[0].centerId, null); assert.equal(state.factions[0].life, 'exiled');
  state = play(state, { type: 'EndTurn' }); state = play(state, { type: 'EndTurn' });
  state.sites[0].recruited = true;
  state = play(state, { type: 'EstablishCapital', siteId: '首都-0' });
  assert.equal(state.sites[0].recruited, true);
});

test('hash包含未來規則旗標與兩方知識，明確排除protocolledger', () => {
  const state = createGame('hash'); const baseline = canonicalHash(state);
  for (const mutate of [(s: GameState) => { s.units[0].acted = true; }, (s: GameState) => { s.sites[0].recruited = true; }, (s: GameState) => { s.factions[0].completedTurns++; }, (s: GameState) => { s.surveyed[1][0] = !s.surveyed[1][0]; }]) {
    const different = structuredClone(state); mutate(different); assert.notEqual(canonicalHash(different), baseline);
  }
  const ledger = structuredClone(state); ledger.requests.fake = 'test'; ledger.history.push({ actor: 0, requestId: 'fake', expectedVersion: 0, action: { type: 'EndTurn' } });
  assert.equal(canonicalHash(ledger), baseline);
  const unicodeA = structuredClone(state), unicodeB = structuredClone(state);
  unicodeA.sites[0].name = '😀'; unicodeB.sites[0].name = '😁';
  assert.notEqual(canonicalHash(unicodeA), canonicalHash(unicodeB));
});

test('AI僅接Observation，全部決策出自合法候選且不修改view', () => {
  let state = createGame('策略');
  for (let i = 0; i < 100 && state.winner === null; i++) {
    const view = observe(state, state.active), before = JSON.stringify(view);
    const action = chooseAction(view);
    assert.ok(action);
    assert.ok(view.legalActions.some(a => JSON.stringify(a) === JSON.stringify(action)));
    assert.equal(JSON.stringify(view), before);
    state = play(state, action);
  }
});

test('AI能靠觀測移向敵都、攻擊守軍、占領並在流亡後主動建中心', () => {
  let state = createGame('AI戰術'); state.relics = []; state.terrain.fill('plain');
  state.units = [{ ...state.units[0], x: 19, y: 20 }, { ...state.units[2], x: 20, y: 20, hp: 1 }];
  state.sites[0].recruited = true;
  let action = chooseAction(observe(state, 0)); assert.equal(action?.type, 'Attack'); assert.ok(action);
  state = play(state, action);
  state = play(state, { type: 'EndTurn' }); state = play(state, { type: 'EndTurn' });
  state.factions[0].gold = 0;
  action = chooseAction(observe(state, 0)); assert.equal(action?.type, 'Move'); assert.ok(action?.type === 'Move'); assert.deepEqual(action.to, { x: 20, y: 20 });
  state = play(state, action);
  action = chooseAction(observe(state, 0)); assert.equal(action?.type, 'Capture'); assert.ok(action);
  state = play(state, action); assert.equal(state.sites[1].owner, 0);
  // A surviving faction with an established holding can rebuild for free.
  state.winner = null; state.factions[0].centerId = null; state.factions[0].life = 'exiled';
  state.factions[1].completedTurns = 2;
  state.sites[0].recruited = true;
  action = chooseAction(observe(state, 0)); assert.equal(action?.type, 'EstablishCapital'); assert.ok(action);
  state = play(state, action); assert.equal(state.factions[0].life, 'active'); assert.equal(state.sites[0].recruited, true);
});

test('非active與terminalObservation的AI停止返回null', () => {
  const state = createGame('AI停止');
  assert.equal(chooseAction(observe(state, 1)), null);
  state.winner = 0;
  assert.equal(chooseAction(observe(state, 0)), null);
});

test('接受的history entry/action/to深凍結，舊snapshot與原usercommand不能污染新snapshot', () => {
  const state = createGame('不可變歷史');
  const action = observe(state, 0).legalActions.find((a): a is Extract<Action, { type: 'Move' }> => a.type === 'Move' && a.unitId === '兵-0')!;
  assert.ok(action);
  const command = { actor: 0 as const, requestId: 'immutable', expectedVersion: 0, action };
  const result = applyCommand(state, command); assert.equal(result.ok, true);
  const saved = structuredClone(result.state.history[0]);
  action.to.x = 999;
  assert.deepEqual(result.state.history[0], saved);
  assert.throws(() => { result.state.history[0].expectedVersion = 999; }, TypeError);
  assert.throws(() => { const a = result.state.history[0].action; if (a.type === 'Move') a.to.x = 999; }, TypeError);
  let next = result.state;
  if (next.pendingRelic) next = play(next, { type: 'ResolveRelic', choice: 'gold' });
  next = play(next, { type: 'EndTurn' });
  assert.equal(next.history[0], result.state.history[0]);
  const restored = deserializeGame(serializeGame(next));
  assert.ok(Object.isFrozen(restored.history[0]));
  assert.ok(Object.isFrozen(restored.history[0].action));
});

test('AI尋目標時不把友軍占位當可穿越，選擇可達繞路而不反覆折返', () => {
  const state = createGame('AI繞路'); state.relics = []; state.terrain.fill('mountain');
  state.units = [{ ...state.units[0], x: 4, y: 5 }, { ...state.units[1], x: 6, y: 5, moved: true, acted: true }];
  state.sites = [{ ...state.sites[0], recruited: true }, { ...state.sites[1], x: 8, y: 5 }];
  state.factions[0].gold = 0; state.explored[0].fill(true); state.surveyed[0].fill(true);
  for (let x = 4; x <= 8; x++) { state.terrain[5 * 24 + x] = 'plain'; state.terrain[3 * 24 + x] = 'plain'; }
  state.terrain[4 * 24 + 4] = 'plain'; state.terrain[4 * 24 + 8] = 'plain';
  const action = chooseAction(observe(state, 0)); assert.ok(action?.type === 'Move'); assert.equal(action.unitId, '兵-0');
  assert.deepEqual(action.to, { x: 4, y: 4 });
});

test('AI用遠射完成攻城，保留fresh城旁兵同turn入空城，避免殺守軍→招募永久循環', () => {
  let state = createGame('AI攻城'); state.relics = []; state.terrain.fill('plain'); state.factions[0].gold = 0;
  state.units = [
    { ...state.units[0], x: 19, y: 20 },
    { ...state.units[1], id: '兵-4', kind: 'archer', x: 18, y: 20, hp: 7 },
    { ...state.units[1], id: '兵-5', kind: 'archer', x: 19, y: 19, hp: 7 },
    { ...state.units[2], x: 20, y: 20, hp: 2 },
    { ...state.units[3], id: '兵-6', kind: 'infantry', x: 19, y: 21, hp: 10 },
  ];
  state.nextUnitId = 7;
  let action = chooseAction(observe(state, 0)); assert.ok(action?.type === 'Attack'); assert.notEqual(action.unitId, '兵-0');
  state = play(state, action);
  action = chooseAction(observe(state, 0)); assert.ok(action?.type === 'Attack'); assert.notEqual(action.unitId, '兵-0');
  state = play(state, action);
  action = chooseAction(observe(state, 0)); assert.ok(action?.type === 'Move'); assert.equal(action.unitId, '兵-0'); assert.deepEqual(action.to, { x: 20, y: 20 });
  state = play(state, action);
  action = chooseAction(observe(state, 0)); assert.equal(action?.type, 'Capture'); assert.ok(action);
  state = play(state, action); assert.equal(state.sites[1].owner, 0); assert.equal(state.factions[1].life, 'exiled');
});

test('斥候不被補兵戰線吸住，未發現敵都時主動擴大未知觀測', () => {
  const state = createGame('AI探索分工'); state.terrain.fill('plain'); state.relics = []; state.factions[0].gold = 0;
  state.units = [{ ...state.units[1], x: 5, y: 5 }, { ...state.units[0], moved: true, acted: true }, { ...state.units[2], x: 7, y: 5 }];
  const action = chooseAction(observe(state, 0)); assert.ok(action?.type === 'Move'); assert.equal(action.unitId, '兵-1');
  assert.ok(Math.abs(action.to.x - 7) + Math.abs(action.to.y - 5) > 2, '斥候應朝有未知格的側翼探索，不加入近敵戰線');
});
