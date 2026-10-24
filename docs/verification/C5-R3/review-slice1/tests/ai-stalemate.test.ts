import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, applyCommand, observe } from '../src/core/game';
import { chooseAction } from '../src/core/ai';
import type { Action, GameState } from '../src/core/types';

// Synthetic counterexample: no private generated world or historical transcript.
function scoutSiege(): GameState {
  const s = createGame('C5-R2-minimal-scout');
  s.relics = []; s.pendingRelic = null; s.terrain.fill('plain');
  s.factions[0].gold = 0;
  s.units = [
    { id: 'scout', owner: 0, kind: 'scout', x: 18, y: 20, hp: 7, moved: false, acted: false },
    { id: 'guard', owner: 1, kind: 'scout', x: 20, y: 20, hp: 7, moved: true, acted: true },
  ];
  return s;
}

function play(s: GameState, action: Action): GameState {
  const r = applyCommand(s, { actor: s.active, requestId: `r2-${s.version}`, expectedVersion: s.version, action });
  assert.equal(r.ok, true, r.error ?? '合法命令遭拒絕');
  return r.state;
}

test('C5-R2：斥候已移動仍攻擊守軍，不為本回合不可能的探索空過', () => {
  const s = play(scoutSiege(), { type: 'Move', unitId: 'scout', to: { x: 19, y: 20 } });
  const view = observe(s, 0), before = structuredClone(view);
  assert.ok(view.tiles.some(t => t.visibility === 'unknown'));
  assert.equal(view.legalActions.some(a => a.type === 'Move'), false);
  const expected: Action = { type: 'Attack', unitId: 'scout', targetId: 'guard' };
  assert.ok(view.legalActions.some(a => JSON.stringify(a) === JSON.stringify(expected)));
  assert.deepEqual(chooseAction(view), expected);
  assert.deepEqual(chooseAction(view), expected, '同 Observation 必須確定性');
  assert.deepEqual(view, before, 'policy 不可改寫輸入');
  const after = play(s, expected);
  assert.equal(after.units.find(u => u.id === 'guard')!.hp, 5, '3 attack - 0 defense - 1 site cover');
  assert.equal(after.active, 0);
  assert.equal(after.winner, null);
});

test('C5-R2：斥候未移動但無合法探索路線，也不因遠方未知格拒絕攻城', () => {
  const s = scoutSiege(); s.units[0].x = 19;
  s.terrain.fill('mountain');
  s.terrain[20 * s.width + 19] = 'plain';
  s.terrain[20 * s.width + 20] = 'plain';
  const view = observe(s, 0);
  assert.ok(view.tiles.some(t => t.visibility === 'unknown'));
  assert.equal(view.legalActions.some(a => a.type === 'Move'), false);
  assert.deepEqual(chooseAction(view), { type: 'Attack', unitId: 'scout', targetId: 'guard' });
});

test('C5-R2：斥候仍有合法新情報移動時，保留既有探索優先', () => {
  const s = scoutSiege(); s.units[0].x = 19;
  const view = observe(s, 0);
  assert.ok(view.legalActions.some(a => a.type === 'Attack'));
  const action = chooseAction(view);
  assert.equal(action?.type, 'Move');
  assert.ok(action && view.legalActions.some(a => JSON.stringify(a) === JSON.stringify(action)));
  const after = observe(play(s, action!), 0);
  assert.ok(after.tiles.some((t, i) => t.visibility !== 'unknown' && view.tiles[i].visibility === 'unknown'));
});

test('C5-R2：同分同路程候選優先靠近目標，避免座標排序選回繞路入口', () => {
  const s = scoutSiege(); s.terrain.fill('mountain');
  s.units = [{ id: 'walker', owner: 0, kind: 'infantry', x: 4, y: 5, hp: 10, moved: false, acted: false }];
  s.sites = [{ ...s.sites[1], x: 8, y: 5 }];
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  // Both north and east take five further steps to the site, via the same row.
  // East is also closer in physical distance; north wins only the old y tie.
  for (let x = 4; x <= 8; x++) s.terrain[4 * s.width + x] = 'plain';
  for (const x of [4, 5, 8]) s.terrain[5 * s.width + x] = 'plain';
  const view = observe(s, 0);
  assert.deepEqual(chooseAction(view), { type: 'Move', unitId: 'walker', to: { x: 5, y: 5 } });
});

