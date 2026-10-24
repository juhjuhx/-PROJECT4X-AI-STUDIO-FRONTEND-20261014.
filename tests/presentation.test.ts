import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, createGame, observe } from '../src/core/game';
import type { Action, GameState, Observation } from '../src/core/types';
import type { DeepReadonly, PresentationEvent } from '../src/session/contracts';

import { projectPresentationEvents as project } from '../src/presentation/events';

const copy = <T>(value: T): T => structuredClone(value);
function pair(): [Observation, Observation] {
  const before = observe(createGame('事件測試'), 0);
  const after = copy(before); after.version++;
  return [before, after];
}
function play(state: GameState, action: Action): GameState {
  const result = applyCommand(state, { actor: state.active, requestId: `F-${state.version}`, expectedVersion: state.version, action });
  assert.equal(result.ok, true, result.error ?? '合法命令必須成功'); return result.state;
}
function changes(events: readonly PresentationEvent[]) {
  return events.map(({ schema, viewer, generation, fromVersion, toVersion, sequence, id, ...change }) => change);
}
function combatState(): GameState {
  const state = createGame('真實戰鬥'); state.relics = []; state.terrain.fill('plain');
  state.units = [{ ...state.units[0], x: 4, y: 3 }, { ...state.units[2], x: 5, y: 3 }];
  return state;
}
function healthPair(): [Observation, Observation] {
  const [before, after] = pair(); after.units[0].hp = 6; return [before, after];
}

test('F01 匯出正式 projector 並發出兩端可見同兵的實際 HP 變化', () => {
  assert.equal(typeof project, 'function');
  const [before, after] = healthPair();
  assert.deepEqual(changes(project(before, after, 7)), [{ type: 'UnitHealthChanged', unitId: '兵-0', at: { x: 3, y: 3 }, beforeHP: 10, afterHP: 6 }]);
});

test('F02 真實 applyCommand/observe 傷害只給當前可知位置，不帶攻擊者', () => {
  const state = combatState(); const before = observe(state, 0);
  const after = observe(play(state, { type: 'Attack', unitId: '兵-0', targetId: '兵-2' }), 0);
  assert.deepEqual(changes(project(before, after, 0)), [{ type: 'UnitHealthChanged', unitId: '兵-2', at: { x: 5, y: 3 }, beforeHP: 10, afterHP: 7 }]);
});

test('F03 真實敵方攻擊移除己軍只發 OwnUnitDestroyed', () => {
  const state = combatState(); state.active = 1; state.units[0].hp = 1;
  const before = observe(state, 0);
  const after = observe(play(state, { type: 'Attack', unitId: '兵-2', targetId: '兵-0' }), 0);
  assert.deepEqual(changes(project(before, after, 3)), [{ type: 'OwnUnitDestroyed', unitId: '兵-0', lastKnownAt: { x: 4, y: 3 } }]);
});

test('F04 敵兵撤出視野或被擊殺均不能由消失推死亡', () => {
  const state = combatState(); state.active = 1; state.units[0].x = 3;
  const before = observe(state, 0);
  const after = observe(play(state, { type: 'Move', unitId: '兵-2', to: { x: 6, y: 3 } }), 0);
  assert.ok(before.units.some(u => u.id === '兵-2')); assert.ok(!after.units.some(u => u.id === '兵-2'));
  assert.deepEqual(project(before, after, 0), []);
  const kill = combatState(); kill.units[1].hp = 1;
  assert.deepEqual(project(observe(kill, 0), observe(play(kill, { type: 'Attack', unitId: '兵-0', targetId: '兵-2' }), 0), 0), []);
});

test('F05 真實據點佔領：兩端 visible 且明確 owner 才發改變', () => {
  const state = combatState(); state.units[0].x = 8; state.units[0].y = 4;
  const before = observe(state, 0); const after = observe(play(state, { type: 'Capture', unitId: '兵-0' }), 0);
  assert.deepEqual(changes(project(before, after, 0)), [{ type: 'SiteOwnerChanged', siteId: '村莊-0', at: { x: 8, y: 4 }, beforeOwner: null, afterOwner: 0 }]);
});

test('F06 owner undefined、單端 explored、重見據點均不補演佔領', () => {
  const [before, after] = pair(); const tile = before.tiles.find(t => t.site)!;
  const next = after.tiles.find(t => t.site?.id === tile.site!.id)!;
  next.site!.owner = 1;
  for (const mutate of [
    (b: Observation) => { delete b.tiles.find(t => t.site)?.site?.owner; },
    (b: Observation) => { b.tiles.find(t => t.site)!.visibility = 'explored'; },
    (b: Observation) => { b.tiles.find(t => t.site)!.site = null; },
  ]) { const altered = copy(before); mutate(altered); assert.deepEqual(project(altered, after, 0), []); }
  delete next.site!.owner; assert.deepEqual(project(before, after, 0), []);
});

