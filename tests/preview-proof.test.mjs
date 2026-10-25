import test from 'node:test';
import assert from 'node:assert/strict';
import * as proof from '../scripts/release-proof.mjs';
const artifacts={'index.html':'a'.repeat(64)};
function fixture(kind){const ids=kind==='preview'?['desktop-preview-legal-journey','phone-preview-legal-journey']:['desktop-demo03-preview-1-cross-import-next-game','desktop-g1-ccts-1-cross-import-next-game','phone-demo03-preview-1-cross-import-next-game','phone-g1-ccts-1-cross-import-next-game'];return {status:'PASS',artifacts,errors:[],failures:[],cleanup:[{stage:'browser.close',status:'PASS'},{stage:'private-artifacts',status:'PASS',rootAbsent:true,remainingBefore:0}],scenarios:ids.map(id=>({id,status:'TESTED_PASS',simulatedTouch:id.startsWith('phone'),...(kind==='preview'?{humanCommands:20,research:['defensiveEngineering','pathfinding','militaryMobility'],recruited:['shieldGuard','mobileScout'],threeTileMove:true,legacySlotUnchanged:true,saveLoadReplay:true}:{loadedRuleset:id.includes('g1-ccts-1')?'demo03-preview-1':'g1-ccts-1',newGameRuleset:id.includes('g1-ccts-1')?'g1-ccts-1':'demo03-preview-1',menuCaptionVerified:true,recordCaptionAndConfirmationVerified:true})}))};}
test('preview verifier accepts both complete same-build identity sets',()=>{
 for(const kind of['preview','preview-version'])assert.doesNotThrow(()=>proof.validatePreviewProof(fixture(kind),kind,artifacts));
});
test('preview verifier rejects missing/duplicate IDs, wrong build, errors, cleanup residue and weakened real-action proof',()=>{
 const changes=[v=>v.scenarios.pop(),v=>v.scenarios[1].id=v.scenarios[0].id,v=>v.scenarios[0].status='UNVERIFIED',v=>v.artifacts={'index.html':'b'.repeat(64)},v=>v.errors.push('failure'),v=>v.failures.push({kind:'CLEANUP_FAILURE'}),v=>v.cleanup[1].rootAbsent=false,v=>v.cleanup[1].remainingBefore=1,v=>v.scenarios[0].humanCommands=221,v=>v.scenarios[0].saveLoadReplay=false,v=>v.scenarios[0].threeTileMove=false,v=>v.scenarios[0].legacySlotUnchanged=false,v=>v.scenarios[1].simulatedTouch=false,v=>v.scenarios[0].research.pop()];
 for(const change of changes){const v=structuredClone(fixture('preview'));change(v);assert.throws(()=>proof.validatePreviewProof(v,'preview',artifacts));}
});
test('cross-version verifier rejects false pairing or missing prior disclosure',()=>{
 for(const change of[v=>v.scenarios[0].loadedRuleset='demo03-preview-1',v=>v.scenarios[0].newGameRuleset='g1-ccts-1',v=>v.scenarios[0].menuCaptionVerified=false,v=>v.scenarios[0].recordCaptionAndConfirmationVerified=false]){const v=fixture('preview-version');change(v);assert.throws(()=>proof.validatePreviewProof(v,'preview-version',artifacts));}
 assert.throws(()=>proof.validatePreviewProof(fixture('preview'),'unknown',artifacts));
});
