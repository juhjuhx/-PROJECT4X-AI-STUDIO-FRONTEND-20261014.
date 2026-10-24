import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../scripts/check-publication.mjs',import.meta.url));
function fixture(t){const root=mkdtempSync(join(tmpdir(),'project4x-publication-test-'));t.after(()=>rmSync(root,{recursive:true,force:true}));execFileSync('git',['init','--quiet',root]);return root;}
test('publication CLI scans historical logs and does not echo sensitive matches',t=>{
 const root=fixture(t),value=['','Users','example','Desktop','private'].join('/');
 writeFileSync(join(root,'history.log'),value+'\n'+['ghp','x'.repeat(36)].join('_'));
 const result=spawnSync(process.execPath,[cli,root],{encoding:'utf8'});assert.equal(result.status,1);
 const evidence=JSON.parse(result.stdout);assert.ok(evidence.issues.some(x=>x.code==='LOCAL_PATH'));assert.ok(evidence.issues.some(x=>x.code==='SECRET'));assert.ok(!result.stdout.includes(value));
});
test('publication CLI rejects canonical world embedded in a JSONL record',t=>{
 const root=fixture(t);writeFileSync(join(root,'decisions.jsonl'),JSON.stringify({debug:{terrain:['plain'],units:[],history:[]}})+'\n');
 const result=spawnSync(process.execPath,[cli,root],{encoding:'utf8'});assert.equal(result.status,1);assert.ok(JSON.parse(result.stdout).issues.some(x=>x.code==='CANONICAL_WORLD'));
});
