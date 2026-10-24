import test from 'node:test';
import assert from 'node:assert/strict';
import {observe,canonicalHash} from '../../src/core/game.ts';
import {chooseAction as baseline} from '../../src/core/ai.ts';
import {fixture,ownTurn,step,freeze} from './fixtures.mjs';
import {chooseCooperative,evaluateCooperative} from './candidate.mjs';
test('vacancy：連續合法重觀測可讓被堵步兵擊殺，正式E仍先非致死射擊',()=>{
 const s=fixture(),b=ownTurn(s,baseline);
 assert.deepEqual(b.actions[0],{type:'Attack',unitId:'b-blocker',targetId:'enemy'});
 assert.equal(b.state.units.find(u=>u.id==='enemy')?.hp,1,'fixture must reproduce actual E miss');
 const c=ownTurn(s,chooseCooperative);
 assert.equal(c.state.units.some(u=>u.id==='enemy'),false,'experimental vacancy must lead to real kill');
 assert.equal(c.state.units.find(u=>u.id==='a-infantry').acted,true);
 assert.deepEqual(c.actions.slice(0,3),[{type:'Move',unitId:'b-blocker',to:{x:4,y:3}},{type:'Move',unitId:'a-infantry',to:{x:4,y:4}},{type:'Attack',unitId:'a-infantry',targetId:'enemy'}]);
});
test('city：先讓路與支援擊殺，保留獨立入城者實際Capture',()=>{
 const s=fixture('siege'),b=ownTurn(s,baseline);assert.equal(b.state.sites.find(t=>t.id==='objective').owner,1,'E must fail own-turn capture');
 const c=ownTurn(s,chooseCooperative);assert.equal(c.state.sites.find(t=>t.id==='objective').owner,0);
 assert.ok(c.actions.some(a=>a.type==='Capture'&&a.unitId==='c-entrant'));
});
for(const kind of ['lethal','recruit','detour','retreat','danger','no-passage','spent','insufficient']){
 test('保護：'+kind,()=>{
  const s=fixture(kind),v=freeze(observe(s,0)),c=ownTurn(s,chooseCooperative);
  assert.deepEqual(chooseCooperative(v),baseline(v),'registered safety case preserves existing first choice');
  if(kind==='lethal')assert.equal(c.actions[0].type,'Attack');
  if(kind==='recruit'){assert.ok(c.actions.some(a=>a.type==='Recruit'));assert.equal(c.state.factions[0].gold,0);}
  if(kind==='detour')assert.deepEqual(c.actions[0],{type:'Move',unitId:'walker',to:{x:2,y:3}});
  if(kind==='retreat'){assert.ok(c.state.units.some(u=>u.id==='survivor'));assert.ok(c.actions[0].to.x<3);}
  if(kind==='danger')assert.equal(c.actions[0].type,'Attack');
  if(kind==='no-passage')assert.equal(c.actions[0].type,'EndTurn');
 });
}
test('Fog／freeze／clone／交錯呼叫：候選不讀隱藏HP或保留記憶',()=>{
 const a=fixture();a.terrain[88]='plain';a.units.push({id:'hidden',owner:1,kind:'infantry',x:8,y:8,hp:10,moved:false,acted:false});
 const b=structuredClone(a);b.units.find(u=>u.id==='hidden').hp=9;assert.notEqual(canonicalHash(a),canonicalHash(b));
 const va=observe(a,0),vb=observe(b,0);assert.deepEqual(va,vb);const before=structuredClone(va),want=chooseCooperative(freeze(va));
 for(let i=0;i<12;i++){assert.deepEqual(chooseCooperative(freeze(structuredClone(vb))),want);chooseCooperative(freeze(observe(fixture('siege'),0)));assert.deepEqual(chooseCooperative(va),want);}
 assert.deepEqual(va,before);
});
test('預算：超過友軍上限時整次fallback，不截斷偏好子集',()=>{
 const state=fixture();
 for(let i=0;i<24;i++){state.terrain[i]='plain';state.units.push({id:'extra-'+i,owner:0,kind:'infantry',x:i%10,y:Math.floor(i/10),hp:10,moved:true,acted:true});}
 const v=observe(state,0);
 const r=evaluateCooperative(freeze(v));assert.deepEqual(r.action,baseline(v));assert.equal(r.diagnostics.overflow,true);
});

test('證書邊界：步兵不可把超過本回合移動額度的射位算作機會',()=>{
 const s=fixture();s.units.find(u=>u.id==='enemy').x=6;s.terrain[46]='plain';
 const v=freeze(observe(s,0)),r=evaluateCooperative(v);assert.equal(r.diagnostics.certificates,0);assert.deepEqual(r.action,baseline(v));
});
test('投影健壯性（非可達core觀測）：未知中途格不形成證書',()=>{
 const v=observe(fixture(),0),tile=v.tiles[44];tile.visibility='unknown';tile.terrain=null;
 const r=evaluateCooperative(freeze(v));assert.equal(r.diagnostics.certificates,0);assert.deepEqual(r.action,baseline(v));
});
test('證書邊界：B新落點還堵住射位，不能假裝穿過B',()=>{
 const s=fixture();s.terrain[34]='mountain'; // B has no vacancy landing.
 const v=freeze(observe(s,0)),r=evaluateCooperative(v);assert.equal(r.diagnostics.certificates,0);assert.deepEqual(r.action,baseline(v));
});
test('證書邊界：城市沒有獨立fresh entrant時不聲稱capture窗口',()=>{
 const s=fixture('siege');s.units.find(u=>u.id==='c-entrant').moved=true;s.units.find(u=>u.id==='c-entrant').acted=true;
 const r=evaluateCooperative(freeze(observe(s,0)));assert.equal(r.diagnostics.certificates,0);
});
test('證書邊界：離開後失去目標可見性，不保留隱藏記憶',()=>{
 const s=fixture();s.units.find(u=>u.id==='a-infantry').x=2;s.terrain[42]='plain';s.units.find(u=>u.id==='enemy').x=8;s.terrain[48]='plain';
 const v=observe(s,0);assert.ok(v.units.some(u=>u.id==='enemy')); // pathfinding scout at4,4 sees8,4, but not from4,3.
 const after=step(s,{type:'Move',unitId:'b-blocker',to:{x:4,y:3}});
 assert.equal(observe(after,0).units.some(u=>u.id==='enemy'),false);
 const r=evaluateCooperative(freeze(observe(after,0)));assert.equal(r.diagnostics.certificates,0);assert.ok(r.action);
});
