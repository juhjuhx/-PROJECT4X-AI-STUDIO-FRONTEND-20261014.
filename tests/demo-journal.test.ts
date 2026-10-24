import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,observe,applyCommand,canonicalHash} from '../src/core/game';
import {createProgress,advanceProgress,completeProgress,parseProgress} from '../src/demo/progress';
import {parseNarrativePack,DEMO_PACK} from '../src/demo/content';
function fixture(){const s=createGame('demo-journal-test');s.terrain.fill('plain');s.relics=[{id:'journal-relic',x:5,y:3,claimedBy:null,resolved:false}];s.pendingRelic=null;return s;}
function play(s:ReturnType<typeof fixture>,action:any){const before=observe(s,0),r=applyCommand(s,{actor:0,requestId:'demo-'+s.version,expectedVersion:s.version,action});assert.ok(r.ok,r.error??'合法命令遭拒');return {before,after:observe(r.state,0),state:r.state};}
test('Demo journal derives real exploration/research/relic consequences without writing winner or core',()=>{
 let s=fixture(),progress=createProgress(observe(s,0));
 assert.equal(completeProgress(progress),false);
 for(const action of [{type:'Move',unitId:'兵-1',to:{x:5,y:3}},{type:'ResolveRelic',choice:'gold'},{type:'Research',tech:'pathfinding'}]){
  const r=play(s,action),hash=canonicalHash(r.state);progress=advanceProgress(progress,action as any,r.before,r.after);
  assert.equal(canonicalHash(r.state),hash);s=r.state;
 }
 assert.equal(completeProgress(progress),true);assert.equal(s.winner,null);assert.equal(s.ruleset,'g1-ccts-1');assert.equal(s.schema,'project4x-save-1');
});
test('unchanged or duplicate observation cannot manufacture progress; another seed resets journal',()=>{
 const s=fixture(),view=observe(s,0),p=createProgress(view),before=structuredClone(view);
 const q=advanceProgress(p,{type:'ResolveRelic',choice:'gold'},view,view);
 assert.deepEqual(q,p);assert.deepEqual(view,before);
 const different=structuredClone(view);different.seed='new';
 assert.equal(completeProgress(advanceProgress({...p,explored:true,relicChoice:'gold',researched:true},{type:'EndTurn'},view,different)),false);
});
test('narrative packs only allow versioned text/objectives; never authority gameplay effects',()=>{
 assert.equal(parseNarrativePack(DEMO_PACK).id,'mistbound.demo.first-observation');
 assert.throws(()=>parseNarrativePack({...DEMO_PACK,effects:['set-winner']}),/effects/);
 assert.throws(()=>parseNarrativePack({...DEMO_PACK,rulesets:['unknown-rule']}),/rulesets/);
 assert.throws(()=>parseNarrativePack({...DEMO_PACK,requiredAssets:['https://untrusted.invalid/x']}),/assets/);
});

test('journal accepts every legal core seed length, rejects invalid empty/oversize metadata',()=>{
 for(const size of [120,121,256]){const view=observe(createGame('x'.repeat(size)),0);assert.ok(parseProgress(createProgress(view)));}
 const p=createProgress(observe(fixture(),0));assert.equal(parseProgress({...p,seed:''}),null);assert.equal(parseProgress({...p,seed:'x'.repeat(257)}),null);
});
