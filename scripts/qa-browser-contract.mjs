import assert from 'node:assert/strict';
export const REQUIRED_BROWSER_SCENARIOS=Object.freeze([
  'first-party-error-observable-native-selectors','desktop-load',
  'explore-relic-escapeblocked-intel-tech-move-income-recruit','storage-failure-export-do-not-ack',
  'recruited-unit-next-own-turn-real-move','save-export-replay-invalidimport-preserves-reload-load-twice-no-requestcollision',
  'keyboard-selection-navigation','mobile-map-selection-opens-inspection','手機直式','手機橫式','窄手機'
]);
export function validateBrowserEvidence(browser,{artifacts,servedIndexSha256,gameplay=false}) {
  assert.equal(browser.status,'PASS','browser執行狀態');
  assert.deepEqual(browser.errors,[],'browser runtime errors');
  assert.deepEqual(browser.failures,[],'browser primary/cleanup failures');
  assert.ok(!browser.failure,'browser failure不可被status遮蔽');
  const required=[...REQUIRED_BROWSER_SCENARIOS,...(gameplay?['continuous-existing-gameplay']:[])].sort();
  assert.ok(Array.isArray(browser.scenarios));
  const ids=browser.scenarios.map(s=>s.id);
  assert.equal(new Set(ids).size,ids.length,'重複scenario ID');
  assert.deepEqual([...ids].sort(),required,'必要scenario identity不完整或未審核情境');
  for(const scenario of browser.scenarios) assert.equal(scenario.status,'PASS',scenario.id);
  assert.equal(browser.servedIndexSha256,servedIndexSha256,'服務HTML與本輪不同');
  assert.equal(servedIndexSha256,artifacts['index.html'],'預期HTML與產物不同');
  for(const hash of Object.values(artifacts)) assert.match(hash,/^[a-f0-9]{64}$/);
  assert.deepEqual(browser.artifactHashes,artifacts,'完整產物SHA256不一致');
  if (artifacts['service-worker.js']) {
    const proof=browser.workerScriptProbe;
    assert.ok(proof,'缺少worker實際HTTP收據');
    assert.equal(proof.path,'service-worker.js');
    assert.equal(proof.via,'http-probe');
    assert.equal(proof.status,200);
    assert.match(proof.contentType,/^(?:text|application)\/javascript(?:\s*;|$)/i);
    assert.equal(proof.sha256,artifacts['service-worker.js']);
  }
  const served=Object.fromEntries(Object.entries(artifacts).filter(([path])=>/\.(js|css)$/.test(path)));
  assert.deepEqual(browser.servedAssets,served,'實際服務bundle/CSS未完整核對');
  assert.equal(browser.gameplayAssertionResult,gameplay?'PASS':'NOT_RUN','玩法結果與執行模式不一致');
  assert.ok(Array.isArray(browser.cleanupReceipts),'缺少清理收據');
  for(const receipt of browser.cleanupReceipts)assert.equal(receipt.status,'PASS','清理收據不是PASS');
  const closed=browser.cleanupReceipts.filter(r=>r.stage==='context.close').map(r=>r.id);
  assert.deepEqual([...closed].sort(),['desktop','手機直式','手機橫式','窄手機'].sort(),'context身分未完整清理');
  for(const stage of ['browser.close','downloads.directory-absent'])
    assert.equal(browser.cleanupReceipts.filter(r=>r.stage===stage).length,1,'缺少或重複'+stage);
  assert.equal(browser.artifactCleanupResult,'PASS');
  assert.equal(browser.privateArtifactsRemaining,0,'私有下載殘留');
  assert.equal(browser.browserDisconnected,true,'browser仍在執行');
}

