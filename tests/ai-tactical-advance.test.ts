import test from 'node:test';
import assert from 'node:assert/strict';
import {applyCommand, createGame, observe} from '../src/core/game';
import {chooseAction} from '../src/core/ai';
import type {Action, GameState} from '../src/core/types';

test('R6-02：致命反擊射位仍在其他可見敵軍單回合潛在射程內時，不套用捷徑',()=>{
  const s=exposedScreen();
  s.units.find(u=>u.id==='striker')!.hp=2;
  s.units.find(u=>u.id==='screen')!.hp=7;
  s.terrain[3*6+3]='mountain';
  s.units.push({id:'retaliator',owner:1,kind:'archer',x:4,y:3,hp:7,moved:true,acted:true});
  const view=observe(s,0);
  assert.ok(view.units.some(u=>u.id==='retaliator'),'風險必須確實可見，不能補隱藏敵人');
  assert.equal(view.legalActions.some(a=>a.type==='Attack'),false);
  const advanced=play(play(play(s,north),{type:'Attack',unitId:'striker',targetId:'wounded'}),{type:'EndTurn'});
  const response=play(advanced,{type:'Move',unitId:'retaliator',to:{x:4,y:2}});
  assert.ok(observe(response,1).legalActions.some(a=>a.type==='Attack'&&a.targetId==='striker'));
  assert.equal(play(response,{type:'Attack',unitId:'retaliator',targetId:'striker'}).units.some(u=>u.id==='striker'),false);
  const retreat=play(play(s,west),{type:'EndTurn'});
  const possibleShots=observe(retreat,1).legalActions.filter(a=>a.type==='Move'&&a.unitId==='retaliator').some(move=>
    observe(play(retreat,move),1).legalActions.some(a=>a.type==='Attack'&&a.targetId==='striker'));
  assert.equal(possibleShots,false,'山脈與距離讓原路線避開這個合法致命反擊');
  assert.deepEqual(chooseAction(view),west);
});


// Synthetic six-by-six reduction; no private seed, world or historic coordinates.
function exposedScreen(): GameState {
  const s = createGame('R602-synthetic-screen');
  s.width = 6; s.height = 6; s.terrain = Array(36).fill('plain');
  s.terrain[2 * 6 + 1] = 'mountain'; s.terrain[2 * 6 + 3] = 'mountain';
  s.explored = [Array(36).fill(true), Array(36).fill(true)];
  s.surveyed = [Array(36).fill(true), Array(36).fill(true)];
  s.relics = []; s.pendingRelic = null;
  s.units = [
    {id:'striker',owner:0,kind:'infantry',x:2,y:3,hp:8,moved:false,acted:false},
    {id:'screen',owner:0,kind:'infantry',x:1,y:1,hp:3,moved:true,acted:true},
    {id:'wounded',owner:1,kind:'infantry',x:2,y:1,hp:1,moved:true,acted:true},
  ];
  s.sites = [
    {id:'home',kind:'capital',name:'己方中心',owner:0,x:5,y:5,heldSince:0,recruited:false},
    {id:'objective',kind:'village',name:'已知據點',owner:1,x:0,y:0,heldSince:0,recruited:false},
  ];
  for (const f of s.factions) { f.gold = 0; f.life = 'active'; f.centerId = f.id === 0 ? 'home' : 'objective'; f.originalCapitalId = f.centerId; }
  return s;
}
const north: Action = {type:'Move',unitId:'striker',to:{x:2,y:2}};
const west: Action = {type:'Move',unitId:'striker',to:{x:1,y:3}};
function play(s: GameState, action: Action): GameState {
  const r = applyCommand(s,{actor:s.active,requestId:`r602-test-${s.version}`,expectedVersion:s.version,action});
  assert.equal(r.ok,true,r.error ?? '合法指令遭拒絕'); return r.state;
}
function frozen<T>(v:T):T {
  if(v && typeof v==='object') {Object.freeze(v);for(const x of Object.values(v)) frozen(x);} return v;
}

