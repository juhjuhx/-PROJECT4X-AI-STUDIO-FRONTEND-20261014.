import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {latencySummary,emptyMetrics} from '../scripts/qa-match';
import {RoundLedger,writeFirstJson,validateFull100Rows} from '../scripts/qa-ledger';
const identity={schema:'project4x-qa-round-1',sourceHash:'a'.repeat(64),methodFingerprint:'b'.repeat(64),
  ruleset:'g1-ccts-1',saveSchema:'project4x-save-1',replaySchema:'project4x-replay-1',node:process.version,
  seeds:[1,2,3],limits:{maxTurns:800,maxCommands:40000},shadowHash:null};
function row(n:number,status='COMPLETE') {
 const endTurn=status==='TURN_LIMIT'?800:1,commands=endTurn,metrics=emptyMetrics();metrics.actions.EndTurn=endTurn;
 return {seed:'獨立QA-'+String(n).padStart(3,'0'),seedNumber:n,status,winner:status==='COMPLETE'?0:null,
  endTurn,turns:endTurn+1,commands,duration:.1,metrics,decisionMetrics:latencySummary(Array(commands).fill(0)),timing:{aiMs:0},failureReason:status==='COMPLETE'?null:'HARNESS_TURN_LIMIT_NOT_A_DRAW_OR_VICTORY',failure:status==='COMPLETE'?null:'HARNESS_TURN_LIMIT_NOT_A_DRAW_OR_VICTORY',
  terminalSaveVerified:status==='COMPLETE',terminalReplayVerified:status==='COMPLETE',
  terminalSaveReplayChecked:status==='COMPLETE',sourceHash:identity.sourceHash,methodFingerprint:identity.methodFingerprint};
}
function temporary(body:(dir:string)=>void) {const dir=mkdtempSync(join(tmpdir(),'project4x-ledger-test-'));try{body(dir);}finally{rmSync(dir,{recursive:true,force:true});}}
test('ledger：兩個stale-reader交錯不能取走剛取得的活coordinator',()=>temporary(dir=>{
 const a=new RoundLedger(dir,identity),b=new RoundLedger(dir,identity);
 writeFileSync(join(dir,'coordinator.json'),JSON.stringify({pid:2147483647,token:'old'}));
 const original=process.kill;let nested=false,releaseB:(()=>void)|undefined;
 process.kill=((pid:number,signal?:number|string)=>{
  if(pid===2147483647){if(!nested){nested=true;try{releaseB=b.acquire();}catch{}}throw Object.assign(new Error('dead'),{code:'ESRCH'});}
  return original(pid,signal as NodeJS.Signals);
 }) as typeof process.kill;
 let releaseA:(()=>void)|undefined;
 try{try{releaseA=a.acquire();}catch{}assert.equal(Boolean(releaseA&&releaseB),false,'同一輪不可有兩個coordinator');}
 finally{process.kill=original;releaseA?.();if(!releaseA)releaseB?.();}
}));
test('full100驗證器拒絕不可能的計數與假終局旗標組合',()=>{
 const full={...identity,seeds:Array.from({length:100},(_,i)=>i+1)};
 assert.throws(()=>validateFull100Rows(full.seeds.map(n=>({...row(n),turns:1,endTurn:800,commands:0})),full));
});
test('ledger：首次結果exclusive發布；不同payload重複seed不可覆寫',()=>temporary(dir=>{
 const ledger=new RoundLedger(dir,identity);ledger.commit(row(1));
 const before=readFileSync(join(dir,'results','001.json'));
 assert.throws(()=>ledger.commit({...row(1),winner:1}));
 assert.deepEqual(readFileSync(join(dir,'results','001.json')),before);
 assert.throws(()=>ledger.commit(row(1)),'同payload重複也應被偵測，不可靜默Map.set');
}));
test('ledger：部分中斷續跑只缺seed，保留先前失敗與不完整temp',()=>temporary(dir=>{
 let ledger=new RoundLedger(dir,identity);ledger.commit(row(1,'TURN_LIMIT'));
 const before=readFileSync(join(dir,'results','001.json'));
 writeFileSync(join(dir,'results','.interrupted.tmp'),'{');
 const attempt=ledger.startAttempt(2);assert.ok(attempt);
 ledger=new RoundLedger(dir,identity);
 assert.deepEqual(ledger.missing(),[2,3]);assert.deepEqual(readFileSync(join(dir,'results','001.json')),before);
 assert.ok(existsSync(join(dir,'results','.interrupted.tmp')));
 ledger.commit(row(2));assert.deepEqual(ledger.missing(),[3]);
}));
for(const [name,change] of [
 ['product source',{sourceHash:'c'.repeat(64)}],
 ['method source',{methodFingerprint:'c'.repeat(64)}],
 ['limits',{limits:{maxTurns:799,maxCommands:40000}}],
 ['schema',{ruleset:'other-ruleset'}],
 ['seed set',{seeds:[1,2]}]
] as const)test('ledger：拒絕混合'+name,()=>temporary(dir=>{
 new RoundLedger(dir,identity);assert.throws(()=>new RoundLedger(dir,{...identity,...change}));
}));
test('ledger：拒絕重複seed manifest與非正式seed別名',()=>temporary(dir=>{
 assert.throws(()=>new RoundLedger(dir,{...identity,seeds:[1,1]}));
 const ledger=new RoundLedger(join(dir,'valid'),identity);
 assert.throws(()=>ledger.commit({...row(1),seed:'獨立QA-1'}));
 assert.throws(()=>ledger.commit({...row(1),seedNumber:2}));
 assert.throws(()=>ledger.commit({...row(1),seedNumber:4,seed:'獨立QA-004'}));
}));
test('ledger：COMPLETE沒有逐局Save/Replay證據不能發布',()=>temporary(dir=>{
 const ledger=new RoundLedger(dir,identity);
 assert.throws(()=>ledger.commit({...row(1),terminalReplayVerified:false}));
 assert.throws(()=>ledger.commit({...row(1),terminalSaveVerified:false}));
 assert.throws(()=>ledger.commit({...row(1),winner:null}));
 assert.deepEqual(ledger.missing(),[1,2,3]);
}));
test('ledger：不同來源的row不准混入同輪',()=>temporary(dir=>{
 const ledger=new RoundLedger(dir,identity);
 assert.throws(()=>ledger.commit({...row(1),sourceHash:'c'.repeat(64)}));
 assert.throws(()=>ledger.commit({...row(1),methodFingerprint:'c'.repeat(64)}));
}));
test('exclusive檔案：ENOSPC注入與發布前中斷不破壞已存在結果',()=>temporary(dir=>{
 const previous=join(dir,'one.json'),next=join(dir,'two.json');writeFirstJson(previous,{first:true});
 const before=readFileSync(previous);
 assert.throws(()=>writeFirstJson(next,{second:true},()=>{throw Object.assign(new Error('disk full'),{code:'ENOSPC'})}),{code:'ENOSPC'});
 assert.equal(existsSync(next),false);assert.deepEqual(readFileSync(previous),before);
 assert.throws(()=>writeFirstJson(previous,{first:false}));
 assert.deepEqual(readFileSync(previous),before);
}));
test('full100驗證器：固定分母、唯一seed、每局結果與來源均須成立',()=>{
 const full={...identity,seeds:Array.from({length:100},(_,i)=>i+1)};
 const rows=full.seeds.map(n=>row(n));
 assert.doesNotThrow(()=>validateFull100Rows(rows,full));
 assert.throws(()=>validateFull100Rows(rows.slice(1),full));
 assert.throws(()=>validateFull100Rows([rows[0],...rows.slice(0,99)],full));
 assert.throws(()=>validateFull100Rows(rows.map((r,i)=>i===9?{...r,terminalReplayVerified:false}:r),full));
 assert.throws(()=>validateFull100Rows(rows.map((r,i)=>i===9?row(10,'TURN_LIMIT'):r),full));
 assert.throws(()=>validateFull100Rows(rows.map((r,i)=>i===9?{...r,sourceHash:'c'.repeat(64)}:r),full));
});

