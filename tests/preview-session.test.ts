import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameSession } from '../src/session/game-session';
import type { SessionOptions, SessionPorts } from '../src/session/game-session';
import type { Action, Command } from '../src/core/types';
import type { Scheduler } from '../src/session/ai-driver';
import { serializeGame, exportReplay } from '../src/core/persistence';
import { createGame } from '../src/core/game';
import { createPreviewJourney } from './helpers/preview-journey';

const ports=(scheduler?:Scheduler)=>createGameSession({seed:'預覽session',ruleset:'demo03-preview-1',scheduler} as SessionOptions);
function submit(p:SessionPorts,action:Action,id='preview-request'){
 const s=p.gameplay.getSnapshot().stamp;
 return p.gameplay.submitAction({sessionId:s.sessionId,generation:s.generation,expectedVersion:s.version,requestId:id,action});
}
function save(p:SessionPorts){const r=p.files.save();assert.ok(r.ok);return r.file.text;}

test('Session 預覽真Action去重、不雙花；load G1不轉換，newGame回factory預覽',()=>{
 const p=ports();try{
  assert.equal(p.gameplay.getObservation().ruleset,'demo03-preview-1');
  const stamp=p.gameplay.getSnapshot().stamp,request={sessionId:stamp.sessionId,generation:stamp.generation,expectedVersion:stamp.version,requestId:'defense',action:{type:'Research',tech:'defensiveEngineering'} as Action};
  assert.ok(p.gameplay.submitAction(request).ok);assert.equal(p.gameplay.getObservation().faction.gold,1);
  const before=p.gameplay.getSnapshot();const duplicate=p.gameplay.submitAction(request);
  assert.equal(duplicate.ok&&duplicate.disposition,'duplicate');assert.deepEqual(duplicate.ok&&duplicate.events,[]);assert.equal(p.gameplay.getSnapshot(),before);
  const conflict=p.gameplay.submitAction({...request,action:{type:'EndTurn'}});assert.equal(!conflict.ok&&conflict.error.code,'REQUEST_CONFLICT');
  assert.ok(p.files.load(serializeGame(createGame('legacy-load')),before.stamp).ok);
  assert.equal(p.gameplay.getObservation().ruleset,'g1-ccts-1');
  assert.ok(p.files.newGame('new-preview',p.gameplay.getSnapshot().stamp).ok);
  assert.equal(p.gameplay.getObservation().ruleset,'demo03-preview-1');
  assert.equal(!p.gameplay.submitAction(request).ok,true);
 }finally{p.dispose();}
});

test('預覽 import/Replay真版本摘要與確認保存；failed import保留局/dirty/timer',()=>{
 const tasks=new Map<number,()=>void>();let id=0;
 const scheduler:Scheduler={set:f=>{tasks.set(++id,f);return id;},clear:h=>{tasks.delete(h as number);}};
 const p=ports(scheduler);try{
  const journey=createPreviewJourney();assert.ok(p.files.load(serializeGame(journey),p.gameplay.getSnapshot().stamp).ok);
  const before=p.gameplay.getSnapshot();
  assert.deepEqual(p.files.verifyReplay(exportReplay(journey),before.stamp),{ok:true,verified:true,ruleset:'demo03-preview-1',schema:'project4x-replay-2'});
  assert.equal(p.gameplay.getSnapshot(),before);
  assert.ok(submit(p,{type:'EndTurn'}).ok);assert.equal(tasks.size,1);
  const busy=p.gameplay.getSnapshot(),text=save(p),pending=[...tasks.keys()];
  const invalid=JSON.parse(serializeGame(journey));invalid.contentHash='0'.repeat(64);
  const failed=p.files.load(JSON.stringify(invalid),busy.stamp);assert.equal(failed.ok,false);
  assert.equal(p.gameplay.getSnapshot(),busy);assert.equal(save(p),text);assert.deepEqual([...tasks.keys()],pending);
  assert.equal(busy.hasUnsavedChanges,true);
  const callback=[...tasks.values()][0];
  assert.ok(p.files.newGame('replace',busy.stamp).ok);assert.equal(tasks.size,0);
  const replaced=p.gameplay.getSnapshot();callback();assert.equal(p.gameplay.getSnapshot(),replaced);
  const exported=p.files.save();assert.ok(exported.ok);assert.ok(p.files.acknowledgeSave(exported.file.stamp).ok);
  assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,false);
 }finally{p.dispose();assert.equal(tasks.size,0);}
});
