import { UNIT_STATS, TECH_STATS } from './types';

export type RulesetId = 'g1-ccts-1' | 'demo03-preview-1';
export type ContentUnitId = 'infantry' | 'scout' | 'archer' | 'shieldGuard' | 'mobileScout';
export type ContentTechId = 'farm' | 'archery' | 'pathfinding' | 'defensiveEngineering' | 'militaryMobility';
export interface UnitDefinition {
  readonly id: ContentUnitId; readonly name: string;
  readonly cost: number; readonly hp: number; readonly attack: number; readonly defense: number;
  readonly range: number; readonly move: number; readonly sight: number;
  readonly role: 'line' | 'recon' | 'ranged' | 'defense';
  readonly visual: { readonly key: string; readonly fallback: 'infantry' | 'scout' | 'archer' | 'unidentified' };
}
export type TechnologyEffect =
  | { readonly type: 'unlockUnit'; readonly unit: ContentUnitId }
  | { readonly type: 'unitSight'; readonly unit: ContentUnitId; readonly amount: number }
  | { readonly type: 'siteIncome'; readonly amount: number };
export interface TechnologyDefinition {
  readonly id: ContentTechId; readonly name: string; readonly cost: number; readonly description: string;
  readonly prerequisites: readonly ContentTechId[]; readonly effects: readonly TechnologyEffect[];
}
export interface RulesetDefinition {
  readonly id: RulesetId; readonly namespace: 'project4x'; readonly version: '1.0.0';
  readonly generatorVersion: 'g1-mapgen-1'; readonly contentHash: string;
  readonly units: readonly UnitDefinition[]; readonly technologies: readonly TechnologyDefinition[];
}

const unitIds = ['infantry','scout','archer','shieldGuard','mobileScout'];
const techIds = ['farm','archery','pathfinding','defensiveEngineering','militaryMobility'];
const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
function requireThat(ok: unknown): asserts ok { if (!ok) throw new Error('內容定義無效'); }
function exact(v: unknown, keys: readonly string[]): asserts v is Record<string, unknown> {
  requireThat(isRecord(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v,k)));
}
const positive = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
const label = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 256;

/** 結構/引用/DAG linter。非任意外部包載入器；runtime 僅接受下方兩個固定 bundle。
 * contentHash 的 SHA-256 bytes 在建置測試以 Node crypto 驗證，瀏覽器不依賴 Node/WebCrypto。 */
export function validateRuleset(value: unknown): asserts value is RulesetDefinition {
  exact(value,['id','namespace','version','generatorVersion','contentHash','units','technologies']);
  requireThat(['g1-ccts-1','demo03-preview-1'].includes(value.id as string) && value.namespace === 'project4x' && value.version === '1.0.0' && value.generatorVersion === 'g1-mapgen-1');
  requireThat(typeof value.contentHash === 'string' && /^[0-9a-f]{64}$/.test(value.contentHash));
  requireThat(Array.isArray(value.units) && value.units.length > 0 && Array.isArray(value.technologies) && value.technologies.length > 0);
  const units = new Set<string>(), techs = new Map<string, Record<string, unknown>>();
  for (const unit of value.units) {
    exact(unit,['id','name','cost','hp','attack','defense','range','move','sight','role','visual']);
    requireThat(typeof unit.id === 'string' && unitIds.includes(unit.id) && !units.has(unit.id)); units.add(unit.id);
    requireThat(label(unit.name) && ['line','recon','ranged','defense'].includes(unit.role as string));
    for (const key of ['cost','hp','attack','range','move','sight']) requireThat(positive(unit[key]));
    requireThat(typeof unit.defense === 'number' && Number.isSafeInteger(unit.defense) && unit.defense >= 0);
    exact(unit.visual,['key','fallback']);
    requireThat(typeof unit.visual.key === 'string' && /^[a-z][a-zA-Z0-9-]*$/.test(unit.visual.key) && ['infantry','scout','archer','unidentified'].includes(unit.visual.fallback as string));
  }
  for (const tech of value.technologies) {
    exact(tech,['id','name','cost','description','prerequisites','effects']);
    requireThat(typeof tech.id === 'string' && techIds.includes(tech.id) && !techs.has(tech.id)); techs.set(tech.id,tech);
    requireThat(label(tech.name) && label(tech.description) && positive(tech.cost) && Array.isArray(tech.prerequisites) && new Set(tech.prerequisites).size === tech.prerequisites.length && Array.isArray(tech.effects) && tech.effects.length > 0);
    for (const effect of tech.effects) {
      requireThat(isRecord(effect));
      if (effect.type === 'unlockUnit') { exact(effect,['type','unit']); requireThat(units.has(effect.unit as string)); }
      else if (effect.type === 'unitSight') { exact(effect,['type','unit','amount']); requireThat(units.has(effect.unit as string) && positive(effect.amount)); }
      else if (effect.type === 'siteIncome') { exact(effect,['type','amount']); requireThat(positive(effect.amount)); }
      else requireThat(false);
    }
  }
  const done = new Set<string>(), visiting = new Set<string>();
  function visit(id: string): void {
    requireThat(techs.has(id) && !visiting.has(id));
    if (done.has(id)) return;
    visiting.add(id);
    for (const required of techs.get(id)!.prerequisites as unknown[]) { requireThat(typeof required === 'string'); visit(required); }
    visiting.delete(id); done.add(id);
  }
  for (const id of techs.keys()) visit(id);
}

