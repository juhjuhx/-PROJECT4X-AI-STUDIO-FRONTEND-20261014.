import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm,lstat} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import vm from 'node:vm';
import * as qa from '../scripts/qa-download.mjs';
const source=readFileSync(new URL('../scripts/browser-check.mjs',import.meta.url),'utf8');
const legacy=source.slice(source.indexOf('    const remaining=await readdir(downloadsPath);'),source.indexOf("  } catch(error) {addFailure(error,'CLEANUP_FAILURE','downloads.directory-check');}"));
const cleanup=qa.cleanupBrowserArtifacts??(async(root,disconnected)=>vm.runInNewContext('(async()=>{'+legacy+'})()',{downloadsPath:join(root,'downloads'),browserRunRoot:root,evidence:{browserDisconnected:disconnected},assert,readdir,rm,cleanupReceipts:[]}));
const reserve=qa.reserveBrowserEvidence??(async()=>{});
const emit=qa.emitQaEvidence??(async(evidence,persist,output)=>{await persist(evidence);output(evidence)});
test('browser清理：殘留必須FAIL，但斷線後仍移除本輪私有檔案',async()=>{
 const root=await mkdtemp(join(tmpdir(),'project4x-browser-test-'));await mkdir(join(root,'downloads'));await writeFile(join(root,'downloads','private.json'),'private fixture');
 try{
  await assert.rejects(()=>cleanup(root,true));
  await assert.rejects(()=>lstat(root),{code:'ENOENT'});
 }finally{await rm(root,{recursive:true,force:true});}
});
test('browser清理：browser仍連線時不刪其檔案',async()=>{
 const root=await mkdtemp(join(tmpdir(),'project4x-browser-test-'));await mkdir(join(root,'downloads'));
 try{await assert.rejects(()=>cleanup(root,false));assert.ok(await lstat(root));}
 finally{await rm(root,{recursive:true});}
});
test('browser證據：在開始前拒絕重用目錄，舊圖片與JSON不被覆寫',async()=>{
 const root=await mkdtemp(join(tmpdir(),'project4x-evidence-test-'));
 try{
  await writeFile(join(root,'browser.json'),'old report');await writeFile(join(root,'桌面初局.png'),'old pixels');
  await assert.rejects(()=>reserve(root));
  assert.equal(await readFile(join(root,'browser.json'),'utf8'),'old report');
  assert.equal(await readFile(join(root,'桌面初局.png'),'utf8'),'old pixels');
 }finally{await rm(root,{recursive:true});}
});
test('browser證據：並行預留相同輸出空間只有一個成功',async()=>{
 const root=await mkdtemp(join(tmpdir(),'project4x-evidence-test-'));
 try{const r=await Promise.allSettled([reserve(root),reserve(root)]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);}
 finally{await rm(root,{recursive:true});}
});
test('browser收據：落盤失敗仍保留首敗及cleanup錯誤並嘗試stdout',async()=>{
 const e={status:'FAIL',failures:[{kind:'PRIMARY_TEST_FAILURE',stage:'assertion',message:'original'}]};let output;
 await emit(e,async()=>{throw Object.assign(new Error('full'),{code:'ENOSPC'})},v=>{output=structuredClone(v)});
 assert.equal(output.failures[0].message,'original');
 assert.ok(output.failures.some(x=>x.kind==='CLEANUP_FAILURE'&&x.stage==='evidence.write'));
 assert.equal(output.status,'FAIL');
});

