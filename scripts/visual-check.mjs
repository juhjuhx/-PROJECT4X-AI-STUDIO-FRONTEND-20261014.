// Real presentation interactions; the existing GameplayPort/core remain authoritative.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {artifactHashes} from './artifact-proof.mjs';
import {monitorMapPaint} from './qa-map-probe.mjs';
import {privateSave,reserveBrowserEvidence,cleanupBrowserArtifacts,failureRecords} from './qa-download.mjs';
const base=process.env.PROJECT4X_URL||'http://127.0.0.1:4173';
const dir=resolve(process.env.PROJECT4X_EVIDENCE_DIR||await mkdtemp(resolve(tmpdir(),'project4x-visual-proof-')));
await mkdir(dir,{recursive:true});await reserveBrowserEvidence(dir);
const proof={status:'RUNNING',scenarios:[],errors:[],failures:[],cleanup:[],artifacts:artifactHashes(resolve('dist'))};
const fail=(error,kind='PRIMARY_TEST_FAILURE',stage='visual')=>proof.failures.push(...failureRecords(error,kind,stage).map(f=>({kind:f.kind,stage:f.stage,message:f.error?.message??String(f.error),stack:f.error?.stack})));
let root,browser,lastPage;const contexts=[];
try{
 const response=await fetch(base);assert.equal(response.status,200);
 assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),proof.artifacts['index.html']);
 root=await mkdtemp(resolve(tmpdir(),'project4x-browser-'));await mkdir(resolve(root,'downloads'));
 browser=await chromium.launch({headless:true,downloadsPath:resolve(root,'downloads'),...(process.env.PROJECT4X_CHROMIUM_PATH?{executablePath:process.env.PROJECT4X_CHROMIUM_PATH}:{})});
 for(const [id,width,height,mobile,motion]of [['desktop',1440,960,false,'no-preference'],['phone',375,812,true,'reduce']]){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1,reducedMotion:motion,acceptDownloads:true});contexts.push(context);await context.addInitScript(monitorMapPaint);
  const page=await context.newPage();lastPage=page;page.on('pageerror',e=>proof.errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))proof.errors.push(m.text());});
  const press=locator=>mobile?locator.tap():locator.click();await page.goto(base);
  await press(page.locator('.demo-menu').getByRole('button',{name:'開始探索Demo',exact:true}));
  await press(page.locator('.unit-row').filter({hasText:'斥候'}));
  assert.equal(await page.locator('.inspect-panel h2').innerText(),'斥候');
  const before=await privateSave(page);await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const input=await page.evaluate(()=>{
   const text=[...document.querySelectorAll('.unit-row')].find(row=>row.textContent.includes('步兵')).querySelector('.unit-copy > span').textContent;
   const match=text.match(/(\d+) · (\d+)\s*\//);if(!match)throw new Error('missing own unit coordinates');
   const x=Number(match[1])-1,y=Number(match[2])-1,m=window.__qaMapMetrics.paint.transform,r=document.querySelector('canvas').getBoundingClientRect();
   const px=r.x+(x-y)*38*m.a+m.e,py=r.y+((x+y)*21-34)*m.d+m.f;
   const hit=document.elementFromPoint(px,py);
   return {x:px,y:py,tile:{x,y},hitCanvas:hit===document.querySelector('canvas'),hitTag:hit?.tagName,hitClass:String(hit?.className),canvas:{x:r.x,y:r.y,width:r.width,height:r.height},transform:m,scrollY};
  });
  (proof.inputTrace??=[]).push({id,...input});
  assert.equal(input.hitCanvas,true,'real input must not hit an overlay');
  if(mobile)await page.touchscreen.tap(input.x,input.y);else await page.mouse.click(input.x,input.y);
  assert.equal(await page.locator('.inspect-panel h2').innerText(),'步兵');
  assert.match(await page.locator('.coordinates').innerText(),new RegExp((input.tile.x+1)+' · '+(input.tile.y+1)));
  assert.equal(await privateSave(page),before,'presentation selection must not issue a command');
  proof.scenarios.push({id:id+'-real-miniature-head-selection',status:'TESTED_PASS',viewport:{width,height},simulatedTouch:mobile,canonicalSaveUnchanged:true});
  await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));await page.screenshot({path:resolve(dir,id+'-unit-selection.png')});
  await press(page.locator('.unit-row').filter({hasText:'斥候'}));await press(page.locator('.move-list summary'));
  await press(page.locator('.tile-actions').getByRole('button',{name:'6 · 4',exact:true}));
  const relic=page.locator('.relic-dialog');await relic.waitFor({state:'visible'});
  const animation=await relic.locator('.relic-art').evaluate(async element=>{
   const animations=element.getAnimations(),a=animations.find(a=>a.animationName==='d03-relic-reveal');
   if(a)await a.finished;
   return {name:getComputedStyle(element).animationName,duration:a?.effect.getTiming().duration??null,animationPresent:!!a};
  });
  if(motion==='reduce'){assert.equal(animation.name,'none');assert.equal(animation.animationPresent,false);}else{assert.equal(animation.animationPresent,true);assert.equal(animation.duration,440);}
  await page.screenshot({path:resolve(dir,id+'-relic-motion.png')});
  await press(relic.getByRole('button',{name:/解讀地形/}));await relic.waitFor({state:'hidden'});
  proof.scenarios.push({id:id+'-real-relic-'+motion,status:'TESTED_PASS',animation,realMoveAndResolve:true});
  await context.close();contexts.splice(contexts.indexOf(context),1);proof.cleanup.push({stage:id+'.close',status:'PASS'});
 }
 assert.deepEqual(proof.errors,[]);proof.status='PASS';
}catch(error){fail(error);proof.status='FAIL';try{await lastPage?.screenshot({path:resolve(dir,'failure.png')});}catch(screenshotError){fail(screenshotError,'CLEANUP_FAILURE','failure.screenshot');}}
finally{
 for(const context of contexts)try{await context.close();}catch(error){fail(error,'CLEANUP_FAILURE','context.close');}
 try{await browser?.close();proof.cleanup.push({stage:'browser.close',status:'PASS'});}catch(error){fail(error,'CLEANUP_FAILURE','browser.close');}
 try{const receipt=await cleanupBrowserArtifacts(root,!browser?.isConnected());proof.cleanup.push({stage:'private-artifacts',...receipt,status:'PASS'});}catch(error){fail(error,'CLEANUP_FAILURE','private-artifacts');}
 if(proof.failures.length)proof.status='FAIL';
 await writeFile(resolve(dir,'visual.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:proof.status,scenarios:proof.scenarios,cleanupPassed:proof.cleanup.every(x=>x.status==='PASS'),failureKinds:proof.failures.map(x=>x.kind)}));if(proof.status!=='PASS')process.exitCode=1;
}
