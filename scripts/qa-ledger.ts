import assert from 'node:assert/strict';
import {openSync,closeSync,writeFileSync,fsyncSync,linkSync,unlinkSync,mkdirSync,readFileSync,readdirSync,existsSync,rmdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {seedName} from './qa-match';
import {actionNames,latencySummary} from './qa-match';

export interface RoundIdentity {
  schema:string;sourceHash:string;methodFingerprint:string;ruleset:string;saveSchema:string;replaySchema:string;
  node:string;seeds:number[];limits:{maxTurns:number;maxCommands:number};shadowHash:string|null;
}
export interface LedgerRow {
  seed:string;seedNumber:number;status:string;winner:number|null;endTurn:number;commands:number;duration:number;
  sourceHash:string;methodFingerprint:string;terminalSaveVerified:boolean;terminalReplayVerified:boolean;terminalSaveReplayChecked:boolean;
  [key:string]:unknown;
}
export function canonicalJson(value:unknown):string {
  if(Array.isArray(value))return '['+value.map(canonicalJson).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a<b?-1:a>b?1:0)
    .map(([k,v])=>JSON.stringify(k)+':'+canonicalJson(v)).join(',')+'}';
  return JSON.stringify(value);
}
function syncDirectory(path:string) {const fd=openSync(path,'r');try{fsyncSync(fd);}finally{closeSync(fd);}}
// Hard-link publication is atomic and refuses EEXIST; rename alone would overwrite first attempts.
export function writeFirstJson(path:string,value:unknown,beforePublish?:()=>void):void {
  mkdirSync(dirname(path),{recursive:true,mode:0o700});
  const temporary=join(dirname(path),'.tmp-'+randomUUID());let fd:number|undefined,primary:unknown;
  try {
    fd=openSync(temporary,'wx',0o600);writeFileSync(fd,JSON.stringify(value)+'\n');fsyncSync(fd);closeSync(fd);fd=undefined;
    beforePublish?.();linkSync(temporary,path);syncDirectory(dirname(path));
  } catch(error) {primary=error;throw error;}
  finally {
    const cleanup:unknown[]=[];
    if(fd!==undefined)try{closeSync(fd);}catch(error){cleanup.push(error);}
    try{unlinkSync(temporary);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')cleanup.push(error);}
    if(cleanup.length)throw new AggregateError([...(primary?[primary]:[]),...cleanup],'atomic publish cleanup failed',{cause:primary});
  }
}
function validateIdentity(value:unknown):asserts value is RoundIdentity {
  assert.ok(value&&typeof value==='object');const v=value as RoundIdentity;
  assert.equal(v.schema,'project4x-qa-round-1');
  assert.match(v.sourceHash,/^[a-f0-9]{64}$/);assert.match(v.methodFingerprint,/^[a-f0-9]{64}$/);
  assert.equal(v.ruleset,'g1-ccts-1');assert.equal(v.saveSchema,'project4x-save-1');assert.equal(v.replaySchema,'project4x-replay-1');
  assert.equal(v.node,process.version,'Node版本不可混用');
  assert.ok(Array.isArray(v.seeds)&&v.seeds.length>0);v.seeds.forEach(seedName);
  assert.deepEqual([...new Set(v.seeds)].sort((a,b)=>a-b),v.seeds,'seed必須唯一且排序');
  assert.ok(Number.isSafeInteger(v.limits.maxTurns)&&v.limits.maxTurns>0&&v.limits.maxTurns<=800);
  assert.ok(Number.isSafeInteger(v.limits.maxCommands)&&v.limits.maxCommands>0&&v.limits.maxCommands<=40000);
  assert.ok(v.shadowHash===null||/^[a-f0-9]{64}$/.test(v.shadowHash));
}
export function validateLedgerRow(value:unknown,identity:RoundIdentity):asserts value is LedgerRow {
  assert.ok(value&&typeof value==='object');const row=value as LedgerRow;
  assert.ok(identity.seeds.includes(row.seedNumber));assert.equal(row.seed,seedName(row.seedNumber));
  assert.equal(row.sourceHash,identity.sourceHash);assert.equal(row.methodFingerprint,identity.methodFingerprint);
  assert.ok(['COMPLETE','TURN_LIMIT','COMMAND_LIMIT','ERROR'].includes(row.status));
  assert.ok(Number.isSafeInteger(row.endTurn)&&row.endTurn>=0&&row.endTurn<=identity.limits.maxTurns);
  assert.ok(Number.isSafeInteger(row.commands)&&row.commands>=0&&row.commands<=identity.limits.maxCommands);
  assert.ok(Number.isFinite(row.duration)&&row.duration>=0);
  assert.ok(row.winner===null||row.winner===0||row.winner===1);
  assert.equal(row.turns,row.endTurn+1);assert.ok(row.commands>=row.endTurn);
  const metrics=row.metrics as {actions:Record<string,number>};assert.ok(metrics?.actions);
  for(const name of actionNames)assert.ok(Number.isSafeInteger(metrics.actions[name])&&metrics.actions[name]>=0);
  assert.equal(Object.values(metrics.actions).reduce((a,b)=>a+b,0),row.commands);
  assert.equal(metrics.actions.EndTurn,row.endTurn);
  const decision=row.decisionMetrics as ReturnType<typeof latencySummary>;
  assert.ok(Array.isArray(decision?.samplesMs));
  assert.ok(decision.samplesMs.every(n=>Number.isFinite(n)&&n>=0));
  assert.equal(canonicalJson(decision),canonicalJson(latencySummary(decision.samplesMs)));
  assert.ok(decision.count>=row.commands&&decision.count<=row.commands+1);
  const timing=row.timing as Record<string,number>;
  assert.ok(timing);for(const n of Object.values(timing))assert.ok(Number.isFinite(n)&&n>=0);
  assert.equal(timing.aiMs,decision.totalMs);
  assert.equal(row.failure,row.failureReason);
  if(row.status==='COMPLETE') {
    assert.ok(row.winner===0||row.winner===1);
    assert.equal(row.terminalSaveVerified,true);assert.equal(row.terminalReplayVerified,true);assert.equal(row.terminalSaveReplayChecked,true);
    assert.equal(row.failureReason,null);assert.equal(decision.count,row.commands);
  } else {
    assert.equal(row.terminalSaveReplayChecked,false);
    if(row.status!=='ERROR') {
      assert.equal(row.winner,null);assert.equal(row.terminalReplayVerified,false);
      if(row.status==='TURN_LIMIT')assert.equal(row.endTurn,identity.limits.maxTurns);
      if(row.status==='COMMAND_LIMIT')assert.equal(row.commands,identity.limits.maxCommands);
    }
  }
}
export class RoundLedger {
  readonly identity:RoundIdentity;
  constructor(readonly directory:string,identity:unknown) {
    validateIdentity(identity);this.identity=JSON.parse(JSON.stringify(identity));
    mkdirSync(directory,{recursive:true,mode:0o700});mkdirSync(join(directory,'results'),{recursive:true,mode:0o700});
    mkdirSync(join(directory,'attempts'),{recursive:true,mode:0o700});
    const path=join(directory,'manifest.json');
    if(!existsSync(path))try{writeFirstJson(path,this.identity);}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}
    assert.equal(canonicalJson(JSON.parse(readFileSync(path,'utf8'))),canonicalJson(this.identity),'拒絕混合source/method/limits/seed/schema manifest');
    this.readResults();
  }
  readResults():LedgerRow[] {
    return readdirSync(join(this.directory,'results')).filter(name=>/^\d{3}\.json$/.test(name)).sort().map(name=>{
      const row:unknown=JSON.parse(readFileSync(join(this.directory,'results',name),'utf8'));
      validateLedgerRow(row,this.identity);assert.equal(name,String(row.seedNumber).padStart(3,'0')+'.json');return row;
    });
  }
  missing():number[] {const done=new Set(this.readResults().map(row=>row.seedNumber));return this.identity.seeds.filter(n=>!done.has(n));}
  commit(value:unknown):void {
    validateLedgerRow(value,this.identity);
    writeFirstJson(join(this.directory,'results',String(value.seedNumber).padStart(3,'0')+'.json'),value);
  }
  startAttempt(number:number):string {
    assert.ok(this.identity.seeds.includes(number));assert.ok(!existsSync(join(this.directory,'results',String(number).padStart(3,'0')+'.json')),'terminal結果已存在');
    const id=randomUUID();
    writeFirstJson(join(this.directory,'attempts',number+'-'+id+'.start.json'),{id,number,seed:seedName(number),pid:process.pid,startedAt:new Date().toISOString(),sourceHash:this.identity.sourceHash,methodFingerprint:this.identity.methodFingerprint});
    return id;
  }
  finishAttempt(number:number,id:string,status:string,reason:string|null=null):void {
    const start=JSON.parse(readFileSync(join(this.directory,'attempts',number+'-'+id+'.start.json'),'utf8'));
    assert.equal(start.id,id);assert.equal(start.number,number);
    writeFirstJson(join(this.directory,'attempts',number+'-'+id+'.end.json'),{id,number,status,reason,finishedAt:new Date().toISOString()});
  }
  acquire():()=>void {
    const path=join(this.directory,'coordinator.json'),token=randomUUID();
    const guarded=<T>(operation:()=>T):T=>{
      const guard=join(this.directory,'.coordinator-recovery');
      // Crash within this small section fails closed. Never guess that a recovery guard is abandoned.
      mkdirSync(guard,{mode:0o700});
      try{return operation();}finally{rmdirSync(guard);}
    };
    guarded(()=>{
    if(existsSync(path)) {
      const old=JSON.parse(readFileSync(path,'utf8'));assert.ok(Number.isSafeInteger(old.pid)&&old.pid>0);
      let dead=false;try{process.kill(old.pid,0);}catch(error){if((error as NodeJS.ErrnoException).code==='ESRCH')dead=true;else throw error;}
      assert.equal(dead,true,'本輪已有活躍coordinator');
      // 只封存已確認死亡的本輪lock；未完成attempt與原結果保留。
      linkSync(path,join(this.directory,'attempts','interrupted-coordinator-'+randomUUID()+'.json'));unlinkSync(path);
    }
    writeFirstJson(path,{pid:process.pid,token,startedAt:new Date().toISOString()});
    });
    return ()=>guarded(()=>{const current=JSON.parse(readFileSync(path,'utf8'));assert.equal(current.token,token);unlinkSync(path);syncDirectory(this.directory);});
  }
}
export function validateFull100Rows(rows:unknown[],identity:unknown):void {
  validateIdentity(identity);assert.deepEqual(identity.seeds,Array.from({length:100},(_,i)=>i+1));
  assert.deepEqual(identity.limits,{maxTurns:800,maxCommands:40000});assert.equal(rows.length,100);
  const numbers:number[]=[];
  for(const row of rows){validateLedgerRow(row,identity);assert.equal(row.status,'COMPLETE',row.seed);numbers.push(row.seedNumber);}
  assert.deepEqual(numbers.sort((a,b)=>a-b),identity.seeds,'固定seed缺少或重複');
}
