/** Trusted local file boundary only. Full save text is hashed, never parsed or sent to HUD/content. */
import {parseProgress,type DemoProgress} from './progress';
import {DEMO_PACK,PREVIEW_DEMO_PACK,getNarrativePack} from './content';
const hash=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
export async function bindProgressToSave(privateSaveText:string,progress:DemoProgress,ruleset='g1-ccts-1'):Promise<string>{
 const pack=getNarrativePack(ruleset);
 return JSON.stringify({schema:'project4x-demo-progress-1',packId:pack.id,packVersion:pack.version,saveSha256:await hash(privateSaveText),progress});
}
export async function readBoundProgress(privateSaveText:string,sidecar:string):Promise<DemoProgress|null>{
 let value:unknown;try{value=JSON.parse(sidecar);}catch{return null;}
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(v.schema!=='project4x-demo-progress-1'||![DEMO_PACK,PREVIEW_DEMO_PACK].some(p=>p.id===v.packId&&p.version===v.packVersion)||typeof v.saveSha256!=='string'||v.saveSha256!==await hash(privateSaveText))return null;
 return parseProgress(v.progress);
}
