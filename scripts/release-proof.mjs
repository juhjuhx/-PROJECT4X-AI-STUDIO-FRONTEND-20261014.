import assert from 'node:assert/strict';
import {basename} from 'node:path';
const required={
 demo:['desktop-load-prevalidation-and-intent-cancellation','desktop-real-exploration-journal-save-load','phone-load-prevalidation-and-intent-cancellation','phone-real-exploration-journal-save-load'],
 pwa:['manifest-installability-static-only-cache','offline-reload-real-world-local-save-load'],
};
export function validateClientProof(proof,kind,artifacts){
 assert.ok(Object.hasOwn(required,kind),'unknown proof kind');assert.equal(proof?.status,'PASS','client gate failed');
 assert.deepEqual(proof.artifacts,artifacts,'build bytes differ');assert.deepEqual(proof.errors,[],'browser errors');assert.deepEqual(proof.failures,[],'primary or cleanup failure');
 assert.ok(Array.isArray(proof.scenarios));assert.equal(proof.scenarios.length,required[kind].length,'scenario count');
 assert.equal(new Set(proof.scenarios.map(x=>x.id)).size,proof.scenarios.length,'duplicate scenario');
 for(const id of required[kind])assert.ok(proof.scenarios.some(x=>x.id===id&&x.status==='TESTED_PASS'),'missing passed scenario: '+id);
 const cleanup=proof.cleanup;assert.ok(Array.isArray(cleanup)&&cleanup.length>0,'cleanup absent');assert.ok(cleanup.every(x=>x.status==='PASS'),'cleanup failed');
 const stages=kind==='demo'?['desktop.close','phone.close','browser.close','private-artifacts']:['context.close','owned-profile'];
 for(const stage of stages)assert.equal(cleanup.filter(x=>x.stage===stage).length,1,'missing/duplicate cleanup stage');
 assert.equal(cleanup.find(x=>x.stage===(kind==='demo'?'private-artifacts':'owned-profile')).rootAbsent,true,'private profile/artifacts remain');
 if(kind==='demo')assert.equal(proof.artifactCleanupResult,'PASS');
}
export function publicClientSummary(proof,kind){
 return {kind,status:proof.status,scenarioCount:proof.scenarios.length,scenarios:proof.scenarios.map(({id,status})=>({id,status})),artifacts:proof.artifacts};
}

export function publicVerificationSummary(result){
 const {status,gate,checks,proofs,sourceUnchanged,sourceFingerprint,artifacts,human,physicalPhone}=result;
 return {status,gate,checks:checks?.map(check=>({...check,command:check.command?[basename(check.command[0]),...check.command.slice(1)]:undefined})),proofs,sourceUnchanged,sourceFingerprint,artifacts,human,physicalPhone,
  cleanup:result.cleanup?.map(({stage,status})=>({stage,status})),
  primaryFailure:result.primaryFailure?{kind:'PRIMARY_TEST_FAILURE',stage:result.failedStage??'verification',code:'GATE_FAILED'}:null};
}

export function validateUpdateProof(proof,expectedRevision){
 assert.equal(proof?.status,'PASS');assert.equal(proof.waitingWithOldClient,'TESTED_PASS');assert.equal(proof.activationAfterOldClientsClosed,'TESTED_PASS');assert.equal(proof.cleanup,'PASS');assert.equal(proof.revisions.a,expectedRevision);assert.equal(typeof proof.revisions.b,'string');assert.notEqual(proof.revisions.a,proof.revisions.b);
}
