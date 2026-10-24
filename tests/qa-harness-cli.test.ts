import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,chmodSync,rmSync,readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
test('CLI：private診斷寫入EACCES不丟失首次terminal row，續跑不可重做該seed',()=>{
 const dir=mkdtempSync(join(tmpdir(),'project4x-cli-failure-')),privateDir=join(dir,'private');
 mkdirSync(privateDir);chmodSync(privateDir,0o500);
 const env={...process.env,PROJECT4X_QA_START_SEED:'4',PROJECT4X_QA_GAMES:'1',PROJECT4X_QA_WORKERS:'1',
  PROJECT4X_QA_MAX_TURNS:'1',PROJECT4X_QA_MAX_COMMANDS:'100',PROJECT4X_QA_LEDGER:join(dir,'ledger'),PROJECT4X_QA_PRIVATE_DIR:privateDir};
 try {
  const run=(name:string)=>spawnSync(process.execPath,['--import','tsx','scripts/headless.ts'],{cwd:root,env:{...env,PROJECT4X_QA_OUTPUT:join(dir,name+'.json')},encoding:'utf8',timeout:30000});
  const first=run('first');assert.equal(first.status,1,first.stderr);
  const rowPath=join(dir,'ledger/results/004.json');assert.ok(existsSync(rowPath),'必須先提交terminal row，再嘗試private診斷');
  const before=readFileSync(rowPath);assert.equal(JSON.parse(before.toString()).status,'TURN_LIMIT');
  const count=readdirSync(join(dir,'ledger/attempts')).filter(n=>n.endsWith('.start.json')).length;
  const second=run('resume');assert.equal(second.status,1,'未解決的diagnostic failure不可被resume抹去');
  assert.deepEqual(readFileSync(rowPath),before);
  assert.equal(readdirSync(join(dir,'ledger/attempts')).filter(n=>n.endsWith('.start.json')).length,count);
 } finally {chmodSync(privateDir,0o700);rmSync(dir,{recursive:true,force:true});}
});
test('CLI：部分batch續接只跑缺seed，舊輸出與來源不符均拒絕',()=>{
 const dir=mkdtempSync(join(tmpdir(),'project4x-cli-resume-'));
 const env={...process.env,PROJECT4X_QA_START_SEED:'4',PROJECT4X_QA_WORKERS:'2',PROJECT4X_QA_MAX_TURNS:'1',PROJECT4X_QA_MAX_COMMANDS:'100',
  PROJECT4X_QA_LEDGER:join(dir,'ledger'),PROJECT4X_QA_PRIVATE_DIR:join(dir,'private')};
 const run=(name:string,count:string)=>spawnSync(process.execPath,['--import','tsx','scripts/headless.ts'],{cwd:root,env:{...env,PROJECT4X_QA_GAMES:count,PROJECT4X_QA_OUTPUT:join(dir,name+'.json')},encoding:'utf8',timeout:30000});
 try{
  assert.equal(run('first','2').status,1);const first=readFileSync(join(dir,'first.json'));
  const old=readFileSync(join(dir,'ledger/results/004.json'));
  writeFileSync(join(dir,'ledger/results/.interrupted.tmp'),'{');
  assert.equal(run('resume','3').status,1);
  assert.equal(JSON.parse(readFileSync(join(dir,'resume.json'),'utf8')).finishedGames,3);
  assert.deepEqual(readFileSync(join(dir,'ledger/results/004.json')),old);
  assert.equal(readdirSync(join(dir,'ledger/attempts')).filter(n=>n.endsWith('.start.json')).length,3);
  assert.ok(existsSync(join(dir,'ledger/results/.interrupted.tmp')));
  assert.equal(run('first','2').status,1);assert.deepEqual(readFileSync(join(dir,'first.json')),first);
  const manifest=join(dir,'ledger/manifest.json'),value=JSON.parse(readFileSync(manifest,'utf8'));value.sourceHash='c'.repeat(64);writeFileSync(manifest,JSON.stringify(value));
  const mixed=run('mixed','4');assert.equal(mixed.status,1);assert.match(mixed.stderr,/拒絕混合/);
  assert.equal(existsSync(join(dir,'ledger/results/007.json')),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
