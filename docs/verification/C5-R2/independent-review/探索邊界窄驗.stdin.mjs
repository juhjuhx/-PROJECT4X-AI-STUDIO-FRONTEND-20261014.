import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from './src/core/game.ts';
import { chooseAction } from './src/core/ai.ts';
import { UNIT_STATS } from './src/core/types.ts';
function fixture() {
 const s=createGame('review-branch'); s.relics=[]; s.pendingRelic=null; s.terrain.fill('plain'); s.factions[0].gold=0;
 s.units=[{id:'scout',owner:0,kind:'scout',x:19,y:20,hp:7,moved:false,acted:false},{id:'guard',owner:1,kind:'scout',x:20,y:20,hp:7,moved:true,acted:true}];
 s.explored[0].fill(true); s.surveyed[0].fill(true); return s;
}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const s=fixture(); s.explored[0][0]=false; s.surveyed[0][0]=false;
const v=observe(s,0), moves=v.legalActions.filter(a=>a.type==='Move');
assert.ok(moves.length>0); assert.ok(v.tiles.some(t=>t.visibility==='unknown'));
assert.ok(moves.every(a=>v.tiles.every(t=>t.visibility!=='unknown'||distance(a.to,t)>3)));
assert.deepEqual(chooseAction(v),{type:'Attack',unitId:'scout',targetId:'guard'});
console.log('PASS legal moves exist but none reveal unknown -> Attack');
for (const pathfinding of [false,true]) {
 const s=fixture(); s.terrain.fill('mountain'); for(const x of [18,19,20]) s.terrain[20*s.width+x]='plain';
 const unknown=20*s.width+14; s.explored[0][unknown]=false; s.surveyed[0][unknown]=false;
 if(pathfinding)s.factions[0].techs.push('pathfinding');
 const v=observe(s,0), a=chooseAction(v);
 assert.equal(a.type,pathfinding?'Move':'Attack');
 if(a.type==='Move') {
  const r=applyCommand(s,{actor:0,requestId:'review',expectedVersion:s.version,action:a}); assert.ok(r.ok); assert.equal(observe(r.state,0).tiles[unknown].visibility,'visible');
 }
 console.log('PASS pathfinding='+pathfinding+' sight boundary -> '+a.type);
}