test('F07 真實 Recruit 需本玩家成功 receipt 與唯一 site/kind 新兵', () => {
  const state = createGame('招募事件'); state.relics = []; state.units[0].y = 4;
  const action: Action = { type: 'Recruit', siteId: '首都-0', kind: 'infantry' };
  const before = observe(state, 0); const after = observe(play(state, action), 0);
  assert.deepEqual(changes(project(before, after, 1, action)), [{ type: 'UnitRecruited', siteId: '首都-0', unitId: '兵-4', kind: 'infantry', at: { x: 3, y: 3 } }]);
  assert.deepEqual(project(before, after, 1), []);
  assert.deepEqual(project(before, after, 1, { ...action, kind: 'scout' }), []);
  const ambiguous = copy(after); ambiguous.units.push({ ...after.units.at(-1)!, id: '額外兵', x: 4 });
  assert.deepEqual(project(before, ambiguous, 1, action), []);
  const wrongPlace = copy(after); wrongPlace.units.at(-1)!.x++;
  assert.deepEqual(project(before, wrongPlace, 1, action), []);
  const notOwnTurn = copy(before); notOwnTurn.active = 1;
  assert.deepEqual(project(notOwnTurn, after, 1, action), []);
});

test('F08 新看見敵軍不能當成招募；不在合法候選的 receipt 不足', () => {
  const [before, after] = pair(); after.units.push({ ...after.units[0], id: '新敵兵', owner: 1 });
  assert.deepEqual(project(before, after, 0, { type: 'Recruit', siteId: '首都-0', kind: 'infantry' }), []);
});

test('F-R1 合法 Recruit 擴大視野新見敵兵仍只招募己方新兵', () => {
  const state = createGame('獨立招募擴視野反例');
  state.relics = []; state.terrain.fill('plain');
  state.units[0].x = 1; state.units[0].y = 3;
  state.units[1].x = 1; state.units[1].y = 4;
  state.units[2].x = 5; state.units[2].y = 3;
  const before = observe(state, 0);
  const action: Action = { type: 'Recruit', siteId: '首都-0', kind: 'infantry' };
  assert.ok(before.legalActions.some(candidate => JSON.stringify(candidate) === JSON.stringify(action)));
  assert.equal(before.units.some(unit => unit.id === '兵-2'), false);
  const after = observe(play(state, action), 0);
  assert.deepEqual(after.units.filter(unit => !before.units.some(old => old.id === unit.id)).map(({ id, owner }) => ({ id, owner })), [
    { id: '兵-2', owner: 1 }, { id: '兵-4', owner: 0 },
  ]);
  assert.deepEqual(changes(project(before, after, 0, action)), [{
    type: 'UnitRecruited', siteId: '首都-0', unitId: '兵-4', kind: 'infantry', at: { x: 3, y: 3 },
  }]);
});

test('F09 科技僅由己方 faction.techs 實際新增投影且排序確定', () => {
  const [before, after] = pair(); after.faction.techs = ['pathfinding', 'farm', 'archery'];
  assert.deepEqual(changes(project(before, after, 0)), ['archery', 'farm', 'pathfinding'].map(tech => ({ type: 'TechResearched', tech })));
  assert.deepEqual(project(after, { ...after, version: after.version + 1 }, 0), []);
});

for (const choice of ['gold', 'intel'] as const) test(`F10 真實 ResolveRelic ${choice} 的實際揭露格`, () => {
  let state = createGame(`遺跡-${choice}`);
  state = play(state, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } });
  const action: Action = { type: 'ResolveRelic', choice }; const before = observe(state, 0);
  const after = observe(play(state, action), 0);
  const actual = after.tiles.filter((t, i) => before.tiles[i].visibility === 'unknown' && t.visibility !== 'unknown').map(({ x, y }) => ({ x, y }));
  assert.equal(actual.length, choice === 'gold' ? 0 : 3);
  assert.deepEqual(changes(project(before, after, 2, action)), [{ type: 'RelicResolved', relicId: '遺跡-0', choice, revealedTiles: actual }]);
  assert.deepEqual(project(before, after, 2), []);
  const unchangedPending = copy(after); unchangedPending.pendingRelic = copy(before.pendingRelic);
  assert.deepEqual(project(before, unchangedPending, 2, action), []);
});

