import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,unlink,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {buildPwa} from '../scripts/build-pwa.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
async function fixture(){const d=await mkdtemp(join(tmpdir(),'project4x-pwa-'));await mkdir(join(d,'assets'));await mkdir(join(d,'icons'));for(const [f,s]of Object.entries({'index.html':'<!doctype html><head></head><body>fixture</body>','manifest.webmanifest':'{}','assets/app.js':'export const value=1','icons/icon-192.png':'fixture'}))await writeFile(join(d,f),s);return d;}
test('PWA build emits deterministic relative shell with byte hashes and isolated cache revision',async()=>{const d=await fixture();try{
 await buildPwa(d);const first=await readFile(join(d,'pwa-assets.json'),'utf8'),manifest=JSON.parse(first);
 assert.ok(manifest.files['index.html']);for(const [f,sha]of Object.entries(manifest.files))assert.equal(hash(await readFile(join(d,f))),sha);
 assert.match(await readFile(join(d,'index.html'),'utf8'),/src="\.\/register-sw.js"/);
 assert.match(await readFile(join(d,'service-worker.js'),'utf8'),/addEventListener\('fetch'/);
 await buildPwa(d);assert.equal(await readFile(join(d,'pwa-assets.json'),'utf8'),first);
 await writeFile(join(d,'assets/app.js'),'export const value=2');await buildPwa(d);assert.notEqual(JSON.parse(await readFile(join(d,'pwa-assets.json'),'utf8')).revision,manifest.revision);
 }finally{await rm(d,{recursive:true});}});
test('PWA build refuses unexpected data files and symlinks rather than precaching private data',async()=>{const d=await fixture();try{await writeFile(join(d,'private-save.json'),'{"secret":true}');await assert.rejects(buildPwa(d),/不允許/);await unlink(join(d,'private-save.json'));await symlink(join(d,'index.html'),join(d,'bad-link'));await assert.rejects(buildPwa(d),/符號連結/);}finally{await rm(d,{recursive:true});}});
