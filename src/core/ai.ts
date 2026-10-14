import { UNIT_STATS } from './types';
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

  const attacks = legal.filter((a): a is Extract<Action, { type: 'Attack' }> => a.type === 'Attack');
  if (attacks.length) {
    const damageFor = (a: typeof attacks[number]): number => {
      const unit = owned.find(u => u.id === a.unitId)!, target = enemies.find(u => u.id === a.targetId)!;
      const tile = view.tiles[target.y * view.width + target.x];
      const cover = tile.terrain === 'forest' || tile.terrain === 'hill' || tile.site?.owner === target.owner ? 1 : 0;
      return Math.max(1, UNIT_STATS[unit.kind].attack - UNIT_STATS[target.kind].defense - cover);
    };
    const reserved = new Set<string>(), siegeTargets = new Set<string>();
    for (const target of enemies) {
      const tile = view.tiles[target.y * view.width + target.x];
      if (!tile.site || tile.site.owner === view.actor) continue;
      const candidates = owned.filter(u => !u.moved && !u.acted && distance(u, target) === 1).sort((a, b) => compareIds(a.id, b.id));
      for (const candidate of candidates) {
        // Include support that already fired this turn. Otherwise the final
        // fresh occupier kills the weakened garrison and leaves a refill window.
        const supportDamage = owned.filter(u => u.id !== candidate.id && distance(u, target) <= UNIT_STATS[u.kind].range)
          .reduce((sum, u) => sum + damageFor({ type: 'Attack', unitId: u.id, targetId: target.id }), 0);
        const candidateDamage = damageFor({ type: 'Attack', unitId: candidate.id, targetId: target.id });
        if (supportDamage > 0 && supportDamage + candidateDamage >= target.hp) { reserved.add(candidate.id); siegeTargets.add(target.id); break; }
      }
    }
    const score = (a: typeof attacks[number]): number => {
      const unit = owned.find(u => u.id === a.unitId)!, target = enemies.find(u => u.id === a.targetId)!;
      const tile = view.tiles[target.y * view.width + target.x];
      const damage = damageFor(a);
      const scoutExplore = unit.kind === 'scout' && unknownTiles.length > 0 && damage < target.hp && !siegeTargets.has(target.id);
      return (reserved.has(unit.id) ? -10000 : 0) + (scoutExplore ? -1000 : 0) + (siegeTargets.has(target.id) ? 2000 : 0) + (damage >= target.hp ? 1000 : 0) + damage * 10 - target.hp + (tile.site ? 20 : 0);
    };
    attacks.sort((a, b) => score(b) - score(a) || compareIds(a.unitId, b.unitId) || compareIds(a.targetId, b.targetId));
    if (score(attacks[0]) >= 0) return copyAction(attacks[0]);
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
    const goals: { tile: Point; sources: Point[]; purpose: 'site' | 'enemy' | 'relic' | 'explore' | 'patrol'; weight: number; distances: number[] }[] = [];
    const validTerrain = (t: KnownTile): boolean => t.terrain !== 'water' && t.terrain !== 'mountain';
    const neighbors = (p: Point): number[] => [p.y > 0 ? (p.y - 1) * view.width + p.x : -1, p.x > 0 ? p.y * view.width + p.x - 1 : -1, p.x + 1 < view.width ? p.y * view.width + p.x + 1 : -1, p.y + 1 < view.height ? (p.y + 1) * view.width + p.x : -1].filter(i => i >= 0);
    const distances = (sources: Point[], blocked = new Set<number>()): number[] => {
      const d = Array<number>(view.tiles.length).fill(Infinity), queue: number[] = [];
      for (const p of sources) { const i = p.y * view.width + p.x; d[i] = 0; queue.push(i); }
      for (let q = 0; q < queue.length; q++) for (const i of neighbors(view.tiles[queue[q]])) if (d[i] === Infinity && validTerrain(view.tiles[i]) && !blocked.has(i)) { d[i] = d[queue[q]] + 1; queue.push(i); }
      return d;
    };
    for (const tile of view.tiles) {
      if (tile.site && tile.site.owner !== view.actor) goals.push({ tile, sources: [tile], purpose: 'site', weight: tile.site.kind === 'capital' || tile.site.centerOf !== undefined ? 3000 : tile.site.owner === null ? 400 : 1800, distances: distances([tile]) });
      else if (tile.relic?.resolved === false) goals.push({ tile, sources: [tile], purpose: 'relic', weight: 160, distances: distances([tile]) });
    }
    for (const enemy of enemies) goals.push({ tile: enemy, sources: [enemy], purpose: 'enemy', weight: 650, distances: distances([enemy]) });
    const frontiers = view.tiles.filter(t => t.visibility === 'unknown' && neighbors(t).some(i => view.tiles[i].visibility !== 'unknown' && validTerrain(view.tiles[i])));
    if (frontiers.length) goals.push({ tile: frontiers[0], sources: frontiers, purpose: 'explore', weight: 120, distances: distances(frontiers) });
    if (!goals.length) {
      // Explored terrain is not live visibility. Search the known map for hidden
      // survivors; this schedule chooses routes, never a winner or exile limit.
      const knownLand = view.tiles.filter(t => t.terrain !== null && validTerrain(t));
      for (const anchor of [{ x: 2, y: 2 }, { x: view.width - 3, y: 2 }, { x: view.width - 3, y: view.height - 3 }, { x: 2, y: view.height - 3 }]) {
        const tile = [...knownLand].sort((a, b) => distance(a, anchor) - distance(b, anchor) || a.y - b.y || a.x - b.x)[0];
        if (tile) goals.push({ tile, sources: [tile], purpose: 'patrol', weight: 80, distances: distances([tile]) });
      }
    }
    const unitGoals = new Map<string, typeof goals[number]>();
    const movableIds = new Set(movable.map(a => a.unitId));
    for (const unit of owned.filter(u => movableIds.has(u.id))) {
      const i = unit.y * view.width + unit.x;
      const blocked = new Set(view.units.filter(u => u.id !== unit.id).map(u => u.y * view.width + u.x));
      // A visible enemy objective seeds the graph, but every other occupied cell
      // blocks a route. This prevents armies oscillating behind friendly lines.
      const patrol = (Math.floor((view.faction.ownTurns - 1) / 32) + (Number(unit.id.split('-').at(-1)) || 0)) % goals.length;
      const roles = goals.filter((g, n) => g.purpose !== 'patrol' || n === patrol).map(g => ({ ...g, weight: g.purpose === 'explore' && unit.kind === 'scout' ? 1600 : g.weight }));
      // Compare reachable objectives by value and route length. A historical
      // capital must not redirect the entire front past nearby enemy supplies.
      const promising = roles.filter(g => Number.isFinite(g.distances[i])).sort((a, b) => b.weight / (b.distances[i] + 4) - a.weight / (a.distances[i] + 4) || a.tile.y - b.tile.y || a.tile.x - b.tile.x);
      const candidates = promising.slice(0, 4).map(g => ({ ...g, distances: distances(g.sources, blocked) })).filter(g => Number.isFinite(g.distances[i]));
      if (!candidates.length) for (const g of promising.slice(4)) { const d = distances(g.sources, blocked); if (Number.isFinite(d[i])) { candidates.push({ ...g, distances: d }); break; } }
      candidates.sort((a, b) => b.weight / (b.distances[i] + 4) - a.weight / (a.distances[i] + 4) || a.tile.y - b.tile.y || a.tile.x - b.tile.x);
      if (candidates[0]) unitGoals.set(unit.id, candidates[0]);
    }
    const scoreMove = (a: typeof movable[number]): number => {
      const unit = owned.find(u => u.id === a.unitId)!, goal = unitGoals.get(unit.id);
      const i = a.to.y * view.width + a.to.x, start = unit.y * view.width + unit.x;
      const progress = goal ? goal.distances[start] - goal.distances[i] : 0;
      const goalScore = goal ? goal.weight / (goal.distances[i] + 4) : 0;
      const sight = UNIT_STATS[unit.kind].sight + (unit.kind === 'scout' && view.faction.techs.includes('pathfinding') ? 1 : 0);
      let discovery = 0;
      for (const tile of unknownTiles) if (distance(a.to, tile) <= sight) discovery++;
      const crowd = owned.filter(u => u.id !== unit.id && distance(a.to, u) <= 1).length;
      const freesSite = ownSites.some(t => same(t, unit)) ? 4 : 0;
      const adjacentEnemy = enemies.some(e => distance(a.to, e) <= UNIT_STATS[unit.kind].range) ? 15 : 0;
      if (progress <= 0 && discovery === 0 && freesSite === 0) return -Infinity;
      return progress * 25 + goalScore + discovery * 1.5 - crowd * 3 + freesSite + adjacentEnemy;
    };
    const scores = new Map(movable.map(a => [a, scoreMove(a)]));
    movable.sort((a, b) => scores.get(b)! - scores.get(a)! || compareIds(a.unitId, b.unitId) || a.to.y - b.to.y || a.to.x - b.to.x);
    if (Number.isFinite(scores.get(movable[0])!)) return copyAction(movable[0]);
  }
  return copyAction(legal.find(a => a.type === 'EndTurn') ?? legal[0]);
}