for (const remaining of [1, 2] as const) test(`F11 情報只剩 ${remaining} 格時絕不預填三格`, () => {
  let state = createGame(`剩餘-${remaining}`);
  state = play(state, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } });
  state.explored[0].fill(true); for (let i = 0; i < remaining; i++) state.explored[0][575 - i] = false;
  const before = observe(state, 0); const action: Action = { type: 'ResolveRelic', choice: 'intel' };
  assert.equal(before.pendingRelic!.intelCount, remaining);
  const after = observe(play(state, action), 0); const event = project(before, after, 0, action).find(e => e.type === 'RelicResolved');
  assert.ok(event?.type === 'RelicResolved'); assert.equal(event.revealedTiles.length, remaining);
  assert.deepEqual(event.revealedTiles, after.tiles.filter((t, i) => before.tiles[i].visibility === 'unknown' && t.visibility !== 'unknown').map(({ x, y }) => ({ x, y })));
});

test('F12 pending 換至下個己方遺跡仍只處置前一個，沒有 receipt 不猜', () => {
  const [before, after] = pair(); before.pendingRelic = { id: '舊遺跡', intelCount: 1 }; after.pendingRelic = { id: '新遺跡', intelCount: 3 };
  before.legalActions = [{ type: 'ResolveRelic', choice: 'gold' }];
  assert.deepEqual(changes(project(before, after, 0, { type: 'ResolveRelic', choice: 'gold' })), [{ type: 'RelicResolved', relicId: '舊遺跡', choice: 'gold', revealedTiles: [] }]);
  const noPending = copy(before); noPending.pendingRelic = null;
  assert.deepEqual(project(noPending, after, 0, { type: 'ResolveRelic', choice: 'gold' }), []);
});

test('F13 己方政治中心實際改變含 null；不觀測對手 faction', () => {
  const [before, after] = pair(); after.faction.centerId = null;
  assert.deepEqual(changes(project(before, after, 0)), [{ type: 'PoliticalCenterChanged', beforeSiteId: '首都-0', afterSiteId: null }]);
  before.faction.centerId = null; after.faction.centerId = '首都-0';
  assert.deepEqual(changes(project(before, after, 0)), [{ type: 'PoliticalCenterChanged', beforeSiteId: null, afterSiteId: '首都-0' }]);
});

test('F14 跨 actor/version/ruleset/seed/尺寸、非法版本與世代均拒絕投影', () => {
  const [before, after] = healthPair();
  for (const delta of [{ actor: 1 }, { version: before.version }, { version: before.version + 2 }, { version: -1 }, { version: NaN }, { ruleset: '未來' }, { seed: '另一世界' }, { width: 25 }, { height: 25 }]) {
    assert.deepEqual(project(before, { ...after, ...delta } as Observation, 0), [], JSON.stringify(delta));
  }
  assert.deepEqual(project({ ...before, version: -1 }, { ...after, version: 0 }, 0), []);
  assert.deepEqual(project({ ...before, ruleset: '未來' }, { ...after, ruleset: '未來' }, 0), []);
  for (const generation of [-1, 0.5, Infinity, NaN]) assert.deepEqual(project(before, after, generation), []);
  assert.deepEqual(project(before, { ...after, faction: { ...after.faction, id: 1 } }, 0), []);
});

test('F15 固定類別順序、穩定 ID 排序與 envelope，不依陣列輸入順序', () => {
  const [before, after] = pair();
  after.units[0].hp--; after.units[1].hp--;
  before.units.push({ ...before.units[0], id: '亡兵-Z' }, { ...before.units[0], id: '亡兵-A' });
  const site = after.tiles.find(t => t.site)!; site.site!.owner = 1;
  after.faction.techs = ['pathfinding', 'farm']; after.faction.centerId = null;
  const events = project(before, after, 5);
  assert.deepEqual(events.map(e => e.type), ['UnitHealthChanged', 'UnitHealthChanged', 'OwnUnitDestroyed', 'OwnUnitDestroyed', 'SiteOwnerChanged', 'TechResearched', 'TechResearched', 'PoliticalCenterChanged']);
  assert.deepEqual(events.filter(e => e.type === 'OwnUnitDestroyed').map(e => e.unitId), ['亡兵-A', '亡兵-Z']);
  events.forEach((e, sequence) => assert.deepEqual({ schema: e.schema, viewer: e.viewer, generation: e.generation, fromVersion: e.fromVersion, toVersion: e.toVersion, sequence: e.sequence, id: e.id }, { schema: 'project4x-presentation-1', viewer: 0, generation: 5, fromVersion: 0, toVersion: 1, sequence, id: `5:0:1:0:${sequence}` }));
  before.units.reverse(); before.tiles.reverse(); after.units.reverse(); after.tiles.reverse(); after.faction.techs.reverse();
  assert.deepEqual(project(before, after, 5), events);
});

