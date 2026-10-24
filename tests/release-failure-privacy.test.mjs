import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import * as proof from '../scripts/release-proof.mjs';
const summary=proof.publicVerificationSummary??(x=>x);
test('public verifier failure summary strips raw primary and cleanup error details',()=>{
 const path=['','Users','example','private'].join('/');
 const safe=summary({status:'FAIL',primaryFailure:'EACCES '+path,failedStage:'browser',cleanup:[{stage:'owned-server',status:'FAIL',message:'EACCES '+path}],privateDetail:path});
 assert.ok(!JSON.stringify(safe).includes(path));assert.ok(!JSON.stringify(safe).includes('EACCES'));assert.deepEqual(safe.primaryFailure,{kind:'PRIMARY_TEST_FAILURE',stage:'browser',code:'GATE_FAILED'});assert.equal(safe.cleanup[0].status,'FAIL');
});
test('verifier initialization collision exits nonzero without public path or stack',t=>{
 const root=mkdtempSync(join(tmpdir(),'project4x-existing-evidence-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 const cli=fileURLToPath(new URL('../scripts/verify-demo02.mjs',import.meta.url));
 const result=spawnSync(process.execPath,[cli],{encoding:'utf8',env:{...process.env,PROJECT4X_EVIDENCE_DIR:root}});
 assert.equal(result.status,1);assert.ok(!result.stdout.includes(root));assert.ok(!result.stderr.includes(root));assert.ok(!result.stderr.includes('at file:'));
 const receipt=JSON.parse(result.stdout);assert.equal(receipt.primaryFailure.code,'INITIALIZATION_FAILED');
});
test('successful public command receipts do not expose a home-installed Node path',()=>{
 const binary=['','Users','example','.nvm','node'].join('/');
 const safe=summary({status:'PASS',checks:[{label:'check',command:[binary,'scripts/check.mjs'],exitCode:0}],cleanup:[],primaryFailure:null});
 assert.ok(!JSON.stringify(safe).includes(binary));assert.equal(safe.checks[0].command[0],'node');
});
