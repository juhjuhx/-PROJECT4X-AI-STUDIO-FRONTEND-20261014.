import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,observe,applyCommand,distance} from '../src/core/game';
import {chooseAction} from '../src/core/ai';
import type {Action,Actor,GameState} from '../src/core/types';

// Minimized/translated from a lawful seed008 Observation. This synthetic world
// is a rule-level fixture, not a generated match or a persistence provenance.
function siege(actor:Actor=0,direct=false):GameState {
 const s=createGame('C5-R6-synthetic-siege');s.active=actor;s.relics=[];s.pendingRelic=null;s.terrain.fill('plain');
 s.explored=[Array(576).fill(false),Array(576).fill(false)];s.surveyed=[Array(576).fill(false),Array(576).fill(false)];
 s.factions[actor].gold=0;s.factions[actor].techs=['archery'];
 s.sites=[{id:'home',name:'Home',kind:'capital',owner:actor,x:0,y:0,heldSince:0,recruited:false},
  {id:'target',name:'Target',kind:'village',owner:actor===0?1:0,x:2,y:2,heldSince:0,recruited:false}];
 s.factions[actor].centerId='home';s.factions[actor].originalCapitalId='home';
 s.factions[actor===0?1:0].centerId='target';s.factions[actor===0?1:0].originalCapitalId='target';
 s.units=[{id:'entry',owner:actor,kind:'archer',x:2,y:3,hp:7,moved:false,acted:false},
  {id:'support',owner:actor,kind:'infantry',x:3,y:direct?2:1,hp:7,moved:false,acted:false},
  {id:'guard',owner:actor===0?1:0,kind:'infantry',x:2,y:2,hp:2,moved:true,acted:true}];
 return s;
}
function play(s:GameState,a:Action):GameState {
 const view=observe(s,s.active);assert.ok(view.legalActions.some(x=>JSON.stringify(x)===JSON.stringify(a)),'action must be actually legal');
 const r=applyCommand(s,{actor:s.active,expectedVersion:s.version,requestId:'siege-'+s.version,action:a});assert.ok(r.ok,r.error??'fixture action rejected');return r.state;
}
function finish(s:GameState,actor:Actor) {
 let a=chooseAction(observe(s,actor));assert.deepEqual(a,{type:'Attack',unitId:'support',targetId:'guard'});s=play(s,a!);
 assert.equal(s.units.some(u=>u.id==='guard'),false,'support really clears the defended holding');
 a=chooseAction(observe(s,actor));assert.deepEqual(a,{type:'Move',unitId:'entry',to:{x:2,y:2}});s=play(s,a!);
 a=chooseAction(observe(s,actor));assert.deepEqual(a,{type:'Capture',unitId:'entry'});s=play(s,a!);
 assert.equal(s.sites.find(t=>t.id==='target')!.owner,actor);assert.equal(s.active,actor);
}
for(const actor of [0,1] as const)test('C5-R6：保留唯一入城者，先讓支援移位射擊（actor '+actor+'）',()=>{
 let s=siege(actor);const v=observe(s,actor),before=structuredClone(v);const a=chooseAction(v);
 assert.ok(a?.type==='Move'&&a.unitId==='support','spent entry fire loses a legal same-turn capture window');
 assert.ok(distance(a.to,{x:2,y:2})<=1);assert.deepEqual(v,before);s=play(s,a);finish(s,actor);
});
test('C5-R6：可直接單擊清城時由支援開火，不按id預留較強火力',()=>{
 const s=siege(0,true);s.units[0].id='z-entry';s.units[1].id='a-support';
 const a=chooseAction(observe(s,0));assert.deepEqual(a,{type:'Attack',unitId:'a-support',targetId:'guard'});
 const after=play(s,a!);assert.equal(after.units.find(u=>u.id==='z-entry')!.acted,false);
 assert.ok(observe(after,0).legalActions.some(a=>a.type==='Move'&&a.unitId==='z-entry'&&a.to.x===2&&a.to.y===2));
});
test('C5-R6：直接清城仍先釋放己方招募格，實際占領並招募',()=>{
 let s=siege();s.factions[0].gold=4;
 s.sites=[{id:'home',name:'Home',kind:'capital',owner:0,x:3,y:3,heldSince:0,recruited:false},
  {id:'target',name:'Target',kind:'village',owner:1,x:4,y:4,heldSince:0,recruited:false},
  {id:'away',name:'Away',kind:'capital',owner:1,x:22,y:22,heldSince:0,recruited:false}];
 s.factions[1].centerId='away';s.factions[1].originalCapitalId='away';
 s.units=[{id:'a-entry',owner:0,kind:'infantry',x:3,y:4,hp:10,moved:false,acted:false},
  {id:'z-support',owner:0,kind:'archer',x:3,y:3,hp:7,moved:false,acted:false},
  {id:'guard',owner:1,kind:'infantry',x:4,y:4,hp:1,moved:true,acted:true}];
 const expected:Action[]=[{type:'Move',unitId:'z-support',to:{x:4,y:3}},
  {type:'Attack',unitId:'z-support',targetId:'guard'},
  {type:'Move',unitId:'a-entry',to:{x:4,y:4}},
  {type:'Capture',unitId:'a-entry'},
  {type:'Recruit',siteId:'home',kind:'infantry'}];
 for(const action of expected){assert.deepEqual(chooseAction(observe(s,0)),action);s=play(s,action);}
 assert.equal(s.sites.find(t=>t.id==='target')!.owner,0);
 assert.equal(s.sites.find(t=>t.id==='home')!.recruited,true);
 assert.equal(s.factions[0].gold,0);assert.equal(s.units.filter(u=>u.owner===0).length,3);
 assert.equal(s.active,0,'the reinforcement window must be used before handing off');
});
test('C5-R6：沒有fresh入城者不憑空保留攻城角色',()=>{
 const s=siege();s.units[0].moved=true;
 assert.deepEqual(chooseAction(observe(s,0)),{type:'Attack',unitId:'entry',targetId:'guard'});
});
test('C5-R6：支援移位後火力不足不宣稱單擊清城',()=>{
 const s=siege();s.units.find(u=>u.id==='guard')!.hp=3;
 assert.deepEqual(chooseAction(observe(s,0)),{type:'Attack',unitId:'entry',targetId:'guard'});
});
test('C5-R6：已知地形封住支援射擊格時只能使用既有合法候選',()=>{
 const s=siege();s.terrain[1*24+2]='mountain';s.terrain[2*24+3]='mountain';
 assert.deepEqual(chooseAction(observe(s,0)),{type:'Attack',unitId:'entry',targetId:'guard'});
});
function freeze<T>(v:T):T {if(v&&typeof v==='object'){Object.freeze(v);for(const x of Object.values(v))freeze(x);}return v;}
test('C5-R6：同觀測異hidden truth、freeze／clone／重複與穿插決策一致',()=>{
 const a=siege(),b=structuredClone(a);b.units.push({id:'hidden',owner:1,kind:'scout',x:21,y:21,hp:7,moved:false,acted:false});b.terrain[22*24+22]='forest';b.factions[1].gold=999;
 const va=observe(a,0),vb=observe(b,0);assert.deepEqual(va,vb,'canonical differs but lawful Observation must match');
 const copy=structuredClone(va),expected=chooseAction(freeze(va));assert.ok(expected?.type==='Move'&&expected.unitId==='support');
 for(let i=0;i<4;i++){assert.deepEqual(chooseAction(structuredClone(vb)),expected);chooseAction(observe(siege(1,true),1));assert.deepEqual(chooseAction(va),expected);}
 assert.deepEqual(va,copy,'input immutable');assert.ok(va.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(expected)));
});
