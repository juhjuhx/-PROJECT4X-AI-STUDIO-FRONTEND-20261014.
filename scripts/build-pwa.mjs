import {readdir,readFile,writeFile,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function buildPwa(directory){
 const root=resolve(directory),generated=new Set(['service-worker.js','register-sw.js','pwa-assets.json']);
 async function walk(dir,prefix=''){const out=[];for(const name of (await readdir(dir)).sort()){
  const path=join(dir,name),rel=prefix+name,st=await lstat(path);
  if(st.isSymbolicLink())throw new Error('不允許PWA符號連結：'+rel);
  if(st.isDirectory())out.push(...await walk(path,rel+'/'));else out.push(rel);
 }return out;}
 const existing=(await walk(root)).filter(f=>!generated.has(f));
 const allowed=f=>['index.html','manifest.webmanifest','favicon.ico','icon.svg','icons/icon-192.png','icons/icon-512.png'].includes(f)||/^assets\/[A-Za-z0-9_-]+\.(js|css)$/.test(f);
 for(const file of existing)if(!allowed(file))throw new Error('不允許PWA產物：'+file);
 if(!existing.includes('index.html')||!existing.includes('manifest.webmanifest'))throw new Error('PWA缺少入口或manifest');
 const marker='<script type="module" src="./register-sw.js"></script>';
 let html=await readFile(join(root,'index.html'),'utf8');if(!html.includes(marker))html=html.replace('</body>',marker+'\n</body>');
 await writeFile(join(root,'index.html'),html);
 await writeFile(join(root,'register-sw.js'),`if ('serviceWorker' in navigator && window.isSecureContext) {\n navigator.serviceWorker.register(new URL('./service-worker.js', import.meta.url), {scope:new URL('./',import.meta.url).pathname,updateViaCache:'none'}).catch(error=>console.error('離線快取未能啟用：',error));\n}\n`);
 const files={};for(const f of [...existing,'register-sw.js'].sort())files[f]=sha(await readFile(join(root,f)));
 const revision=sha(JSON.stringify(files));
 const worker=`// PROJECT-4X static shell only. No save, replay, history or API caching.\nconst FILES=${JSON.stringify(files)};\nconst ROOT=new URL('./',self.location.href);\nconst PREFIX='project4x-demo:'+encodeURIComponent(ROOT.pathname)+':';\nconst CACHE=PREFIX+${JSON.stringify(revision)};\nconst urls=new Map(Object.keys(FILES).map(path=>[new URL(path,ROOT).href,path]));\nself.addEventListener('install',event=>{event.waitUntil((async()=>{\n const responses=await Promise.all(Object.entries(FILES).map(async([path,expected])=>{\n  const response=await fetch(new Request(new URL(path,ROOT),{cache:'reload',credentials:'same-origin'}));\n  if(!response.ok||response.redirected)throw new Error('離線資產讀取失敗：'+path);\n  const bytes=await response.clone().arrayBuffer();\n  const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');\n  if(actual!==expected)throw new Error('離線資產版本不符：'+path);\n  return [new URL(path,ROOT).href,response];\n }));\n const cache=await caches.open(CACHE);await Promise.all(responses.map(([url,response])=>cache.put(url,response)));\n})());});\n// Default waiting lifecycle: do not replace a running game.\nself.addEventListener('activate',event=>{event.waitUntil((async()=>{\n await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));\n await self.clients.claim();\n})());});\nself.addEventListener('fetch',event=>{\n const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==ROOT.origin)return;\n let key=url.href;\n if(request.mode==='navigate'&&(url.pathname===ROOT.pathname||url.pathname===new URL('index.html',ROOT).pathname))key=new URL('index.html',ROOT).href;\n if(!urls.has(key))return;\n event.respondWith((async()=>{const cached=await (await caches.open(CACHE)).match(key);return cached||fetch(request);})());\n});\n`;
 await writeFile(join(root,'service-worker.js'),worker);
 const result={schema:'project4x-static-shell-1',revision,files};await writeFile(join(root,'pwa-assets.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await buildPwa(process.argv[2]||'dist')));
