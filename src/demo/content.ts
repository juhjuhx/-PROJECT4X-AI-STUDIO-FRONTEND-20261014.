/** Narrative-only vertical content slice. No gameplay definitions or authority effects. */
export interface NarrativePack {
 readonly schema:'project4x-narrative-pack-1';readonly id:string;readonly version:string;readonly locale:'zh-Hant';
 readonly rulesets:readonly string[];readonly license:'MIT';readonly requiredAssets:readonly string[];readonly effects:readonly ('text'|'objectives')[];
 readonly text:Readonly<Record<'title'|'discovery'|'interpretation'|'gold'|'intel'|'lead'|'completion',string>>;
}
export const DEMO_PACK: NarrativePack=Object.freeze({
 schema:'project4x-narrative-pack-1',id:'mistbound.demo.first-observation',version:'1.0.0',locale:'zh-Hant',rulesets:Object.freeze(['g1-ccts-1']),license:'MIT',requiredAssets:Object.freeze([]),effects:Object.freeze(['text','objectives'] as const),
 text:Object.freeze({
  title:'第一份觀測紀錄',
  discovery:'霧中留下了一處遺跡。我們還不知道是誰建造了它。',
  interpretation:'探險隊可以帶回可用的金幣，或記錄附近仍未知的地形。地形情報不包含敵軍的位置。',
  gold:'探險隊帶回4金幣，可投入招募或研究。遺跡的來源仍待調查。',
  intel:'你記錄了遺跡周邊仍未知的地形。這份線索尚未說明遺跡的來源。',
  lead:'耕作改善據點收入，弓術解鎖弓兵，尋徑擴大斥候視野。帶著已知能力，選擇下一段探索方向。',
  completion:'首段探索紀錄已完成。這不是對戰勝利；你可以保存航程、繼續探索，或重新出發。',
 })
});
export const PREVIEW_DEMO_PACK: NarrativePack=Object.freeze({
 ...DEMO_PACK,id:'mistbound.demo03.first-observation',rulesets:Object.freeze(['demo03-preview-1']),
 text:Object.freeze({...DEMO_PACK.text,lead:'防禦工程解鎖盾衛；尋徑之後可研究軍事機動，招募機動偵察。投入研究與招募需要金幣，先決定這段航程要守備或探索。'}),
});
export function getNarrativePack(ruleset:string):NarrativePack {
 if(ruleset==='g1-ccts-1')return DEMO_PACK;
 if(ruleset==='demo03-preview-1')return PREVIEW_DEMO_PACK;
 throw new Error('不支援的敘事版本');
}
export function parseNarrativePack(value:unknown):NarrativePack {
 if(!value||typeof value!=='object')throw new Error('pack');
 const v=value as Record<string,unknown>;
 if(v.schema!=='project4x-narrative-pack-1'||typeof v.id!=='string'||!/^mistbound\.[a-z0-9.-]+$/.test(v.id)
   ||typeof v.version!=='string'||!/^\d+\.\d+\.\d+$/.test(v.version)||v.locale!=='zh-Hant'||v.license!=='MIT')throw new Error('manifest');
 if(!Array.isArray(v.rulesets)||v.rulesets.length!==1||!['g1-ccts-1','demo03-preview-1'].includes(v.rulesets[0] as string))throw new Error('rulesets');
 if(!Array.isArray(v.effects)||!v.effects.length||!v.effects.every(x=>x==='text'||x==='objectives'))throw new Error('effects');
 if(!Array.isArray(v.requiredAssets)||!v.requiredAssets.every(x=>typeof x==='string'&&/^[a-z0-9/_-]+\.(png|svg|ico)$/.test(x)))throw new Error('assets');
 const text=v.text as Record<string,unknown>;
 if(!text||!['title','discovery','interpretation','gold','intel','lead','completion'].every(k=>typeof text[k]==='string'&&(text[k] as string).length>0&&(text[k] as string).length<=1200))throw new Error('text');
 return DEMO_PACK.id===v.id&&value===DEMO_PACK?DEMO_PACK:structuredClone(value) as NarrativePack;
}
