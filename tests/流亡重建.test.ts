import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, createGame, observe, passable } from '../src/core/game';
import { chooseAction } from '../src/core/ai';
import { deserializeGame, exportReplay, replayGame, serializeGame } from '../src/core/persistence';
import type { Action, Actor, GameState, Point } from '../src/core/types';

function play(s: GameState, action: Action): GameState {
  const result = applyCommand(s, { actor: s.active, expectedVersion: s.version, requestId: `旅程-${s.version}`, action });
  assert.equal(result.ok, true, result.error ?? '旅程命令遭拒');
  return result.state;
}
function resolveRelics(s: GameState): GameState {
  while (s.pendingRelic) s = play(s, { type: 'ResolveRelic', choice: 'gold' });
  return s;
}
function turn(s: GameState, actor: Actor): GameState {
  while (s.active !== actor) s = resolveRelics(play(resolveRelics(s), { type: 'EndTurn' }));
  return resolveRelics(s);
}
// Test driver plans against the generated map; it never edits game truth.
function travel(s: GameState, unitId: string, target: Point): GameState {
  for (let n = 0; n < 100; n++) {
    const unit = s.units.find(u => u.id === unitId)!;
    s = turn(s, unit.owner);
    if (unit.x === target.x && unit.y === target.y) return s;
    const path: Point[] = [unit], previous = new Map<number, number>();
    const key = (p: Point) => p.y * s.width + p.x;
    previous.set(key(unit), -1);
    for (let i = 0; i < path.length && !previous.has(key(target)); i++) {
      const p = path[i];
      for (const next of [{ x: p.x, y: p.y - 1 }, { x: p.x - 1, y: p.y }, { x: p.x + 1, y: p.y }, { x: p.x, y: p.y + 1 }]) {
        if (next.x < 0 || next.x >= s.width || next.y < 0 || next.y >= s.height || previous.has(key(next)) || !passable(s.terrain[key(next)]) || s.units.some(u => u.id !== unitId && u.x === next.x && u.y === next.y)) continue;
        previous.set(key(next), key(p)); path.push(next);
      }
    }
    assert.ok(previous.has(key(target)), '生成地圖上的旅程必須可達');
    const route: number[] = []; let cursor = key(target);
    while (cursor !== key(unit)) { route.unshift(cursor); cursor = previous.get(cursor)!; }
    const moves = observe(s, unit.owner).legalActions.filter((a): a is Extract<Action, { type: 'Move' }> => a.type === 'Move' && a.unitId === unitId);
    const destination = route.filter(k => moves.some(a => key(a.to) === k)).at(-1);
    if (destination !== undefined) s = resolveRelics(play(s, moves.find(a => key(a.to) === destination)!));
    if (s.units.find(u => u.id === unitId)!.x === target.x && s.units.find(u => u.id === unitId)!.y === target.y) return s;
    s = resolveRelics(play(s, { type: 'EndTurn' }));
  }
  throw Error('測試旅程超限，沒有改寫勝負');
}
function roundTrip(s: GameState): GameState {
  const restored = deserializeGame(serializeGame(s));
  assert.deepEqual(restored, s);
  assert.deepEqual(replayGame(exportReplay(s)), s);
  return restored;
}

test('G1實際命令旅程：流亡可選異地建國或故土復國，兩條分支均可保存重播', () => {
  let s = createGame('G1-流亡重建旅程');
  const identity = s.factions[0].identityId, lineage = s.factions[0].lineageId;
  const original = s.factions[0].originalCapitalId;
  const village = s.sites.find(site => site.id === '村莊-0')!;
  s = travel(s, '兵-1', village);
  s = play(s, { type: 'Capture', unitId: '兵-1' });
  const leave = observe(s, 0).legalActions.find(a => a.type === 'Move' && a.unitId === '兵-0');
  assert.ok(leave); s = play(s, leave);
  s = turn(s, 1);
  s = travel(s, '兵-3', s.sites.find(site => site.id === original)!);
  s = play(s, { type: 'Capture', unitId: '兵-3' });
  s = turn(s, 0);
  assert.equal(s.factions[0].life, 'exiled');
  assert.equal(s.factions[0].centerId, null);
  assert.equal(s.winner, null);
  const exiled = roundTrip(s);

  // The AI explicitly chooses a new polity; control is not restored by the core.
  const abroadAction = chooseAction(observe(exiled, 0));
  assert.deepEqual(abroadAction, { type: 'EstablishCapital', siteId: village.id });
  const abroad = roundTrip(play(exiled, abroadAction!));
  assert.equal(abroad.factions[0].centerId, village.id);
  assert.equal(abroad.factions[0].gold, exiled.factions[0].gold);
  assert.equal(abroad.sites.find(site => site.id === original)!.owner, 1);
  assert.deepEqual(abroad.units, exiled.units);

  // Alternatively remain exiled and reclaim the original city through commands.
  s = turn(exiled, 1);
  const withdraw = observe(s, 1).legalActions.find(a => a.type === 'Move' && a.unitId === '兵-3');
  assert.ok(withdraw); s = play(s, withdraw);
  s = turn(s, 0);
  s = play(s, { type: 'Move', unitId: '兵-0', to: { x: 3, y: 3 } });
  s = play(s, { type: 'Capture', unitId: '兵-0' });
  s = roundTrip(s);
  assert.equal(s.factions[0].life, 'exiled');
  assert.equal(s.factions[0].centerId, null);
  assert.equal(observe(s, 0).legalActions.some(a => a.type === 'EstablishCapital' && a.siteId === original), false);
  const tooEarly = applyCommand(s, { actor: 0, expectedVersion: s.version, requestId: '未完整控制', action: { type: 'EstablishCapital', siteId: original } });
  assert.equal(tooEarly.ok, false); assert.strictEqual(tooEarly.state, s);
  s = turn(play(s, { type: 'EndTurn' }), 0);
  const before = s;
  s = roundTrip(play(s, { type: 'EstablishCapital', siteId: original }));
  assert.equal(s.factions[0].life, 'active');
  assert.equal(s.factions[0].centerId, original);
  assert.equal(s.factions[0].gold, before.factions[0].gold);
  assert.deepEqual(s.units, before.units);
  assert.deepEqual(s.sites, before.sites);
  for (const branch of [abroad, s]) {
    assert.equal(branch.factions[0].identityId, identity);
    assert.equal(branch.factions[0].lineageId, lineage);
    assert.equal(branch.factions[0].originalCapitalId, original);
    assert.equal(branch.winner, null);
  }
});
