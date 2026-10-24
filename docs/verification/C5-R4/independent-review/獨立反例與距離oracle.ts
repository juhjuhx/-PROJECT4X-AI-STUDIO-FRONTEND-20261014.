import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from './凍結來源/src/core/game';
import { chooseAction } from './凍結來源/src/core/ai';
import { chooseAction as seam, qaDistanceField as field, qaPrimary, qaFallbackIds } from './凍結來源/src/core/候選QA接縫';
import { chooseAction as legacy, qaDistanceField as oldField } from './凍結來源/src/core/R3QA接縫';
import type { GameState, Observation, Point, Action } from './凍結來源/src/core/types';

function base(): GameState {
  const s = createGame('獨立C5-R4終審');
  s.terrain.fill('plain'); s.sites = []; s.relics = []; s.pendingRelic = null;
  s.explored[0].fill(true); s.surveyed[0].fill(true);
  for (const f of s.factions) { f.gold = 0; f.life = 'exiled'; f.centerId = null; }
  s.units = [
    { id: 'left-0', owner: 0, kind: 'scout', x: 0, y: 0, hp: 7, moved: false, acted: false },
    { id: 'friend-2', owner: 0, kind: 'infantry', x: 7, y: 3, hp: 10, moved: true, acted: true },
    { id: 'hidden-1', owner: 1, kind: 'infantry', x: 23, y: 23, hp: 10, moved: false, acted: false },
  ];
  return s;
}
const adj = (p: Point, w: number, h: number) => [[p.x - 1, p.y], [p.x + 1, p.y], [p.x, p.y - 1], [p.x, p.y + 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < w && y < h).map(([x, y]) => y * w + x);
const knownPassable = (v: Observation, i: number) => v.tiles[i].terrain !== null && !['mountain', 'water'].includes(v.tiles[i].terrain!);
function freeze<T>(v: T): T { if (v && typeof v === 'object') { for (const x of Object.values(v)) freeze(x); Object.freeze(v); } return v; }
// Independent definition: one unweighted BFS per allowed source, then take min(cost + path).
// This intentionally does not use production's bucket scheduler or neighbor helper.
function oracle(v: Observation, sources: Point[], blocked: Set<number>, costs: number[]): number[] {
  const out = v.tiles.map(() => Infinity);
  for (const p of sources) {
    const i = p.y * v.width + p.x;
    if (!knownPassable(v, i) || blocked.has(i)) continue;
    const queue = [i], steps = v.tiles.map(() => -1); steps[i] = 0;
    for (let head = 0; head < queue.length; head++) {
      const at = queue[head]; out[at] = Math.min(out[at], steps[at] + costs[i]);
      const x = at % v.width, y = Math.floor(at / v.width);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, next = ny * v.width + nx;
        if (nx < 0 || ny < 0 || nx >= v.width || ny >= v.height || steps[next] >= 0 || blocked.has(next) || !knownPassable(v, next)) continue;
        steps[next] = steps[at] + 1; queue.push(next);
      }
    }
  }
  return out;
}
let maps = 0, primaryFields = 0, comparedKnown = 0, primaryActionParity = 0, weightedFields = 0, blockedSources = 0, determinismCases = 0;
for (let n = 0; n < 16; n++) {
  const s = base();
  for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) {
    const i = y * s.width + x;
    s.terrain[i] = (x * 13 + y * 19 + n * 11) % 19 === 0 ? 'mountain' : (x * 7 + y * 17 + n * 3) % 31 === 0 ? 'water' : 'plain';
    if ((x * 3 + y * 11 + n * 5) % 13 < 3) { s.explored[0][i] = false; s.surveyed[0][i] = false; }
  }
  for (const [x, y] of [[0, 0], [0, 1], [1, 0], [7, 3], [23, 23]]) s.terrain[y * s.width + x] = 'plain';
  if (n % 2) s.factions[0].techs = ['pathfinding'];
  const v = observe(s, 0), before = structuredClone(v), action = chooseAction(v);
  assert.deepEqual(seam(v), action, '外部QA接縫與產品行動相同');
  const newFn = field, primary = qaPrimary;
  const oldAction = legacy(v), oldFn = oldField;
  assert.ok(primary); assert.ok(newFn); assert.ok(oldFn);
  const boundary = v.tiles.filter(t => t.visibility === 'unknown' && adj(t, v.width, v.height).some(i => knownPassable(v, i)));
  const expectedSources = v.tiles.filter(t => knownPassable(v, t.y * v.width + t.x) && adj(t, v.width, v.height).some(i => v.tiles[i].visibility === 'unknown'));
  assert.deepEqual(primary.sources, expectedSources); assert.deepEqual(primary.tile, boundary[0]);
  const actualTraffic = new Set(v.units.filter(u => u.id !== 'left-0').map(u => u.y * v.width + u.x));
  const withBlockedSource = new Set(actualTraffic); withBlockedSource.add(expectedSources[n % expectedSources.length].y * v.width + expectedSources[n % expectedSources.length].x); blockedSources++;
  for (const blockers of [new Set<number>(), actualTraffic, withBlockedSource]) {
    const a = newFn(primary.sources, blockers, true, primary.sourceCosts), b = oldFn(boundary, blockers);
    for (let i = 0; i < v.tiles.length; i++) {
      if (v.tiles[i].terrain !== null) { assert.equal(a[i], b[i], `primary field mismatch map ${n} cell ${i}`); comparedKnown++; }
      else assert.equal(a[i], Infinity, '新探索距離不途經未知地形');
    }
    primaryFields++;
  }
  if (Number.isFinite(primary.distances[0])) { assert.deepEqual(action, oldAction); primaryActionParity++; }
  const land = v.tiles.filter((t, i) => knownPassable(v, i));
  const sources = [land[(n * 17 + 3) % land.length], land[(n * 23 + 11) % land.length], land[(n * 31 + 19) % land.length]];
  const costs = v.tiles.map(() => Infinity); sources.forEach((t, k) => costs[t.y * v.width + t.x] = 1 + (k + n) % 4);
  const blockers = new Set<number>();
  if (n % 2) blockers.add(sources[0].y * v.width + sources[0].x);
  assert.deepEqual(newFn(sources, blockers, true, costs), oracle(v, sources, blockers, costs)); weightedFields++;
  assert.deepEqual(chooseAction(freeze(structuredClone(v))), action);
  chooseAction(observe(base(), 0)); assert.deepEqual(chooseAction(v), action);
  const seedGuard = structuredClone(v); Object.defineProperty(seedGuard, 'seed', { get() { throw new Error('policy must not read seed'); } });
  assert.deepEqual(chooseAction(seedGuard), action);
  const returned = chooseAction(v); if (returned?.type === 'Move') returned.to.x = 999;
  assert.deepEqual(chooseAction(v), action); assert.deepEqual(v, before); determinismCases++; maps++;
}

