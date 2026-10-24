import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter,once} from 'node:events';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const moduleURL=new URL('../scripts/qa-pwa-update-lifecycle.mjs',import.meta.url);
let helpers={};try{helpers=await import(moduleURL);}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
const cleanup=helpers.cleanupUpdateResources??(async()=>{});
const observe=helpers.observeUpdatePages??(()=>{});
test('PWA update cleanup still closes owned server and fixture after context close fails',async t=>{
 const fixture=await mkdtemp(join(tmpdir(),'project4x-update-fixture-')),profile=await mkdtemp(join(tmpdir(),'project4x-update-profile-'));await mkdir(join(profile,'downloads'));
 const server=createServer((req,res)=>res.end('owned'));server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(async()=>{server.closeAllConnections();if(server.listening)await new Promise(r=>server.close(r));await rm(fixture,{recursive:true,force:true});await rm(profile,{recursive:true,force:true});});
 await assert.rejects(()=>cleanup({context:{close:async()=>{throw new Error('close failed');}},profile,server,root:fixture}));
 assert.equal(server.listening,false);await assert.rejects(()=>access(fixture),{code:'ENOENT'});await access(profile);
});
test('PWA update observes runtime and console failures from both old and replacement pages',()=>{
 const context=new EventEmitter(),errors=[];observe(context,errors);
 for(let i=0;i<2;i++){const page=new EventEmitter();context.emit('page',page);page.emit('pageerror',new Error('runtime '+i));page.emit('console',{type:()=> 'error',text:()=> 'console '+i});}
 assert.deepEqual(errors,['runtime 0','console 0','runtime 1','console 1']);
});
