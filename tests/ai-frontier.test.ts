import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from '../src/core/game';
import { chooseAction } from '../src/core/ai';
import type { Action, GameState, Observation } from '../src/core/types';

// Synthetic observations through the real projector; no generated private world.
function world(): GameState {
  const s = createGame('C5-R4-frontier-fixture');
  s.terrain.fill('plain'); s.sites = []; s.relics = []; s.pendingRelic = null;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  for (const f of s.factions) { f.gold = 0; f.centerId = null; f.life = 'exiled'; }
  s.units = [
    { id: 'patrol-0', owner: 0, kind: 'scout', x: 2, y: 2, hp: 7, moved: false, acted: false },
    { id: 'hidden-1', owner: 1, kind: 'infantry', x: 22, y: 22, hp: 10, moved: false, acted: false },
  ];
  return s;
}
function play(s: GameState, action: Action): GameState {
  const r = applyCommand(s, { actor: s.active, requestId: `frontier-${s.version}`, expectedVersion: s.version, action });
  assert.equal(r.ok, true, r.error ?? 'policy must submit a legal action');
  return r.state;
}
function centralUnknown(): GameState {
  const s = world(), x = 12, y = 12;
  s.explored[0][y * s.width + x] = false;
  s.surveyed[0][y * s.width + x] = false;
  // Sight is a Manhattan radius, without terrain occlusion. A known vantage
  // can reveal this unknown tile despite its four known mountain neighbors.
  for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) s.terrain[(y + dy) * s.width + x + dx] = 'mountain';
  return s;
}
function corridor(): GameState {
  const s = world(); s.terrain.fill('mountain');
  for (let x = 0; x <= 6; x++) s.terrain[2 * s.width + x] = 'plain';
  s.terrain[22 * s.width + 22] = 'plain';
  Object.assign(s.units[0], { kind: 'infantry', hp: 10 });
  return s;
}
function freeze<T>(v: T): T {
  if (v && typeof v === 'object') { for (const x of Object.values(v)) freeze(x); Object.freeze(v); }
  return v;
}

test('C5-R4：中央未知格沒有可進入鄰格時，仍走向合法已知視野vantage', () => {
  const s = centralUnknown(), v = observe(s, 0);
  assert.equal(v.tiles.filter(t => t.visibility === 'unknown').length, 1);
  assert.ok([[0, 0], [23, 0], [0, 23], [23, 23]].every(([x, y]) => v.tiles[y * v.width + x].visibility !== 'unknown'));
  const a = chooseAction(v);
  assert.equal(a?.type, 'Move', '山圈不阻擋視野；應先走到可揭露資訊的已知位置');
  assert.ok(a && v.legalActions.some(x => JSON.stringify(x) === JSON.stringify(a)));
  const after = play(s, a!);
  assert.ok(after.units[0].x + after.units[0].y > 4, '初始合法步驟應接近未知幾何區域');
});

test('C5-R4：少量真命令可揭露山圈中的未知區域，而非只有方向斷言', () => {
  let s = centralUnknown();
  for (let n = 0; n < 80 && observe(s, 0).tiles.some(t => t.visibility === 'unknown') && s.winner === null; n++) {
    const v = observe(s, s.active), a = s.active === 0 ? chooseAction(v) : { type: 'EndTurn' } as const;
    assert.ok(a); s = play(s, a);
  }
  assert.equal(observe(s, 0).tiles.filter(t => t.visibility === 'unknown').length, 0, '必須真的揭露，不能只聲稱探索');
});

test('C5-R4：已知七格廊道仍有不可見情報時，不停在原四角目標', () => {
  const s = corridor(), v = observe(s, 0);
  assert.equal(v.tiles.some(t => t.visibility === 'unknown'), false);
  assert.deepEqual(v.legalActions, [
    { type: 'Move', unitId: 'patrol-0', to: { x: 1, y: 2 } },
    { type: 'Move', unitId: 'patrol-0', to: { x: 3, y: 2 } }, { type: 'EndTurn' },
  ]);
  assert.equal(v.tiles[2 * s.width + 5].visibility, 'explored');
  const a = chooseAction(v);
  assert.deepEqual(a, { type: 'Move', unitId: 'patrol-0', to: { x: 3, y: 2 } });
  assert.equal(observe(play(s, a!), 0).tiles[2 * s.width + 5].visibility, 'visible');
});

test('C5-R4：目前可達地形全可見時，不為不可達偵巡目標反覆移動', () => {
  const s = corridor(); s.terrain[2 * s.width + 4] = 'mountain';
  const v = observe(s, 0);
  assert.ok(v.legalActions.some(a => a.type === 'Move'));
  assert.deepEqual(chooseAction(v), { type: 'EndTurn' });
});

