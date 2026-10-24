import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { readFileSync } from 'node:fs';
import { createGame, observe } from './frozen/baseline/src/core/game';
import type { Action, Observation } from './frozen/baseline/src/core/types';

const variants = process.argv.slice(2);
assert.ok(variants.length > 0, 'Specify frozen variant names.');
const iterations = 30;
const warmups = 4;
const sha = (text: string) => createHash('sha256').update(text).digest('hex');

// This block is byte-for-byte the R3 synthetic state setup after import lines.
function originalR3() {
const s=createGame('有界性能-合成交通牆');s.terrain.fill('plain');s.units=[];s.sites=[];s.relics=[];s.pendingRelic=null;
s.factions[0].gold=0;s.explored[0].fill(true);s.surveyed[0].fill(true);
for(let n=0;n<40;n++)s.units.push({id:`fresh-${n}`,owner:0,kind:'infantry',x:(n%6)*2,y:Math.floor(n/6)*2,hp:10,moved:false,acted:false});
for(let y=0;y<24;y++)s.units.push({id:`wall-${y}`,owner:0,kind:'infantry',x:12,y,hp:10,moved:true,acted:true});
for(let n=0;n<10;n++)s.sites.push({id:`goal-${n}`,name:`目標-${n}`,kind:'village',owner:1,x:18,y:n*2,heldSince:0,recruited:false});
  return s;
}

function unknownFrontier() {
  const s = originalR3();
  s.seed = '有界性能-合成未知邊界';
  s.sites = [];
  s.explored[0].fill(false);
  s.surveyed[0].fill(false);
  return s;
}

function knownPatrol() {
  const s = originalR3();
  s.seed = '有界性能-合成已知巡邏';
  s.sites = [];
  return s;
}

const scenarios = [
  { id: 'r3-exact-traffic-wall', state: originalR3(), construction: 'Exact R3 64 units = 40 fresh + 24 wall, 10 goals.' },
  { id: 'unknown-frontier-traffic-wall', state: unknownFrontier(), construction: 'Same 64 units; no sites; explored/surveyed reset; Observation visibility remains engine-produced.' },
  { id: 'known-patrol-traffic-wall', state: knownPatrol(), construction: 'Same 64 units; no sites; fully explored/surveyed; exercises patrol component and waypoint BFS.' },
];

function assertPolicyResult(view: Observation, before: Observation, action: Action | null, expected: Action | null) {
  assert.deepEqual(view, before, 'chooseAction mutated its Observation input');
  assert.ok(action !== null && view.legalActions.some(a => JSON.stringify(a) === JSON.stringify(action)), 'chooseAction returned a non-legal action');
  assert.deepEqual(action, expected, 'Repeated immutable input produced a different action');
  assert.ok(!view.legalActions.some(a => a === action), 'Action return aliases a legalActions member');
}

const results = [];
for (const variant of variants) {
  const plain = await import(`./frozen/${variant}/src/core/ai.ts`);
  const measured = await import(`./frozen/${variant}/src/core/measured-ai.ts`);
  const instrumentation = JSON.parse(readFileSync(new URL(`./${variant}-instrumentation.json`, import.meta.url), 'utf8'));
  for (const scenario of scenarios) {
    const view = observe(scenario.state, 0);
    const before = structuredClone(view);
    // The first warmup also supplies the independent repeatability reference.
    const expected = plain.chooseAction(view);
    assertPolicyResult(view, before, expected, expected);
    for (let n = 1; n < warmups; n++) assertPolicyResult(view, before, plain.chooseAction(view), expected);
    const times: number[] = [];
    for (let n = 0; n < iterations; n++) {
      const start = performance.now();
      const action = plain.chooseAction(view);
      times.push(performance.now() - start);
      assertPolicyResult(view, before, action, expected);
    }
    for (let n = 0; n < warmups; n++) assertPolicyResult(view, before, measured.chooseAction(view), expected);
    for (const key of Object.keys(measured.reviewMetrics)) measured.reviewMetrics[key] = 0;
    const perCallCounters = [];
    for (let n = 0; n < iterations; n++) {
      const previous = { ...measured.reviewMetrics };
      assertPolicyResult(view, before, measured.chooseAction(view), expected);
      perCallCounters.push(Object.fromEntries(Object.entries(measured.reviewMetrics).map(([k, v]) => [k, Number(v) - Number(previous[k])])));
    }
    for (const counters of perCallCounters) assert.deepEqual(counters, perCallCounters[0], 'Counter totals vary for the same input');
    const sorted = [...times].sort((a, b) => a - b);
    results.push({
      variant,
      scenario: scenario.id,
      scenarioConstruction: scenario.construction,
      observationSha256: sha(JSON.stringify(view)),
      aiSha256: sha(readFileSync(new URL(`./frozen/${variant}/src/core/ai.ts`, import.meta.url), 'utf8')),
      units: view.units.length,
      movableFreshUnits: new Set(view.legalActions.filter(a => a.type === 'Move').map(a => a.unitId)).size,
      legalActions: view.legalActions.length,
      legalMoveActions: view.legalActions.filter(a => a.type === 'Move').length,
      knownSiteTiles: view.tiles.filter(t => t.site).length,
      unknownTiles: view.tiles.filter(t => t.visibility === 'unknown').length,
      iterations,
      warmups,
      latency: {
        source: 'Uninstrumented frozen ai.ts; chooseAction only, no assertions or Observation creation inside timer.',
        percentileDefinition: 'Exact R3 indexes: sorted[15] median, sorted[28] p95 for 30 calls.',
        medianMs: sorted[15],
        p95Ms: sorted[28],
        minMs: sorted[0],
        maxMs: sorted.at(-1),
        samplesMs: times,
      },
      countersPerCall: perCallCounters[0],
      frontierSpecificCounters: {
        ...instrumentation.frontierSpecificCounters,
        candidateCount: perCallCounters[0].frontierUniqueVantages ?? null,
        searchExpansions: perCallCounters[0].frontierNodeExpansions ?? null,
      },
      action: expected,
      assertions: { immutableObservation: true, legalAction: true, repeatable: true, plainMeasuredEquivalent: true, detachedAction: true },
    });
  }
}
console.log(JSON.stringify({ schema: 'c5-r4-independent-bounded-performance-1', generatedAt: new Date().toISOString(), executionOrder: variants, scenarios: scenarios.map(s => s.id), results }, null, 2));
