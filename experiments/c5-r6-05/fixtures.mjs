import assert from 'node:assert/strict';
import {createGame,observe,applyCommand} from '../../src/core/game.ts';
import {chooseAction as baseline} from '../../src/core/ai.ts';
import {createHash} from 'node:crypto';
export const freeze=x=>{if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const v of Object.values(x))freeze(v);}return x;};
export const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function fixture(kind='nonsiege'){
 const s=createGame('R605-SYNTHETIC-'+kind);s.width=10;s.height=10;s.terrain=Array(100).fill('mountain');s.explored=[Array(100).fill(true),Array(100).fill(true)];s.surveyed=[Array(100).fill(true),Array(100).fill(true)];
 s.sites=s.sites.slice(0,2).map((site,i)=>({...site,x:i?9:0,y:i?9:0}));s.relics=[];s.pendingRelic=null;s.history=[];s.requests={};s.nextUnitId=1000;
 for(const f of s.factions){f.gold=0;f.techs=['farm','archery','pathfinding'];}
 const land=(x,y)=>s.terrain[y*10+x]='plain';
 for(const [x,y] of [[0,0],[9,9],[3,4],[4,4],[5,4],[4,3]])land(x,y);
 s.units=[
  {id:'a-infantry',owner:0,kind:'infantry',x:3,y:4,hp:10,moved:false,acted:false},
  {id:'b-blocker',owner:0,kind:'scout',x:4,y:4,hp:7,moved:false,acted:false},
  {id:'enemy',owner:1,kind:'infantry',x:5,y:4,hp:kind==='siege'?2:3,moved:false,acted:false},
 ];
 if(kind==='siege'){land(6,4);s.units.push({id:'c-entrant',owner:0,kind:'scout',x:6,y:4,hp:7,moved:false,acted:false});s.sites.push({id:'objective',name:'Synthetic Objective',kind:'village',x:5,y:4,owner:1,heldSince:0,recruited:false});}
 if(kind==='lethal')s.units.find(u=>u.id==='enemy').hp=1;
 if(kind==='danger'){land(6,3);s.units.push({id:'other-enemy',owner:1,kind:'archer',x:6,y:3,hp:7,moved:false,acted:false});}
 if(kind==='no-passage'){s.units.find(u=>u.id==='b-blocker').moved=true;s.units.find(u=>u.id==='b-blocker').acted=true;}
 if(kind==='spent')s.units.find(u=>u.id==='a-infantry').moved=true;
 if(kind==='insufficient')s.units.find(u=>u.id==='enemy').hp=10;
 if(kind==='detour'){
  s.units=[{id:'walker',owner:0,kind:'infantry',x:2,y:4,hp:10,moved:false,acted:false}];
  for(const [x,y] of [[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[5,3],[5,4]])land(x,y);
  s.terrain[4*10+3]='mountain';s.sites.push({id:'detour-goal',name:'Detour',kind:'village',x:5,y:4,owner:null,heldSince:0,recruited:false});
 }
 if(kind==='retreat'){
  s.terrain.fill('mountain');for(const [x,y] of [[0,0],[9,9],[1,4],[2,4],[3,4],[5,4]])land(x,y);
  s.units=[{id:'survivor',owner:0,kind:'scout',x:3,y:4,hp:1,moved:false,acted:false},{id:'sniper',owner:1,kind:'archer',x:5,y:4,hp:7,moved:false,acted:false}];
  s.sites.push({id:'safe-site',name:'Safe',kind:'village',x:1,y:4,owner:null,heldSince:0,recruited:false});
 }
 if(kind==='recruit'){
  land(3,3);
  s.units=[{id:'shooter',owner:0,kind:'scout',x:3,y:4,hp:7,moved:false,acted:false},{id:'victim',owner:1,kind:'scout',x:4,y:4,hp:2,moved:false,acted:false}];
  s.sites[0].x=3;s.sites[0].y=4;s.factions[0].gold=4;
 }
 return s;
}
export function step(s,action,id='step'){
 assert.ok(observe(s,s.active).legalActions.some(x=>equal(x,action)),'not a current legal Action');
 const r=applyCommand(s,{actor:s.active,requestId:'R605-'+id+'-'+s.version,expectedVersion:s.version,action});assert.ok(r.ok,r.error);return r.state;
}
export function ownTurn(initial,policy=baseline){
 let s=structuredClone(initial);const actor=s.active,actions=[];
 for(let i=0;i<40&&s.active===actor&&s.winner===null;i++){
  const view=freeze(observe(s,actor)),before=JSON.stringify(view),action=policy(view);assert.equal(JSON.stringify(view),before);
  assert.ok(action);s=step(s,action,String(i));actions.push(action);
 }
 assert.ok(s.active!==actor||s.winner!==null,'own turn cap exceeded');
 return {state:s,actions};
}
export const obsSha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
