/** 呈現資料；沒有能力、費用、命令或世界狀態。 */
export type TerrainVisual = Readonly<{id: string; slab: readonly [string, string, string]}>;
const terrain = (id: string, slab: [string, string, string]): TerrainVisual => Object.freeze({id, slab: Object.freeze(slab)});
const FOG = terrain('fog', ['#1f3630','#172924','#111e1a']);
const MISSING_TERRAIN = terrain('unidentified', ['#88908a','#626d65','#48564d']);
const TERRAINS: Readonly<Record<string, TerrainVisual>> = Object.freeze({
 plain: terrain('plain', ['#a0ad82','#78845c','#5d6c46']),
 forest: terrain('forest', ['#6b8972','#4c6653','#354e40']),
 hill: terrain('hill', ['#b2ae8c','#858362','#63694e']),
 mountain: terrain('mountain', ['#8e9b90','#66766b','#4d5d53']),
 water: terrain('water', ['#4d8190','#386471','#294e59']),
});
export function getTerrainVisual(tile: {visibility: string; terrain?: string | null}): TerrainVisual {
 if (tile.visibility === 'unknown') return FOG;
 return tile.terrain && Object.hasOwn(TERRAINS, tile.terrain) ? TERRAINS[tile.terrain] : MISSING_TERRAIN;
}
export type UnitVisual = Readonly<{id: string; silhouette: 'soldier' | 'wanderer' | 'bowman' | 'bulwark' | 'runner' | 'unidentified'}>;
const MISSING_UNIT: UnitVisual = Object.freeze({id:'unidentified',silhouette:'unidentified'});
const UNITS: Readonly<Record<string, UnitVisual>> = Object.freeze({
 infantry: Object.freeze({id:'infantry',silhouette:'soldier'}),
 scout: Object.freeze({id:'scout',silhouette:'wanderer'}),
 archer: Object.freeze({id:'archer',silhouette:'bowman'}),
 shieldGuard: Object.freeze({id:'shieldGuard',silhouette:'bulwark'}),
 mobileScout: Object.freeze({id:'mobileScout',silhouette:'runner'}),
});
export function getUnitVisual(kind: string): UnitVisual {
 return Object.hasOwn(UNITS, kind) ? UNITS[kind] : MISSING_UNIT;
}
export const MINIATURE_MATERIALS = Object.freeze({
 own: Object.freeze({cloth:'#6d8c76',shade:'#294c40',trim:'#e1c777',base:'#345746'}),
 enemy: Object.freeze({cloth:'#b97963',shade:'#743f36',trim:'#f0bb97',base:'#7a483c'}),
 steel:'#b7c3b8',steelShade:'#687b71',wood:'#8c6943',skin:'#d7bc92',ink:'#20372e',
});
