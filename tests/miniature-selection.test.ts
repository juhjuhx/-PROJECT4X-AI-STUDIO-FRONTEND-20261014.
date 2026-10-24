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
