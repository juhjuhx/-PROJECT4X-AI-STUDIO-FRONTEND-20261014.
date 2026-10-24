import {readFile, lstat, readdir, rm, writeFile} from 'node:fs/promises';
import {resolve,basename,dirname} from 'node:path';
import {tmpdir} from 'node:os';

export class QaLifecycleError extends AggregateError {
  constructor(failures) {
    super(failures.map(f=>f.error), failures.map(f=>`[${f.kind}:${f.stage}] ${f.error?.message ?? f.error}`).join('\n'));
    this.name='QaLifecycleError'; this.failures=failures;
    this.primaryFailure=failures.find(f=>f.kind==='PRIMARY_TEST_FAILURE') ?? null;
    this.cleanupFailures=failures.filter(f=>f.kind==='CLEANUP_FAILURE');
    this.cause=this.primaryFailure?.error ?? failures[0]?.error;
  }
}
export function failureRecords(error, kind='PRIMARY_TEST_FAILURE', stage='operation') {
  return error instanceof QaLifecycleError ? error.failures : [{kind,stage,error}];
}
export async function withQaCleanup(operation, cleanups) {
  const failures=[]; let value;
  try {value=await operation();} catch(error) {failures.push(...failureRecords(error));}
  for(const {stage,run} of cleanups) {
    try {await run();} catch(error) {failures.push(...failureRecords(error,'CLEANUP_FAILURE',stage));}
  }
  if(failures.length) throw new QaLifecycleError(failures);
  return value;
}

// 所有 waiter 在觸發前接上拒絕處理；consume、delete 與磁碟查驗屬同一生命週期。
export async function useDownload(page, trigger, consume) {
  let download, path;
  return withQaCleanup(async()=>{
    const acquisitionFailures=[];
    await Promise.allSettled([
      Promise.resolve().then(()=>page.waitForEvent('download')).then(value=>{download=value;}).catch(error=>acquisitionFailures.push({kind:'PRIMARY_TEST_FAILURE',stage:'download.wait',error})),
      Promise.resolve().then(trigger).catch(error=>acquisitionFailures.push({kind:'PRIMARY_TEST_FAILURE',stage:'download.trigger',error}))
    ]);
    if(acquisitionFailures.length)throw new QaLifecycleError(acquisitionFailures);
    path=await download.path();
    return consume(download,path);
  },[
    {stage:'download.delete',run:async()=>{if(download) await download.delete();}},
    {stage:'download.file-absence',run:async()=>{
      if(!path) return;
      try {await lstat(path);} catch(error) {if(error.code==='ENOENT')return;throw error;}
      throw new Error('download.delete resolved but private artifact still exists');
    }}
  ]);
}
export async function privateSave(page) {
  const dialog=page.locator('.record-dialog'); let opened=false;
  return withQaCleanup(async()=>{
    opened=!await dialog.isVisible();
    if(opened) await page.getByRole('button',{name:'航行紀錄',exact:true}).click();
    return useDownload(page,()=>dialog.getByRole('button',{name:'匯出保存',exact:true}).click(),(_download,path)=>readFile(path,'utf8'));
  },[{stage:'dialog.close',run:async()=>{
    if(opened)await dialog.getByRole('button',{name:'關閉',exact:true}).click();
  }}]);
}



// 先拒絕既有產物，再以exclusive claim避免並行run互相覆寫。
export async function reserveBrowserEvidence(directory) {
  for(const name of ['browser.json','桌面初局.png','遺跡選擇.png','真實戰鬥佔領旅程.png','手機直式.png','手機橫式.png','窄手機.png']) {
    try {await lstat(resolve(directory,name));} catch(error){if(error.code==='ENOENT')continue;throw error;}
    throw new Error('browser證據已存在，請使用新的run目錄：'+name);
  }
  await writeFile(resolve(directory,'.browser-run-claim.json'),JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}),{flag:'wx',mode:0o600});
}
export async function cleanupBrowserArtifacts(root,disconnected) {
  if(!root)return {rootAbsent:true,remainingBefore:0};
  // 此函式只接本輪mkdtemp建立的目錄；拒絕任意使用者路徑或仍在使用的browser。
  if(dirname(root)!==resolve(tmpdir())||!basename(root).startsWith('project4x-browser-'))
    throw new QaLifecycleError([{kind:'CLEANUP_FAILURE',stage:'downloads.scope',error:new Error('不是本輪browser暫存路徑')}]);
  if(!disconnected)throw new QaLifecycleError([{kind:'CLEANUP_FAILURE',stage:'browser.still-connected',error:new Error('browser仍在使用私有檔案')}]);
  const failures=[],receipt={remainingBefore:0,rootAbsent:false};
  try {
    const info=await lstat(root);if(info.isSymbolicLink())throw new Error('browser root不可為symlink');
  } catch(error) {if(error.code==='ENOENT')return {...receipt,rootAbsent:true};throw error;}
  try {
    receipt.remainingBefore=(await readdir(resolve(root,'downloads'))).length;
    if(receipt.remainingBefore)failures.push({kind:'CLEANUP_FAILURE',stage:'downloads.residue',error:new Error('私有下載殘留：'+receipt.remainingBefore)});
  } catch(error){if(error.code!=='ENOENT')failures.push({kind:'CLEANUP_FAILURE',stage:'downloads.inspect',error});}
  // 殘留檢查失敗仍獨立嘗試清除本輪root，原FAIL不可消失。
  try {await rm(root,{recursive:true});}catch(error){failures.push({kind:'CLEANUP_FAILURE',stage:'downloads.remove',error});}
  try {await lstat(root);failures.push({kind:'CLEANUP_FAILURE',stage:'downloads.absence',error:new Error('root仍存在')});}
  catch(error){if(error.code==='ENOENT')receipt.rootAbsent=true;else failures.push({kind:'CLEANUP_FAILURE',stage:'downloads.absence',error});}
  if(failures.length){const error=new QaLifecycleError(failures);error.cleanupReceipt=receipt;throw error;}
  return receipt;
}
export async function emitQaEvidence(evidence,persist,output) {
  try {await persist(evidence);}
  catch(error) {
    evidence.failures.push({kind:'CLEANUP_FAILURE',stage:'evidence.write',name:error.name,message:error.message,stack:error.stack});
    evidence.artifactCleanupResult='FAIL';evidence.status='FAIL';
  }
  output(evidence);
}