const units: UnitDefinition[] = [
  { id:'infantry', ...UNIT_STATS.infantry, role:'line', visual:{key:'infantry',fallback:'infantry'} },
  { id:'scout', ...UNIT_STATS.scout, role:'recon', visual:{key:'scout',fallback:'scout'} },
  { id:'archer', ...UNIT_STATS.archer, role:'ranged', visual:{key:'archer',fallback:'archer'} },
];
const technologies: TechnologyDefinition[] = [
  { id:'farm', ...TECH_STATS.farm, prerequisites:[], effects:[{type:'siteIncome',amount:1}] },
  { id:'archery', ...TECH_STATS.archery, prerequisites:[], effects:[{type:'unlockUnit',unit:'archer'}] },
  { id:'pathfinding', ...TECH_STATS.pathfinding, prerequisites:[], effects:[{type:'unitSight',unit:'scout',amount:1}] },
];
const legacy: RulesetDefinition = { id:'g1-ccts-1',namespace:'project4x',version:'1.0.0',generatorVersion:'g1-mapgen-1',contentHash:'f0c4c2161e55c42c9d3c4a0f7936da4a1d607d2894aa0e55cbb5c57755440986',units,technologies };
const preview: RulesetDefinition = {
  id:'demo03-preview-1',namespace:'project4x',version:'1.0.0',generatorVersion:'g1-mapgen-1',contentHash:'10937708c18410e00e88d87a2ae6835918d4c00b433807588b62e29e3f151e88',
  units:[...units,
    {id:'shieldGuard',name:'盾衛',cost:6,hp:10,attack:3,defense:2,range:1,move:1,sight:2,role:'defense',visual:{key:'shieldGuard',fallback:'unidentified'}},
    {id:'mobileScout',name:'機動偵察',cost:7,hp:7,attack:3,defense:0,range:1,move:3,sight:3,role:'recon',visual:{key:'mobileScout',fallback:'unidentified'}},
  ],
  technologies:[...technologies,
    {id:'defensiveEngineering',name:'防禦工程',cost:7,description:'解鎖盾衛；隔離預覽測試基準',prerequisites:[],effects:[{type:'unlockUnit',unit:'shieldGuard'}]},
    {id:'militaryMobility',name:'軍事機動',cost:6,description:'解鎖機動偵察；隔離預覽測試基準',prerequisites:['pathfinding'],effects:[{type:'unlockUnit',unit:'mobileScout'}]},
  ],
};
function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
}
const bundles = freeze({ 'g1-ccts-1': legacy, 'demo03-preview-1': preview });

export function getRuleset(id: string): RulesetDefinition {
  if (!Object.hasOwn(bundles,id)) throw new Error('不支援的 ruleset');
  return bundles[id as RulesetId];
}

export function unitDefinition(ruleset: string, kind: ContentUnitId): UnitDefinition {
  const definition = getRuleset(ruleset).units.find(u => u.id === kind);
  if (!definition) throw new Error('此 ruleset 不支援的兵種');
  return definition;
}

export function technologyDefinition(ruleset: string, id: ContentTechId): TechnologyDefinition {
  const definition = getRuleset(ruleset).technologies.find(t => t.id === id);
  if (!definition) throw new Error('此 ruleset 不支援的科技');
  return definition;
}
