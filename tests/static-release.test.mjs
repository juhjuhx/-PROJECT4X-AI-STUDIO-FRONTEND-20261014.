import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('production server serves ICO and web manifest with explicit browser MIME, HEAD and 404 remain strict',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'project4x-static-'));let child;
 try{
  await mkdir(join(temp,'scripts'));await mkdir(join(temp,'dist'));
  await writeFile(join(temp,'scripts/serve.mjs'),await readFile(new URL('../scripts/serve.mjs',import.meta.url)));
  await writeFile(join(temp,'dist/index.html'),'<!doctype html><title>HTTP fixture only</title>');
  await writeFile(join(temp,'dist/favicon.ico'),Buffer.from([0,0,1,0,0,0])); // MIME fixture, not a valid product icon.
  await writeFile(join(temp,'dist/manifest.webmanifest'),'{"name":"HTTP fixture"}');
  const reservation=createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(r=>reservation.close(r));
  child=spawn(process.execPath,[join(temp,'scripts/serve.mjs')],{env:{...process.env,PROJECT4X_PORT:String(port)},stdio:'pipe'});
  let startup='';child.stderr.on('data',b=>startup+=b);child.stdout.resume();
  const base='http://127.0.0.1:'+port;let ready=false;
  for(let i=0;i<50;i++){try{ready=(await fetch(base+'/__project4x_health')).ok;}catch{}if(ready)break;if(child.exitCode!==null)break;await new Promise(r=>setTimeout(r,50));}
  assert.ok(ready,'test server startup failed: '+startup);
  for(const [path,mime] of [['favicon.ico','image/vnd.microsoft.icon'],['manifest.webmanifest','application/manifest+json']]){
   const response=await fetch(base+'/'+path);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),mime);
   const head=await fetch(base+'/'+path,{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),mime);assert.equal((await head.arrayBuffer()).byteLength,0);
  }
  assert.equal((await fetch(base+'/actually-missing.png')).status,404);
 }finally{
  if(child&&child.exitCode===null){const stopped=once(child,'exit');child.kill('SIGTERM');await stopped;}
  await rm(temp,{recursive:true});
 }
});