test('R6-02：無現成Attack時，合法移動反擊可擊殺可見威脅，保住已耗盡友軍',()=>{
  const s=exposedScreen(),view=observe(s,0),before=structuredClone(view);
  assert.equal(view.legalActions.some(a=>a.type==='Attack'),false);
  assert.ok(view.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(north)));
  // Establish both legal consequences before asserting the policy expectation.
  const advanced=play(s,north),shot:Action={type:'Attack',unitId:'striker',targetId:'wounded'};
  assert.ok(observe(advanced,0).legalActions.some(a=>JSON.stringify(a)===JSON.stringify(shot)));
  const cleared=play(advanced,shot);
  assert.equal(cleared.units.some(u=>u.id==='wounded'),false);
  assert.equal(cleared.units.find(u=>u.id==='screen')?.hp,3);
  assert.equal(cleared.winner,null,'U=0但S>0仍存續，不能合成勝者');
  const control=play(play(s,west),{type:'EndTurn'});
  const retaliation:Action={type:'Attack',unitId:'wounded',targetId:'screen'};
  assert.deepEqual(chooseAction(observe(control,1)),retaliation,'相同對手政策確實會利用留下的威脅');
  assert.equal(play(control,retaliation).units.some(u=>u.id==='screen'),false);
  assert.deepEqual(chooseAction(view),north);
  assert.deepEqual(chooseAction(observe(advanced,0)),shot);
  assert.deepEqual(view,before);
});
test('R6-02：無法一擊清除的威脅不套用移動反擊捷徑',()=>{
  const s=exposedScreen();s.units.find(u=>u.id==='wounded')!.hp=10;
  assert.deepEqual(chooseAction(observe(s,0)),west);
});
test('R6-02：無友軍受到當前可見敵軍射程威脅時，保留原策略路線',()=>{
  const s=exposedScreen();s.units=s.units.filter(u=>u.id!=='screen');
  assert.deepEqual(chooseAction(observe(s,0)),west);
});
test('R6-02：現成合法攻擊仍優先，不為移動反擊延後',()=>{
  const s=exposedScreen();s.units.find(u=>u.id==='striker')!.y=2;
  assert.deepEqual(chooseAction(observe(s,0)),{type:'Attack',unitId:'striker',targetId:'wounded'});
});
test('R6-02：既有攻城預留使現成Attack暫不出手時，保留原移動路線',()=>{
  const s=exposedScreen();s.terrain[2*6+3]='plain';
  s.units.push(
    {id:'entry',owner:0,kind:'infantry',x:4,y:2,hp:10,moved:false,acted:false},
    {id:'spent-support',owner:0,kind:'infantry',x:3,y:3,hp:10,moved:true,acted:true},
    {id:'guard',owner:1,kind:'infantry',x:3,y:2,hp:4,moved:true,acted:true},
  );
  s.sites.push({id:'garrison',kind:'village',name:'守軍據點',owner:1,x:3,y:2,heldSince:0,recruited:false});
  const view=observe(s,0);
  assert.deepEqual(view.legalActions.filter(a=>a.type==='Attack'),[{type:'Attack',unitId:'entry',targetId:'guard'}]);
  const after=observe(play(s,north),0);
  assert.ok(after.legalActions.some(a=>a.type==='Attack'&&a.unitId==='striker'&&a.targetId==='wounded'));
  assert.deepEqual(chooseAction(after),{type:'Attack',unitId:'striker',targetId:'guard'},'既有攻城排序會使用射位攻守軍，不能假定下一步擊殺原威脅');
  assert.deepEqual(chooseAction(view),west,'新反擊只處理原本沒有Attack的缺口，不改攻城預留的fallback');
});
test('R6-02：相同Observation不同隱藏truth、deepfreeze與交錯呼叫均同決策',()=>{
  const a=exposedScreen(),b=structuredClone(a);b.factions[1].gold=999;
  b.units.push({id:'hidden',owner:1,kind:'scout',x:0,y:5,hp:7,moved:true,acted:true});
  const va=observe(a,0),vb=observe(b,0);assert.deepEqual(va,vb);
  const before=structuredClone(va);frozen(va);frozen(vb);
  const unrelated=exposedScreen();unrelated.units.find(u=>u.id==='wounded')!.hp=10;
  for(let i=0;i<5;i++) {assert.deepEqual(chooseAction(va),north);chooseAction(observe(unrelated,0));assert.deepEqual(chooseAction(structuredClone(vb)),north);}
  assert.deepEqual(va,before);
});