// Different known terrain components: primary frontier exists for the right infantry,
// while the left scout can reveal only through a sight vantage beyond a mountain gap.
let s = base(); s.terrain.fill('mountain');
for (let y = 1; y <= 8; y++) for (let x = 1; x <= 8; x++) s.terrain[y * s.width + x] = 'plain';
for (let y = 15; y <= 21; y++) for (let x = 15; x <= 22; x++) s.terrain[y * s.width + x] = 'plain';
s.terrain[4 * s.width + 10] = 'plain'; s.terrain[23 * s.width + 23] = 'plain';
Object.assign(s.units[0], { x: 3, y: 4 }); Object.assign(s.units[1], { x: 17, y: 18, moved: false, acted: false });
for (const [x, y] of [[10, 4], [22, 18]]) { s.explored[0][y * s.width + x] = false; s.surveyed[0][y * s.width + x] = false; }
const v = observe(s, 0), initial = chooseAction(v); assert.deepEqual(seam(v), initial);
assert.equal(Number.isFinite(qaPrimary.distances[4 * s.width + 3]), false);
assert.equal(Number.isFinite(qaPrimary.distances[18 * s.width + 17]), true);
assert.deepEqual(qaFallbackIds, ['left-0']);
assert.ok(initial?.type === 'Move' && initial.unitId === 'left-0');
const hiddenTwin = structuredClone(s); hiddenTwin.terrain[4 * s.width + 10] = 'water'; hiddenTwin.units[2].x = 22;
assert.deepEqual(observe(hiddenTwin, 0), v); assert.deepEqual(chooseAction(observe(hiddenTwin, 0)), initial);
let commands = 0;
while (commands < 25 && observe(s, 0).tiles[4 * s.width + 10].visibility === 'unknown') {
  const a: Action | null = s.active === 0 ? chooseAction(observe(s, 0)) : { type: 'EndTurn' };
  assert.ok(a); const r = applyCommand(s, { actor: s.active, expectedVersion: s.version, requestId: `review-${commands}`, action: a });
  assert.equal(r.ok, true, r.error); s = r.state; commands++;
}
assert.equal(observe(s, 0).tiles[4 * s.width + 10].visibility, 'visible');
console.log(JSON.stringify({ status: 'TESTED_PASS', maps, primaryFields, comparedKnown, primaryActionParity, weightedFields, blockedSources, determinismCases, qaActionParityCases: maps + 1, crossComponent: { initialAction: initial, fallbackIds: ['left-0'], commandsToReveal: commands, visibility: 'visible' }, fogTwinObservationEquality: true, seedReadGuard: true, note: 'Small synthetic real-projector cases only; no complete game, benchmark, or full100 claim.' }, null, 2));
