import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createGame, observe, applyCommand, visibility } from '../../project/src/core/game.ts';
import { chooseAction } from '../../project/src/core/ai.ts';
import type { GameState, Observation, Action } from '../../project/src/core/types.ts';
const aiPath = new URL('../../project/src/core/ai.ts', import.meta.url);
const hash = () => createHash('sha256').update(readFileSync(aiPath)).digest('hex');
const beforeHash = hash();
function fixture(): GameState {
  const s = createGame('C5-R2-central-search-counterexample');
  s.terrain.fill('plain'); s.sites = []; s.relics = []; s.pendingRelic = null;
  s.units = [
    { id: 'patrol-0', owner: 0, kind: 'scout', x: 2, y: 2, hp: 7, moved: false, acted: false },
    { id: 'survivor-1', owner: 1, kind: 'infantry', x: 12, y: 12, hp: 10, moved: false, acted: false },
  ];
  for (const f of s.factions) { f.gold = 0; f.centerId = null; f.life = 'exiled'; }
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  s.factions[0].techs = ['farm', 'archery', 'pathfinding'];
  return s;
}
function play(s: GameState, a: Action, id = 'diagnostic'): GameState {
  const result = applyCommand(s, { actor: s.active, expectedVersion: s.version, requestId: `${id}-${s.version}`, action: a });
  assert.equal(result.ok, true, result.error);
  return result.state;
}
const initialState = fixture(), initial = observe(initialState, 0);
const moves = initial.legalActions.filter((a): a is Extract<Action, {type:'Move'}> => a.type === 'Move');
const initialVisible = initial.tiles.filter(t => t.visibility === 'visible').length;
const gains = moves.map(a => {
  const next = observe(play(initialState, a, `move-${a.to.x}-${a.to.y}`), 0);
  return { to: a.to, newlyVisibleRememberedLand: next.tiles.filter((t, i) => t.visibility === 'visible' && initial.tiles[i].visibility === 'explored').length };
});
assert.deepEqual(chooseAction(initial), {type:'EndTurn'});
assert.equal(moves.length, 12);
assert.ok(gains.some(g => g.newlyVisibleRememberedLand > 0));
const unknownState = fixture();
unknownState.explored[0] = visibility(unknownState, 0); unknownState.surveyed[0] = visibility(unknownState, 0);
const unknown = observe(unknownState, 0), unknownAction = chooseAction(unknown);
assert.equal(unknownAction?.type, 'Move');
const truthVariant = fixture(); truthVariant.units[1].x = 13;
assert.deepEqual(observe(truthVariant, 0), initial);
assert.deepEqual(chooseAction(observe(truthVariant, 0)), chooseAction(initial));
function freeze<T>(x:T):T { if(x && typeof x === 'object') { Object.freeze(x); for (const v of Object.values(x)) freeze(v); } return x; }
const frozen = freeze(structuredClone(initial)), frozenJSON = JSON.stringify(frozen);
chooseAction(unknown); const afterInterleaving = chooseAction(frozen);
assert.deepEqual(afterInterleaving, chooseAction(structuredClone(initial)));
assert.equal(JSON.stringify(frozen), frozenJSON);
let s = fixture(), seen = false, commands = 0, movesMade = 0;
const union = new Set<number>(), positions = new Set<string>(), phaseStarts: unknown[] = [];
let previousPhase = -1;
for (; commands < 400 && s.winner === null; commands++) {
  const view = observe(s, s.active);
  if (s.active === 0) {
    view.tiles.forEach((t, i) => { if (t.visibility === 'visible') union.add(i); });
    const unit = view.units.find(u => u.owner === 0)!; positions.add(`${unit.x},${unit.y}`);
    seen ||= view.units.some(u => u.owner === 1);
    const phase = Math.floor((view.faction.ownTurns - 1) / 32) % 4;
    if (phase !== previousPhase) { phaseStarts.push({ command: commands, ownTurns: view.faction.ownTurns, phase, at: {x:unit.x,y:unit.y}, action: chooseAction(view) }); previousPhase = phase; }
  }
  const action = s.active === 0 ? chooseAction(view) : {type:'EndTurn'} as Action;
  assert.ok(action); assert.ok(view.legalActions.some(a => JSON.stringify(a) === JSON.stringify(action)));
  if(action.type === 'Move') movesMade++;
  s = play(s, action, 'trace');
}
const positionsList = [...positions].map(p => p.split(',').map(Number));
assert.ok(positionsList.every(([x,y]) => x===2 || x===21 || y===2 || y===21));
assert.equal(seen, false);
assert.ok(union.size <= 476);
for(let y=7;y<=16;y++) for(let x=7;x<=16;x++) assert.equal(union.has(y*24+x),false);
assert.equal(hash(), beforeHash, 'AI source changed during run');
console.log(JSON.stringify({
  schema:'project4x-c5-r4-readonly-root-analysis-1', aiSha256: beforeHash,
  initial: {ownTurns:initial.faction.ownTurns, visibleTiles:initialVisible, exploredButNotVisible:initial.tiles.filter(t=>t.visibility==='explored').length, unknownTiles:initial.tiles.filter(t=>t.visibility==='unknown').length, visibleEnemyCount:initial.units.filter(u=>u.owner!==0).length, legalMoves:moves.length, action:chooseAction(initial), gains},
  unknownVariant:{unknownTiles:unknown.tiles.filter(t=>t.visibility==='unknown').length, action:unknownAction},
  boundary:{sameObservationDifferentHiddenTruth:true, deepFreeze:true, cloneDeterminism:true, interleavingIndependence:true},
  boundedTrace:{commands, movesMade, unionVisibleTiles:union.size, neverVisibleTiles:576-union.size, positionsOnFourCornerRectangle:true, seen, winner:s.winner, phaseStarts},
},null,2));
