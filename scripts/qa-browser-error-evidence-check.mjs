// Standalone real-browser regression for the QA error receipt contract.
// Requires the actual same-source build server and its unresolved 404 fixture.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
assert.ok(process.env.PROJECT4X_EVIDENCE_DIR,'Explicit unique evidence directory required');
assert.ok(process.env.PROJECT4X_URL,'Explicit same-build server required');
const out=resolve(process.env.PROJECT4X_EVIDENCE_DIR);mkdirSync(out,{recursive:false});
const driver=resolve(project,'scripts/browser-check.mjs'),evidence=join(out,'driver');
const result=spawnSync(process.execPath,['--import','tsx',driver],{
 cwd:project,env:{...process.env,PROJECT4X_EVIDENCE_DIR:evidence},encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024});
writeFileSync(join(out,'driver.log'),(result.stdout??'')+(result.stderr??''),{flag:'wx'});
assert.equal(result.error,undefined,result.error?.message);
const receipt=JSON.parse(readFileSync(join(evidence,'browser.json'),'utf8'));
assert.equal(result.status,1,'The missing resource must still FAIL the browser gate');
assert.equal(receipt.status,'FAIL');
assert.match(receipt.failure,/404/,'The real missing resource must be exercised');
assert.equal(receipt.artifactCleanupResult,'PASS');
assert.equal(receipt.browserDisconnected,true);
assert.equal(receipt.privateArtifactsRemaining,0);
assert.ok(receipt.errors.some(message=>message.includes('404')),'Desktop console errors must be retained in evidence.errors, not only in assertion stacks');
writeFileSync(join(out,'REGRESSION-PASS.json'),JSON.stringify({
 status:'TESTED_PASS',scope:'QA error receipt contract; browser gate remains TESTED_FAIL',
 driverExitCode:result.status,browserStatus:receipt.status,errors:receipt.errors,cleanup:receipt.artifactCleanupResult,
},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({regression:'PASS',browser:'FAIL',errorCount:receipt.errors.length,cleanup:'PASS'}));

