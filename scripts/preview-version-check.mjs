// Ruling/finding regression: the loaded world's rules and the next-game factory are separate.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {artifactHashes} from './artifact-proof.mjs';
import {reserveBrowserEvidence,useDownload,cleanupBrowserArtifacts,failureRecords} from './qa-download.mjs';
import {createGame} from '../src/core/game.ts';
import {serializeGame,deserializeGame} from '../src/core/persistence.ts';
const base=process.env.PROJECT4X_URL||'http://127.0.0.1:4173',dir=resolve(process.env.PROJECT4X_EVIDENCE_DIR||await mkdtemp(resolve(tmpdir(),'project4x-version-proof-')));
await mkdir(dir,{recursive:true});await reserveBrowserEvidence(dir);
const proof={status:'RUNNING',scenarios:[],errors:[],failures:[],cleanup:[],artifacts:artifactHashes(resolve('dist'))};
let browser,root;const contexts=[];
const fail=(e,kind='PRIMARY_TEST_FAILURE',stage='version-presentation')=>proof.failures.push(...failureRecords(e,kind,stage).map(f=>({kind:f.kind,stage:f.stage,message:f.error?.message??String(f.error)})));
try{
 root=await mkdtemp(resolve(tmpdir(),'project4x-browser-'));await mkdir(resolve(root,'downloads'));
 browser=await chromium.launch({headless:true,downloadsPath:resolve(root,'downloads'),...(process.env.PROJECT4X_CHROMIUM_PATH?{executablePath:process.env.PROJECT4X_CHROMIUM_PATH}:{})});
 for(const mobile of[false,true])for(const factory of['demo03-preview-1','g1-ccts-1']){
  const context=await browser.newContext({viewport:mobile?{width:375,height:812}:{width:1440,height:960},hasTouch:mobile,isMobile:mobile,acceptDownloads:true,reducedMotion:'reduce'});contexts.push(context);
  const page=await context.newPage(),dialogs=[];page.setDefaultTimeout(5000);page.on('dialog',d=>{dialogs.push(d.message());return d.accept();});
  page.on('pageerror',e=>proof.errors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))proof.errors.push(m.text());});
  const press=l=>mobile?l.tap():l.click(),menu=page.locator('.demo-menu'),record=page.locator('.record-dialog');
  const label=factory==='demo03-preview-1'?'Demo03隔離預覽':'G1既有規則',other=factory==='demo03-preview-1'?'g1-ccts-1':'demo03-preview-1';
  async function openRecord(){await press(page.getByRole('button',{name:'航行紀錄',exact:true}));}
  async function exported(){await openRecord();const text=await useDownload(page,()=>press(record.getByRole('button',{name:'匯出保存',exact:true})),(_d,p)=>readFile(p,'utf8'));await press(record.getByRole('button',{name:'關閉',exact:true}));return deserializeGame(text);}
  async function importOther(){await openRecord();await record.locator('input[type=file]').first().setInputFiles({name:'known-other-save.json',mimeType:'application/json',buffer:Buffer.from(serializeGame(createGame('合法跨版本匯入',other)))});await record.waitFor({state:'hidden'});assert.equal((await exported()).ruleset,other);}
  await page.goto(base+(factory==='demo03-preview-1'?'/?preview=demo03':'/'));await press(menu.locator('.demo-choices .primary-button'));
  await importOther();await press(page.getByRole('button',{name:'選單',exact:true}));
  assert.equal(await menu.locator('.next-game-ruleset').count(),1,'開始前必須說明下一新局規則');assert.match(await menu.locator('.next-game-ruleset').innerText(),new RegExp(label));
  assert.match(await menu.locator('.demo-choices .primary-button').innerText(),factory==='demo03-preview-1'?/Demo03隔離預覽/:/探索Demo/);
  await press(menu.locator('.demo-choices .primary-button'));assert.equal((await exported()).ruleset,factory);
  await importOther();await openRecord();assert.match(await record.locator('.next-game-ruleset').innerText(),new RegExp(label));
  await record.locator('#world-seed').fill('record-next-'+factory);await press(record.locator('.danger-button'));await record.waitFor({state:'hidden'});
  assert.match(dialogs.at(-1),new RegExp(label));assert.equal((await exported()).ruleset,factory);
  proof.scenarios.push({id:(mobile?'phone':'desktop')+'-'+factory+'-cross-import-next-game',status:'TESTED_PASS',loadedRuleset:other,newGameRuleset:factory,menuCaptionVerified:true,recordCaptionAndConfirmationVerified:true,simulatedTouch:mobile});
  await context.close();contexts.splice(contexts.indexOf(context),1);
 }
 assert.deepEqual(proof.errors,[]);proof.status='PASS';
}catch(e){fail(e);proof.status='FAIL';}
finally{
 for(const c of contexts)try{await c.close();}catch(e){fail(e,'CLEANUP_FAILURE','context.close');}
 try{await browser?.close();proof.cleanup.push({stage:'browser.close',status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE','browser.close');}
 try{const r=await cleanupBrowserArtifacts(root,!browser?.isConnected());proof.cleanup.push({stage:'private-artifacts',...r,status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE','private-artifacts');}
 if(proof.failures.length)proof.status='FAIL';await writeFile(resolve(dir,'preview-version.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:proof.status,scenarios:proof.scenarios,cleanupPassed:proof.cleanup.every(x=>x.status==='PASS'),failureKinds:proof.failures.map(x=>x.kind)}));if(proof.status!=='PASS')process.exitCode=1;
}
