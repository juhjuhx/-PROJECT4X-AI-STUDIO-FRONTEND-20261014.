import {readFileSync,writeFileSync,mkdirSync,existsSync,renameSync,statfsSync,realpathSync,readdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve,relative,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {createGame,applyCommand,observe,canonicalHash} from '../src/core/game';
import {chooseAction} from '../src/core/ai';
import {serializeGame,deserializeGame,exportReplay,replayGame} from '../src/core/persistence';
import type {Action,GameState} from '../src/core/types';
import {runGeneratedMatch,emptyMetrics,actionNames} from './qa-match';
import {RoundLedger,writeFirstJson,validateLedgerRow,canonicalJson} from './qa-ledger';
import type {LedgerRow,RoundIdentity} from './qa-ledger';
import {productSources,sourceHash,methodSources,methodHash,sha} from './qa-source';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const positive=(value:string|undefined,fallback:number)=>{const n=value===undefined?fallback:Number(value);assert.ok(Number.isSafeInteger(n)&&n>=1,'QA上限必須是正整數');return n;};
const count=positive(process.env.PROJECT4X_QA_GAMES,100),firstSeed=positive(process.env.PROJECT4X_QA_START_SEED,1);
assert.ok(firstSeed+count-1<=100,'固定seed只能001–100');
const batchRange={first:firstSeed,last:firstSeed+count-1};
const maxTurns=positive(process.env.PROJECT4X_QA_MAX_TURNS,800),maxCommands=positive(process.env.PROJECT4X_QA_MAX_COMMANDS,40000);
const official=maxTurns===800&&maxCommands===40000;
const reportPath=resolve(process.env.PROJECT4X_QA_OUTPUT??resolve(root,'../evidence','headless-'+Date.now(),'headless.json'));
const ledgerPath=resolve(process.env.PROJECT4X_QA_LEDGER??reportPath+'.ledger');
const originalRoot=resolve(process.env.PROJECT4X_QA_ORIGINAL_ROOT??root);
const inside=(base:string,path:string)=>{const r=relative(base,path);return r===''||(!r.startsWith('..'+sep)&&r!=='..'&&!r.startsWith(sep));};
const privatePath=resolve(process.env.PROJECT4X_QA_PRIVATE_DIR??(inside(originalRoot,dirname(reportPath))?resolve(root,'../evidence','headless-private-'+Date.now()):resolve(dirname(reportPath),'private')));
assert.ok(!inside(originalRoot,privatePath),'canonical world必須放在專案外private evidence');
const sourceStart=productSources(root),productHash=sourceHash(sourceStart);
const shadowPath=process.env.PROJECT4X_QA_SHADOW_PATH;
const shadowHash=shadowPath?sha(readFileSync(shadowPath)):null;
const methodStart=methodSources(root),methodFingerprint=methodHash(methodStart,shadowHash);
const identity:RoundIdentity={schema:'project4x-qa-round-1',sourceHash:productHash,methodFingerprint,
 ruleset:'g1-ccts-1',saveSchema:'project4x-save-1',replaySchema:'project4x-replay-1',node:process.version,
 seeds:Array.from({length:100},(_,i)=>i+1),limits:{maxTurns,maxCommands},shadowHash};
const seedRange=official?{first:1,last:100}:batchRange;
const requested=Array.from({length:count},(_,i)=>firstSeed+i);
const availableBytes=()=>{const s=statfsSync(dirname(reportPath));return s.bavail*s.bsize;};

function submit(s: GameState, action: Action, prefix: string): GameState {
  const result = applyCommand(s, { actor: s.active, expectedVersion: s.version, requestId: `${prefix}-${s.version}`, action });
  assert.equal(result.ok, true, result.error ?? '合法fixture指令被拒絕');
  return result.state;
}
function fixtures() {
  const rows: Array<Record<string, unknown>> = [];
  let s = createGame('QA-fixture-立即遺跡');
  s = submit(s, { type: 'Move', unitId: '兵-1', to: { x: 5, y: 3 } }, 'fixture-relic');
  assert.ok(s.pendingRelic);
  const view = observe(s, s.active);
  const choice = chooseAction(view);
  assert.ok(choice && choice.type === 'ResolveRelic');
  const before = s;
  s = submit(s, choice, 'fixture-relic');
  assert.equal(s.relics[0].resolved, true);
  assert.equal(s.pendingRelic, null);
  assert.deepEqual(deserializeGame(serializeGame(s)), s);
  rows.push({ id: 'AI-立即遺跡', status: 'PASS', seed: s.seed, action: choice, hash: canonicalHash(s), observationOnly: true, savedContinuation: true, gainGold: s.factions[0].gold - before.factions[0].gold });

  s = createGame('QA-fixture-流亡與建都');
  s.terrain.fill('plain'); s.relics = [];
  const old = s.sites.find(site => site.id === s.factions[0].originalCapitalId)!;
  const village = s.sites.find(site => site.kind === 'village')!;
  old.owner = 1; village.owner = 0; village.heldSince = 0;
  s.factions[0].centerId = null; s.factions[0].life = 'exiled'; s.factions[0].gold = 0;
  s = submit(s, { type: 'EndTurn' }, 'fixture-exile');
  s = submit(s, { type: 'EndTurn' }, 'fixture-exile');
  assert.equal(s.winner, null);
  assert.equal(s.factions[0].life, 'exiled');
  s.units.filter(u => u.owner === 0).forEach(u => { u.moved = true; u.acted = true; });
  const flags = structuredClone(s.units), gold = s.factions[0].gold;
  const action = chooseAction(observe(s, 0));
  assert.ok(action && action.type === 'EstablishCapital');
  s = submit(s, action, 'fixture-exile');
  assert.equal(s.factions[0].centerId, village.id);
  assert.equal(s.factions[0].life, 'active');
  assert.equal(s.factions[0].gold, gold);
  assert.equal(s.sites.find(site => site.id === old.id)!.owner, 1);
  assert.deepEqual(s.units, flags);
  rows.push({ id: 'AI-流亡主動建中心', status: 'PASS', setup: 'controlled fixture, not generated-match completion or persistence provenance', observationOnly: true, action, preservesFlags: true, originalCapitalRestored: false });
  return rows;
}

if(!isMainThread) {
 const configuration=workerData as {index:number;identity:RoundIdentity;injectFailure:boolean};
 assert.equal(canonicalJson(identity),canonicalJson(configuration.identity),'worker source/method不同');
 if(configuration.injectFailure)throw new Error('QA_TEST_INJECTED_WORKER_FAILURE');
 const shadowModule=shadowPath?await import(pathToFileURL(shadowPath).href):null;
 let pending:{number:number;attemptId:string;outcome:ReturnType<typeof runGeneratedMatch>}|null=null;
 const shadow=shadowModule?{chooseAction:shadowModule.chooseAction,metrics:shadowModule.reviewMetrics as Record<string,number>}:undefined;
 parentPort!.on('message',(message:{type:string;number:number;attemptId:string})=>{
  if(message.type==='stop'){parentPort!.close();return;}
  if(message.type==='persist-diagnostics') {
   assert.ok(pending);assert.equal(message.number,pending.number);assert.equal(message.attemptId,pending.attemptId);
   let failure:string|null=null;
   try{const {outcome}=pending;writeFirstJson(resolve(privatePath,String(message.number).padStart(3,'0')+'-'+message.attemptId+'.json'),
    {seed:outcome.row.seed,sourceHash:productHash,status:outcome.row.status,error:outcome.privateFailure,state:outcome.privateState});}
   catch(error){failure=error instanceof Error?error.message:String(error);}
   pending=null;parentPort!.postMessage({type:'diagnostics',number:message.number,attemptId:message.attemptId,failure});return;
  }
  assert.equal(message.type,'job');assert.equal(pending,null);
  const outcome=runGeneratedMatch(message.number,{maxTurns,maxCommands,sourceHash:productHash,methodFingerprint,shadow,
   onProgress:progress=>parentPort!.postMessage({type:'progress',number:message.number,attemptId:message.attemptId,progress,rss:process.memoryUsage().rss})});
  const diagnosticRequired=outcome.row.status!=='COMPLETE';
  if(diagnosticRequired)pending={number:message.number,attemptId:message.attemptId,outcome};
  parentPort!.postMessage({type:'complete',number:message.number,attemptId:message.attemptId,row:outcome.row,diagnosticRequired,rss:process.memoryUsage().rss});
 });
 parentPort!.postMessage({type:'ready',sourceHash:productHash,methodFingerprint});
} else {
 mkdirSync(dirname(reportPath),{recursive:true,mode:0o700});mkdirSync(privatePath,{recursive:true,mode:0o700});
 assert.ok(!inside(realpathSync(originalRoot),realpathSync(privatePath)),'private symlink不可指向專案內');
 assert.equal(existsSync(reportPath),false,'QA輸出已存在；使用新報告路徑，既有seed結果由ledger續接');
 if(official)assert.ok(!Object.keys(process.env).some(key=>key.startsWith('PROJECT4X_QA_TEST_')),'正式Full100不接受故障注入');
 const ledger=new RoundLedger(ledgerPath,identity),release=ledger.acquire();
 const started=performance.now(),diskStart=availableBytes();
 const rows=new Map(ledger.readResults().map(row=>[row.seedNumber,row]));
 const missing=requested.filter(n=>!rows.has(n));
 const workers=Math.min(missing.length,positive(process.env.PROJECT4X_QA_WORKERS,4));
 const progress=new Map<number,Record<string,unknown>>(),errors:string[]=[];
 const inheritedIncidents=readdirSync(resolve(ledgerPath,'attempts')).filter(n=>n.endsWith('.diagnostic.json')).map(n=>JSON.parse(readFileSync(resolve(ledgerPath,'attempts',n),'utf8'))).filter(v=>v.status==='FAIL');
 errors.push(...inheritedIncidents.map(v=>'prior diagnostic failure: '+v.number+': '+v.failure));
 for(const name of readdirSync(resolve(ledgerPath,'attempts')).filter(n=>n.endsWith('.start.json'))) {
  const attempt=JSON.parse(readFileSync(resolve(ledgerPath,'attempts',name),'utf8'));
  if(!rows.has(attempt.number))continue;
  const end=resolve(ledgerPath,'attempts',name.replace('.start.json','.end.json'));
  if(!existsSync(end)||JSON.parse(readFileSync(end,'utf8')).status==='INTERRUPTED')errors.push('committed result has interrupted evidence: '+attempt.number);
 }
 const activeWorkers=new Set<Worker>();
 let stopped=false,lastProgressWrite=0,peakRssBytes=process.memoryUsage().rss;
 let fixtureResults:Array<Record<string,unknown>>=[],fixtureFailure:string|null=null;
 try{fixtureResults=fixtures();}catch(error){fixtureFailure=error instanceof Error?error.stack??error.message:String(error);}
 const selectedRows=()=>[...rows.values()].filter(row=>official||requested.includes(row.seedNumber)).sort((a,b)=>a.seedNumber-b.seedNumber);
 const compactRow=(row:LedgerRow)=>{
  const copy=structuredClone(row);
  if(copy.decisionMetrics&&typeof copy.decisionMetrics==='object')delete (copy.decisionMetrics as Record<string,unknown>).samplesMs;
  return copy;
 };
 const updateReport=(value:unknown,initial=false)=>{
  if(initial)writeFirstJson(reportPath,value);
  else {const temp=reportPath+'.snapshot-'+randomUUID();writeFirstJson(temp,value);renameSync(temp,reportPath);}
 };
 const checkpoint=(initial=false)=>{
  const current=selectedRows();
  updateReport({status:'RUNNING_NOT_PASS',roundIdentity:identity,sourceHash:productHash,methodFingerprint,seedRange,batchRange,
   requestedGames:official?100:count,finishedGames:current.length,completedGames:current.filter(r=>r.status==='COMPLETE').length,
   missingSeeds:identity.seeds.filter(n=>!rows.has(n)),progress:[...progress.values()],ledgerPath},initial);
  lastProgressWrite=performance.now();
 };
 checkpoint(true);
 const ensureSources=()=>{
  assert.equal(sourceHash(productSources(root)),productHash,'product source漂移');
  assert.equal(methodHash(methodSources(root),shadowPath?sha(readFileSync(shadowPath)):null),methodFingerprint,'QA method漂移');
  assert.ok(availableBytes()>=2*1024**3,'QA磁碟資源低於2GiB保守預算，停止新工作');
 };
 try {
  const settled=await Promise.allSettled(Array.from({length:workers},(_,index)=>new Promise<void>((resolveWorker,rejectWorker)=>{
   const numbers=missing.filter((_,i)=>i%workers===index);
   const worker=new Worker(new URL(import.meta.url),{workerData:{index,identity,injectFailure:process.env.PROJECT4X_QA_TEST_WORKER_FAILURE==='1'&&index===0}});
   activeWorkers.add(worker);
   let current:{number:number;attemptId:string;committed?:boolean}|null=null,workerError:Error|null=null;
   const dispatch=()=>{
    if(stopped||!numbers.length){worker.postMessage({type:'stop'});return;}
    ensureSources();
    const number=numbers.shift()!,attemptId=ledger.startAttempt(number);current={number,attemptId};
    worker.postMessage({type:'job',number,attemptId});
   };
   worker.on('message',(message:{type:string;number:number;attemptId:string;row?:LedgerRow;progress?:Record<string,unknown>;sourceHash?:string;methodFingerprint?:string;rss?:number;diagnosticRequired?:boolean;failure?:string|null})=>{
    try{
     peakRssBytes=Math.max(peakRssBytes,message.rss??0,process.memoryUsage().rss);
     if(message.type==='ready'){assert.equal(message.sourceHash,productHash);assert.equal(message.methodFingerprint,methodFingerprint);dispatch();return;}
     assert.ok(current);assert.equal(message.number,current.number);assert.equal(message.attemptId,current.attemptId);
     if(message.type==='progress'){
      progress.set(message.number,message.progress!);
      if(performance.now()-lastProgressWrite>=1000)checkpoint();
     } else if(message.type==='diagnostics') {
      assert.equal(current.committed,true);
      writeFirstJson(resolve(ledgerPath,'attempts',message.number+'-'+message.attemptId+'.diagnostic.json'),
       {number:message.number,attemptId:message.attemptId,status:message.failure?'FAIL':'PASS',failure:message.failure??null});
      ledger.finishAttempt(message.number,message.attemptId,rows.get(message.number)!.status,message.failure??null);
      current=null;
      if(message.failure)throw new Error('PRIVATE_DIAGNOSTIC_FAILURE: '+message.failure);
      dispatch();
     } else {
      assert.equal(message.type,'complete');assert.equal(current.committed,undefined);assert.ok(message.row);validateLedgerRow(message.row,identity);
      assert.equal(message.row.seedNumber,message.number);
      ledger.commit(message.row);current.committed=true;
      rows.set(message.number,message.row);progress.delete(message.number);
      console.log(`${rows.size}/100 ${message.row.seed} ${message.row.status} EndTurn=${message.row.endTurn} commands=${message.row.commands} winner=${message.row.winner} ${Math.round(Number(message.row.milliseconds))}ms`);
      checkpoint();
      if(message.diagnosticRequired){worker.postMessage({type:'persist-diagnostics',number:message.number,attemptId:message.attemptId});}
      else {ledger.finishAttempt(message.number,message.attemptId,message.row.status);current=null;dispatch();}
     }
    }catch(error){
     workerError=error instanceof Error?error:new Error(String(error));stopped=true;
     for(const other of activeWorkers)void other.terminate();
    }
   });
   worker.once('error',error=>{workerError=error instanceof Error?error:new Error(String(error));});
   worker.once('exit',code=>{
    activeWorkers.delete(worker);
    if(current) {
     try {ledger.finishAttempt(current.number,current.attemptId,'INTERRUPTED',workerError?.message??'worker exit '+code);}
     catch(error){errors.push('attempt receipt: '+String(error));}
     // 未取得完整結果的attempt保留INTERRUPTED，不捏造成合法終局；下次只補缺seed。
    }
    workerError?rejectWorker(workerError):code===0?resolveWorker():rejectWorker(new Error('headless worker '+(index+1)+' exit '+code));
   });
  })));
  settled.forEach((result,index)=>{if(result.status==='rejected')errors.push('worker '+(index+1)+': '+String(result.reason));});
 } finally {
  for(const worker of activeWorkers)await worker.terminate();
 }
 const games=ledger.readResults().filter(row=>official||requested.includes(row.seedNumber));
 const completed=games.filter(row=>row.status==='COMPLETE').length,denominator=official?100:count;
 const sourceEnd=productSources(root),methodEnd=methodHash(methodSources(root),shadowPath?sha(readFileSync(shadowPath)):null);
 const sourceUnchanged=sourceHash(sourceEnd)===productHash,methodUnchanged=methodEnd===methodFingerprint;
 const aggregate=emptyMetrics();
 for(const game of games) {
  const m=game.metrics as ReturnType<typeof emptyMetrics>|undefined;
  if(!m)continue;
  for(const name of actionNames)aggregate.actions[name]+=m.actions[name];
  for(const key of ['relicGold','relicIntel','exileEntries','centersEstablished','eliminations'] as const)aggregate[key]+=m[key];
  aggregate.maxUnits=Math.max(aggregate.maxUnits,m.maxUnits);
 }
 const workerFailure=errors.length?errors.join('\n'):null;
 const clean=!fixtureFailure&&!workerFailure&&sourceUnchanged&&methodUnchanged;
 const report={schema:'project4x-qa-headless-2',generatedAt:new Date().toISOString(),status:clean&&completed===denominator?(official?'PASS':'PARTIAL'):clean&&games.length<denominator&&games.every(g=>g.status==='COMPLETE')?'PARTIAL':'FAIL',
  executionCompleted:games.length===denominator,roundIdentity:identity,sourceHash:productHash,ruleset:identity.ruleset,node:process.version,
  seedRange,batchRange,requestedGames:denominator,finishedGames:games.length,completedGames:completed,failedGames:games.filter(g=>g.status!=='COMPLETE').length,unfinishedGames:denominator-games.length,
  workers,ledgerPath,privatePath,shadowPath:shadowPath??null,milliseconds:performance.now()-started,
  inputBoundary:'chooseAction receives only observe(state, active); reducer receives only original policy action',
  limits:{maxTurns,maxCommands,harnessOnly:true,noSyntheticWinner:true},methodFingerprint,methodEnd,methodUnchanged,sourceStart,sourceEnd,sourceUnchanged,
  metrics:aggregate,fixtures:fixtureResults,fixtureFailure,workerFailure,games:games.map(compactRow),
  resources:{diskStartBytes:diskStart,diskEndBytes:availableBytes(),peakRssBytes},
  humanPlayability:'NOT_VERIFIED',physicalMobile:'NOT_VERIFIED'};
 try{updateReport(report);}catch(error){errors.push('final report write: '+String(error));report.status='FAIL';console.error(errors.at(-1));}
 finally{release();}
 console.log(JSON.stringify({status:report.status,finishedGames:games.length,completedGames:completed,failedGames:report.failedGames,unfinishedGames:report.unfinishedGames,reportPath,ledgerPath,resources:report.resources}));
 if(report.status==='FAIL')process.exitCode=1;
}
