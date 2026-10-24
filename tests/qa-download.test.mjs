import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, readFile, rm, unlink} from 'node:fs/promises';
import {readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import vm from 'node:vm';

// RED 時直接執行既有 entry 的真實函式；有可匯入 QA seam 後測同一 runtime。
const moduleURL = new URL('../scripts/qa-download.mjs', import.meta.url);
const qa = existsSync(moduleURL) ? await import(moduleURL) : {
  privateSave: vm.runInNewContext(
    readFileSync(new URL('../scripts/browser-check.mjs', import.meta.url), 'utf8')
      .match(/async function privateSave\(page\) \{[\s\S]*?\n\}/)[0] + '\nprivateSave',
    {readFile}
  )
};

async function fixture(options = {}) {
  const folder = await mkdtemp(join(tmpdir(), 'project4x-download-test-'));
  const path = join(folder, 'save.json'); await writeFile(path, '{"fixture":true}');
  const calls = []; let visible = false;
  const download = {
    path: async () => { calls.push('path'); if(options.primary) throw options.primary; return path; },
    delete: async () => { calls.push('delete'); if(options.cleanup) throw options.cleanup; await unlink(path); }
  };
  const dialog = {
    isVisible: async () => visible,
    getByRole: (_, {name}) => ({
      click: async () => {
        if(name==='關閉') { calls.push('close'); if(options.close) throw options.close; visible=false; }
        else { calls.push('export'); if(options.click) throw options.click; }
      }
    })
  };
  const page = {
    locator: () => dialog,
    getByRole: () => ({click: async () => { calls.push('open'); visible=true; }}),
    waitForEvent: () => options.click ? new Promise((_,reject)=>setTimeout(()=>reject(new Error('late waiter')),10)) : Promise.resolve(download)
  };
  return {folder,path,page,calls};
}

test('下載生命週期：原始失敗與兩項清理失敗都保留，關閉仍執行', async () => {
  const primary = new Error('PATH_PRIMARY'), cleanup = new Error('DELETE_SECONDARY'), close = new Error('DIALOG_SECONDARY');
  const f = await fixture({primary,cleanup,close});
  try {
    await assert.rejects(()=>qa.privateSave(f.page), e=>{
      assert.equal(e.primaryFailure?.error, primary);
      assert.deepEqual(e.cleanupFailures.map(x=>x.error),[cleanup,close]);
      assert.deepEqual(e.failures.map(x=>x.kind),['PRIMARY_TEST_FAILURE','CLEANUP_FAILURE','CLEANUP_FAILURE']);
      return true;
    });
    assert.ok(f.calls.includes('close'));
  } finally { await rm(f.folder,{recursive:true}); }
});

test('下載生命週期：成功讀取但delete失敗仍FAIL，不偽造primary failure', async () => {
  const cleanup = new Error('DELETE_FAILED'); const f=await fixture({cleanup});
  try {
    await assert.rejects(()=>qa.privateSave(f.page), e=>{
      assert.equal(e.primaryFailure, null);
      assert.equal(e.cleanupFailures[0].error,cleanup); return true;
    });
    assert.ok(f.calls.includes('close'));
  } finally {await rm(f.folder,{recursive:true});}
});

test('下載生命週期：成功下載真的讀回且私有檔案被移除', async () => {
  const f=await fixture();
  try {
    assert.equal(await qa.privateSave(f.page),'{"fixture":true}');
    await assert.rejects(()=>readFile(f.path),{code:'ENOENT'});
    assert.deepEqual(f.calls,['open','export','path','delete','close']);
  } finally {await rm(f.folder,{recursive:true});}
});

test('下載生命週期：匯出click失敗仍關閉對話框且晚到waiter不成unhandled rejection', async () => {
  const primary=new Error('CLICK_FAILED'),f=await fixture({click:primary});
  try {
    await assert.rejects(()=>qa.privateSave(f.page),e=>{assert.equal(e.primaryFailure?.error,primary);return true;});
    await new Promise(r=>setTimeout(r,20));
    assert.ok(f.calls.includes('close'));
  } finally {await rm(f.folder,{recursive:true});}
});



test('下載生命週期：同步trigger throw也須接住晚到waiter拒絕',async()=>{
 const primary=new Error('SYNC_TRIGGER');let late=false;
 const page={waitForEvent:()=>new Promise((_,reject)=>setTimeout(()=>{late=true;reject(new Error('LATE_WAITER'))},10))};
 await assert.rejects(()=>qa.useDownload(page,()=>{throw primary},()=>null),e=>{assert.equal(e.primaryFailure?.error,primary);return true});
 await new Promise(r=>setTimeout(r,25));assert.equal(late,true);
});
test('下載生命週期：已收到download但trigger拒絕，仍刪除取得的artifact',async()=>{
 const root=await mkdtemp(join(tmpdir(),'project4x-trigger-test-'));const path=join(root,'private.json');await writeFile(path,'private fixture');
 try{
  const d={path:async()=>path,delete:async()=>unlink(path)};
  await assert.rejects(()=>qa.useDownload({waitForEvent:()=>Promise.resolve(d)},async()=>{await Promise.resolve();throw new Error('TRIGGER_LATE')},()=>null));
  await assert.rejects(()=>readFile(path),{code:'ENOENT'});
 }finally{await rm(root,{recursive:true,force:true});}
});
test('下載生命週期：delete resolve但檔案存在必須FAIL',async()=>{
 const root=await mkdtemp(join(tmpdir(),'project4x-delete-test-'));const path=join(root,'private.json');await writeFile(path,'fixture');
 try{
  await assert.rejects(()=>qa.useDownload({waitForEvent:()=>Promise.resolve({path:async()=>path,delete:async()=>{}})},()=>Promise.resolve(),()=>null),e=>{assert.ok(e.cleanupFailures.some(x=>x.stage==='download.file-absence'));return true});
 }finally{await rm(root,{recursive:true});}
});
