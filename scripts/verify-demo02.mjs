// Explicit Demo02 engineering gate. scripts/verify.mjs retains the separate full100 gate.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {readFileSync,openSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer} from 'node:net';
import {once} from 'node:events';
import {tmpdir} from 'node:os';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {artifactHashes} from './artifact-proof.mjs';
import {validateBrowserEvidence} from './qa-browser-contract.mjs';
import {validateClientProof,publicClientSummary,validateUpdateProof,publicVerificationSummary} from './release-proof.mjs';
async function verify(){
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const capture=()=>Object.fromEntries([...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean))].sort().map(p=>[p,sha(readFileSync(resolve(root,p)))]));
let evidence;if(process.env.PROJECT4X_EVIDENCE_DIR){evidence=resolve(process.env.PROJECT4X_EVIDENCE_DIR);assert.ok(!evidence.startsWith(root+sep),'private evidence must be outside source');await mkdir(evidence,{recursive:false});}else evidence=await mkdtemp(resolve(tmpdir(),'project4x-demo02-verification-'));
const checks=[],proofs=[],cleanup=[];let server,serverLog,source=capture(),artifacts,error=null,activeStage='initialization';
async function run(label,command,args,extra={}){
 activeStage=label;
 const start=performance.now(),path=resolve(evidence,label+'.log'),fd=openSync(path,'wx');let child,code=1,timer;
 try{code=await new Promise((accept,reject)=>{child=spawn(command,args,{cwd:root,stdio:['ignore',fd,fd],env:{...process.env,...extra}});child.once('error',reject);child.once('close',value=>accept(value??1));timer=setTimeout(()=>{child.kill('SIGTERM');timer=setTimeout(()=>child.kill('SIGKILL'),5000);},600000);});}
 finally{clearTimeout(timer);closeSync(fd);checks.push({label,command:[command,...args],exitCode:code,milliseconds:Math.round(performance.now()-start),logSha256:sha(await readFile(path))});}
 assert.equal(code,0,label+' failed; detailed log retained in private evidence');
 if(label==='tests'){const text=await readFile(path,'utf8');const count=name=>{const match=text.match(new RegExp('(?:#|ℹ)\\s+'+name+'\\s+(\\d+)'));assert.ok(match,'missing Node test count: '+name);return Number(match[1]);};const totals={tests:count('tests'),pass:count('pass'),fail:count('fail'),skipped:count('skipped')};assert.ok(totals.tests>=203,'baseline tests missing');assert.equal(totals.pass,totals.tests);assert.equal(totals.fail,0);assert.equal(totals.skipped,0);checks.at(-1).testCounts=totals;}
}
async function port(){const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const value=socket.address().port;await new Promise(r=>socket.close(r));return value;}
try{
 await run('publication',process.execPath,['scripts/check-publication.mjs']);
 await run('check','npm',['run','check']);await run('tests','npm',['test']);await run('build','npm',['run','build']);artifacts=artifactHashes(resolve(root,'dist'));
 const selectedPort=await port(),url='http://127.0.0.1:'+selectedPort;serverLog=openSync(resolve(evidence,'server.log'),'wx');server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:['ignore',serverLog,serverLog],env:{...process.env,PROJECT4X_PORT:String(selectedPort)}});let spawnError;server.once('error',e=>{spawnError=e;});
 let ready=false;for(let i=0;i<50&&!ready;i++){if(spawnError)throw spawnError;if(server.exitCode!==null)throw new Error('owned server exited');try{const response=await fetch(url,{signal:AbortSignal.timeout(300)});ready=response.ok&&sha(Buffer.from(await response.arrayBuffer()))===artifacts['index.html'];}catch{ready=false;}if(!ready)await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'owned server not ready');
 for(const [kind,args]of [['browser',['scripts/browser-check.mjs']],['gameplay',['--import','tsx','scripts/browser-check.mjs','--gameplay']],['demo',['--import','tsx','scripts/demo-check.mjs']],['pwa',['--import','tsx','scripts/pwa-check.mjs']]]){
  const dir=resolve(evidence,kind);await run(kind,process.execPath,args,{PROJECT4X_URL:url,PROJECT4X_EVIDENCE_DIR:dir});const path=resolve(dir,kind==='demo'?'demo.json':kind==='pwa'?'pwa.json':'browser.json');const receipt=JSON.parse(await readFile(path,'utf8'));
  if(kind==='browser'||kind==='gameplay'){
   validateBrowserEvidence(receipt,{artifacts,servedIndexSha256:artifacts['index.html'],gameplay:kind==='gameplay'});
   if(kind==='gameplay'){const journey=receipt.scenarios.find(x=>x.id==='continuous-existing-gameplay');assert.equal(journey.maxHumanCommands,220);assert.ok(journey.humanCommands<=220);assert.equal(journey.captureAfterAttack,true);assert.equal(journey.replayVerified,true);}
   proofs.push({kind,status:'PASS',scenarioCount:receipt.scenarios.length,receiptSha256:sha(await readFile(path))});
  }else{validateClientProof(receipt,kind,artifacts);proofs.push({...publicClientSummary(receipt,kind),receiptSha256:sha(await readFile(path))});}
 }
 const updateDir=resolve(evidence,'pwa-update');await run('pwa-update',process.execPath,['scripts/pwa-update-check.mjs'],{PROJECT4X_EVIDENCE_DIR:updateDir});const updatePath=resolve(updateDir,'update.json');const update=JSON.parse(await readFile(updatePath,'utf8'));validateUpdateProof(update,JSON.parse(await readFile(resolve(root,'dist/pwa-assets.json'),'utf8')).revision);proofs.push({kind:'pwa-update',status:'PASS',waitingWithOldClient:update.waitingWithOldClient,activationAfterOldClientsClosed:update.activationAfterOldClientsClosed,receiptSha256:sha(await readFile(updatePath))});
 assert.equal(server.exitCode,null,'owned server unexpectedly exited');
}catch(e){error=e.stack??String(e);}
finally{
 try{if(server&&server.exitCode===null){const done=once(server,'exit');server.kill('SIGTERM');let timer;try{await Promise.race([done,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('server cleanup timeout')),5000);})]);}finally{clearTimeout(timer);if(server.exitCode===null)server.kill('SIGKILL');}}cleanup.push({stage:'owned-server',status:'PASS'});}catch(e){cleanup.push({stage:'owned-server',status:'FAIL',message:e.message});}
 if(serverLog!==undefined)closeSync(serverLog);
 let same=false;try{assert.deepEqual(capture(),source);if(artifacts)assert.deepEqual(artifactHashes(resolve(root,'dist')),artifacts);same=true;}catch{error??='source/build changed during verification';}
 const result={status:!error&&cleanup.every(x=>x.status==='PASS')?'PASS':'FAIL',gate:'Demo02 engineering; not full100 or Playable Alpha',checks,proofs,cleanup,sourceUnchanged:same,sourceFingerprint:sha(JSON.stringify(source)),artifacts:artifacts??null,primaryFailure:error,failedStage:error?activeStage:null,human:'UNVERIFIED',physicalPhone:'UNVERIFIED'};
 await writeFile(resolve(evidence,'demo02-verification.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(publicVerificationSummary(result),null,2));if(result.status!=='PASS')process.exitCode=1;
}
}
await verify().catch(async error=>{
 // Initialization/persistence failures must not expose machine paths on public CI.
 let diagnosticRetained=false;
 try{const dir=await mkdtemp(resolve(tmpdir(),'project4x-verification-failure-'));await writeFile(resolve(dir,'failure.json'),JSON.stringify({kind:'INITIALIZATION_OR_PERSISTENCE_FAILURE',message:error.message,stack:error.stack})+'\n',{flag:'wx',mode:0o600});diagnosticRetained=true;}catch{}
 console.log(JSON.stringify({status:'FAIL',primaryFailure:{kind:'PRIMARY_TEST_FAILURE',stage:'initialization-or-persistence',code:'INITIALIZATION_FAILED'},diagnosticRetained}));process.exitCode=1;
});
