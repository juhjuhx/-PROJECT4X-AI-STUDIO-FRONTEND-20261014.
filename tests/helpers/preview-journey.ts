import assert from 'node:assert/strict';
import { createGame, applyCommand, legalActions } from '../../src/core/game';
import type { Action, GameState } from '../../src/core/types';

/** 全部經原 reducer 的合成新局；不修改 gold/terrain/knowledge 當合法存檔。 */
export function createPreviewJourney(): GameState {
  let state=createGame('預覽合法持久旅程','demo03-preview-1');
  function play(action: Action): void {
    const result=applyCommand(state,{actor:state.active,requestId:`preview-journey-${state.version}`,expectedVersion:state.version,action});
    assert.equal(result.ok,true,result.error ?? '合法預覽旅程');state=result.state;
  }
  function resolve(): void { if(state.pendingRelic) play({type:'ResolveRelic',choice:'gold'}); }
  function budget(cost: number): void {
    for(let i=0;state.factions[0].gold<cost&&i<20;i++){
      resolve();play({type:'EndTurn'});resolve();play({type:'EndTurn'});resolve();
    }
    assert.ok(state.factions[0].gold>=cost);
  }
  play({type:'Research',tech:'defensiveEngineering'});
  const leave=legalActions(state,0).find(a=>a.type==='Move'&&a.unitId==='兵-0');assert.ok(leave);play(leave);resolve();
  budget(6);play({type:'Recruit',siteId:'首都-0',kind:'shieldGuard'});
  budget(4);play({type:'Research',tech:'pathfinding'});resolve();
  budget(6);play({type:'Research',tech:'militaryMobility'});
  budget(7);
  const guard=state.units.find(u=>u.kind==='shieldGuard')!;
  const clear=legalActions(state,0).find(a=>a.type==='Move'&&a.unitId===guard.id);assert.ok(clear);play(clear);resolve();
  play({type:'Recruit',siteId:'首都-0',kind:'mobileScout'});
  return state;
}
