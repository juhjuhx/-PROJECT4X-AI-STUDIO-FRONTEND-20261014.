// 真 DOM/capability 旅程；完整下載檔只在本機 QA 記憶體核對，不送 HUD/公開收據。
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir,mkdtemp,readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { artifactHashes } from './artifact-proof.mjs';
import { reserveBrowserEvidence,useDownload,cleanupBrowserArtifacts,failureRecords } from './qa-download.mjs';
import { createGame,observe,canonicalHash } from '../src/core/game.ts';
import { serializeGame,deserializeGame,replayGame } from '../src/core/persistence.ts';
const base=process.env.PROJECT4X_URL||'http://127.0.0.1:4173';
const dir=resolve(process.env.PROJECT4X_EVIDENCE_DIR||await mkdtemp(resolve(tmpdir(),'project4x-preview-proof-')));
await mkdir(dir,{recursive:true});await reserveBrowserEvidence(dir);
const proof={status:'RUNNING',scenarios:[],errors:[],failures:[],cleanup:[],artifacts:artifactHashes(resolve('dist'))};
let browser,root,lastPage;const contexts=[];
const fail=(error,kind='PRIMARY_TEST_FAILURE',stage='preview')=>proof.failures.push(...failureRecords(error,kind,stage).map(f=>({kind:f.kind,stage:f.stage,message:f.error?.message??String(f.error),stack:f.error?.stack})));
try{
 const response=await fetch(base);assert.equal(response.status,200);
 assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),proof.artifacts['index.html']);
 root=await mkdtemp(resolve(tmpdir(),'project4x-browser-'));await mkdir(resolve(root,'downloads'));
 browser=await chromium.launch({headless:true,downloadsPath:resolve(root,'downloads'),...(process.env.PROJECT4X_CHROMIUM_PATH?{executablePath:process.env.PROJECT4X_CHROMIUM_PATH}:{})});
 for(const[id,width,height,mobile]of[['desktop',1440,960,false],['phone',375,812,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',acceptDownloads:true});contexts.push(context);
  const legacy=serializeGame(createGame('保留既有本機保存'));
  await context.addInitScript(text=>{if(!localStorage.getItem('project4x-save-1'))localStorage.setItem('project4x-save-1',text);},legacy);
  const page=await context.newPage();lastPage=page;page.setDefaultTimeout(6000);page.on('dialog',d=>d.accept());
  page.on('pageerror',e=>proof.errors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))proof.errors.push(m.text());});
  const press=l=>mobile?l.tap():l.click();
  const record=page.locator('.record-dialog');
  async function openRecord(){if(!await record.isVisible())await press(page.getByRole('button',{name:'航行紀錄',exact:true}));}
  async function closeRecord(){if(await record.isVisible())await press(record.getByRole('button',{name:'關閉',exact:true}));}
  async function exported(kind){await openRecord();const text=await useDownload(page,()=>press(record.getByRole('button',{name:kind==='save'?'匯出保存':'匯出回放',exact:true})),(_d,p)=>readFile(p,'utf8'));await closeRecord();return text;}
  const state=async()=>deserializeGame(await exported('save'));
  let commands=0;
  async function end(){assert.ok(++commands<=220,'預覽旅程也不放寬220玩家指令預算');const s=await state();await press(page.locator('.end-turn'));await page.waitForFunction(()=>!document.querySelector('.end-turn').disabled);const n=await state();assert.ok(n.version>s.version);assert.equal(n.active,0);assert.equal(n.winner,null);}
  async function budget(cost){for(let i=0;(await state()).factions[0].gold<cost&&i<20;i++)await end();assert.ok((await state()).factions[0].gold>=cost);}
  async function research(name,cost){if(await page.locator('#tab-tech').isVisible())await press(page.locator('#tab-tech'));const row=page.locator('.tech-row').filter({has:page.getByRole('heading',{name,exact:true})});await press(row.getByRole('button',{name:`${cost} 金`,exact:true}));commands++;}
  async function move(unit,action){if(await page.locator('#tab-inspect').isVisible())await press(page.locator('#tab-inspect'));await press(page.locator('.unit-row').filter({has:page.locator('strong').filter({hasText:unit})}).first());if(await page.locator('.move-list').getAttribute('open')===null)await press(page.locator('.move-list summary'));await press(page.locator('.tile-actions').getByRole('button',{name:`${action.to.x+1} · ${action.to.y+1}`,exact:true}));commands++;}
  await page.goto(base+'/?preview=demo03');
  assert.match(await page.locator('#demo-menu-title').innerText(),/隔離預覽/);
  await page.locator('#demo-world-seed').fill('預覽合法持久旅程');await press(page.locator('.demo-menu').getByRole('button',{name:'開始Demo03隔離預覽',exact:true}));
  assert.equal((await state()).ruleset,'demo03-preview-1');
  await research('防禦工程',7);assert.equal((await state()).factions[0].gold,1);
  let s=await state();const leave=observe(s,0).legalActions.find(a=>a.type==='Move'&&a.unitId==='兵-0');assert.ok(leave);await move('步兵',leave);
  await move('斥候',{type:'Move',to:{x:5,y:3}});await page.locator('.relic-dialog').waitFor({state:'visible'});await press(page.locator('.relic-dialog').getByRole('button',{name:/帶走金幣/}));commands++;
  await budget(6);if(await page.locator('#tab-inspect').isVisible())await press(page.locator('#tab-inspect'));await press(page.getByRole('button',{name:'中心',exact:true}));
  await press(page.getByRole('button',{name:'盾衛 · 6 金',exact:true}));commands++;
  s=await state();const guard=s.units.find(u=>u.kind==='shieldGuard');assert.ok(guard);assert.equal(guard.hp,10);assert.equal(guard.acted,true);
  assert.equal(observe(s,0).legalActions.some(a=>a.type==='Move'&&a.unitId===guard.id),false);
  await end();s=await state();const guardMove=observe(s,0).legalActions.find(a=>a.type==='Move'&&a.unitId===guard.id);assert.ok(guardMove);await move('盾衛',guardMove);
  await budget(4);await research('尋徑',4);await budget(6);await research('軍事機動',6);
  await budget(7);if(await page.locator('#tab-inspect').isVisible())await press(page.locator('#tab-inspect'));await press(page.getByRole('button',{name:'中心',exact:true}));
  await press(page.getByRole('button',{name:'機動偵察 · 7 金',exact:true}));commands++;
  await end();s=await state();const scout=s.units.find(u=>u.kind==='mobileScout');assert.ok(scout);
  const three=observe(s,0).legalActions.find(a=>a.type==='Move'&&a.unitId===scout.id&&Math.abs(a.to.x-scout.x)+Math.abs(a.to.y-scout.y)===3);assert.ok(three,'真實地圖必須找到合法三格路線');await move('機動偵察',three);
  const saved=await exported('save'),replay=await exported('replay');
  assert.equal(canonicalHash(deserializeGame(saved)),canonicalHash(replayGame(replay)));
  await openRecord();await press(record.getByRole('button',{name:'保存進度',exact:true}));await page.waitForFunction(()=>!!localStorage.getItem('project4x-demo03-preview-progress-1'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('project4x-save-1')),legacy);
  const sidecar=JSON.parse(await page.evaluate(()=>localStorage.getItem('project4x-demo03-preview-progress-1')));assert.equal(sidecar.packId,'mistbound.demo03.first-observation');
  await closeRecord();await page.reload();await page.locator('.demo-menu').waitFor({state:'visible'});await press(page.locator('.demo-menu').getByRole('button',{name:'接續保存航程',exact:true}));await page.locator('.demo-menu').waitFor({state:'hidden'});
  assert.equal(canonicalHash(await state()),canonicalHash(deserializeGame(saved)));
  await openRecord();const file=record.locator('input[type=file]').last();await file.setInputFiles({name:'preview-replay.json',mimeType:'application/json',buffer:Buffer.from(replay)});await page.waitForFunction(()=>document.querySelector('.replay-result').textContent.includes('project4x-replay-2'));
  assert.equal(canonicalHash(await state()),canonicalHash(deserializeGame(saved)));await closeRecord();
  await page.screenshot({path:resolve(dir,id+'-preview.png'),fullPage:true});
  proof.scenarios.push({id:id+'-preview-legal-journey',status:'TESTED_PASS',viewport:{width,height},simulatedTouch:mobile,humanCommands:commands,research:['defensiveEngineering','pathfinding','militaryMobility'],recruited:['shieldGuard','mobileScout'],threeTileMove:true,legacySlotUnchanged:true,saveLoadReplay:true});
  await context.close();contexts.splice(contexts.indexOf(context),1);proof.cleanup.push({stage:id+'.context',status:'PASS'});
 }
 assert.deepEqual(proof.errors,[]);proof.status='PASS';
}catch(error){fail(error);proof.status='FAIL';try{await lastPage?.screenshot({path:resolve(dir,'failure.png')});}catch(e){fail(e,'CLEANUP_FAILURE','failure.screenshot');}}
finally{
 for(const c of contexts)try{await c.close();}catch(e){fail(e,'CLEANUP_FAILURE','context.close');}
 try{await browser?.close();proof.cleanup.push({stage:'browser.close',status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE','browser.close');}
 try{const receipt=await cleanupBrowserArtifacts(root,!browser?.isConnected());proof.cleanup.push({stage:'private-artifacts',...receipt,status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE','private-artifacts');}
 if(proof.failures.length)proof.status='FAIL';await writeFile(resolve(dir,'preview.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:proof.status,scenarios:proof.scenarios,cleanupPassed:proof.cleanup.every(x=>x.status==='PASS'),failureKinds:proof.failures.map(x=>x.kind)}));if(proof.status!=='PASS')process.exitCode=1;
}
