import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from './src/core/game';
import { chooseAction } from './src/core/ai';
import { chooseAction as slice1 } from './src/core/slice1-ai';
import type {GameState,Action,Observation} from './src/core/types';

function corridor():GameState{
 const s=createGame('第二片-友軍阻塞');s.terrain.fill('mountain');s.sites=[];s.relics=[];s.pendingRelic=null;
 s.factions[0].gold=0;s.explored[0].fill(true);s.surveyed[0].fill(true);
 for(let x=0;x<=5;x++)s.terrain[x]='plain';
 s.units=[{id:'runner',owner:0,kind:'scout',x:0,y:0,hp:7,moved:false,acted:false},
 {id:'ally',owner:0,kind:'scout',x:2,y:0,hp:7,moved:true,acted:true},
 {id:'enemy',owner:1,kind:'infantry',x:5,y:0,hp:10,moved:true,acted:true}];return s;
}
function check(v:Observation,expected?:Action){const before=structuredClone(v),a=chooseAction(v);if(expected)assert.deepEqual(a,expected);
 assert.ok(a&&v.legalActions.some(l=>JSON.stringify(l)===JSON.stringify(a)));assert.deepEqual(v,before);
 assert.deepEqual(chooseAction(structuredClone(v)),a);return a!;}

test('scout move2 也只能前進空格；下次 fresh 仍被擋時等待，不越兵也不倒退',()=>{
 const s=corridor(),v=observe(s,0);assert.deepEqual(slice1(v),{type:'EndTurn'});
 assert.deepEqual(v.legalActions,[{type:'Move',unitId:'runner',to:{x:1,y:0}},{type:'EndTurn'}]);
 const a=check(v,{type:'Move',unitId:'runner',to:{x:1,y:0}});
 const r=applyCommand(s,{actor:0,requestId:'review-r3-corridor',expectedVersion:s.version,action:a});assert.equal(r.ok,true);
 const next=structuredClone(r.state);next.units.find(u=>u.id==='runner')!.moved=false;next.units.find(u=>u.id==='runner')!.acted=false;
 const nv=observe(next,0);assert.ok(nv.legalActions.some(a=>a.type==='Move'&&a.to.x===0));
 assert.ok(!nv.legalActions.some(a=>a.type==='Move'&&a.to.x>1));check(nv,{type:'EndTurn'});
 assert.equal(next.units.find(u=>u.id==='ally')!.x,2);assert.equal(next.units.find(u=>u.id==='enemy')!.x,5);
});

test('完整交通繞路存在時不啟用忽略友軍備援；即使第一步反向也保留真繞路',()=>{
 const s=corridor();s.units[0]={...s.units[0],kind:'infantry',hp:10,x:4,y:5};
 s.units[1]={...s.units[1],kind:'infantry',hp:10,x:6,y:5};s.units=s.units.slice(0,2);
 s.terrain.fill('mountain');for(let x=4;x<=8;x++){s.terrain[5*s.width+x]='plain';s.terrain[3*s.width+x]='plain';}
 s.terrain[4*s.width+4]='plain';s.terrain[4*s.width+8]='plain';
 s.sites=[{id:'target',name:'目標',kind:'capital',owner:1,x:8,y:5,heldSince:0,recruited:false}];
 const v=observe(s,0);const expected:Action={type:'Move',unitId:'runner',to:{x:4,y:4}};
 assert.deepEqual(slice1(v),expected);check(v,expected);
});

test('fallback 的未知通道實況不作為決策來源，動作仍須合法',()=>{
 const a=corridor();a.units[0].kind='infantry';a.units[0].hp=10;a.units[1].kind='infantry';a.units[1].hp=10;
 a.units[2].x=9;for(let x=0;x<=10;x++)a.terrain[x]='plain';
 a.units.push({id:'observer',owner:0,kind:'infantry',x:10,y:0,hp:10,moved:true,acted:true});
 // Only x=5..7 is unknown; both sides are visible. The actual passage differs at x=6.
 a.explored[0].fill(true);a.surveyed[0].fill(true);for(const x of [5,6,7]){a.explored[0][x]=false;a.surveyed[0][x]=false;}
 const b=structuredClone(a);b.terrain[6]='mountain';
 const va=observe(a,0),vb=observe(b,0);assert.deepEqual(va,vb);
 const action=check(va,{type:'Move',unitId:'runner',to:{x:1,y:0}});assert.deepEqual(check(vb),action);
 const ra=applyCommand(a,{actor:0,requestId:'fog-a',expectedVersion:a.version,action});
 const rb=applyCommand(b,{actor:0,requestId:'fog-b',expectedVersion:b.version,action});assert.equal(ra.ok,true);assert.equal(rb.ok,true);
});

test('fallback 仍是無記憶純函式：凍結、穿插、clone、修改回傳都一致',()=>{
 const v=observe(corridor(),0),expected=check(v);
 const other=corridor();other.units[1].x=3;chooseAction(observe(other,0));
 const freeze=(x:unknown):void=>{if(x&&typeof x==='object'){Object.freeze(x);Object.values(x).forEach(freeze);}};
 const frozen=structuredClone(v);freeze(frozen);const a=chooseAction(frozen);assert.deepEqual(a,expected);
 if(a?.type==='Move')a.to.x=100;assert.deepEqual(chooseAction(frozen),expected);assert.deepEqual(v,frozen);
});
