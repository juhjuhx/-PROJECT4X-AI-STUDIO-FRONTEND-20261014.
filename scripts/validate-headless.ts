import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {canonicalJson,validateFull100Rows} from './qa-ledger';
import {productSources,sourceHash,methodSources,methodHash,sha} from './qa-source';
const root=resolve(import.meta.dirname,'..');
const path=resolve(process.argv[2]);
const report=JSON.parse(readFileSync(path,'utf8'));
assert.equal(report.status,'PASS');assert.equal(report.sourceUnchanged,true);assert.equal(report.methodUnchanged,true);
const identity=JSON.parse(readFileSync(resolve(report.ledgerPath,'manifest.json'),'utf8'));
assert.equal(canonicalJson(identity),canonicalJson(report.roundIdentity));
assert.equal(identity.sourceHash,sourceHash(productSources(root)));
assert.equal(identity.methodFingerprint,methodHash(methodSources(root),report.shadowPath?sha(readFileSync(report.shadowPath)):null));
const files=readdirSync(resolve(report.ledgerPath,'results')).filter(n=>/^\d{3}\.json$/.test(n)).sort();
const rows=files.map(name=>{const row=JSON.parse(readFileSync(resolve(report.ledgerPath,'results',name),'utf8'));assert.equal(name,String(row.seedNumber).padStart(3,'0')+'.json');return row;});
validateFull100Rows(rows,identity);
assert.equal(report.fixtures.length,2);assert.ok(report.fixtures.every((v:{status:string})=>v.status==='PASS'));
assert.equal(report.workerFailure,null);assert.equal(report.fixtureFailure,null);
assert.deepEqual(rows.map(r=>r.seed),report.games.map((r:{seed:string})=>r.seed));
for(let i=0;i<rows.length;i++) {const compact=structuredClone(rows[i]);delete compact.decisionMetrics.samplesMs;assert.deepEqual(compact,report.games[i]);}
console.log(JSON.stringify({status:'PASS',checked:rows.length,sourceHash:identity.sourceHash,methodFingerprint:identity.methodFingerprint,
 resultHashes:Object.fromEntries(files.map(file=>[file,sha(readFileSync(resolve(report.ledgerPath,'results',file)))]))}));