test('C5-R2：駐軍可移位完成同一擊殺時，先釋放據點並在同回合補兵', () => {
  let s = scoutSiege(); s.units[0].x = 3; s.units[0].y = 3;
  s.units[1].x = 4; s.units[1].y = 3; s.units[1].hp = 2;
  s.factions[0].gold = 4;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  const first = chooseAction(observe(s, 0));
  assert.equal(first?.type, 'Move', '原地 Attack 消耗 moved，封住本回合唯一補兵格');
  assert.ok(first?.type === 'Move');
  assert.ok(Math.abs(first.to.x - 4) + Math.abs(first.to.y - 3) <= 1, '移位後仍能完成原擊殺');
  s = play(s, first);
  const second = chooseAction(observe(s, 0));
  assert.deepEqual(second, { type: 'Attack', unitId: 'scout', targetId: 'guard' });
  s = play(s, second!);
  assert.equal(s.units.some(u => u.id === 'guard'), false);
  const third = chooseAction(observe(s, 0));
  assert.deepEqual(third, { type: 'Recruit', siteId: s.sites[0].id, kind: 'infantry' });
  s = play(s, third!);
  assert.equal(s.factions[0].gold, 0);
  assert.ok(s.units.some(u => u.owner === 0 && u.x === 3 && u.y === 3 && u.moved && u.acted));
  assert.equal(s.active, 0);
});

test('C5-R2：無補兵金幣時保留原地擊殺，不為不存在的招募機會移位', () => {
  const s = scoutSiege(); s.units[0].x = 3; s.units[0].y = 3;
  s.units[1].x = 4; s.units[1].y = 3; s.units[1].hp = 2;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  assert.deepEqual(chooseAction(observe(s, 0)), { type: 'Attack', unitId: 'scout', targetId: 'guard' });
});

test('C5-R3：友軍使前四目標繞遠時，不忽略第五個更可達的已知據點', () => {
  const s = createGame('C5-R3-goal-pruning');
  s.terrain.fill('plain'); s.relics = []; s.pendingRelic = null;
  s.factions[0].gold = 0;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  s.units = [{ id: 'walker', owner: 0, kind: 'infantry', x: 3, y: 5, hp: 10, moved: false, acted: false }];
  // A temporary friendly wall, not impassable terrain. Only walker can move.
  for (let y = 2; y <= 8; y++) s.units.push({ id: `blocker-${y}`, owner: 0, kind: 'infantry', x: 4, y, hp: 10, moved: true, acted: true });
  s.sites = [{ x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 6 }, { x: 6, y: 5 }, { x: 3, y: 9 }]
    .map((p, n) => ({ ...p, id: `goal-${n}`, kind: 'village', name: `Objective ${n}`, owner: 1, heldSince: 0, recruited: false }));
  const view = observe(s, 0), before = structuredClone(view);
  assert.ok(view.tiles.filter(t => t.site).every(t => t.site!.owner === 1), '五據點的身份均為合法可見資訊');
  assert.ok(view.legalActions.some(a => a.type === 'Move' && a.unitId === 'walker' && a.to.x === 3 && a.to.y === 6));
  // Terrain-only distances: 2,3,3,3,4. With the friendly wall: 10,9,9,11,4.
  // Equal-value holdings must prefer the four-step southern route over a
  // nine-step detour. The old top-four cutoff selected north (3,4).
  assert.deepEqual(chooseAction(view), { type: 'Move', unitId: 'walker', to: { x: 3, y: 6 } });
  assert.deepEqual(chooseAction(structuredClone(view)), chooseAction(view), '確定性');
  assert.deepEqual(view, before, '唯讀Observation');
});
