import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import vm from 'node:vm';
const moduleURL=new URL('../scripts/qa-browser-contract.mjs',import.meta.url);
const validate=existsSync(moduleURL)?(await import(moduleURL)).validateBrowserEvidence:(browser,expected)=>{
  const source=readFileSync(new URL('../scripts/verify.mjs',import.meta.url),'utf8');
  const line=source.split('\n').find(s=>s.includes('browser.scenarios.length !== 7'));
  vm.runInNewContext(line,{browser,servedIndexSha256:expected.servedIndexSha256,buildStart:expected.artifacts});
};
const ids=[
'first-party-error-observable-native-selectors','desktop-load',
'explore-relic-escapeblocked-intel-tech-move-income-recruit','storage-failure-export-do-not-ack',
'recruited-unit-next-own-turn-real-move','save-export-replay-invalidimport-preserves-reload-load-twice-no-requestcollision',
'keyboard-selection-navigation','mobile-map-selection-opens-inspection','手機直式','手機橫式','窄手機'];
function fixture(){
 const artifacts={'index.html':'a'.repeat(64),'assets/app.js':'b'.repeat(64),'assets/app.css':'c'.repeat(64)};
 const expected={artifacts,servedIndexSha256:artifacts['index.html']};
 const browser={status:'PASS',scenarios:ids.map(id=>({id,status:'PASS'})),errors:[],failures:[],
   artifactCleanupResult:'PASS',browserDisconnected:true,privateArtifactsRemaining:0,gameplayAssertionResult:'NOT_RUN',
   cleanupReceipts:[...['desktop','手機直式','手機橫式','窄手機'].map(id=>({stage:'context.close',id,status:'PASS'})),{stage:'browser.close',status:'PASS'},{stage:'downloads.directory-absent',status:'PASS'}],
   servedIndexSha256:expected.servedIndexSha256,artifactHashes:{...artifacts},
   servedAssets:{'assets/app.js':artifacts['assets/app.js'],'assets/app.css':artifacts['assets/app.css']}};
 return {browser,expected};
}
test('browser合約：正式十一個具名情境及同一build通過，不以舊數量拒絕',()=>{
 const {browser,expected}=fixture();assert.doesNotThrow(()=>validate(browser,expected));
});
for(const [name,mutate] of [
 ['缺少必要ID但數量不變',b=>{b.scenarios[0].id='replacement';}],
 ['重複ID',b=>{b.scenarios[0].id=b.scenarios[1].id;}],
 ['個別情境失敗',b=>{b.scenarios[0].status='FAIL';}],
 ['錯誤HTML',b=>{b.servedIndexSha256='d'.repeat(64);}],
 ['錯誤bundle',b=>{b.artifactHashes['assets/app.js']='d'.repeat(64);}],
 ['服務的bundle不同',b=>{b.servedAssets['assets/app.js']='d'.repeat(64);}],
 ['服務缺CSS',b=>{delete b.servedAssets['assets/app.css'];}],
 ['隱藏cleanup失敗',b=>{b.artifactCleanupResult='FAIL';}],
 ['私有下載殘留',b=>{b.privateArtifactsRemaining=1;}],
 ['browser仍連線',b=>{b.browserDisconnected=false;}],
 ['錯誤紀錄非空',b=>{b.errors.push('runtime failure');}],
 ['缺少清理收據',b=>{delete b.cleanupReceipts;}],
 ['清理收據空陣列',b=>{b.cleanupReceipts=[];}],
 ['context身分重複',b=>{b.cleanupReceipts[1].id='desktop';}],
 ['browser關閉收據缺少',b=>{b.cleanupReceipts=b.cleanupReceipts.filter(x=>x.stage!=='browser.close');}],
 ['玩法結果與模式矛盾',b=>{b.gameplayAssertionResult='FAIL';}]
])test('browser合約拒絕：'+name,()=>{
 const {browser,expected}=fixture();mutate(browser);assert.throws(()=>validate(browser,expected));
});
test('browser合約：gameplay模式另外要求完整旅程，不借正常十一項冒充',()=>{
 const {browser,expected}=fixture();assert.throws(()=>validate(browser,{...expected,gameplay:true}));
 browser.scenarios.push({id:'continuous-existing-gameplay',status:'PASS'});
 browser.gameplayAssertionResult='PASS';
 assert.doesNotThrow(()=>validate(browser,{...expected,gameplay:true}));
});

test('PWA browser合約要求實際worker HTTP收據，拒絕缺漏、錯誤MIME或不符hash',()=>{
 const {browser,expected}=fixture();const hash='e'.repeat(64);
 expected.artifacts['service-worker.js']=hash;browser.artifactHashes['service-worker.js']=hash;
 browser.servedAssets['service-worker.js']=hash;
 assert.throws(()=>validate(browser,expected));
 browser.workerScriptProbe={path:'service-worker.js',via:'http-probe',status:200,contentType:'text/javascript',sha256:hash};
 assert.doesNotThrow(()=>validate(browser,expected));
 for(const mutation of [{status:404},{contentType:'text/html'},{sha256:'f'.repeat(64)},{via:'expected-artifact-map'}]){
  const copy=structuredClone(browser);Object.assign(copy.workerScriptProbe,mutation);assert.throws(()=>validate(copy,expected));
 }
});

