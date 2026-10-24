import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {artifactHashes} from './artifact-proof.mjs';
import {privateSave,reserveBrowserEvidence,cleanupBrowserArtifacts,failureRecords} from './qa-download.mjs';
import {deserializeGame} from '../src/core/persistence.ts';
import {canonicalHash} from '../src/core/game.ts';
const base=process.env.PROJECT4X_URL||'http://127.0.0.1:4173',dir=resolve(process.env.PROJECT4X_EVIDENCE_DIR||'../evidence/demo-'+Date.now());
await mkdir(dir,{recursive:true});await reserveBrowserEvidence(dir);
const evidence={status:'RUNNING',scenarios:[],errors:[],failures:[],cleanup:[],artifacts:artifactHashes(resolve('dist')),generatedAt:new Date().toISOString()};
let browser,root;const contexts=[];
const fail=(error,kind='PRIMARY_TEST_FAILURE',stage='demo')=>evidence.failures.push(...failureRecords(error,kind,stage).map(f=>({kind:f.kind,stage:f.stage,message:f.error?.message??String(f.error),stack:f.error?.stack})));
try{
 root=await mkdtemp(resolve(tmpdir(),'project4x-browser-'));evidence.ownedArtifactRoot=root;const downloads=resolve(root,'downloads');await mkdir(downloads,{mode:0o700});
 browser=await chromium.launch({headless:true,downloadsPath:downloads,...(process.env.PROJECT4X_CHROMIUM_PATH?{executablePath:process.env.PROJECT4X_CHROMIUM_PATH}:{})});
 for(const [label,width,height,mobile] of [['desktop',1440,960,false],['phone',375,812,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,acceptDownloads:true,reducedMotion:'reduce'});contexts.push(context);
  const page=await context.newPage();
  page.on('pageerror',e=>evidence.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')evidence.errors.push(m.text());});
  page.setDefaultTimeout(6000);
  const press=locator=>mobile?locator.tap():locator.click();
  await page.goto(base);
  const menu=page.getByRole('dialog',{name:'霧境初航 · 探索Demo',exact:true});await menu.waitFor({state:'visible',timeout:4000});
  await page.screenshot({path:resolve(dir,label+'-menu.png'),fullPage:true});
  assert.equal(await menu.getByRole('button',{name:'保存目前航程',exact:true}).isVisible(),false,'pre-start save must not bypass menu');
  await press(menu.getByRole('button',{name:'探索手札',exact:true}));
  await press(page.getByRole('dialog',{name:'第一份觀測紀錄',exact:true}).getByRole('button',{name:'返回主選單',exact:true}));
  await menu.waitFor({state:'visible'});
  await press(menu.getByRole('button',{name:'玩法指南',exact:true}));
  await press(page.locator('.help-dialog').getByRole('button',{name:'關閉',exact:true}));
  await menu.waitFor({state:'visible'});
  await press(menu.getByRole('button',{name:'開始探索Demo',exact:true}));
  await menu.waitFor({state:'hidden'});await press(page.locator('.unit-row').filter({hasText:'斥候'}));
  await press(page.locator('.move-list summary'));await press(page.locator('.tile-actions').getByRole('button',{name:'6 · 4',exact:true}));
  await page.locator('.relic-dialog').waitFor({state:'visible'});
  await press(page.locator('.relic-dialog').getByRole('button',{name:/解讀地形/}));
  await page.locator('.relic-dialog').waitFor({state:'hidden'});
  if(mobile)await press(page.getByRole('tab',{name:'科技研發',exact:true}));
  await press(page.locator('.tech-row').filter({hasText:'耕作'}).getByRole('button',{name:'5 金',exact:true}));
  await page.waitForFunction(()=>document.querySelector('.demo-progress')?.getAttribute('data-complete')==='true');
  const completed=deserializeGame(await privateSave(page));assert.equal(completed.winner,null);
  assert.ok(completed.history.some(c=>c.actor===0&&c.action.type==='Move'));
  assert.ok(completed.history.some(c=>c.actor===0&&c.action.type==='ResolveRelic'&&c.action.choice==='intel'));
  assert.ok(completed.history.some(c=>c.actor===0&&c.action.type==='Research'&&c.action.tech==='farm'));
  if(mobile)await press(page.getByRole('tab',{name:'城邦手札',exact:true}));
  await press(page.locator('.demo-progress').getByRole('button',{name:'閱讀探索手札',exact:true}));
  const journal=page.getByRole('dialog',{name:'第一份觀測紀錄',exact:true});await journal.waitFor({state:'visible'});
  assert.match(await journal.innerText(),/這不是對戰勝利/);assert.match(await journal.innerText(),/3 格/);
  await page.screenshot({path:resolve(dir,label+'-journal.png'),fullPage:true});
  await press(journal.getByRole('button',{name:'繼續探索',exact:true}));
  const continued=deserializeGame(await privateSave(page));assert.equal(canonicalHash(continued),canonicalHash(completed));
  await press(page.getByRole('button',{name:'航行紀錄',exact:true}));await press(page.getByRole('button',{name:'保存進度',exact:true}));
  await page.waitForFunction(()=>!!localStorage.getItem('project4x-demo-progress-1'));
  await page.reload();await menu.waitFor({state:'visible'});
  for(const cancel of ['journal','new-game']){
   await page.evaluate(()=>{
    const native=crypto.subtle.digest.bind(crypto.subtle);window.__demoDigestPending=false;window.__demoDigestDone=false;
    Object.defineProperty(crypto.subtle,'digest',{configurable:true,value:(...args)=>{
     delete crypto.subtle.digest;window.__demoDigestPending=true;
     return new Promise((resolve,reject)=>{window.__releaseDemoDigest=()=>native(...args).then(value=>{resolve(value);window.__demoDigestDone=true;},reject);});
    }});
   });
   await press(menu.getByRole('button',{name:'接續保存航程',exact:true}));
   await page.waitForFunction(()=>window.__demoDigestPending);
   assert.equal(await page.locator('.resource-value').first().innerText(),'8','world must not replace before companion prevalidation completes');
   if(cancel==='journal'){
    await press(menu.getByRole('button',{name:'探索手札',exact:true}));
    await press(page.getByRole('dialog',{name:'第一份觀測紀錄',exact:true}).getByRole('button',{name:'返回主選單',exact:true}));
   }else{
    await menu.getByLabel('世界種子',{exact:true}).fill('霧境初航-01');
    await press(menu.getByRole('button',{name:'開始探索Demo',exact:true}));await menu.waitFor({state:'hidden'});
    await press(page.getByRole('button',{name:'選單',exact:true}));
   }
   await page.evaluate(()=>window.__releaseDemoDigest());await page.waitForFunction(()=>window.__demoDigestDone);
   assert.equal(await menu.isVisible(),true,'stale load callback must not close current menu');
   assert.equal(await menu.getByRole('alert').innerText(),'','stale load callback must not report failure into another intent');
   assert.equal(await page.locator('.resource-value').first().innerText(),'8','cancelled load must preserve current world');
  }
  evidence.scenarios.push({id:label+'-load-prevalidation-and-intent-cancellation',status:'TESTED_PASS',controlledInstrumentation:'native SHA digest deferred in QA only, real algorithm and core unchanged'});

  page.once('dialog',async dialog=>{assert.equal(dialog.type(),'confirm');assert.match(dialog.message(),/未保存/);await dialog.accept();});
  await press(menu.getByRole('button',{name:'接續保存航程',exact:true}));await menu.waitFor({state:'hidden'});
  await page.waitForFunction(()=>document.querySelector('.demo-progress')?.getAttribute('data-complete')==='true');
  const loaded=deserializeGame(await privateSave(page));assert.equal(canonicalHash(loaded),canonicalHash(completed));
  assert.equal(loaded.schema,'project4x-save-1');assert.equal(loaded.ruleset,'g1-ccts-1');assert.equal(loaded.winner,null);
  evidence.scenarios.push({id:label+'-real-exploration-journal-save-load',status:'TESTED_PASS',viewport:{width,height},simulatedTouch:mobile,commands:loaded.history.length,canonicalHash:canonicalHash(loaded),militaryWinner:null});
  await context.close();contexts.splice(contexts.indexOf(context),1);evidence.cleanup.push({stage:label+'.close',status:'PASS'});
 }
 assert.deepEqual(evidence.errors,[]);evidence.status='PASS';
}catch(error){fail(error);evidence.status='FAIL';}
finally{
 for(const c of contexts)try{await c.close();}catch(e){fail(e,'CLEANUP_FAILURE','context.close');}
 try{await browser?.close();evidence.cleanup.push({stage:'browser.close',status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE','browser.close');}
 try{const receipt=await cleanupBrowserArtifacts(root,!browser?.isConnected());evidence.cleanup.push({stage:'private-artifacts',...receipt,status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE','private-artifacts');}
 evidence.artifactCleanupResult=evidence.failures.some(f=>f.kind==='CLEANUP_FAILURE')?'FAIL':'PASS';
 if(evidence.failures.length)evidence.status='FAIL';
 await writeFile(resolve(dir,'demo.json'),JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:evidence.status,scenarios:evidence.scenarios,failures:evidence.failures,artifactCleanupResult:evidence.artifactCleanupResult}));
 if(evidence.status!=='PASS')process.exitCode=1;
}
