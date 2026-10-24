import { unitDefinition } from './rulesets';
import type { Action, KnownTile, Observation, Point, Unit } from './types';

const distance = (a: Point, b: Point): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
const copyAction = (action: Action): Action => structuredClone(action);
const compareIds = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;

/** Pure observation policy: no seed reconstruction, authoritative state, or memory. */
export function chooseAction(view: Observation): Action | null {
  const legal = view.legalActions;
  if (!legal.length) return null;
  const owned = view.units.filter(u => u.owner === view.actor);
  const enemies = view.units.filter(u => u.owner !== view.actor);
  const ownSites = view.tiles.filter(t => t.site?.owner === view.actor);
  const unknownTiles = view.tiles.filter(t => t.visibility === 'unknown');
  const obligatory = legal.find(a => a.type === 'ResolveRelic' && (view.faction.gold < 4 ? a.choice === 'gold' : a.choice === 'intel')) ?? legal.find(a => a.type === 'ResolveRelic');
  if (obligatory) return copyAction(obligatory);
  const capital = legal.find(a => a.type === 'EstablishCapital');
  if (capital) return copyAction(capital);
  const capture = legal.find(a => a.type === 'Capture');
  if (capture) return copyAction(capture);
  // Enter an exposed holding before spending the fresh occupier on another
  // skirmish; killing a garrison never moves its attacker into the city.
  const occupations = legal.filter((a): a is Extract<Action, { type: 'Move' }> => a.type === 'Move' && Boolean(view.tiles[a.to.y * view.width + a.to.x].site) && view.tiles[a.to.y * view.width + a.to.x].site!.owner !== view.actor);
  occupations.sort((a, b) => {
    const priority = (m: typeof occupations[number]) => { const s = view.tiles[m.to.y * view.width + m.to.x].site!; return s.centerOf !== undefined ? 3 : s.kind === 'capital' ? 2 : s.owner === null ? 0 : 1; };
    return priority(b) - priority(a) || compareIds(a.unitId, b.unitId) || a.to.y - b.to.y || a.to.x - b.to.x;
  });
  if (occupations[0]) return copyAction(occupations[0]);

  const damageBetween = (unit: Unit, target: Unit): number => {
    const tile = view.tiles[target.y * view.width + target.x];
    const cover = tile.terrain === 'forest' || tile.terrain === 'hill' || tile.site?.owner === target.owner ? 1 : 0;
    return Math.max(1, unitDefinition(view.ruleset,unit.kind).attack - unitDefinition(view.ruleset,target.kind).defense - cover);
  };
  const attacks = legal.filter((a): a is Extract<Action, { type: 'Attack' }> => a.type === 'Attack');
  if (attacks.length) {
    const damageFor = (a: typeof attacks[number]): number => damageBetween(owned.find(u => u.id === a.unitId)!, enemies.find(u => u.id === a.targetId)!);
    // Preserve the existing recruitment window when a lethal shot remains
    // available after moving its shooter off a friendly holding.
    const firingMoveFor = (shot: typeof attacks[number]): Action | undefined => {
      const unit = owned.find(u => u.id === shot.unitId)!, target = enemies.find(u => u.id === shot.targetId)!;
      if (ownSites.some(t => same(t, unit)) && view.faction.gold >= unitDefinition(view.ruleset,'infantry').cost
        && owned.length < Math.max(6, ownSites.length * 8) && damageFor(shot) >= target.hp) {
        return legal.find(a => a.type === 'Move' && a.unitId === unit.id
          && distance(a.to, target) <= unitDefinition(view.ruleset,unit.kind).range && !ownSites.some(t => same(t, a.to)));
      }
      return undefined;
    };
    // A one-shot support strike can secure a holding only if another fresh
    // adjacent unit keeps its entry action. Include legal move-then-fire support
    // before spending that entrant on an otherwise attractive nonlethal shot.
    const clearances: Action[] = [];
    for (const target of enemies) {
      const tile = view.tiles[target.y * view.width + target.x];
      if (!tile.site || tile.site.owner === view.actor || tile.site.owner === undefined
        || tile.terrain === null || tile.terrain === 'water' || tile.terrain === 'mountain') continue;
      const entry = owned.filter(u => !u.moved && !u.acted && distance(u, target) === 1);
      const preservesEntry = (id: string) => entry.some(u => u.id !== id);
      for (const attack of attacks) if (attack.targetId === target.id
        && preservesEntry(attack.unitId) && damageFor(attack) >= target.hp) clearances.push(attack);
      for (const move of legal) if (move.type === 'Move' && preservesEntry(move.unitId)) {
        const support = owned.find(u => u.id === move.unitId)!;
        if (distance(move.to, target) <= unitDefinition(view.ruleset,support.kind).range
          && damageFor({ type: 'Attack', unitId: support.id, targetId: target.id }) >= target.hp) clearances.push(move);
      }
    }
    clearances.sort((a, b) => Number(a.type === 'Move') - Number(b.type === 'Move')
      || compareIds('unitId' in a ? a.unitId : '', 'unitId' in b ? b.unitId : '')
      || (a.type === 'Move' && b.type === 'Move' ? a.to.y - b.to.y || a.to.x - b.to.x : 0)
      || (a.type === 'Attack' && b.type === 'Attack' ? compareIds(a.targetId, b.targetId) : 0));
    if (clearances[0]) {
      const clearance = clearances[0];
      return copyAction(clearance.type === 'Attack' ? firingMoveFor(clearance) ?? clearance : clearance);
    }
    const reserved = new Set<string>(), siegeTargets = new Set<string>();
    for (const target of enemies) {
      const tile = view.tiles[target.y * view.width + target.x];
      if (!tile.site || tile.site.owner === view.actor) continue;
      const candidates = owned.filter(u => !u.moved && !u.acted && distance(u, target) === 1).sort((a, b) => compareIds(a.id, b.id));
      for (const candidate of candidates) {
        // Include support that already fired this turn. Otherwise the final
        // fresh occupier kills the weakened garrison and leaves a refill window.
        const supportDamage = owned.filter(u => u.id !== candidate.id && distance(u, target) <= unitDefinition(view.ruleset,u.kind).range)
          .reduce((sum, u) => sum + damageFor({ type: 'Attack', unitId: u.id, targetId: target.id }), 0);
        const candidateDamage = damageFor({ type: 'Attack', unitId: candidate.id, targetId: target.id });
        if (supportDamage > 0 && supportDamage + candidateDamage >= target.hp) { reserved.add(candidate.id); siegeTargets.add(target.id); break; }
      }
    }
    // Reserve a scout for exploration only while a legal move can reveal new
    // terrain this turn. A spent or blocked scout loses nothing by attacking.
    const exploringScouts = new Set(owned.filter(u => u.kind === 'scout' && !u.moved && !u.acted && legal.some(a =>
      a.type === 'Move' && a.unitId === u.id && unknownTiles.some(t => distance(a.to, t) <= unitDefinition(view.ruleset,'scout').sight + (view.faction.techs.includes('pathfinding') ? 1 : 0))
    )).map(u => u.id));
    const score = (a: typeof attacks[number]): number => {
      const unit = owned.find(u => u.id === a.unitId)!, target = enemies.find(u => u.id === a.targetId)!;
      const tile = view.tiles[target.y * view.width + target.x];
      const damage = damageFor(a);
      const scoutExplore = exploringScouts.has(unit.id) && damage < target.hp && !siegeTargets.has(target.id);
      return (reserved.has(unit.id) ? -10000 : 0) + (scoutExplore ? -1000 : 0) + (siegeTargets.has(target.id) ? 2000 : 0) + (damage >= target.hp ? 1000 : 0) + damage * 10 - target.hp + (tile.site ? 20 : 0);
    };
    attacks.sort((a, b) => score(b) - score(a) || compareIds(a.unitId, b.unitId) || compareIds(a.targetId, b.targetId));
    if (score(attacks[0]) >= 0) {
      const shot = attacks[0];
      return copyAction(firingMoveFor(shot) ?? shot);
    }
  }

  // A route detour can also open a lethal counterstrike opportunity.
  // Restrict this to visible enemies already threatening a spent friendly unit;
  // retain the existing siege fallback whenever an Attack already exists. The
  // next decision must still obtain its real Attack from the new legalActions.
  if (!attacks.length) {
    const counterstrikes: { move: Extract<Action, { type: 'Move' }>; targetId: string }[] = [];
    for (const target of enemies) {
      if (!owned.some(u => u.acted && distance(u, target) <= unitDefinition(view.ruleset,target.kind).range)) continue;
      for (const move of legal) if (move.type === 'Move') {
        const unit = owned.find(u => u.id === move.unitId)!;
        if (distance(move.to, target) <= unitDefinition(view.ruleset,unit.kind).range && damageBetween(unit, target) >= target.hp) {
          // A conservative visible-geometry bound, not an enemy legal-action
          // oracle. Decline this shortcut if another enemy could reach firing
          // range next turn; ordinary routing still decides any necessary risk.
          const exposed = enemies.some(enemy => enemy.id !== target.id
            && distance(enemy, move.to) <= unitDefinition(view.ruleset,enemy.kind).move + unitDefinition(view.ruleset,enemy.kind).range);
          if (!exposed) counterstrikes.push({ move, targetId: target.id });
        }
      }
    }
    counterstrikes.sort((a, b) => compareIds(a.move.unitId, b.move.unitId) || compareIds(a.targetId, b.targetId) || a.move.to.y - b.move.to.y || a.move.to.x - b.move.to.x);
    if (counterstrikes[0]) return copyAction(counterstrikes[0].move);
  }

  const research = (tech: 'farm' | 'archery' | 'pathfinding') => legal.find(a => a.type === 'Research' && a.tech === tech);
  if (ownSites.length >= 2 && owned.length >= 3 && research('farm')) return copyAction(research('farm')!);
  if (enemies.length && owned.length >= 4 && view.faction.gold >= 10 && research('archery')) return copyAction(research('archery')!);
  if (view.faction.gold >= 12 && owned.length >= 4 && research('pathfinding')) return copyAction(research('pathfinding')!);
  if (view.faction.gold >= 15 && owned.length >= 4 && research('archery')) return copyAction(research('archery')!);
  const recruits = legal.filter((a): a is Extract<Action, { type: 'Recruit' }> => a.type === 'Recruit');
  // Distant fronts need units in transit as well as units fighting. The former
  // four-per-holding cap stranded rich factions below the defender's refill rate.
  if (recruits.length && owned.length < Math.max(6, ownSites.length * 8)) {
    const desiredScouts = unknownTiles.length > 120 && owned.length >= 8 ? 2 : 1;
    const desired = owned.filter(u => u.kind === 'scout').length < desiredScouts ? 'scout' : view.faction.techs.includes('archery') && owned.filter(u => u.kind === 'archer').length * 3 < owned.length ? 'archer' : 'infantry';
    // Use the nearest known front instead of array order: rear-capital recruits
    // took many turns to reach battles while empty forward holdings stayed idle.
    const objectives = view.tiles.filter(t => t.site && t.site.owner !== view.actor && t.site.owner !== null);
    const destinations = objectives.length ? objectives : enemies.length ? enemies : unknownTiles;
    const deploymentDistance = (a: typeof recruits[number]): number => {
      const site = ownSites.find(t => t.site!.id === a.siteId)!;
      return destinations.length ? Math.min(...destinations.map(t => distance(site, t))) : 0;
    };
    const candidates = recruits.filter(a => a.kind === desired);
    const choices = candidates.length ? candidates : recruits;
    choices.sort((a, b) => deploymentDistance(a) - deploymentDistance(b) || compareIds(a.siteId, b.siteId));
    return copyAction(choices[0]);
  }

  const movable = legal.filter((a): a is Extract<Action, { type: 'Move' }> => a.type === 'Move');
  if (movable.length) {
    const goals: { tile: Point; sources: Point[]; purpose: 'site' | 'enemy' | 'relic' | 'explore' | 'patrol'; weight: number; distances: number[]; sight?: number; sourceCosts?: number[]; fallback?: boolean }[] = [];
    const validTerrain = (t: KnownTile): boolean => t.terrain !== 'water' && t.terrain !== 'mountain';
    const neighbors = (p: Point): number[] => [p.y > 0 ? (p.y - 1) * view.width + p.x : -1, p.x > 0 ? p.y * view.width + p.x - 1 : -1, p.x + 1 < view.width ? p.y * view.width + p.x + 1 : -1, p.y + 1 < view.height ? (p.y + 1) * view.width + p.x : -1].filter(i => i >= 0);
    const distances = (sources: Point[], blocked = new Set<number>(), knownOnly = false, sourceCosts?: number[]): number[] => {
      const d = Array<number>(view.tiles.length).fill(Infinity), queue: number[] = [];
      if (sourceCosts) {
        // Integer multi-source Dijkstra: known route length plus the geometric
        // sight gap, not a claim that unknown terrain can be traversed. Seeding
        // every vantage at zero would flatten the scout's movement gradient.
        const buckets: number[][] = [];
        for (const p of sources) {
          const i = p.y * view.width + p.x, cost = sourceCosts[i];
          if (!blocked.has(i) && cost < d[i]) { d[i] = cost; (buckets[cost] ??= []).push(i); }
        }
        for (let cost = 0; cost < buckets.length; cost++) for (const current of buckets[cost] ?? []) {
          if (d[current] !== cost) continue;
          for (const i of neighbors(view.tiles[current])) if (cost + 1 < d[i] && view.tiles[i].terrain !== null && validTerrain(view.tiles[i]) && !blocked.has(i)) {
            d[i] = cost + 1; (buckets[cost + 1] ??= []).push(i);
          }
        }
        return d;
      }
      for (const p of sources) { const i = p.y * view.width + p.x; d[i] = 0; queue.push(i); }
      for (let q = 0; q < queue.length; q++) for (const i of neighbors(view.tiles[queue[q]])) if (d[i] === Infinity && validTerrain(view.tiles[i]) && (!knownOnly || view.tiles[i].terrain !== null) && !blocked.has(i)) { d[i] = d[queue[q]] + 1; queue.push(i); }
      return d;
    };
    for (const tile of view.tiles) {
      if (tile.site && tile.site.owner !== view.actor) goals.push({ tile, sources: [tile], purpose: 'site', weight: tile.site.kind === 'capital' || tile.site.centerOf !== undefined ? 3000 : tile.site.owner === null ? 400 : 1800, distances: distances([tile]) });
      else if (tile.relic?.resolved === false) goals.push({ tile, sources: [tile], purpose: 'relic', weight: 160, distances: distances([tile]) });
    }
    for (const enemy of enemies) goals.push({ tile: enemy, sources: [enemy], purpose: 'enemy', weight: 650, distances: distances([enemy]) });
    const sightFor = (unit: Unit): number => unitDefinition(view.ruleset,unit.kind).sight + (unit.kind === 'scout' && view.faction.techs.includes('pathfinding') ? 1 : 0);
    const boundary = unknownTiles.filter(t => neighbors(t).some(i => view.tiles[i].terrain !== null && validTerrain(view.tiles[i])));
    const adjacent = view.tiles.filter(t => t.terrain !== null && validTerrain(t) && neighbors(t).some(i => view.tiles[i].visibility === 'unknown'));
    let primaryExplore: typeof goals[number] | undefined;
    if (adjacent.length) {
      // A known boundary plus one information step preserves the original
      // nearest-unknown potential on known cells, without routing through fog.
      const sourceCosts = Array<number>(view.tiles.length).fill(1);
      primaryExplore = { tile: boundary[0], sources: adjacent, purpose: 'explore', weight: 120, sourceCosts, distances: distances(adjacent, new Set(), true, sourceCosts) };
      goals.push(primaryExplore);
    }
    const informationBySight = new Map<number, number[]>();
    for (const sight of new Set(owned.map(sightFor))) {
      const information = Array<number>(view.tiles.length).fill(0);
      const sourceCosts = Array<number>(view.tiles.length).fill(Infinity);
      // Unknown content is never inspected. Count only the geometry of tiles
      // that this unit's real sight could reveal from each possible vantage.
      for (const t of unknownTiles) for (let y = Math.max(0, t.y - sight); y <= Math.min(view.height - 1, t.y + sight); y++) {
        const dx = sight - Math.abs(y - t.y);
        for (let x = Math.max(0, t.x - dx); x <= Math.min(view.width - 1, t.x + dx); x++) {
          const i = y * view.width + x;
          information[i]++; sourceCosts[i] = Math.min(sourceCosts[i], Math.abs(x - t.x) + Math.abs(y - t.y));
        }
      }
      informationBySight.set(sight, information);
      const frontiers = view.tiles.filter((t, i) => t.terrain !== null && validTerrain(t) && information[i] > 0);
      if (frontiers.length && (!primaryExplore || owned.some(u => sightFor(u) === sight && !Number.isFinite(primaryExplore!.distances[u.y * view.width + u.x])))) {
        goals.push({ tile: frontiers[0], sources: frontiers, purpose: 'explore', weight: 120, sight, sourceCosts, fallback: true, distances: distances(frontiers, new Set(), true, sourceCosts) });
      }
    }
    const knownLand = !goals.length && !unknownTiles.length ? view.tiles.filter(t => t.terrain !== null && validTerrain(t)) : [];
    // Candidate goals copy distance arrays for current traffic, but retain their
    // sources identity. Keep the terrain potential to avoid rewarding a retreat
    // solely because that traffic graph changed between decisions.
    const terrainDistances = new Map(goals.map(g => [g.sources, g.distances]));
    const unitGoals = new Map<string, typeof goals[number]>();
    const movableIds = new Set(movable.map(a => a.unitId));
    // Per-decision caches only: units in the same known component share its
    // enumeration, and identical recon waypoints share the terrain field.
    const reconComponents = new Map<number, KnownTile[]>();
    const patrolFields = new Map<number, typeof goals[number]>();
    const enemyPositions = new Set(enemies.map(u => u.y * view.width + u.x));
    for (const unit of owned.filter(u => movableIds.has(u.id))) {
      const i = unit.y * view.width + unit.x;
      const blocked = new Set(view.units.filter(u => u.id !== unit.id).map(u => u.y * view.width + u.x));
      // An occupied objective seeds the graph; other occupied cells block transit.
      const sight = sightFor(unit);
      const roles = goals.filter(g => (g.sight === undefined || g.sight === sight) && (!g.fallback || !primaryExplore || !Number.isFinite(primaryExplore.distances[i]))).map(g => ({ ...g, weight: g.purpose === 'explore' && unit.kind === 'scout' ? 1600 : g.weight }));
      if (!roles.length && knownLand.length) {
        // Explored is not currently visible. Sweep uniform sight-sized cells,
        // rather than four corners, using the existing replayed turn counter.
        // No per-tile visit memory or hidden target coordinate is introduced.
        let land = reconComponents.get(i);
        if (!land) {
          const component = distances([unit], enemyPositions, true);
          land = knownLand.filter(t => Number.isFinite(component[t.y * view.width + t.x]));
          for (const tile of land) reconComponents.set(tile.y * view.width + tile.x, land);
        }
        if (land.some(t => t.visibility !== 'visible')) {
          const columns = Math.ceil(view.width / sight), rows = Math.ceil(view.height / sight);
          const suffix = Number(unit.id.split('-').at(-1));
          const offset = Number.isSafeInteger(suffix) && suffix >= 0 ? suffix : 0;
          const phase = (Math.floor(Math.max(0, view.faction.ownTurns - 1) / Math.max(view.width, view.height)) + offset + 1) % (columns * rows);
          const row = Math.floor(phase / columns), col = row % 2 ? columns - 1 - phase % columns : phase % columns;
          const anchor = { x: Math.min(view.width - 1, Math.floor(sight / 2) + col * sight), y: Math.min(view.height - 1, Math.floor(sight / 2) + row * sight) };
          const tile = land.reduce((best, t) => distance(t, anchor) < distance(best, anchor) || (distance(t, anchor) === distance(best, anchor) && (t.y < best.y || (t.y === best.y && t.x < best.x))) ? t : best);
          const key = tile.y * view.width + tile.x;
          let goal = patrolFields.get(key);
          if (!goal) {
            const sources = [tile];
            goal = { tile, sources, purpose: 'patrol', weight: 80, distances: distances(sources, new Set(), true) };
            patrolFields.set(key, goal); terrainDistances.set(sources, goal.distances);
          }
          roles.push(goal);
        }
      }
      // Compare reachable objectives by value and route length. A historical
      // capital must not redirect the entire front past nearby enemy supplies.
      const promising = roles.filter(g => Number.isFinite(g.distances[i])).sort((a, b) => b.weight / (b.distances[i] + 4) - a.weight / (a.distances[i] + 4) || a.tile.y - b.tile.y || a.tile.x - b.tile.x);
      const routesThrough = (obstacles: Set<number>): typeof goals => {
        const candidates: typeof goals = [];
        let bestValue = 0;
        for (const g of promising) {
          // Terrain distance is an optimistic bound, not a fixed top-four cutoff:
          // friendly traffic can make a lower-ranked objective the better route.
          // Occupied graphs only remove edges, so later bounds cannot beat this
          // value. Keep equal bounds for the deterministic coordinate tie-break.
          if (g.weight / (g.distances[i] + 4) < bestValue) break;
          const d = distances(g.sources, obstacles, g.purpose === 'explore' || g.purpose === 'patrol', g.sourceCosts);
          if (Number.isFinite(d[i])) {
            candidates.push({ ...g, distances: d });
            bestValue = Math.max(bestValue, g.weight / (d[i] + 4));
          }
        }
        return candidates;
      };
      let candidates = routesThrough(blocked);
      if (!candidates.length) {
        // A friendly bottleneck may close every complete route this turn.
        // Still approach through legal empty cells using the enemy-blocked
        // potential; legalActions remains the only source of actual movement.
        candidates = routesThrough(enemyPositions);
      }
      candidates.sort((a, b) => b.weight / (b.distances[i] + 4) - a.weight / (a.distances[i] + 4) || a.tile.y - b.tile.y || a.tile.x - b.tile.x);
      if (candidates[0]) unitGoals.set(unit.id, candidates[0]);
    }
    const scoreMove = (a: typeof movable[number]): number => {
      const unit = owned.find(u => u.id === a.unitId)!, goal = unitGoals.get(unit.id);
      const i = a.to.y * view.width + a.to.x, start = unit.y * view.width + unit.x;
      const progress = goal ? goal.distances[start] - goal.distances[i] : 0;
      const goalScore = goal ? goal.weight / (goal.distances[i] + 4) : 0;
      const discovery = informationBySight.get(sightFor(unit))![i];
      const crowd = owned.filter(u => u.id !== unit.id && distance(a.to, u) <= 1).length;
      const freesSite = ownSites.some(t => same(t, unit)) ? 4 : 0;
      const adjacentEnemy = enemies.some(e => distance(a.to, e) <= unitDefinition(view.ruleset,unit.kind).range) ? 15 : 0;
      if (progress <= 0 && discovery === 0 && freesSite === 0) return -Infinity;
      return progress * 25 + goalScore + discovery * 1.5 - crowd * 3 + freesSite + adjacentEnemy;
    };
    const scores = new Map(movable.map(a => [a, scoreMove(a)]));
    const forward = movable.filter(a => {
      const unit = owned.find(u => u.id === a.unitId)!, goal = unitGoals.get(unit.id);
      const terrain = goal && terrainDistances.get(goal.sources);
      if (!goal || !terrain) return false;
      const start = unit.y * view.width + unit.x, end = a.to.y * view.width + a.to.x;
      return goal.distances[start] > goal.distances[end] && terrain[start] > terrain[end];
    });
    // Keep real obstacle detours when no unit can advance on both measures.
    const choices = forward.length ? forward : movable;
    const approach = (a: typeof movable[number]): number => {
      const goal = unitGoals.get(a.unitId);
      return goal && goal.purpose !== 'explore' ? distance(a.to, goal.tile) : 0;
    };
    // Equal route progress must not prefer a return to the detour entrance
    // just because its y coordinate is smaller. Leave real detours eligible.
    choices.sort((a, b) => scores.get(b)! - scores.get(a)! || compareIds(a.unitId, b.unitId) || approach(a) - approach(b) || a.to.y - b.to.y || a.to.x - b.to.x);
    if (Number.isFinite(scores.get(choices[0])!)) return copyAction(choices[0]);
  }
  return copyAction(legal.find(a => a.type === 'EndTurn') ?? legal[0]);
}
