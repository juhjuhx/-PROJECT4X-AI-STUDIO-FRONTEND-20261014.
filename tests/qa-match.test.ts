import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGame,observe,applyCommand,canonicalHash} from '../src/core/game';
import {chooseAction} from '../src/core/ai';
import * as persistence from '../src/core/persistence';
import {createTerminalJourney} from './helpers/terminal-journey';
import type {Action,Observation} from '../src/core/types';
const url=new URL('../scripts/qa-match.ts',import.meta.url);
const modern=existsSync(url)?(await import(url.href)).runGeneratedMatch:null;
const source=readFileSync(new URL('../scripts/headless.ts',import.meta.url),'utf8');
const legacy=source.slice(source.indexOf('function runMatch('),source.indexOf('\nif (!isMainThread)'))
 .replace('number: number','number').replace('): Record<string, unknown>',')')
 .replace('let failure: string | null','let failure').replace('const cmd: Command','const cmd');
const options={maxTurns:800,maxCommands:40000,sourceHash:'a'.repeat(64),methodFingerprint:'b'.repeat(64)};
function run(number:number,limits:Record<string,unknown>={},deps:Record<string,unknown>={}) {
 const o={...options,...limits};
 if(modern)return modern(number,o,deps).row;
 const fn=vm.runInNewContext(legacy+'\nrunMatch',{
  createGame,observe,applyCommand,canonicalHash,chooseAction,...persistence,
  metrics:()=>({}),updateMetric:()=>{},parentPort:null,performance,assert,
  maxTurns:o.maxTurns,maxCommands:o.maxCommands,...deps
 });
 return fn(number);
}
const journey=createTerminalJourney();
test('逐局harness：非第十局自然終局也必須實做Save與Replay全state驗證',()=>{
 const row=run(1,{}, {createGame:()=>structuredClone(journey.final)});
 assert.equal(row.status,'COMPLETE');assert.equal(row.winner,0);
 assert.equal(row.terminalReplayVerified,true);assert.equal(row.terminalSaveVerified,true);
 assert.equal(row.sourceHash,options.sourceHash);
});
for(const [name,inject] of [
 ['Save',{serializeGame:()=>{throw new Error('SAVE_FAULT')}}],
 ['Load',{deserializeGame:()=>{throw new Error('LOAD_FAULT')}}],
 ['Replay',{replayGame:()=>{throw new Error('REPLAY_FAULT')}}]
] as const)test('逐局harness：自然winner但'+name+'失敗必須ERROR',()=>{
 const row=run(1,{}, {createGame:()=>structuredClone(journey.final),...inject});
 assert.equal(row.status,'ERROR');assert.equal(row.winner,0);
 assert.equal(row.terminalReplayVerified,false);assert.ok(row.failureReason);
});
test('逐局harness：800上限語意不變，小型同構fixture到第1次EndTurn正確分類',()=>{
 const row=run(2,{maxTurns:1,maxCommands:100},{chooseAction:()=>({type:'EndTurn'})});
 assert.equal(row.status,'TURN_LIMIT');assert.equal(row.endTurn,1);assert.equal(row.commands,1);
 assert.equal(row.winner,null);assert.equal(row.terminalReplayVerified,false);
 assert.equal(row.partialReplayVerified,true);
});
test('逐局harness：command cap不冒充回合上限或勝負',()=>{
 const row=run(2,{maxCommands:1},{chooseAction:(v:Observation)=>v.legalActions.find(a=>a.type==='Move')!});
 assert.equal(row.status,'COMMAND_LIMIT');assert.equal(row.endTurn,0);assert.equal(row.commands,1);
 assert.equal(row.winner,null);
});
test('逐局harness：最後一筆合法command形成winner優先於command cap',()=>{
 const row=run(1,{maxCommands:1},{createGame:()=>structuredClone(journey.previous),chooseAction:()=>journey.lastCommand.action});
 assert.equal(row.status,'COMPLETE');assert.equal(row.commands,1);assert.equal(row.winner,0);
 assert.equal(row.terminalReplayVerified,true);
});
test('逐局harness：執行異常有獨立ERROR，輸入只含Observation',()=>{
 let inspected=false;
 const row=run(3,{}, {chooseAction:(view:Observation)=>{
  inspected=true;assert.equal(Object.hasOwn(view,'history'),false);
  assert.ok(Array.isArray(view.legalActions));throw new Error('AI_DECISION_FAULT');
 }});
 assert.equal(inspected,true);assert.equal(row.status,'ERROR');
 assert.equal(row.winner,null);assert.equal(row.terminalReplayVerified,false);
});
for(const kind of ['action','mutation','counter'] as const)test('shadow診斷拒絕'+kind+'，正式policy不被shadow替換',()=>{
 const metrics={expansions:0};
 const row=run(3,{maxCommands:1,shadow:{metrics,chooseAction:(view:Observation)=>{
  const action=chooseAction(view);
  if(kind==='action')return {type:'EndTurn'};
  if(kind==='mutation')(view as unknown as Record<string,unknown>).injected=true;
  if(kind==='counter')metrics.expansions=NaN;
  return action;
 }}});
 assert.equal(row.status,'ERROR');assert.equal(row.commands,0);assert.match(row.failureReason!,/^SHADOW_PARITY:/);
});

