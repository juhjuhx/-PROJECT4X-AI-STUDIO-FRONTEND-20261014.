import { applyCommand, canonicalHash, createGame, passable, stableStringify, validCommand, visibility } from './game';
import { UNIT_STATS } from './types';
import type { Actor, Command, GameState } from './types';

const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const integer = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
const string = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 256;
function requireThat(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`資料無效：${message}`); }
function exact(v: unknown, keys: string[], name: string): asserts v is Record<string, unknown> {
  requireThat(isRecord(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k)), `${name}欄位`);
}

/** Reject before replay: no clamping, coercion, unknown versions, or extra fields. */
function validateState(value: unknown): asserts value is GameState {
  exact(value, ['schema', 'ruleset', 'seed', 'width', 'height', 'terrain', 'units', 'sites', 'relics', 'factions', 'explored', 'surveyed', 'active', 'turn', 'version', 'nextUnitId', 'pendingRelic', 'winner', 'history', 'requests'], '存檔');
  requireThat(value.schema === 'project4x-save-1' && value.ruleset === 'g1-ccts-1', '不支援的版本');
  requireThat(string(value.seed) && value.width === 24 && value.height === 24, '世界尺寸與種子');
  requireThat(Array.isArray(value.terrain) && value.terrain.length === 576 && value.terrain.every(t => ['plain', 'forest', 'hill', 'mountain', 'water'].includes(t)), '地形');
  requireThat(Array.isArray(value.units) && Array.isArray(value.sites) && Array.isArray(value.relics) && Array.isArray(value.factions) && value.factions.length === 2, '物件清單');
  const ids = new Set<string>(), occupied = new Set<number>();
  const point = (v: Record<string, unknown>): number => { requireThat(integer(v.x) && integer(v.y) && v.x < 24 && v.y < 24, '座標'); const k = v.y * 24 + v.x; requireThat(passable((value.terrain as GameState['terrain'])[k]), '非通行座標'); return k; };
  const entity = (v: Record<string, unknown>) => { requireThat(string(v.id) && !ids.has(v.id), '物件ID重複或不合法'); ids.add(v.id); };
  for (const unit of value.units) {
    exact(unit, ['id', 'owner', 'kind', 'x', 'y', 'hp', 'moved', 'acted'], '單位'); entity(unit);
    requireThat(unit.owner === 0 || unit.owner === 1, '單位歸屬');
    requireThat(unit.kind === 'infantry' || unit.kind === 'scout' || unit.kind === 'archer', '兵種');
    requireThat(integer(unit.hp) && unit.hp >= 1 && unit.hp <= UNIT_STATS[unit.kind].hp && typeof unit.moved === 'boolean' && typeof unit.acted === 'boolean' && (!unit.acted || unit.moved), '單位生命與行動旗標');
    requireThat(typeof unit.id === 'string' && /^兵-\d+$/.test(unit.id) && integer(value.nextUnitId) && Number(unit.id.slice(2)) < value.nextUnitId, '單位流水號');
    const k = point(unit); requireThat(!occupied.has(k), '單位重疊'); occupied.add(k);
  }
  const sitePoints = new Set<number>();
  requireThat(value.sites.length >= 5 && value.sites.length <= 7, '據點數量');
  for (const site of value.sites) {
    exact(site, ['id', 'kind', 'name', 'owner', 'x', 'y', 'heldSince', 'recruited'], '據點'); entity(site);
    requireThat((site.kind === 'capital' || site.kind === 'village') && string(site.name) && (site.owner === null || site.owner === 0 || site.owner === 1) && integer(site.heldSince) && typeof site.recruited === 'boolean', '據點資料');
    const k = point(site); requireThat(!sitePoints.has(k), '據點重疊'); sitePoints.add(k);
    if (site.owner === null) requireThat(site.heldSince === 0 && site.recruited === false, '中立據點旗標');
  }
  const relicPoints = new Set<number>();
  for (const relic of value.relics) {
    exact(relic, ['id', 'x', 'y', 'claimedBy', 'resolved'], '遺跡'); entity(relic);
    requireThat((relic.claimedBy === null || relic.claimedBy === 0 || relic.claimedBy === 1) && typeof relic.resolved === 'boolean' && (!relic.resolved || relic.claimedBy !== null), '遺跡認領');
    const k = point(relic); requireThat(!relicPoints.has(k) && !sitePoints.has(k), '遺跡重疊'); relicPoints.add(k);
  }
  requireThat((value.active === 0 || value.active === 1) && (value.winner === null || value.winner === 0 || value.winner === 1) && integer(value.version) && integer(value.turn) && value.turn >= 1 && integer(value.nextUnitId) && value.nextUnitId >= 4, '回合與版本');
  for (let actor = 0; actor < 2; actor++) {
    const f = value.factions[actor];
    exact(f, ['id', 'identityId', 'lineageId', 'gold', 'techs', 'life', 'centerId', 'originalCapitalId', 'ownTurns', 'completedTurns'], '文明');
    requireThat(f.id === actor && string(f.identityId) && string(f.lineageId) && integer(f.gold) && integer(f.ownTurns) && integer(f.completedTurns), '文明資料');
    requireThat(Array.isArray(f.techs) && f.techs.every(t => ['farm', 'archery', 'pathfinding'].includes(t)) && new Set(f.techs).size === f.techs.length, '科技');
    requireThat(f.ownTurns === f.completedTurns + (value.active === actor ? 1 : 0), '己方回合序號');
    requireThat(value.sites.some(s => s.id === f.originalCapitalId && s.kind === 'capital'), '歷史首都參照');
    const alive = value.units.some(u => u.owner === actor) || value.sites.some(s => s.owner === actor);
    const center = value.sites.some(s => s.id === f.centerId && s.owner === actor);
    requireThat(alive ? (center ? f.life === 'active' : f.life === 'exiled' && f.centerId === null) : f.life === 'eliminated' && f.centerId === null, '生存與政治中心');
    if (!alive) requireThat(value.winner === (actor === 0 ? 1 : 0), '淘汰與勝負');
  }
  const factions = value.factions as GameState['factions'];
  requireThat(value.turn === 1 + factions[0].completedTurns + factions[1].completedTurns && (value.active === 0 ? factions[0].completedTurns === factions[1].completedTurns : factions[0].completedTurns === factions[1].completedTurns + 1), '輪流回合順序');
  if (value.winner !== null) requireThat(factions[value.winner === 0 ? 1 : 0].life === 'eliminated', '過早宣告勝負');
  for (const site of value.sites) if (site.owner !== null) requireThat(site.heldSince <= factions[site.owner === 0 ? 1 : 0].completedTurns, '據點控制序號');
  for (const field of ['explored', 'surveyed'] as const) requireThat(Array.isArray(value[field]) && value[field].length === 2 && value[field].every(a => Array.isArray(a) && a.length === 576 && a.every(b => typeof b === 'boolean')), '知識格陣');
  const state = value as unknown as GameState;
  for (const actor of [0, 1] as Actor[]) {
    const seen = visibility(state, actor);
    requireThat(state.surveyed[actor].every((known, i) => (!known || state.explored[actor][i]) && (!seen[i] || known)), '視野與知識一致性');
  }
  const unresolved = state.relics.filter(r => r.claimedBy !== null && !r.resolved);
  if (value.pendingRelic !== null) {
    exact(value.pendingRelic, ['actor', 'relicId'], '必答選擇');
    requireThat(value.pendingRelic.actor === value.active && unresolved.length === 1 && unresolved[0].claimedBy === value.active && unresolved[0].id === value.pendingRelic.relicId && value.winner === null, '遺跡選擇參照');
  } else requireThat(unresolved.length === 0, '遺失遺跡選擇');
  requireThat(Array.isArray(value.history) && value.history.length === value.version && value.history.every(command => validCommand(command)) && isRecord(value.requests) && Object.keys(value.requests).length === value.version && Object.values(value.requests).every(v => typeof v === 'string'), '指令歷史與請求紀錄');
}

