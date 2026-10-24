import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {artifactHashes} from './artifact-proof.mjs';
import {reserveBrowserEvidence,failureRecords,privateSave,cleanupBrowserArtifacts} from './qa-download.mjs';
import {deserializeGame} from '../src/core/persistence.ts';
import {canonicalHash} from '../src/core/game.ts';
const baseUrl=new URL(process.env.PROJECT4X_URL||'http://127.0.0.1:4173');baseUrl.search='';baseUrl.hash='';baseUrl.pathname=baseUrl.pathname.replace(/\/+$/,'')+'/';
const base=baseUrl.href,dir=resolve(process.env.PROJECT4X_EVIDENCE_DIR||'../evidence/pwa-'+Date.now());
await mkdir(dir,{recursive:true});await reserveBrowserEvidence(dir);
const proof={status:'RUNNING',artifacts:artifactHashes(resolve('dist')),scenarios:[],errors:[],failures:[],cleanup:[],generatedAt:new Date().toISOString()};let context,root,closed=false;
const fail=(error,kind='PRIMARY_TEST_FAILURE')=>proof.failures.push(...failureRecords(error,kind,'pwa').map(x=>({kind:x.kind,message:x.error?.message,stack:x.error?.stack})));
try{
 root=await mkdtemp(resolve(tmpdir(),'project4x-browser-pwa-'));await mkdir(resolve(root,'downloads'));
 context=await chromium.launchPersistentContext(resolve(root,'profile'),{headless:true,...(process.env.PROJECT4X_CHROMIUM_PATH?{executablePath:process.env.PROJECT4X_CHROMIUM_PATH}:{})});const page=await context.newPage();
 page.on('pageerror',e=>proof.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')proof.errors.push(m.text());});
 await page.goto(base);await page.getByRole('dialog',{name:'霧境初航 · 探索Demo',exact:true}).waitFor();
 assert.equal(await page.locator('link[rel="manifest"]').count(),1);
 const manifest=await (await context.request.get(new URL('manifest.webmanifest',base).href)).json();assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.deepEqual(manifest.icons.map(i=>i.sizes),['192x192','512x512']);
 await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.active,null,{timeout:15000});await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000});
 const expected=JSON.parse(await readFile('dist/pwa-assets.json','utf8'));
 const cached=await page.evaluate(async()=>{const names=await caches.keys();const entries=[];for(const name of names)entries.push({name,urls:(await(await caches.open(name)).keys()).map(r=>r.url)});return entries;});
 assert.equal(cached.length,1);assert.ok(cached[0].name.endsWith(expected.revision));assert.deepEqual(cached[0].urls.map(u=>new URL(u).pathname).sort(),Object.keys(expected.files).map(f=>new URL(f,base).pathname).sort());
 const cdp=await context.newCDPSession(page);const installability=await cdp.send('Page.getInstallabilityErrors');proof.installability=installability;assert.deepEqual(installability.installabilityErrors,[]);
 proof.scenarios.push({id:'manifest-installability-static-only-cache',status:'TESTED_PASS',revision:expected.revision,cachedAssets:cached[0].urls.length,scope:new URL(base).pathname});
 await page.getByRole('button',{name:'開始探索Demo',exact:true}).click();await page.locator('.unit-row').filter({hasText:'斥候'}).click();await page.locator('.move-list summary').click();await page.locator('.tile-actions').getByRole('button',{name:'6 · 4',exact:true}).click();await page.locator('.relic-dialog').getByRole('button',{name:/解讀地形/}).click();
 await page.getByRole('button',{name:'航行紀錄',exact:true}).click();await page.getByRole('button',{name:'保存進度',exact:true}).click();await page.waitForFunction(()=>!!localStorage.getItem('project4x-demo-progress-1'));
 const before=deserializeGame(await privateSave(page));
 await context.setOffline(true);await page.reload({waitUntil:'load'});await page.getByRole('dialog',{name:'霧境初航 · 探索Demo',exact:true}).waitFor();await page.getByRole('button',{name:'接續保存航程',exact:true}).click();await page.getByRole('dialog',{name:'霧境初航 · 探索Demo',exact:true}).waitFor({state:'hidden'});
 const after=deserializeGame(await privateSave(page));assert.equal(canonicalHash(after),canonicalHash(before));assert.equal(after.winner,null);
 proof.scenarios.push({id:'offline-reload-real-world-local-save-load',status:'TESTED_PASS',commands:after.history.length,canonicalHash:canonicalHash(after)});
 await context.setOffline(false);assert.deepEqual(proof.errors,[]);proof.status='PASS';
}catch(e){fail(e);proof.status='FAIL';}
finally{
 try{await context?.close();closed=true;proof.cleanup.push({stage:'context.close',status:'PASS'});}catch(e){fail(e,'CLEANUP_FAILURE');}
 try{proof.cleanup.push({stage:'owned-profile',status:'PASS',...await cleanupBrowserArtifacts(root,closed)});}catch(e){fail(e,'CLEANUP_FAILURE');}
 if(proof.failures.length)proof.status='FAIL';await writeFile(resolve(dir,'pwa.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:proof.status,scenarios:proof.scenarios,failures:proof.failures}));if(proof.status!=='PASS')process.exitCode=1;
}
