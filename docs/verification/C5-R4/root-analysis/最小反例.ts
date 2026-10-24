import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from '../../project/src/core/game.ts';
import { chooseAction } from '../../project/src/core/ai.ts';
import type { GameState } from '../../project/src/core/types.ts';
function corridor(last=6):GameState {
  const s=createGame('C5-R4-observation-only-corridor');
  s.terrain.fill('mountain'); s.sites=[]; s.relics=[]; s.pendingRelic=null;
  for(let x=0;x<=last;x++) s.terrain[2*s.width+x]='plain';
  s.units=[{id:'patrol-0',owner:0,kind:'infantry',x:2,y:2,hp:10,moved:false,acted:false},{id:'survivor-1',owner:1,kind:'infantry',x:last,y:2,hp:10,moved:false,acted:false}];
  for(const f of s.factions) {f.gold=0;f.life='exiled';f.centerId=null;}
  s.explored[0].fill(true);s.surveyed[0].fill(true);
  return s;
}
const s=corridor(), v=observe(s,0);
assert.equal(v.units.filter(u=>u.owner===1).length,0);
const right={type:'Move',unitId:'patrol-0',to:{x:3,y:2}} as const;
assert.ok(v.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(right)));
const r=applyCommand(s,{actor:0,expectedVersion:0,requestId:'tiny-legal',action:right});assert.equal(r.ok,true);
const after=observe(r.state,0);
assert.equal(after.tiles[2*24+5].visibility,'visible');assert.equal(v.tiles[2*24+5].visibility,'explored');
const blocked=corridor(8);blocked.units.push({id:'friendly',owner:0,kind:'infantry',x:4,y:2,hp:10,moved:true,acted:true});
const b=observe(blocked,0);assert.equal(b.units.filter(u=>u.owner===1).length,0);
const island=corridor();island.terrain[2*24+4]='mountain';const i=observe(island,0);
assert.ok(i.legalActions.some(a=>a.type==='Move'));
const tactical=corridor();tactical.units[1].x=3;const t=observe(tactical,0);
assert.deepEqual(chooseAction(t),{type:'Attack',unitId:'patrol-0',targetId:'survivor-1'});
console.log(JSON.stringify({
 sevenCellCorridor:{legalActions:v.legalActions,oldAction:chooseAction(v),requiredDirection:right,oracle:'Moving east is reducer-accepted and newly observes remembered passable tile (5,2); moving west has no reachable newly observed land.',eastMoveNewlyObservesKnownLand:after.tiles.filter((t,n)=>t.visibility==='visible'&&v.tiles[n].visibility==='explored'&&t.terrain==='plain').map(t=>({x:t.x,y:t.y}))},
 friendlyBottleneck:{legalActions:b.legalActions,oldAction:chooseAction(b),reachableNextCell:right,oracle:'A legal empty approach cell exists before spent friendly (4,2), while known land (7,2)/(8,2) is currently nonvisible; no crossing is legal.'},
 isolatedKnownLand:{legalActions:i.legalActions,oldAction:chooseAction(i),oracle:'The currently nonvisible passable endpoint is behind known mountain (4,2); no reachable unseen land exists, so EndTurn is justified.'},
 tacticalPreemption:{action:chooseAction(t),oracle:'Visible adjacent enemy must retain existing Attack priority.'}
},null,2));
