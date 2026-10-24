import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, observe, applyCommand } from './src/core/game';
import { chooseAction } from './src/core/ai';
import { chooseAction as exhaustive } from './src/core/exhaustive-ai';
import { chooseAction as equalityMutant } from './src/core/equality-mutant-ai';
import { chooseAction as baseline } from './src/core/baseline-ai';
import type { GameState, Observation, Action, Point } from './src/core/types';

function state(): GameState {
  const s = createGame('獨立審查-合成地圖');
  s.terrain.fill('plain'); s.relics = []; s.pendingRelic = null; s.sites = [];
  s.factions[0].gold = 0; s.explored[0].fill(true); s.surveyed[0].fill(true);
  s.units = [{ id:'walker', owner:0, kind:'infantry', x:3,y:5,hp:10,moved:false,acted:false }];
  return s;
}
function blocker(s:GameState,x:number,y:number) {
  s.units.push({ id:`blocker-${x}-${y}`,owner:0,kind:'infantry',x,y,hp:10,moved:true,acted:true });
}
function sites(s:GameState, positions:Point[]) {
  s.sites=positions.map((p,n)=>({...p,id:`goal-${n}`,kind:'village',name:`目標-${n}`,owner:1,heldSince:0,recruited:false}));
}
function safe(view:Observation, expected?:Action) {
  const before=structuredClone(view), result=chooseAction(view);
  if(expected) assert.deepEqual(result,expected);
  assert.ok(result && view.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(result)),'回傳合法行動');
  assert.deepEqual(chooseAction(structuredClone(view)),result,'clone 決定性');
  assert.deepEqual(view,before,'不改寫 Observation');
  return result;
}
function fifth() {
  const s=state();for(let y=2;y<=8;y++)blocker(s,4,y);
  sites(s,[{x:5,y:5},{x:5,y:4},{x:5,y:6},{x:6,y:5},{x:3,y:9}]);return s;
}

test('第五目標：真實合法 Move 通過 reducer，baseline 必須失敗',()=>{
  const s=fifth(),v=observe(s,0),expected:Action={type:'Move',unitId:'walker',to:{x:3,y:6}};
  safe(v,expected);assert.notDeepEqual(baseline(v),expected);
  const result=applyCommand(s,{actor:0,requestId:'review-fifth',expectedVersion:s.version,action:expected});
  assert.equal(result.ok,true);assert.deepEqual(result.state.units.find(u=>u.id==='walker')?.y,6);
  console.log(JSON.stringify({case:'fifth',baseline:baseline(v),candidate:chooseAction(v),reducerAccepted:result.ok}));
});

test('等上界必須保留：後選目標實際同分但 y 較小；<= mutant 必須失敗',()=>{
  const s=state();s.units[0].x=4;s.units[0].y=6;blocker(s,6,5);blocker(s,6,6);blocker(s,0,3);
  sites(s,[{x:7,y:6},{x:0,y:5}]);const v=observe(s,0);
  // East: terrain=3, occupied=5. Northwest: terrain=5, occupied=5.
  // Same 1800/(5+4), so northwest y=5 beats east y=6.
  const expected:Action={type:'Move',unitId:'walker',to:{x:4,y:5}};
  safe(v,expected);assert.deepEqual(exhaustive(v),expected);assert.notDeepEqual(equalityMutant(v),expected);
  console.log(JSON.stringify({case:'equal-bound',candidate:chooseAction(v),mutant:equalityMutant(v)}));
});

test('前四不可達：穿越整張地圖的友軍牆後，第五個可達目標仍選中',()=>{
  const s=state();for(let y=0;y<s.height;y++)blocker(s,4,y);
  sites(s,[{x:5,y:5},{x:5,y:4},{x:5,y:6},{x:6,y:5},{x:3,y:9}]);
  safe(observe(s,0),{type:'Move',unitId:'walker',to:{x:3,y:6}});
});

