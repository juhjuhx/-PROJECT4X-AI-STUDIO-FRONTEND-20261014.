import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createGame, observe, applyCommand } from '../src/core/game';
import { chooseAction } from '../src/core/ai';
import type { Action } from '../src/core/types';

// Reconstructed synthetic QA fixture, not a generated seed/save or a player
// replay. The stationary central enemy is known only to this test oracle.
const policyHash = () => createHash('sha256').update(readFileSync(new URL('../src/core/ai.ts', import.meta.url))).digest('hex');
const source = policyHash(), started = performance.now();
let state = createGame('C5-R2-central-search-counterexample');
state.terrain.fill('plain'); state.sites = []; state.relics = []; state.pendingRelic = null;
state.units = [
  { id: 'patrol-0', owner: 0, kind: 'scout', x: 2, y: 2, hp: 7, moved: false, acted: false },
  { id: 'survivor-1', owner: 1, kind: 'infantry', x: 12, y: 12, hp: 10, moved: false, acted: false },
];
for (const faction of state.factions) { faction.gold = 0; faction.centerId = null; faction.life = 'exiled'; }
state.explored[0].fill(true); state.surveyed[0].fill(true);
state.factions[0].techs = ['farm', 'archery', 'pathfinding'];
assert.equal(observe(state, 0).units.some(u => u.owner === 1), false);
let seen = false, commands = 0;
for (; commands < 1000 && state.winner === null; commands++) {
  assert.ok(performance.now() - started < 30_000, '診斷超時，不能當終局');
  const view = observe(state, state.active);
  if (state.active === 0 && view.units.some(u => u.owner === 1)) seen = true;
  const action: Action | null = state.active === 0 ? chooseAction(view) : { type: 'EndTurn' };
  assert.ok(action);
  const r = applyCommand(state, { actor: state.active, expectedVersion: state.version, requestId: `central-${commands}`, action });
  assert.equal(r.ok, true, r.error ?? '合法行動遭拒絕');
  state = r.state;
}
// Include information revealed by the final command, even at the QA bound.
seen ||= observe(state, 0).units.some(u => u.owner === 1);
assert.equal(policyHash(), source);
const pass = seen && state.winner === 0;
console.log(JSON.stringify({ schema: 'project4x-central-search-counterexample-1', source,
  status: pass ? 'TESTED_PASS' : 'TESTED_FAIL', commands, maxCommands: 1000, seen,
  turn: state.turn, winner: state.winner, milliseconds: Math.round(performance.now() - started),
  inputBoundary: 'AI receives only same actor Observation; fixture truth never supplied',
  scope: 'RECONSTRUCTED_BY_CODEX synthetic patrol counterexample; does not explain seed010 active-front stalemate',
}, null, 2));
if (!pass) process.exitCode = 1;
