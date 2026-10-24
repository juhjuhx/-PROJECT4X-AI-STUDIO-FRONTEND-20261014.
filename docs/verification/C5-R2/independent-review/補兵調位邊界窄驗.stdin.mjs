import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from './src/core/game.ts';
import { chooseAction } from './src/core/ai.ts';
import { UNIT_STATS } from './src/core/types.ts';
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function fixture(kind='scout',count=1,holdings=1) {
 const s=createGame('review-reinforcement'); s.relics=[]; s.pendingRelic=null; s.terrain.fill('plain'); s.factions[0].gold=4;
 if(kind==='archer')s.factions[0].techs.push('archery');
 if(holdings===2)s.sites.find(t=>t.owner===null).owner=0;
 s.units=[{id:'shooter',owner:0,kind,x:3,y:3,hp:UNIT_STATS[kind].hp,moved:false,acted:false},{id:'guard',owner:1,kind:'scout',x:4,y:3,hp:2,moved:true,acted:true}];
 for(let i=1;i<count;i++)s.units.push({id:'parked-'+i,owner:0,kind:'infantry',x:8+i%12,y:10+Math.floor(i/12),hp:10,moved:true,acted:true});
 s.explored[0].fill(true);s.surveyed[0].fill(true);return s;
}
function play(s,action) {
 const r=applyCommand(s,{actor:s.active,requestId:'review-reinforce-'+s.version,expectedVersion:s.version,action});assert.equal(r.ok,true,r.error);return r.state;
}
function check(name,body){body();console.log('PASS '+name);}
function moveKeepsShot(s) {
 const v=observe(s,0),before=structuredClone(v),a=chooseAction(v);
 assert.equal(a.type,'Move');assert.equal(a.unitId,'shooter');assert.ok(v.legalActions.some(x=>JSON.stringify(x)===JSON.stringify(a)));
 const enemy=v.units.find(x=>x.id==='guard');assert.ok(distance(a.to,enemy)<=UNIT_STATS[v.units.find(x=>x.id==='shooter').kind].range);
 assert.ok(!v.tiles.some(t=>t.site?.owner===0&&t.x===a.to.x&&t.y===a.to.y));
 assert.deepEqual(chooseAction(v),a);assert.deepEqual(v,before);
 s=play(s,a);const next=observe(s,0);assert.ok(next.legalActions.some(x=>x.type==='Attack'&&x.unitId==='shooter'&&x.targetId==='guard'));
 const shot=chooseAction(next);assert.deepEqual(shot,{type:'Attack',unitId:'shooter',targetId:'guard'});
 s=play(s,shot);assert.equal(s.units.some(x=>x.id==='guard'),false);return s;
}
check('scout moves within own range, same lethal shot remains legal',()=>moveKeepsShot(fixture('scout')));
check('archer uses range2 rather than infantry range1',()=>moveKeepsShot(fixture('archer')));
check('infantry has no same-range legal sidestep and retains Attack',()=>assert.deepEqual(chooseAction(observe(fixture('infantry'),0)),{type:'Attack',unitId:'shooter',targetId:'guard'}));
check('nonlethal shot retains Attack',()=>{const s=fixture();s.units.find(x=>x.id==='guard').hp=7;assert.equal(chooseAction(observe(s,0)).type,'Attack');});
check('gold3 retains Attack',()=>{const s=fixture();s.factions[0].gold=3;assert.equal(chooseAction(observe(s,0)).type,'Attack');});
check('one holding: count7 below cap8 moves',()=>moveKeepsShot(fixture('scout',7,1)));
check('one holding: count8 at cap8 retains Attack',()=>assert.equal(chooseAction(observe(fixture('scout',8,1),0)).type,'Attack'));
check('two holdings: count15 below cap16 moves',()=>moveKeepsShot(fixture('scout',15,2)));
check('two holdings: count16 at cap16 retains Attack',()=>assert.equal(chooseAction(observe(fixture('scout',16,2),0)).type,'Attack'));
check('no legal firing move retains Attack',()=>{const s=fixture();s.terrain.fill('mountain');for(const x of [3,4])s.terrain[3*s.width+x]='plain';const v=observe(s,0);assert.equal(v.legalActions.some(x=>x.type==='Move'),false);assert.equal(chooseAction(v).type,'Attack');});
check('firing move onto another own holding is excluded',()=>{const s=fixture('archer');s.terrain.fill('mountain');for(const x of [2,3,4])s.terrain[3*s.width+x]='plain';const t=s.sites.find(t=>t.owner===null);t.x=2;t.y=3;t.owner=0;const v=observe(s,0);assert.ok(v.legalActions.some(x=>x.type==='Move'&&x.to.x===2&&x.to.y===3));assert.equal(chooseAction(v).type,'Attack');});
check('reserved fresh occupier still enters and captures after relocated archer kill',()=>{
 let s=fixture('archer');s.sites=[{...s.sites[0],x:5,y:5},{...s.sites[1],x:6,y:6}];
 s.units=[{id:'shooter',owner:0,kind:'archer',x:5,y:5,hp:7,moved:false,acted:false},{id:'a-occupier',owner:0,kind:'infantry',x:7,y:6,hp:10,moved:false,acted:false},{id:'guard',owner:1,kind:'scout',x:6,y:6,hp:2,moved:true,acted:true}];
 s=moveKeepsShot(s);let a=chooseAction(observe(s,0));assert.deepEqual(a,{type:'Move',unitId:'a-occupier',to:{x:6,y:6}});s=play(s,a);a=chooseAction(observe(s,0));assert.deepEqual(a,{type:'Capture',unitId:'a-occupier'});s=play(s,a);assert.equal(s.sites[1].owner,0);
});
check('hidden recruited flag gives identical Observation/action; no guaranteed recruitment claim',()=>{
 const a=fixture(),b=structuredClone(a);b.sites[0].recruited=true;
 assert.deepEqual(observe(a,0),observe(b,0));assert.deepEqual(chooseAction(observe(a,0)),chooseAction(observe(b,0)));
 const after=moveKeepsShot(b);assert.equal(observe(after,0).legalActions.some(x=>x.type==='Recruit'&&x.siteId===b.sites[0].id),false);
});