function rebuild(seed: string, commands: Command[]): GameState {
  let state = createGame(seed);
  for (let i = 0; i < commands.length; i++) {
    requireThat(validCommand(commands[i]) && commands[i].expectedVersion === i && !Object.hasOwn(state.requests, commands[i].requestId), `重播第${i + 1}筆格式或序號`);
    const result = applyCommand(state, commands[i]);
    requireThat(result.ok && result.state.version === i + 1, `重播第${i + 1}筆：${result.error ?? '未套用'}`);
    state = result.state;
  }
  return state;
}

export function serializeGame(state: GameState): string { return JSON.stringify(state); }

export function deserializeGame(text: string): GameState {
  const parsed: unknown = JSON.parse(text);
  validateState(parsed);
  const state = rebuild(parsed.seed, parsed.history);
  requireThat(stableStringify(state) === stableStringify(parsed), '存檔內容與權威歷史不一致');
  return state;
}

export function exportReplay(state: GameState): string {
  return JSON.stringify({ schema: 'project4x-replay-1', ruleset: state.ruleset, seed: state.seed, commands: state.history, hash: canonicalHash(state) });
}

export function replayGame(text: string): GameState {
  const replay: unknown = JSON.parse(text);
  exact(replay, ['schema', 'ruleset', 'seed', 'commands', 'hash'], '重播');
  requireThat(replay.schema === 'project4x-replay-1' && replay.ruleset === 'g1-ccts-1' && string(replay.seed) && Array.isArray(replay.commands) && replay.commands.every(command => validCommand(command)) && typeof replay.hash === 'string' && /^[0-9a-f]{16}$/.test(replay.hash), '重播版本與格式');
  const state = rebuild(replay.seed, replay.commands);
  requireThat(canonicalHash(state) === replay.hash, '重播結果hash不一致');
  return state;
}
