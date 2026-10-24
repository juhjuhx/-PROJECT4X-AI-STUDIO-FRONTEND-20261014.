import assert from 'node:assert/strict';
import {createGame,observe} from './src/core/game';
import {chooseAction as first,reviewMetrics as m1} from './src/core/measured-slice1-ai';
import {chooseAction as second,reviewMetrics as m2} from './src/core/measured-ai';
import {performance} from 'node:perf_hooks';
const s=createGame('有界性能-合成交通牆');s.terrain.fill('plain');s.units=[];s.sites=[];s.relics=[];s.pendingRelic=null;
s.factions[0].gold=0;s.explored[0].fill(true);s.surveyed[0].fill(true);
for(let n=0;n<40;n++)s.units.push({id:`fresh-${n}`,owner:0,kind:'infantry',x:(n%6)*2,y:Math.floor(n/6)*2,hp:10,moved:false,acted:false});
for(let y=0;y<24;y++)s.units.push({id:`wall-${y}`,owner:0,kind:'infantry',x:12,y,hp:10,moved:true,acted:true});
for(let n=0;n<10;n++)s.sites.push({id:`goal-${n}`,name:`目標-${n}`,kind:'village',owner:1,x:18,y:n*2,heldSince:0,recruited:false});
const v=observe(s,0),before=structuredClone(v);
for(let n=0;n<4;n++){first(v);second(v);}
m1.bfs=m1.fallback=m2.bfs=m2.fallback=0;
const out:{slice:string;medianMs:number;p95Ms:number;minMs:number;bfsPerCall:number;fallbackUnitsPerCall:number;action:unknown}[]=[];
for(const [slice,fn,m] of [['first',first,m1],['second',second,m2]] as const){const times:number[]=[];let action;
 for(let n=0;n<30;n++){const t=performance.now();action=fn(v);times.push(performance.now()-t);}
 times.sort((a,b)=>a-b);out.push({slice,medianMs:times[15],p95Ms:times[28],minMs:times[0],bfsPerCall:m.bfs/30,fallbackUnitsPerCall:m.fallback/30,action});}
assert.deepEqual(v,before);assert.equal(m2.fallback/30,40);assert.ok(m2.bfs<=2*m1.bfs);
console.log(JSON.stringify({schema:'independent-bounded-performance-1',units:64,movableFresh:40,goals:10,iterations:30,results:out},null,2));
