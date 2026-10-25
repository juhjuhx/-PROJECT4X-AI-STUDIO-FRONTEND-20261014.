import test from 'node:test';
import assert from 'node:assert/strict';
import { entryRuleset, storageKeys } from '../src/ui/preview-entry';
import { getUnitVisual } from '../src/ui/visual-registry';
import { getNarrativePack, DEMO_PACK } from '../src/demo/content';

test('預覽明確 opt-in，未知 query 不啟用；新舊存檔與手札槽完全分開',()=>{
 assert.equal(entryRuleset(''),'g1-ccts-1');assert.equal(entryRuleset('?preview=other'),'g1-ccts-1');
 assert.equal(entryRuleset('?preview=demo03'),'demo03-preview-1');
 assert.deepEqual(storageKeys('g1-ccts-1'),{save:'project4x-save-1',progress:'project4x-demo-progress-1'});
 assert.notEqual(storageKeys('demo03-preview-1').save,storageKeys('g1-ccts-1').save);
 assert.notEqual(storageKeys('demo03-preview-1').progress,storageKeys('g1-ccts-1').progress);
 assert.throws(()=>storageKeys('future'));
});
test('新兵有明確獨立輪廓；預覽敘事包不覆寫 G1 包版本或相容宣告',()=>{
 assert.equal(getUnitVisual('shieldGuard').silhouette,'bulwark');assert.equal(getUnitVisual('mobileScout').silhouette,'runner');
 assert.equal(getNarrativePack('g1-ccts-1'),DEMO_PACK);assert.equal(DEMO_PACK.version,'1.0.0');assert.deepEqual(DEMO_PACK.rulesets,['g1-ccts-1']);
 const preview=getNarrativePack('demo03-preview-1');assert.notEqual(preview.id,DEMO_PACK.id);assert.deepEqual(preview.rulesets,['demo03-preview-1']);
 assert.throws(()=>getNarrativePack('future'));
});
