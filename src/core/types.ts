export type Actor = 0 | 1;
export type Terrain = 'plain' | 'forest' | 'hill' | 'mountain' | 'water';
export type LegacyUnitKind = 'infantry' | 'scout' | 'archer';
export type LegacyTech = 'farm' | 'archery' | 'pathfinding';
export type UnitKind = LegacyUnitKind | 'shieldGuard' | 'mobileScout';
export type Tech = LegacyTech | 'defensiveEngineering' | 'militaryMobility';
export interface Point { x: number; y: number }
export interface Unit extends Point { id: string; owner: Actor; kind: UnitKind; hp: number; moved: boolean; acted: boolean }
export interface Site extends Point { id: string; kind: 'capital' | 'village'; name: string; owner: Actor | null; heldSince: number; recruited: boolean }
export interface Relic extends Point { id: string; claimedBy: Actor | null; resolved: boolean }
export interface Faction { id: Actor; identityId: string; lineageId: string; gold: number; techs: Tech[]; life: 'active' | 'exiled' | 'eliminated'; centerId: string | null; originalCapitalId: string; ownTurns: number; completedTurns: number }
export type Action =
  | { type: 'Move'; unitId: string; to: Point }
  | { type: 'Attack'; unitId: string; targetId: string }
  | { type: 'Capture'; unitId: string }
  | { type: 'Recruit'; siteId: string; kind: UnitKind }
  | { type: 'Research'; tech: Tech }
  | { type: 'ResolveRelic'; choice: 'gold' | 'intel' }
  | { type: 'EstablishCapital'; siteId: string }
  | { type: 'EndTurn' };
export interface Command { actor: Actor; requestId: string; expectedVersion: number; action: Action }
interface WorldState {
  seed: string; width: number; height: number;
  terrain: Terrain[]; units: Unit[]; sites: Site[]; relics: Relic[]; factions: [Faction, Faction];
  explored: [boolean[], boolean[]]; surveyed: [boolean[], boolean[]]; active: Actor; turn: number; version: number; nextUnitId: number;
  pendingRelic: { actor: Actor; relicId: string } | null; winner: Actor | null;
  history: Command[]; requests: Record<string, string>;
}
export type GameState = WorldState & (
  | { schema: 'project4x-save-1'; ruleset: 'g1-ccts-1' }
  | { schema: 'project4x-save-2'; ruleset: 'demo03-preview-1'; contentHash: string; generatorVersion: 'g1-mapgen-1' }
);
export interface KnownTile extends Point {
  visibility: 'unknown' | 'explored' | 'visible'; terrain: Terrain | null;
  site: null | { id: string; kind: Site['kind']; name: string; owner?: Actor | null; centerOf?: Actor };
  relic: null | { id: string; resolved?: boolean };
}
export interface Observation {
  ruleset: string; seed: string; width: number; height: number; actor: Actor; active: Actor;
  turn: number; version: number; tiles: KnownTile[]; units: Unit[]; faction: Faction;
  legalActions: Action[]; pendingRelic: null | { id: string; intelCount: number }; winner: Actor | null;
}
export interface ApplyResult { ok: boolean; state: GameState; error?: string; events: string[] }
export const UNIT_STATS: Record<LegacyUnitKind, { cost: number; hp: number; attack: number; defense: number; range: number; move: number; sight: number; name: string }> = {
  infantry: { cost: 4, hp: 10, attack: 4, defense: 1, range: 1, move: 1, sight: 2, name: '步兵' },
  scout: { cost: 5, hp: 7, attack: 3, defense: 0, range: 1, move: 2, sight: 3, name: '斥候' },
  archer: { cost: 6, hp: 7, attack: 3, defense: 0, range: 2, move: 1, sight: 2, name: '弓兵' },
};
export const TECH_STATS: Record<LegacyTech, { cost: number; name: string; description: string }> = {
  farm: { cost: 5, name: '耕作', description: '每個據點下次收入起增加 1 金幣' },
  archery: { cost: 6, name: '弓術', description: '解鎖射程 2 格的弓兵' },
  pathfinding: { cost: 4, name: '尋徑', description: '斥候視野立即增加 1 格' },
};
