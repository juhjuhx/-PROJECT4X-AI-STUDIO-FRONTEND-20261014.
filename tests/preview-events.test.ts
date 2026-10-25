import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, applyCommand, observe } from '../src/core/game';
import { projectPresentationEvents } from '../src/presentation/events';
import { createPreviewJourney } from './helpers/preview-journey';

test('預覽僅白名單版本投影真研究與新兵回執，未知版本仍不投影',()=>{
 let s=createGame('預覽安全事件','demo03-preview-1');const before=observe(s,0);
 const action={type:'Research',tech:'defensiveEngineering'} as const;
 const result=applyCommand(s,{actor:0,requestId:'research',expectedVersion:0,action});assert.ok(result.ok);
 const after=observe(result.state,0),events=projectPresentationEvents(before,after,0,action);
 assert.deepEqual(events.map(e=>e.type),['TechResearched']);assert.equal(events[0].viewer,0);
 assert.deepEqual(projectPresentationEvents({...before,ruleset:'future'},{...after,ruleset:'future'},0,action),[]);
 assert.deepEqual(projectPresentationEvents(before,after,0,action),events);
 const complete=createPreviewJourney(),last=complete.history.at(-1)!;
 s=createGame(complete.seed,'demo03-preview-1');
 for(const command of complete.history.slice(0,-1)){const next=applyCommand(s,command);assert.ok(next.ok);s=next.state;}
 const recruit=projectPresentationEvents(observe(s,0),observe(complete,0),3,last.action);
 assert.equal(recruit.length,1);assert.equal(recruit[0].type,'UnitRecruited');
 assert.equal(recruit[0].type==='UnitRecruited'&&recruit[0].kind,'mobileScout');
 assert.deepEqual(projectPresentationEvents(observe(s,0),observe(complete,0),3),[],'無可信own receipt不推測招募');
});
