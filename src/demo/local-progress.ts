/** Trusted local file boundary only. Full save text is hashed, never parsed or sent to HUD/content. */
import {parseProgress,type DemoProgress} from './progress';
import {DEMO_PACK} from './content';
const hash=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
export async function bindProgressToSave(privateSaveText:string,progress:DemoProgress):Promise<string>{
 return JSON.stringify({schema:'project4x-demo-progress-1',packId:DEMO_PACK.id,packVersion:DEMO_PACK.version,saveSha256:await hash(privateSaveText),progress});
}
export async function readBoundProgress(privateSaveText:string,sidecar:string):Promise<DemoProgress|null>{
 let value:unknown;try{value=JSON.parse(sidecar);}catch{return null;}
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(v.schema!=='project4x-demo-progress-1'||v.packId!==DEMO_PACK.id||v.packVersion!==DEMO_PACK.version||typeof v.saveSha256!=='string'||v.saveSha256!==await hash(privateSaveText))return null;
 return parseProgress(v.progress);
}
