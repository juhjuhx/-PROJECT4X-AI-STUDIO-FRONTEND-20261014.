import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseAction } from '../src/core/ai';
import { createGame, observe, applyCommand } from '../src/core/game';
import type { GameState, Observation } from '../src/core/types';

function position(enemy: boolean, gold: number): GameState {
 const s=createGame('預覽AI合法觀測','demo03-preview-1');s.terrain.fill('plain');s.relics=[];
 s.units[0]={...s.units[0],x:3,y:4,moved:true,acted:true};s.units[1]={...s.units[1],moved:true,acted:true};
 if(enemy){s.units[2].x=5;s.units[2].y=3;}
 s.factions[0].gold=gold;return s;
}
function freeze<T>(v:T):T {if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}

test('預覽 AI 在已知威脅下投資盾衛，在未知前線投資機動研究；只從真合法候選選',()=>{
 for(const [state,want] of [
  [position(true,20),{type:'Research',tech:'defensiveEngineering'}],
  [Object.assign(position(false,20),{}),{type:'Research',tech:'militaryMobility'}],
 ] as const){
  if(!state.units.some(u=>u.owner===1&&u.x===5))state.factions[0].techs=['pathfinding'];
  const view=observe(state,0),action=chooseAction(view);assert.deepEqual(action,want);
  assert.ok(view.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(action)));
  assert.ok(action);assert.ok(applyCommand(state,{actor:0,requestId:'real-ai',expectedVersion:state.version,action}).ok);
 }
});

test('預覽 AI 真招募已解鎖盾衛與機動偵察，不只識別資料名稱',()=>{
 const guard=position(true,6);guard.factions[0].techs=['defensiveEngineering'];
 const scout=position(false,7);scout.factions[0].techs=['pathfinding','militaryMobility'];
 for(const [state,kind]of [[guard,'shieldGuard'],[scout,'mobileScout']]as const){
  const action=chooseAction(observe(state,0));assert.deepEqual(action,{type:'Recruit',siteId:'首都-0',kind});assert.ok(action);
  const result=applyCommand(state,{actor:0,requestId:'recruit-ai',expectedVersion:0,action});assert.ok(result.ok);
  assert.ok(result.state.units.some(u=>u.kind===kind));
 }
});

test('預覽 AI 同 Observation 異隱藏世界非干擾，freeze/clone/交錯不改輸入與選擇',()=>{
 const a=position(false,20),b=structuredClone(a);b.units[2].x=18;b.units[2].y=18;b.factions[1].gold=123;
 a.factions[0].techs=['pathfinding'];b.factions[0].techs=['pathfinding'];
 const av=observe(a,0),bv=observe(b,0);assert.notDeepEqual(a,b);assert.deepEqual(av,bv);
 const original=structuredClone(av),expected=chooseAction(av);freeze(av);
 for(let i=0;i<5;i++){assert.deepEqual(chooseAction(av),expected);chooseAction(observe(position(true,6),0));assert.deepEqual(chooseAction(structuredClone(bv)),expected);}
 assert.deepEqual(av,original);
 const mobile=createGame('機動兵合法AI','demo03-preview-1');mobile.terrain.fill('plain');mobile.relics=[];mobile.sites=[];mobile.factions[0].gold=0;
 mobile.units=[{...mobile.units[1],kind:'mobileScout'},{...mobile.units[2],x:5,y:3,hp:1}];
 const action=chooseAction(observe(mobile,0));assert.deepEqual(action,{type:'Attack',unitId:'兵-1',targetId:'兵-2'});
});
