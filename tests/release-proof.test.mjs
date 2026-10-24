import test from 'node:test';import assert from 'node:assert/strict';
import {validateClientProof,publicClientSummary,validateUpdateProof} from '../scripts/release-proof.mjs';
const artifacts={'index.html':'sha'};
const ids={demo:['desktop-load-prevalidation-and-intent-cancellation','desktop-real-exploration-journal-save-load','phone-load-prevalidation-and-intent-cancellation','phone-real-exploration-journal-save-load'],pwa:['manifest-installability-static-only-cache','offline-reload-real-world-local-save-load']};
const fixture=kind=>({status:'PASS',artifacts,errors:[],failures:[],scenarios:ids[kind].map(id=>({id,status:'TESTED_PASS'})),artifactCleanupResult:'PASS',cleanup:kind==='demo'?[{stage:'desktop.close',status:'PASS'},{stage:'phone.close',status:'PASS'},{stage:'browser.close',status:'PASS'},{stage:'private-artifacts',status:'PASS',rootAbsent:true}]:[{stage:'context.close',status:'PASS'},{stage:'owned-profile',status:'PASS',rootAbsent:true}]});
test('release verifier requires identities, complete fresh build, failures and cleanup evidence',()=>{
 for(const kind of ['demo','pwa']){
  const value=fixture(kind);assert.doesNotThrow(()=>validateClientProof(value,kind,artifacts));
  for(const mutate of [v=>v.scenarios.pop(),v=>v.scenarios.push(v.scenarios[0]),v=>v.artifacts={'index.html':'old'},v=>v.failures.push({kind:'CLEANUP_FAILURE'}),v=>v.cleanup=[],v=>v.cleanup[0].status='FAIL',v=>v.errors.push('unexpected')]){const bad=structuredClone(value);mutate(bad);assert.throws(()=>validateClientProof(bad,kind,artifacts));}
 }
});
test('release verifier refuses vacuous and forged success summaries',()=>{
 for(const value of [null,{},fixture('demo')])assert.throws(()=>validateClientProof(value,'unknown',artifacts));
 const v=fixture('demo');v.status='FAIL';assert.throws(()=>validateClientProof(v,'demo',artifacts));v.status='PASS';v.scenarios[0].status='UNVERIFIED';assert.throws(()=>validateClientProof(v,'demo',artifacts));
});
test('public release summaries never forward raw traces, errors or private data',()=>{
 const v=fixture('demo');v.trace=['private-world'];v.localPath=['','Users','example','secret'].join('/');v.scenarios[0].observation={hidden:true};
 const safe=publicClientSummary(v,'demo');assert.equal(safe.kind,'demo');assert.equal(safe.scenarioCount,4);assert.ok(!JSON.stringify(safe).includes('private-world'));assert.ok(!JSON.stringify(safe).includes('localPath'));assert.ok(!JSON.stringify(safe).includes('observation'));
});

test('PWA update proof requires an actual waiting and activation result for this revision',()=>{
 const v={status:'PASS',waitingWithOldClient:'TESTED_PASS',activationAfterOldClientsClosed:'TESTED_PASS',cleanup:'PASS',revisions:{a:'current',b:'new'}};assert.doesNotThrow(()=>validateUpdateProof(v,'current'));
 for(const mutate of [x=>x.revisions.a='old',x=>x.revisions.b='current',x=>x.waitingWithOldClient='UNVERIFIED',x=>x.activationAfterOldClientsClosed='FAIL',x=>x.cleanup='FAIL']){const bad=structuredClone(v);mutate(bad);assert.throws(()=>validateUpdateProof(bad,'current'));}
});
