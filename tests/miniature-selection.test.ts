import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,observe} from '../src/core/game';
import {WorldMap} from '../src/ui/map';
test('standing miniature head hit selects its visible unit tile; empty ground still uses isometric tile picking',()=>{
 const view=observe(createGame('standing-miniature-hit'),0),unit=view.units.find(u=>u.owner===0);assert.ok(unit);
 view.units=[unit];const map=Object.create(WorldMap.prototype)as any;
 const px=(unit.x-unit.y)*38,py=(unit.x+unit.y)*21;
 Object.assign(map,{view,width:800,height:600,camera:{x:px,y:py,zoom:1},tileW:76,tileH:42});
 assert.deepEqual(map.pointAt({x:400,y:266}),{x:unit.x,y:unit.y},'the visible head belongs to this unit, not the ground behind it');
 assert.deepEqual(map.pointAt({x:400,y:384}),{x:unit.x+2,y:unit.y+2});
});
test('miniature selection remains equivalent across zoom and does not mutate its observation',()=>{
 const view=observe(createGame('miniature-zoom'),0),unit=view.units.find(u=>u.owner===0);assert.ok(unit);
 view.units=[unit];const before=JSON.stringify(view),map=Object.create(WorldMap.prototype)as any;
 for(const zoom of [.24,.86,1.12,2.4]){
  Object.assign(map,{view,width:800,height:600,camera:{x:(unit.x-unit.y)*38,y:(unit.x+unit.y)*21,zoom},tileW:76,tileH:42});
  assert.deepEqual(map.pointAt({x:400,y:300-34*zoom}),{x:unit.x,y:unit.y});
 }
 assert.equal(JSON.stringify(view),before);
});
test('frontmost miniature wins overlap; an unknown tile cannot create an invisible hit target',()=>{
 const state=createGame('miniature-overlap');state.units[0].x=3;state.units[0].y=3;state.units[1].x=4;state.units[1].y=4;state.terrain[4*state.width+4]='plain';
 const view=observe(state,0);view.units=view.units.filter(u=>u.owner===0);
 const map=Object.create(WorldMap.prototype)as any;Object.assign(map,{view,width:800,height:600,camera:{x:0,y:0,zoom:1},tileW:76,tileH:42});
 assert.deepEqual(map.pointAt({x:400,y:430}),{x:4,y:4});
 // Defensive malformed-observation case, separate from the real-world Fog differential test.
 const tile=view.tiles.find(t=>t.x===4&&t.y===4);assert.ok(tile);tile.visibility='unknown';
 assert.deepEqual(map.pointAt({x:400,y:430}),{x:3,y:3});
});