test('C5-R4 Fog：不同隱藏地形與敵兵位置，完全相同Observation產生相同行動', () => {
  const a = centralUnknown(), b = structuredClone(a);
  b.terrain[12 * b.width + 12] = 'water'; b.units[1].x = 20;
  const va = observe(a, 0), vb = observe(b, 0);
  assert.deepEqual(va, vb, 'oracle truth必須真的被projector隔離');
  const result = chooseAction(va);
  assert.deepEqual(chooseAction(vb), result);
  assert.ok(result && va.legalActions.some(x => JSON.stringify(x) === JSON.stringify(result)));
});

test('C5-R4：山脈隔絕所有資訊vantage時，只能選合法動作並合理等待', () => {
  const s = corridor();
  s.explored[0][12 * s.width + 12] = false; s.surveyed[0][12 * s.width + 12] = false;
  const v = observe(s, 0);
  assert.ok(v.legalActions.some(a => a.type === 'Move'));
  assert.equal(v.tiles.filter(t => t.visibility === 'unknown').length, 1);
  assert.deepEqual(chooseAction(v), { type: 'EndTurn' });
});

test('C5-R4：友軍暫時截斷已知探索路線時，仍合法接近而不穿兵', () => {
  const s = corridor();
  for (let x = 0; x <= 8; x++) s.terrain[2 * s.width + x] = 'plain';
  s.units[0].x = 0;
  s.units.push({ id: 'friend-2', owner: 0, kind: 'infantry', x: 2, y: 2, hp: 10, moved: true, acted: true });
  s.explored[0][2 * s.width + 8] = false; s.surveyed[0][2 * s.width + 8] = false;
  const v = observe(s, 0), a = chooseAction(v);
  assert.deepEqual(a, { type: 'Move', unitId: 'patrol-0', to: { x: 1, y: 2 } });
  const after = play(s, a!);
  assert.equal(after.units.find(u => u.id === 'friend-2')!.x, 2);
  assert.equal(after.units.find(u => u.id === 'patrol-0')!.x, 1);
});

test('C5-R4：新探索不無條件壓過合法攻擊與佔領', () => {
  const s = centralUnknown(); Object.assign(s.units[0], { kind: 'infantry', hp: 10 });
  Object.assign(s.units[1], { x: 3, y: 2 });
  assert.deepEqual(chooseAction(observe(s, 0)), { type: 'Attack', unitId: 'patrol-0', targetId: 'hidden-1' });
  s.sites = [{ id: 'capture', kind: 'village', name: 'Fixture', x: 2, y: 2, owner: 1, heldSince: 0, recruited: false }];
  assert.deepEqual(chooseAction(observe(s, 0)), { type: 'Capture', unitId: 'patrol-0' });
});

test('C5-R4：低視野友軍佔據vantage時，保留可繞行並真揭露的路線', () => {
  let s = world(); s.units[0].x = 5;
  s.units.push({ id: 'friend-2', owner: 0, kind: 'infantry', x: 6, y: 2, hp: 10, moved: true, acted: true });
  s.explored[0][2 * s.width + 9] = false; s.surveyed[0][2 * s.width + 9] = false;
  const v = observe(s, 0), detour: Action = { type: 'Move', unitId: 'patrol-0', to: { x: 6, y: 1 } };
  assert.equal(v.tiles.filter(t => t.visibility === 'unknown').length, 1);
  assert.ok(v.legalActions.some(a => JSON.stringify(a) === JSON.stringify(detour)));
  assert.deepEqual(chooseAction(v), detour, '佔據的友軍格不能掩蓋可通行的觀測位置');
  s = play(s, detour); s = play(s, { type: 'EndTurn' }); s = play(s, { type: 'EndTurn' });
  s = play(s, { type: 'Move', unitId: 'patrol-0', to: { x: 7, y: 1 } });
  assert.equal(observe(s, 0).tiles[2 * s.width + 9].visibility, 'visible');
});

test('C5-R4：deepfreeze／clone／重複／穿插決策／回傳修改均不影響確定性', () => {
  const v: Observation = observe(centralUnknown(), 0), before = structuredClone(v);
  const frozen = freeze(structuredClone(v)), expected = chooseAction(frozen);
  for (let n = 0; n < 4; n++) {
    assert.deepEqual(chooseAction(v), expected); assert.deepEqual(chooseAction(structuredClone(v)), expected);
    chooseAction(observe(corridor(), 0)); assert.deepEqual(chooseAction(v), expected);
  }
  const returned = chooseAction(v);
  if (returned?.type === 'Move') returned.to.x = 999;
  assert.deepEqual(chooseAction(v), expected); assert.deepEqual(v, before);
});
