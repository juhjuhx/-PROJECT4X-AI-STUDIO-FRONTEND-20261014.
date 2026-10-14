import { UNIT_STATS, TECH_STATS } from './types';
import type { Action, Actor, ApplyResult, Command, Faction, GameState, KnownTile, Observation, Point, Terrain, Unit } from './types';

export const clone = <T>(value: T): T => structuredClone(value);
export const distance = (a: Point, b: Point): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
const index = (s: GameState, p: Point): number => p.y * s.width + p.x;
const within = (s: GameState, p: Point): boolean => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < s.width && p.y < s.height;
export const passable = (terrain: Terrain): boolean => terrain !== 'water' && terrain !== 'mountain';
const other = (actor: Actor): Actor => actor === 0 ? 1 : 0;
const neighbors = (p: Point): Point[] => [{ x: p.x, y: p.y - 1 }, { x: p.x - 1, y: p.y }, { x: p.x + 1, y: p.y }, { x: p.x, y: p.y + 1 }];

/** Keys are sorted; array order is an explicit part of the ruleset. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(value);
}

export function canonicalHash(state: GameState): string {
  // Protocol ledger is validated/reconstructed by persistence, but not game truth.
  const { history: _history, requests: _requests, ...truth } = state;
  let hash = 14695981039346656037n;
  const canonical = stableStringify(truth);
  for (let i = 0; i < canonical.length; i++) hash = BigInt.asUintN(64, (hash ^ BigInt(canonical.charCodeAt(i))) * 1099511628211n);
  return hash.toString(16).padStart(16, '0');
}

function seeded(seed: string): () => number {
  let n = 2166136261;
  for (let i = 0; i < seed.length; i++) n = Math.imul(n ^ seed.charCodeAt(i), 16777619);
  if (n === 0) n = 1;
  return () => { n ^= n << 13; n ^= n >>> 17; n ^= n << 5; return (n >>> 0) / 4294967296; };
}

function faction(id: Actor): Faction {
  return { id, identityId: `文明-${id}`, lineageId: `文化-${id}`, gold: 8, techs: [], life: 'active', centerId: `首都-${id}`, originalCapitalId: `首都-${id}`, ownTurns: id === 0 ? 1 : 0, completedTurns: 0 };
}

export function createGame(seed: string): GameState {
  if (typeof seed !== 'string' || !seed.length || seed.length > 256) throw new Error('世界種子必須是1至256字元');
  const random = seeded(seed);
  const state: GameState = {
    schema: 'project4x-save-1', ruleset: 'g1-ccts-1', seed, width: 24, height: 24, terrain: [],
    units: [
      { id: '兵-0', owner: 0, kind: 'infantry', x: 3, y: 3, hp: 10, moved: false, acted: false },
      { id: '兵-1', owner: 0, kind: 'scout', x: 4, y: 3, hp: 7, moved: false, acted: false },
      { id: '兵-2', owner: 1, kind: 'infantry', x: 20, y: 20, hp: 10, moved: false, acted: false },
      { id: '兵-3', owner: 1, kind: 'scout', x: 19, y: 20, hp: 7, moved: false, acted: false },
    ],
    sites: [
      { id: '首都-0', kind: 'capital', name: '曙光城', owner: 0, x: 3, y: 3, heldSince: 0, recruited: false },
      { id: '首都-1', kind: 'capital', name: '暮星城', owner: 1, x: 20, y: 20, heldSince: 0, recruited: false },
    ],
    relics: [{ id: '遺跡-0', x: 8, y: 3, claimedBy: null, resolved: false }, { id: '遺跡-1', x: 15, y: 20, claimedBy: null, resolved: false }, { id: '遺跡-2', x: 12, y: 7, claimedBy: null, resolved: false }, { id: '遺跡-3', x: 9, y: 17, claimedBy: null, resolved: false }],
    factions: [faction(0), faction(1)], explored: [Array(576).fill(false), Array(576).fill(false)], surveyed: [Array(576).fill(false), Array(576).fill(false)],
    active: 0, turn: 1, version: 0, nextUnitId: 4, pendingRelic: null, winner: null, history: [], requests: {},
  };
  const villagePoints = [{ x: 8, y: 4 }, { x: 6, y: 13 }, { x: 12, y: 11 }, { x: 18, y: 10 }, { x: 14, y: 20 }];
  const count = 3 + Math.floor(random() * 3);
  state.sites.push(...villagePoints.slice(0, count).map((p, i) => ({ ...p, id: `村莊-${i}`, kind: 'village' as const, name: `聚落${i + 1}`, owner: null, heldSince: 0, recruited: false })));
  const required = [...state.units, ...state.sites, ...state.relics];
  for (let attempt = 0; attempt <= 64; attempt++) {
    state.terrain = Array.from({ length: 576 }, (): Terrain => {
      const r = random();
      if (attempt === 64) return r < .2 ? 'forest' : r < .4 ? 'hill' : 'plain';
      return r < .10 ? 'water' : r < .18 ? 'mountain' : r < .35 ? 'forest' : r < .48 ? 'hill' : 'plain';
    });
    for (const p of required) state.terrain[index(state, p)] = 'plain';
    // Early relic paths remain outside initial sight, yet reachable in one move.
    for (let x = 3; x <= 8; x++) state.terrain[3 * 24 + x] = 'plain';
    for (let x = 15; x <= 20; x++) state.terrain[20 * 24 + x] = 'plain';
    const visited = new Set<number>();
    const queue: Point[] = [state.units[0]];
    for (let q = 0; q < queue.length; q++) {
      const p = queue[q], k = index(state, p);
      if (visited.has(k)) continue;
      visited.add(k);
      for (const next of neighbors(p)) if (within(state, next) && passable(state.terrain[index(state, next)]) && !visited.has(index(state, next))) queue.push(next);
    }
    if (required.every(p => visited.has(index(state, p)))) break;
  }
  updateKnowledge(state);
  return state;
}

export function visibility(state: GameState, actor: Actor): boolean[] {
  const seen = Array<boolean>(state.width * state.height).fill(false);
  const sources = [
    ...state.units.filter(u => u.owner === actor).map(u => ({ ...u, radius: UNIT_STATS[u.kind].sight + (u.kind === 'scout' && state.factions[actor].techs.includes('pathfinding') ? 1 : 0) })),
    ...state.sites.filter(s => s.owner === actor).map(s => ({ ...s, radius: 1 })),
  ];
  for (const source of sources) for (let y = Math.max(0, source.y - source.radius); y <= Math.min(state.height - 1, source.y + source.radius); y++) for (let x = Math.max(0, source.x - source.radius); x <= Math.min(state.width - 1, source.x + source.radius); x++) if (distance(source, { x, y }) <= source.radius) seen[y * state.width + x] = true;
  return seen;
}

function updateKnowledge(state: GameState): void {
  for (const actor of [0, 1] as Actor[]) {
    const seen = visibility(state, actor);
    state.explored[actor] = state.explored[actor].map((known, i) => known || seen[i]);
    state.surveyed[actor] = state.surveyed[actor].map((known, i) => known || seen[i]);
  }
  if (state.pendingRelic || state.winner !== null) return;
  const seen = visibility(state, state.active);
  const relic = state.relics.find(r => r.claimedBy === null && seen[index(state, r)]);
  if (relic) { relic.claimedBy = state.active; state.pendingRelic = { actor: state.active, relicId: relic.id }; }
}

function intelTiles(state: GameState, actor: Actor, relicId: string): Point[] {
  const relic = state.relics.find(r => r.id === relicId)!;
  return state.explored[actor].flatMap((known, i) => known ? [] : [{ x: i % state.width, y: Math.floor(i / state.width) }]).sort((a, b) => distance(a, relic) - distance(b, relic) || a.y - b.y || a.x - b.x).slice(0, 3);
}

function moves(state: GameState, unit: Unit): Point[] {
  if (unit.moved || unit.acted) return [];
  const seen = new Set<number>([index(state, unit)]), result: Point[] = [];
  const queue: { p: Point; steps: number }[] = [{ p: unit, steps: 0 }];
  for (let q = 0; q < queue.length; q++) {
    const { p, steps } = queue[q];
    if (steps === UNIT_STATS[unit.kind].move) continue;
    for (const next of neighbors(p)) {
      const k = index(state, next);
      if (!within(state, next) || seen.has(k) || !passable(state.terrain[k]) || state.units.some(u => same(u, next))) continue;
      seen.add(k); result.push(next); queue.push({ p: next, steps: steps + 1 });
    }
  }
  return result;
}

export function legalActions(state: GameState, actor: Actor): Action[] {
  if (actor !== state.active || state.winner !== null || state.factions[actor].life === 'eliminated') return [];
  if (state.pendingRelic) return [{ type: 'ResolveRelic', choice: 'gold' }, ...(intelTiles(state, actor, state.pendingRelic.relicId).length ? [{ type: 'ResolveRelic' as const, choice: 'intel' as const }] : [])];
  const result: Action[] = [], seen = visibility(state, actor), f = state.factions[actor];
  for (const unit of state.units.filter(u => u.owner === actor)) {
    for (const to of moves(state, unit)) result.push({ type: 'Move', unitId: unit.id, to });
    if (unit.acted) continue;
    for (const target of state.units) if (target.owner !== actor && seen[index(state, target)] && distance(unit, target) <= UNIT_STATS[unit.kind].range) result.push({ type: 'Attack', unitId: unit.id, targetId: target.id });
    if (state.sites.some(s => same(s, unit) && s.owner !== actor)) result.push({ type: 'Capture', unitId: unit.id });
  }
  for (const site of state.sites.filter(s => s.owner === actor)) {
    if (!site.recruited && !state.units.some(u => same(u, site))) for (const kind of ['infantry', 'scout', 'archer'] as const) if (f.gold >= UNIT_STATS[kind].cost && (kind !== 'archer' || f.techs.includes('archery'))) result.push({ type: 'Recruit', siteId: site.id, kind });
    if (f.life === 'exiled' && state.factions[other(actor)].completedTurns > site.heldSince) result.push({ type: 'EstablishCapital', siteId: site.id });
  }
  for (const tech of ['farm', 'archery', 'pathfinding'] as const) if (!f.techs.includes(tech) && f.gold >= TECH_STATS[tech].cost) result.push({ type: 'Research', tech });
  result.push({ type: 'EndTurn' });
  return result;
}

export function observe(state: GameState, actor: Actor): Observation {
  const seen = visibility(state, actor);
  const tiles: KnownTile[] = state.terrain.map((terrain, i) => {
    const p = { x: i % state.width, y: Math.floor(i / state.width) };
    const visible = seen[i], explored = state.explored[actor][i];
    const tile: KnownTile = { ...p, visibility: visible ? 'visible' : explored ? 'explored' : 'unknown', terrain: visible || explored ? terrain : null, site: null, relic: null };
    if (visible || state.surveyed[actor][i]) {
      const site = state.sites.find(s => same(s, p));
      if (site) { tile.site = { id: site.id, kind: site.kind, name: site.name }; if (visible) { tile.site.owner = site.owner; const center = state.factions.find(f => f.centerId === site.id); if (center) tile.site.centerOf = center.id; } }
      const relic = state.relics.find(r => same(r, p));
      if (relic) { tile.relic = { id: relic.id }; if (visible) tile.relic.resolved = relic.resolved; }
    }
    return tile;
  });
  return clone({ ruleset: state.ruleset, seed: state.seed, width: state.width, height: state.height, actor, active: state.active, turn: state.turn, version: state.version, tiles, units: state.units.filter(u => u.owner === actor || seen[index(state, u)]), faction: state.factions[actor], legalActions: legalActions(state, actor), pendingRelic: state.pendingRelic?.actor === actor ? { id: state.pendingRelic.relicId, intelCount: intelTiles(state, actor, state.pendingRelic.relicId).length } : null, winner: state.winner });
}

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const keysAre = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k));
const id = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 256;

export function validAction(value: unknown): value is Action {
  if (!record(value)) return false;
  switch (value.type) {
    case 'Move': return keysAre(value, ['type', 'unitId', 'to']) && id(value.unitId) && record(value.to) && keysAre(value.to, ['x', 'y']) && Number.isInteger(value.to.x) && Number.isInteger(value.to.y);
    case 'Attack': return keysAre(value, ['type', 'unitId', 'targetId']) && id(value.unitId) && id(value.targetId);
    case 'Capture': return keysAre(value, ['type', 'unitId']) && id(value.unitId);
    case 'Recruit': return keysAre(value, ['type', 'siteId', 'kind']) && id(value.siteId) && ['infantry', 'scout', 'archer'].includes(value.kind as string);
    case 'Research': return keysAre(value, ['type', 'tech']) && ['farm', 'archery', 'pathfinding'].includes(value.tech as string);
    case 'ResolveRelic': return keysAre(value, ['type', 'choice']) && ['gold', 'intel'].includes(value.choice as string);
    case 'EstablishCapital': return keysAre(value, ['type', 'siteId']) && id(value.siteId);
    case 'EndTurn': return keysAre(value, ['type']);
    default: return false;
  }
}

export function validCommand(value: unknown): value is Command {
  return record(value) && keysAre(value, ['actor', 'requestId', 'expectedVersion', 'action']) && (value.actor === 0 || value.actor === 1) && id(value.requestId) && Number.isSafeInteger(value.expectedVersion) && (value.expectedVersion as number) >= 0 && validAction(value.action);
}

function lifecycle(state: GameState): void {
  for (const f of state.factions) {
    const survives = state.units.some(u => u.owner === f.id) || state.sites.some(s => s.owner === f.id);
    if (!survives) { f.life = 'eliminated'; f.centerId = null; state.winner = other(f.id); }
    else if (!state.sites.some(s => s.id === f.centerId && s.owner === f.id)) { f.life = 'exiled'; f.centerId = null; }
    else f.life = 'active';
  }
}

function immutableCommand(command: Command): Command {
  const entry = clone(command);
  if (entry.action.type === 'Move') Object.freeze(entry.action.to);
  Object.freeze(entry.action);
  return Object.freeze(entry);
}

export function applyCommand(state: GameState, command: Command): ApplyResult {
  const fail = (error: string): ApplyResult => ({ ok: false, state, error, events: [] });
  if (!validCommand(command)) return fail('指令格式不正確');
  const payload = stableStringify({ actor: command.actor, expectedVersion: command.expectedVersion, action: command.action });
  if (Object.hasOwn(state.requests, command.requestId)) return state.requests[command.requestId] === payload ? { ok: true, state, events: [] } : fail('此請求編號已使用其他指令');
  if (command.expectedVersion !== state.version) return fail('狀態版本已過期');
  if (command.actor !== state.active) return fail('尚未輪到此文明');
  if (state.winner !== null) return fail('戰局已結束');
  const actionKey = stableStringify(command.action);
  if (!legalActions(state, command.actor).some(action => stableStringify(action) === actionKey)) return fail(state.pendingRelic ? '必須先選擇遺跡獎勵' : '此行動目前不合法');
  // Accepted ledger entries are append-only; preserve them without recloning an
  // ever-growing transcript. Gameplay truth and both top-level ledger containers
  // remain independent, and incoming commands are cloned before appending.
  const { history, requests, ...truth } = state;
  const next: GameState = { ...clone(truth), history: history.slice(), requests: { ...requests } };
  const action = command.action, actor = command.actor, f = next.factions[actor];
  switch (action.type) {
    case 'Move': {
      const unit = next.units.find(u => u.id === action.unitId)!;
      unit.x = action.to.x; unit.y = action.to.y; unit.moved = true;
      break;
    }
    case 'Attack': {
      const unit = next.units.find(u => u.id === action.unitId)!, target = next.units.find(u => u.id === action.targetId)!;
      const terrain = next.terrain[index(next, target)];
      const cover = terrain === 'forest' || terrain === 'hill' || next.sites.some(s => same(s, target) && s.owner === target.owner) ? 1 : 0;
      target.hp -= Math.max(1, UNIT_STATS[unit.kind].attack - UNIT_STATS[target.kind].defense - cover);
      unit.moved = true; unit.acted = true;
      if (target.hp <= 0) next.units = next.units.filter(u => u.id !== target.id);
      break;
    }
    case 'Capture': {
      const unit = next.units.find(u => u.id === action.unitId)!, site = next.sites.find(s => same(s, unit))!;
      site.owner = actor; site.heldSince = next.factions[other(actor)].completedTurns; site.recruited = false;
      unit.moved = true; unit.acted = true;
      break;
    }
    case 'Recruit': {
      const site = next.sites.find(s => s.id === action.siteId)!;
      f.gold -= UNIT_STATS[action.kind].cost; site.recruited = true;
      next.units.push({ id: `兵-${next.nextUnitId++}`, owner: actor, kind: action.kind, x: site.x, y: site.y, hp: UNIT_STATS[action.kind].hp, moved: true, acted: true });
      break;
    }
    case 'Research': f.gold -= TECH_STATS[action.tech].cost; f.techs.push(action.tech); break;
    case 'ResolveRelic': {
      const relic = next.relics.find(r => r.id === next.pendingRelic!.relicId)!;
      if (action.choice === 'gold') f.gold += 4;
      else for (const p of intelTiles(next, actor, relic.id)) next.explored[actor][index(next, p)] = true;
      relic.resolved = true; next.pendingRelic = null;
      break;
    }
    case 'EstablishCapital': f.centerId = action.siteId; f.life = 'active'; break;
    case 'EndTurn': {
      f.completedTurns++;
      next.active = other(actor); next.turn++;
      const incoming = next.factions[next.active];
      incoming.ownTurns++;
      if (incoming.ownTurns > 1) incoming.gold += next.sites.filter(s => s.owner === next.active).length * (2 + (incoming.techs.includes('farm') ? 1 : 0));
      for (const unit of next.units.filter(u => u.owner === next.active)) { unit.moved = false; unit.acted = false; }
      for (const site of next.sites.filter(s => s.owner === next.active)) site.recruited = false;
      break;
    }
  }
  lifecycle(next);
  updateKnowledge(next);
  next.version++;
  next.history.push(immutableCommand(command));
  Object.defineProperty(next.requests, command.requestId, { value: payload, enumerable: true, configurable: true, writable: true });
  return { ok: true, state: next, events: ['行動已完成。'] };
}
