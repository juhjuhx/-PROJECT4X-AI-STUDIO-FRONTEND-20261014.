import assert from 'node:assert/strict';
import {createGame,applyCommand,observe} from '../src/core/game';
import {chooseAction} from '../src/core/ai';
import {serializeGame,deserializeGame,exportReplay,replayGame} from '../src/core/persistence';
import type {Action,Observation,GameState} from '../src/core/types';

export const actionNames=['Move','Attack','Capture','Recruit','Research','ResolveRelic','EstablishCapital','EndTurn'] as const;
export const emptyMetrics=()=>({actions:Object.fromEntries(actionNames.map(k=>[k,0])) as Record<Action['type'],number>,
  relicGold:0,relicIntel:0,exileEntries:0,centersEstablished:0,eliminations:0,maxUnits:4});
export type MatchMetrics=ReturnType<typeof emptyMetrics>;
export type MatchStatus='COMPLETE'|'TURN_LIMIT'|'COMMAND_LIMIT'|'ERROR';
type Dependencies={createGame:typeof createGame;chooseAction:typeof chooseAction;applyCommand:typeof applyCommand;
  serializeGame:typeof serializeGame;deserializeGame:typeof deserializeGame;exportReplay:typeof exportReplay;replayGame:typeof replayGame};
export interface MatchOptions {
  maxTurns:number;maxCommands:number;sourceHash:string;methodFingerprint:string;
  onProgress?:(progress:Record<string,unknown>)=>void;
  shadow?:{chooseAction:(view:Observation)=>Action|null;metrics:Record<string,number>};
}
export function seedName(number:number):string {
  assert.ok(Number.isSafeInteger(number)&&number>=1&&number<=100,'固定種子範圍001–100');
  return '獨立QA-'+String(number).padStart(3,'0');
}
function updateMetric(m:MatchMetrics,before:GameState,after:GameState,action:Action) {
  m.actions[action.type]++;
  if(action.type==='ResolveRelic')action.choice==='gold'?m.relicGold++:m.relicIntel++;
  if(action.type==='EstablishCapital')m.centersEstablished++;
  m.maxUnits=Math.max(m.maxUnits,after.units.length);
  for(const f of after.factions) {
    if(f.life==='exiled'&&before.factions[f.id].life!=='exiled')m.exileEntries++;
    if(f.life==='eliminated'&&before.factions[f.id].life!=='eliminated')m.eliminations++;
  }
}
export function latencySummary(samples:number[]) {
  const sorted=[...samples].sort((a,b)=>a-b);
  const quantile=(p:number)=>sorted.length?sorted[Math.max(0,Math.ceil(p*sorted.length)-1)]:null;
  return {count:samples.length,totalMs:samples.reduce((a,b)=>a+b,0),medianMs:quantile(.5),p95Ms:quantile(.95),maxMs:sorted.at(-1)??null,
    percentileDefinition:'nearest-rank: sorted[ceil(p*n)-1]',samplesMs:samples};
}
// QA-only runner：正式policy只收Observation，shadow不可產生送進reducer的Action。
export function runGeneratedMatch(number:number,options:MatchOptions,dependencies:Partial<Dependencies>={}) {
  const ops:Dependencies={createGame,chooseAction,applyCommand,serializeGame,deserializeGame,exportReplay,replayGame,...dependencies};
  const seed=seedName(number),metrics=emptyMetrics(),times:number[]=[],workload:Record<string,number>={};
  let state:GameState|undefined,commands=0,observeMs=0,applyMs=0,shadowMs=0,compared=0,persistenceMs=0;
  let saveVerified=false,replayVerified=false,privateFailure:string|null=null;
  let status:MatchStatus='ERROR',failureReason:string|null=null,phase='CREATE';
  const started=performance.now();
  try {
    state=ops.createGame(seed);
    while(state.winner===null&&state.turn<=options.maxTurns&&commands<options.maxCommands) {
      phase='OBSERVATION';let clock=performance.now();const view=observe(state,state.active);observeMs+=performance.now()-clock;
      const before=options.shadow?structuredClone(view):null;
      phase='AI_DECISION';clock=performance.now();const action=ops.chooseAction(view);times.push(performance.now()-clock);
      if(!action)throw new Error('AI_RETURNED_NO_ACTION');
      if(options.shadow) {
        phase='SHADOW_PARITY';clock=performance.now();
        const input=structuredClone(before!),previous={...options.shadow.metrics};
        const shadowAction=options.shadow.chooseAction(input);
        assert.deepEqual(action,shadowAction,'shadow不得改變正式policy結果');
        assert.deepEqual(view,before,'正式policy改動Observation');
        assert.deepEqual(input,before,'shadow改動Observation');
        for(const [key,value] of Object.entries(options.shadow.metrics)) {
          const delta=value-(previous[key]??0);assert.ok(Number.isSafeInteger(delta)&&delta>=0,'不合法workload counter');
          workload[key]=(workload[key]??0)+delta;
        }
        compared++;shadowMs+=performance.now()-clock;
      }
      phase='COMMAND';clock=performance.now();
      const result=ops.applyCommand(state,{actor:state.active,expectedVersion:state.version,requestId:`headless-${number}-${commands}`,action});
      applyMs+=performance.now()-clock;
      if(!result.ok)throw new Error('AI_ILLEGAL_COMMAND');
      assert.equal(result.state.version,state.version+1,'成功command必須增加一個version');
      updateMetric(metrics,state,result.state,action);state=result.state;commands++;
      if(commands%100===0)options.onProgress?.({seed,turn:state.turn,commands,units:state.units.length,metrics,observeMs,aiMs:times.reduce((a,b)=>a+b,0),applyMs});
    }
    status=state.winner!==null?'COMPLETE':state.turn>options.maxTurns?'TURN_LIMIT':'COMMAND_LIMIT';
    if(state.winner!==null)assert.ok(state.winner===0||state.winner===1);
    if(status==='TURN_LIMIT')failureReason='HARNESS_TURN_LIMIT_NOT_A_DRAW_OR_VICTORY';
    if(status==='COMMAND_LIMIT')failureReason='HARNESS_COMMAND_LIMIT_NOT_A_DRAW_OR_VICTORY';
    phase='SAVE_REPLAY';const clock=performance.now();
    // 完整state比較包含history/requests；canonical hash相等不構成替代。
    assert.deepEqual(ops.deserializeGame(ops.serializeGame(state)),state);saveVerified=true;
    assert.deepEqual(ops.replayGame(ops.exportReplay(state)),state);replayVerified=true;
    persistenceMs=performance.now()-clock;
  } catch(error) {
    status='ERROR';failureReason=phase+':'+(error instanceof Error?error.name:'UnknownError');
    privateFailure=error instanceof Error?error.stack??error.message:String(error);
  }
  const naturalTerminal=state?.winner===0||state?.winner===1;
  const milliseconds=performance.now()-started;
  const row={
    seed,seedNumber:number,status,winner:state?.winner??null,turns:state?.turn??1,endTurn:(state?.turn??1)-1,
    commands,duration:milliseconds/1000,milliseconds,failureReason,failure:failureReason,
    terminalSaveVerified:naturalTerminal&&saveVerified,terminalReplayVerified:naturalTerminal&&replayVerified,
    terminalSaveReplayChecked:status==='COMPLETE'&&saveVerified&&replayVerified,
    partialReplayVerified:!naturalTerminal&&replayVerified,partialSaveVerified:!naturalTerminal&&saveVerified,
    sourceHash:options.sourceHash,methodFingerprint:options.methodFingerprint,
    metrics,timing:{observeMs,aiMs:times.reduce((a,b)=>a+b,0),applyMs,persistenceMs,shadowMs},
    decisionMetrics:latencySummary(times),
    pathWorkload:{status:options.shadow?(compared===times.length?'MEASURED':'PARTIAL'):'NOT_CONFIGURED',decisionsCompared:compared,counters:workload},
    finalLife:state?.factions.map(f=>f.life)??[]
  };
  return {row,privateState:state??null,privateFailure};
}
export type MatchRow=ReturnType<typeof runGeneratedMatch>['row'];