test('F16 深凍結、不改輸入、座標副本不共用可變引用且重覆輸入確定', () => {
  const [before, after] = healthPair(); const input = JSON.stringify([before, after]);
  const events = project(before, after, 1); assert.equal(JSON.stringify([before, after]), input);
  assert.deepEqual(project(before, after, 1), events); assert.ok(Object.isFrozen(events)); assert.ok(events.length);
  for (const event of events) { assert.ok(Object.isFrozen(event)); if ('at' in event) assert.ok(Object.isFrozen(event.at)); }
  const saved = copy(events); after.units[0].x = 999; before.units[0].hp = 999;
  assert.deepEqual(events, saved); assert.equal(Object.isFrozen(after.units[0]), false);
});

test('F17 合法同觀測 pair 的三個 hidden 世界有相同事件（局部非干擾）', () => {
  const outputs: (readonly PresentationEvent[])[] = [];
  const views: [Observation, Observation][] = [];
  for (let variant = 0; variant < 3; variant++) {
    let state = createGame('相同可見世界');
    state.terrain[23 * 24 + 23] = ['plain', 'hill', 'forest'][variant] as GameState['terrain'][number];
    state.factions[1].gold += variant; state.units[2].hp -= variant;
    state.units[2].x = 20 + variant; state.terrain[20 * 24 + 20 + variant] = 'plain';
    const before = observe(state, 0); const action: Action = { type: 'Research', tech: 'farm' };
    state = play(state, action); const after = observe(state, 0);
    views.push([before, after]); outputs.push(project(before, after, 4, action));
  }
  assert.deepEqual(views[0], views[1]); assert.deepEqual(views[0], views[2]);
  assert.deepEqual(outputs[0], outputs[1]); assert.deepEqual(outputs[0], outputs[2]);
  assert.deepEqual(changes(outputs[0]), [{ type: 'TechResearched', tech: 'farm' }]);
});

test('F18 己方視野來源死亡後敵軍去向隱藏，不發敵兵去向或死訊', () => {
  const state = combatState(); state.active = 1; state.units[0] = { ...state.units[0], x: 10, y: 10, hp: 1 };
  state.units[1] = { ...state.units[1], x: 11, y: 10 };
  const before = observe(state, 0); const after = observe(play(state, { type: 'Attack', unitId: '兵-2', targetId: '兵-0' }), 0);
  assert.ok(before.units.some(u => u.owner === 1)); assert.ok(!after.units.some(u => u.owner === 1));
  assert.deepEqual(changes(project(before, after, 0)), [{ type: 'OwnUnitDestroyed', unitId: '兵-0', lastKnownAt: { x: 10, y: 10 } }]);
});


test('F19 真實 EstablishCapital 只從己方 faction 發中心恢復事件', () => {
  const state = createGame('建中心事件'); state.relics = [];
  state.factions[0].centerId = null; state.factions[0].life = 'exiled';
  state.factions[1].completedTurns = 1;
  const before = observe(state, 0); const action: Action = { type: 'EstablishCapital', siteId: '首都-0' };
  const after = observe(play(state, action), 0);
  assert.deepEqual(changes(project(before, after, 0, action)), [{ type: 'PoliticalCenterChanged', beforeSiteId: null, afterSiteId: '首都-0' }]);
});

test('F20 actor 1 僅產生己方事件，情報事件巢狀陣列深凍結不共享觀測', () => {
  let state = createGame('玩家一事件'); state = play(state, { type: 'EndTurn' });
  const beforeResearch = observe(state, 1);
  state = play(state, { type: 'Research', tech: 'farm' });
  const research = project(beforeResearch, observe(state, 1), 6);
  assert.equal(research[0].viewer, 1); assert.equal(research[0].id, '6:1:2:1:0');
  assert.deepEqual(changes(research), [{ type: 'TechResearched', tech: 'farm' }]);
  state = play(state, { type: 'Move', unitId: '兵-3', to: { x: 18, y: 20 } });
  const before = observe(state, 1); const receipt: Action = { type: 'ResolveRelic', choice: 'intel' };
  const after = observe(play(state, receipt), 1); const input = JSON.stringify([before, after, receipt]);
  const events = project(before, after, 6, receipt); const event = events.find(e => e.type === 'RelicResolved');
  assert.ok(event?.type === 'RelicResolved'); assert.equal(event.relicId, '遺跡-1');
  assert.ok(Object.isFrozen(event.revealedTiles)); assert.equal(event.revealedTiles.length, 3);
  for (const tile of event.revealedTiles) assert.ok(Object.isFrozen(tile));
  assert.equal(JSON.stringify([before, after, receipt]), input); assert.equal(Object.isFrozen(receipt), false);
});
