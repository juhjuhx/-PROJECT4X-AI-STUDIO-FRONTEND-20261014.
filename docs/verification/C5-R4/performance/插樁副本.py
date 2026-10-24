#!/usr/bin/env python3
"""第二候選外部插樁；來源 hook 不符即中止，不改 production。"""
from pathlib import Path
import hashlib
import json
import sys

root = Path(__file__).resolve().parent
variant = sys.argv[1]
source = root / 'frozen' / variant / 'src/core/ai.ts'
text = source.read_text()
hooks = []

def patch(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected 1 source hook, got {count}')
    text = text.replace(old, new, 1)
    hooks.append(label)

keys = ['bfsCalls', 'bfsNodeExpansions', 'bfsSourceSeeds', 'searchCalls', 'searchNodePops', 'searchNodeExpansions', 'sourceCandidates', 'sourceSeedsAccepted', 'sourceSeedsRejectedBlocked', 'weightedDijkstraCalls', 'weightedBucketPops', 'weightedNodeExpansions', 'weightedStalePops', 'legalMoveCandidates', 'movementGoals', 'routeGoalCandidatesExamined', 'routeGoalCandidatesRetained', 'fallbackUnits']
if variant == 'candidate':
    keys += ['frontierSightClasses', 'frontierGeometryCellUpdates', 'frontierVantageCandidateOccurrences', 'frontierUniqueVantages', 'frontierGoalSources', 'frontierNodeExpansions', 'patrolComponentBfsCalls', 'patrolComponentNodeExpansions', 'patrolWaypointCandidates', 'patrolWaypointBfsCalls', 'patrolWaypointNodeExpansions', 'reconComponentCacheLookups', 'reconComponentCacheHits', 'reconComponentCacheMisses', 'patrolFieldCacheLookups', 'patrolFieldCacheHits', 'patrolFieldCacheMisses', 'primaryExploreGoalCount', 'primaryExploreSources', 'primaryWeightedCalls', 'primaryWeightedExpansions', 'fallbackExploreGoalCount', 'fallbackExploreSources', 'fallbackWeightedCalls', 'fallbackWeightedExpansions']
text = 'export const reviewMetrics = ' + json.dumps(dict.fromkeys(keys, 0)) + ';\n' + text

if variant == 'baseline':
    patch('    const distances = (sources: Point[], blocked = new Set<number>()): number[] => {\n', '    const distances = (sources: Point[], blocked = new Set<number>()): number[] => {\n      reviewMetrics.bfsCalls++; reviewMetrics.searchCalls++; reviewMetrics.bfsSourceSeeds += sources.length; reviewMetrics.sourceCandidates += sources.length; reviewMetrics.sourceSeedsAccepted += sources.length;\n', 'baseline-distance-calls-sources')
    old = '      for (let q = 0; q < queue.length; q++) for (const i of neighbors(view.tiles[queue[q]])) if (d[i] === Infinity && validTerrain(view.tiles[i]) && !blocked.has(i)) { d[i] = d[queue[q]] + 1; queue.push(i); }\n'
    patch(old, old.replace('q++) for', 'q++) { reviewMetrics.bfsNodeExpansions++; reviewMetrics.searchNodePops++; reviewMetrics.searchNodeExpansions++; for').rstrip() + ' }\n', 'baseline-bfs-pops-expansions')
    route = '          const d = distances(g.sources, obstacles);\n'
else:
    patch('    const distances = (sources: Point[], blocked = new Set<number>(), knownOnly = false, sourceCosts?: number[]): number[] => {\n', "    const distances = (sources: Point[], blocked = new Set<number>(), knownOnly = false, sourceCosts?: number[], reviewKind = 'distance'): number[] => {\n      reviewMetrics.searchCalls++; reviewMetrics.sourceCandidates += sources.length;\n      if (sourceCosts) reviewMetrics.weightedDijkstraCalls++; else reviewMetrics.bfsCalls++;\n      if (sourceCosts && reviewKind === 'primaryExplore') reviewMetrics.primaryWeightedCalls++;\n      if (sourceCosts && reviewKind === 'fallbackExplore') reviewMetrics.fallbackWeightedCalls++;\n      if (reviewKind === 'patrolComponent') reviewMetrics.patrolComponentBfsCalls++;\n      if (reviewKind === 'patrolWaypoint') reviewMetrics.patrolWaypointBfsCalls++;\n", 'candidate-distance-calls-sources')
    patch('          if (!blocked.has(i) && cost < d[i]) { d[i] = cost; (buckets[cost] ??= []).push(i); }\n', '          if (blocked.has(i)) reviewMetrics.sourceSeedsRejectedBlocked++;\n          if (!blocked.has(i) && cost < d[i]) { reviewMetrics.sourceSeedsAccepted++; d[i] = cost; (buckets[cost] ??= []).push(i); }\n', 'weighted-source-accepted-and-blocked')
    patch('        for (let cost = 0; cost < buckets.length; cost++) for (const current of buckets[cost] ?? []) {\n          if (d[current] !== cost) continue;\n', '        for (let cost = 0; cost < buckets.length; cost++) for (const current of buckets[cost] ?? []) {\n          reviewMetrics.weightedBucketPops++; reviewMetrics.searchNodePops++;\n          if (d[current] !== cost) { reviewMetrics.weightedStalePops++; continue; }\n          reviewMetrics.weightedNodeExpansions++; reviewMetrics.searchNodeExpansions++; reviewMetrics.frontierNodeExpansions++; if (reviewKind === "primaryExplore") reviewMetrics.primaryWeightedExpansions++; if (reviewKind === "fallbackExplore") reviewMetrics.fallbackWeightedExpansions++;\n', 'weighted-popped-valid-and-stale-nodes')
    patch('      for (const p of sources) { const i = p.y * view.width + p.x; d[i] = 0; queue.push(i); }\n', '      reviewMetrics.bfsSourceSeeds += sources.length; reviewMetrics.sourceSeedsAccepted += sources.length;\n      for (const p of sources) { const i = p.y * view.width + p.x; d[i] = 0; queue.push(i); }\n', 'unweighted-sources-accepted')
    old = '      for (let q = 0; q < queue.length; q++) for (const i of neighbors(view.tiles[queue[q]])) if (d[i] === Infinity && validTerrain(view.tiles[i]) && (!knownOnly || view.tiles[i].terrain !== null) && !blocked.has(i)) { d[i] = d[queue[q]] + 1; queue.push(i); }\n'
    counts = "q++) { reviewMetrics.bfsNodeExpansions++; reviewMetrics.searchNodePops++; reviewMetrics.searchNodeExpansions++; if (reviewKind === 'patrolComponent') reviewMetrics.patrolComponentNodeExpansions++; if (reviewKind === 'patrolWaypoint') reviewMetrics.patrolWaypointNodeExpansions++; for"
    patch(old, old.replace('q++) for', counts).rstrip() + ' }\n', 'candidate-unweighted-bfs-pops-expansions')
    patch('    const informationBySight = new Map<number, number[]>();\n', '    const informationBySight = new Map<number, number[]>();\n    const reviewFrontierVantages = new Set<number>();\n', 'unique-frontier-vantage-set')
    patch('    for (const sight of new Set(owned.map(sightFor))) {\n', '    for (const sight of new Set(owned.map(sightFor))) {\n      reviewMetrics.frontierSightClasses++;\n', 'sight-classes')
    patch('          information[i]++; sourceCosts[i] = Math.min(sourceCosts[i], Math.abs(x - t.x) + Math.abs(y - t.y));\n', '          reviewMetrics.frontierGeometryCellUpdates++;\n          information[i]++; sourceCosts[i] = Math.min(sourceCosts[i], Math.abs(x - t.x) + Math.abs(y - t.y));\n', 'information-geometry-updates')
    patch('      const frontiers = view.tiles.filter((t, i) => t.terrain !== null && validTerrain(t) && information[i] > 0);\n', '      const frontiers = view.tiles.filter((t, i) => t.terrain !== null && validTerrain(t) && information[i] > 0);\n      reviewMetrics.frontierVantageCandidateOccurrences += frontiers.length;\n      for (const t of frontiers) { const key = t.y * view.width + t.x; if (!reviewFrontierVantages.has(key)) { reviewFrontierVantages.add(key); reviewMetrics.frontierUniqueVantages++; } }\n', 'frontier-occurrences-unique-and-sources')
    patch('      goals.push(primaryExplore);\n', '      reviewMetrics.primaryExploreGoalCount++; reviewMetrics.primaryExploreSources += adjacent.length; reviewMetrics.frontierGoalSources += adjacent.length;\n      goals.push(primaryExplore);\n', 'primary-explore-goal-and-sources')
    patch('distances: distances(adjacent, new Set(), true, sourceCosts)', "distances: distances(adjacent, new Set(), true, sourceCosts, 'primaryExplore')", 'primary-weighted-category')
    patch("        goals.push({ tile: frontiers[0], sources: frontiers, purpose: 'explore', weight: 120, sight, sourceCosts, fallback: true, distances: distances(frontiers, new Set(), true, sourceCosts) });\n", "        reviewMetrics.fallbackExploreGoalCount++; reviewMetrics.fallbackExploreSources += frontiers.length; reviewMetrics.frontierGoalSources += frontiers.length;\n        goals.push({ tile: frontiers[0], sources: frontiers, purpose: 'explore', weight: 120, sight, sourceCosts, fallback: true, distances: distances(frontiers, new Set(), true, sourceCosts, 'fallbackExplore') });\n", 'fallback-committed-goal-sources-and-weighted-category')
    patch('        let land = reconComponents.get(i);\n', '        reviewMetrics.reconComponentCacheLookups++;\n        let land = reconComponents.get(i);\n        if (land) reviewMetrics.reconComponentCacheHits++; else reviewMetrics.reconComponentCacheMisses++;\n', 'component-cache-lookups-hits-misses')
    patch('          const component = distances([unit], enemyPositions, true);', "          const component = distances([unit], enemyPositions, true, undefined, 'patrolComponent');", 'component-bfs-category')
    patch('          let goal = patrolFields.get(key);\n', '          reviewMetrics.patrolWaypointCandidates++; reviewMetrics.patrolFieldCacheLookups++;\n          let goal = patrolFields.get(key);\n          if (goal) reviewMetrics.patrolFieldCacheHits++; else reviewMetrics.patrolFieldCacheMisses++;\n', 'waypoint-candidate-cache-lookups-hits-misses')
    patch('distances: distances(sources, new Set(), true)', "distances: distances(sources, new Set(), true, undefined, 'patrolWaypoint')", 'waypoint-terrain-bfs-category')
    route = "          const d = distances(g.sources, obstacles, g.purpose === 'explore' || g.purpose === 'patrol', g.sourceCosts);\n"
    updated = "          const d = distances(g.sources, obstacles, g.purpose === 'explore' || g.purpose === 'patrol', g.sourceCosts, g.purpose === 'explore' ? (g.fallback ? 'fallbackExplore' : 'primaryExplore') : g.purpose === 'patrol' ? 'patrolWaypoint' : 'distance');\n"
    patch(route, updated, 'route-search-category')
    route = updated

old = "  const movable = legal.filter((a): a is Extract<Action, { type: 'Move' }> => a.type === 'Move');\n"
patch(old, old + '  reviewMetrics.legalMoveCandidates += movable.length;\n', 'legal-move-candidate-count')
old = '    const terrainDistances = new Map(goals.map(g => [g.sources, g.distances]));\n'
patch(old, '    reviewMetrics.movementGoals += goals.length;\n' + old, 'global-movement-goals')
patch(route, '          reviewMetrics.routeGoalCandidatesExamined++;\n' + route, 'route-candidates-examined')
old = '            candidates.push({ ...g, distances: d });\n'
patch(old, '            reviewMetrics.routeGoalCandidatesRetained++;\n' + old, 'route-candidates-retained')
old = '      if (!candidates.length) {\n'
patch(old, old + '        reviewMetrics.fallbackUnits++;\n', 'fallback-units')

target = source.with_name('measured-ai.ts')
target.write_text(text)
definitions = {
    'bfsCalls': '只計 unweighted queue BFS 呼叫；weighted Dijkstra 另計。',
    'bfsNodeExpansions': '只計 unweighted queue 出列節點，含 sources。',
    'bfsSourceSeeds': '只計 unweighted 呼叫的播種來源次數。',
    'searchCalls': '所有距離場呼叫：BFS＋weighted bucket Dijkstra。',
    'searchNodePops': '全部 queue/bucket 出列，含 weighted stale entries。',
    'searchNodeExpansions': '全部有效展開；weighted stale entries 不計。',
    'sourceCandidates': '所有距離場收到的 sources 數，尚未過濾 blocked source。',
    'sourceSeedsAccepted': '實際放入 queue/bucket 的初始來源總次數。',
    'sourceSeedsRejectedBlocked': 'weighted sources 中因占位被拒絕的次數。',
    'weightedBucketPops': 'weighted bucket 全部出列，含 stale。',
    'weightedNodeExpansions': 'weighted 通過 stale guard 的有效展開。',
    'reconComponentCacheHits': '同次決策內命中已列舉 component，避免一次 component BFS。',
    'patrolFieldCacheHits': '同次決策內命中 waypoint terrain field，避免一次 terrain BFS。',
    'frontierVantageCandidateOccurrences': '幾何資訊階段評估的完整 sight-vantage 候選；不代表已建立 fallback goal。',
    'frontierGoalSources': '實際建立的 primary＋fallback explore goals 的 sources 總數。',
    'primaryExploreSources': '實際 primary goal 的已知 adjacent-unknown source 數。',
    'fallbackExploreSources': '實際 fallback goal 的已知 full-sight vantage source 數；未建立時為 0。',
    'movementGoals': '進入每單位迴圈前的全域 goals；每單位 waypoint 另外計數。',
    'routeGoalCandidatesExamined': '越過樂觀界並實際呼叫距離場的候選。',
    'routeGoalCandidatesRetained': '距離場可到達單位的候選。',
}
manifest = {'schema': 'c5-r4-weighted-external-instrumentation-1', 'variant': variant, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'instrumentedSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'hooks': hooks, 'counterDefinitions': definitions, 'frontierSpecificCounters': {'status': 'absent-in-baseline' if variant == 'baseline' else 'weighted-vantage-instrumented', 'candidateCount': None, 'searchExpansions': None}, 'latencyUses': '未插樁 ai.ts；measured 只另行計數。'}
(root / f'{variant}-instrumentation.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(manifest, ensure_ascii=False, indent=2))