test('全部目標被友軍牆切斷：保留合法 EndTurn',()=>{
  const s=state();for(let y=0;y<s.height;y++)blocker(s,4,y);
  sites(s,[{x:5,y:5},{x:5,y:4},{x:5,y:6},{x:6,y:5}]);
  const v=observe(s,0);assert.ok(v.legalActions.some(a=>a.type==='Move'));
  safe(v,{type:'EndTurn'});
});

test('私有世界變更但 Observation 相同：未知地形、敵軍與據點不影響選擇',()=>{
  const a=state();a.explored[0].fill(false);a.surveyed[0].fill(false);
  const b=structuredClone(a);b.terrain[20*b.width+20]='mountain';
  b.units.push({id:'private-enemy',owner:1,kind:'archer',x:20,y:20,hp:7,moved:false,acted:false});
  b.sites.push({id:'private-site',kind:'capital',name:'私有目標',owner:1,x:21,y:20,heldSince:0,recruited:false});
  const va=observe(a,0),vb=observe(b,0);assert.deepEqual(va,vb);assert.deepEqual(safe(va),safe(vb));
});

test('無隱式記憶：不同決策穿插、深度凍結輸入與回傳物件修改不改選擇',()=>{
  const a=observe(fifth(),0),b=observe(state(),0),expected=safe(a);
  safe(b);assert.deepEqual(safe(a),expected);
  function freeze(x:unknown):void{if(x&&typeof x==='object'){Object.freeze(x);for(const v of Object.values(x))freeze(v);}}
  const f=structuredClone(a);freeze(f);const returned=chooseAction(f);assert.deepEqual(returned,expected);
  if(returned?.type==='Move')returned.to.x=999;
  assert.deepEqual(chooseAction(f),expected);
});

test('256個有障礙、友軍佔位、已知及未知地圖：剪枝選擇等於完全評估',()=>{
  let seed=120719;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
  let movable=0,moves=0,unknown=0;
  for(let n=0;n<256;n++){
    const s=state();s.units[0].x=2+Math.floor(rnd()*18);s.units[0].y=2+Math.floor(rnd()*18);
    if(n%3===0)s.units[0].kind='scout';
    for(let i=0;i<s.terrain.length;i++)if(rnd()<0.13)s.terrain[i]=rnd()<0.5?'mountain':'water';
    const used=new Set([s.units[0].y*s.width+s.units[0].x]);
    for(let j=0;j<16;j++){
      const x=Math.floor(rnd()*s.width),y=Math.floor(rnd()*s.height),i=y*s.width+x;
      if(used.has(i))continue;used.add(i);s.terrain[i]='plain';blocker(s,x,y);
    }
    const positions:Point[]=[];
    for(let j=0;j<9;j++){
      const x=Math.floor(rnd()*s.width),y=Math.floor(rnd()*s.height),i=y*s.width+x;
      if(used.has(i))continue;used.add(i);s.terrain[i]='plain';positions.push({x,y});
    }
    sites(s,positions);s.terrain[s.units[0].y*s.width+s.units[0].x]='plain';
    for(let j=0;j<s.sites.length;j++){if(j%3===0)s.sites[j].owner=null;if(j%4===0)s.sites[j].kind='capital';}
    if(n%2===0){s.explored[0]=s.explored[0].map(()=>rnd()<0.6);s.surveyed[0]=[...s.explored[0]];}
    const v=observe(s,0),actual=safe(v);if(v.legalActions.some(a=>a.type==='Move'))movable++;
    if(actual?.type==='Move')moves++;if(v.tiles.some(t=>t.visibility==='unknown'))unknown++;
    assert.deepEqual(actual,exhaustive(v),`完整評估與剪枝不一致 case=${n}`);
  }
  assert.ok(movable>=250);assert.ok(moves>=200);assert.equal(unknown,128);
  console.log(JSON.stringify({case:'differential',count:256,movable,moves,unknown,seed:120719}));
});
