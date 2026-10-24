import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, createGame, observe, legalActions, visibility } from '../src/core/game';
import type { GameState, Action } from '../src/core/types';

// 第二參數是本切片新增接點；現行 G1 忽略它時應在行為斷言 RED。
const preview = () => (createGame as (seed: string, ruleset?: string) => GameState)('預覽真命令', 'demo03-preview-1');
function play(state: GameState, action: Action): GameState {
  const result = applyCommand(state,{actor:state.active,requestId:`preview-${state.version}`,expectedVersion:state.version,action});
  assert.equal(result.ok,true,result.error ?? '合法預覽命令'); return result.state;
}

test('預覽為獨立新局；G1 無新增研究/招募或越權 Action', () => {
  const p = preview(), g1 = createGame('預覽真命令');
  assert.equal(observe(p,0).ruleset,'demo03-preview-1');
  assert.ok(legalActions(p,0).some(a=>a.type==='Research' && (a.tech as string)==='defensiveEngineering'));
  assert.equal(legalActions(p,0).some(a=>a.type==='Research' && (a.tech as string)==='militaryMobility'),false);
  assert.equal(legalActions(g1,0).some(a=>a.type==='Research' && (a.tech as string)==='defensiveEngineering'),false);
  const bad = applyCommand(g1,{actor:0,requestId:'new-id',expectedVersion:0,action:{type:'Research',tech:'defensiveEngineering'} as Action});
  assert.equal(bad.ok,false);assert.equal(bad.state,g1);
});

test('盾衛 Research→真扣款→Recruit→下己回合行動；新兵不立即行動', () => {
  let state = preview(); state.factions[0].gold=20;
  state=play(state,{type:'Research',tech:'defensiveEngineering'} as Action);
  assert.equal(state.factions[0].gold,13);
  const move=legalActions(state,0).find(a=>a.type==='Move' && a.unitId==='兵-0');assert.ok(move);state=play(state,move);
  state=play(state,{type:'Recruit',siteId:'首都-0',kind:'shieldGuard'} as Action);
  assert.equal(state.factions[0].gold,7);
  const guard=state.units.find(u=>(u.kind as string)==='shieldGuard')!;assert.ok(guard);assert.equal(guard.hp,10);
  assert.equal(legalActions(state,0).some(a=>(a.type==='Move'||a.type==='Attack')&&a.unitId===guard.id),false);
  state=play(play(state,{type:'EndTurn'}),{type:'EndTurn'});
  assert.ok(legalActions(state,0).some(a=>a.type==='Move'&&a.unitId===guard.id));
});

test('機動前置/費用、三格移動與地形/友軍限制；尋徑不擴張新種視野', () => {
  let state=preview();state.terrain.fill('plain');state.relics=[];state.factions[0].gold=30;
  assert.equal(legalActions(state,0).some(a=>a.type==='Research'&&(a.tech as string)==='militaryMobility'),false);
  state=play(state,{type:'Research',tech:'pathfinding'});
  state=play(state,{type:'Research',tech:'militaryMobility'} as Action);
  assert.equal(state.factions[0].gold,20);
  state=play(state,{type:'Move',unitId:'兵-0',to:{x:3,y:4}});
  state=play(state,{type:'Recruit',siteId:'首都-0',kind:'mobileScout'} as Action);
  assert.equal(state.factions[0].gold,13);
  state=play(play(state,{type:'EndTurn'}),{type:'EndTurn'});
  const scout=state.units.find(u=>(u.kind as string)==='mobileScout')!;
  assert.ok(legalActions(state,0).some(a=>a.type==='Move'&&a.unitId===scout.id&&a.to.x===3&&a.to.y===0));
  assert.equal(legalActions(state,0).some(a=>a.type==='Move'&&a.unitId===scout.id&&a.to.x===4&&a.to.y===3),false,'友軍佔位不得穿入');
  state.terrain[2*24+3]='mountain';state.terrain[3*24+2]='water';
  assert.equal(legalActions(state,0).some(a=>a.type==='Move'&&a.unitId===scout.id&&((a.to.x===3&&a.to.y===2)||(a.to.x===2&&a.to.y===3))),false);
  state.units=[{...scout,x:10,y:10}];state.sites=[];
  assert.equal(visibility(state,0)[10*24+13],true);
  assert.equal(visibility(state,0)[10*24+14],false,'預覽偵察仍基礎視野3，不含未裁決加成');
});

test('盾衛實際降低 plain 傷害、cover 維持最低傷害1；相同行動仍唯一 reducer', () => {
  for(const [terrain,kind,want] of [['plain','shieldGuard',8],['plain','infantry',7],['forest','shieldGuard',9]] as const){
    let s=preview();s.terrain.fill('plain');s.relics=[];s.sites=[];
    s.units=[{...s.units[0],x:10,y:10},{...s.units[2],x:11,y:10,kind:kind as typeof s.units[2]['kind']}];
    s.terrain[10*24+11]=terrain;
    s=play(s,{type:'Attack',unitId:'兵-0',targetId:'兵-2'});
    assert.equal(s.units.find(u=>u.id==='兵-2')!.hp,want);
  }
  let s=preview();s.terrain.fill('plain');s.relics=[];s.sites=[];
  s.units=[{...s.units[0],kind:'shieldGuard' as typeof s.units[0]['kind'],x:10,y:10},{...s.units[2],kind:'shieldGuard' as typeof s.units[2]['kind'],x:11,y:10}];
  s.terrain[10*24+11]='forest';s=play(s,{type:'Attack',unitId:'兵-0',targetId:'兵-2'});
  assert.equal(s.units.find(u=>u.id==='兵-2')!.hp,9);
});
