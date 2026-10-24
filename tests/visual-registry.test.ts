import test from 'node:test';
import assert from 'node:assert/strict';
let registry: Record<string, any> = {}, painter: Record<string, any> = {};
try { registry = await import('../src/ui/visual-registry'); } catch (error: any) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
try { painter = await import('../src/ui/miniatures'); } catch (error: any) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
const terrain = registry.getTerrainVisual ?? (() => undefined);
const unit = registry.getUnitVisual ?? (() => undefined);
const paint = painter.paintMiniature ?? (() => {});
function draw(kind: string, own = true) {
 const calls: unknown[][] = [];
 const ctx = new Proxy({}, {get: (_, key) => (...args: unknown[]) => calls.push([key, ...args]), set: (_, key, value) => { calls.push(['set', key, value]); return true; }}) as CanvasRenderingContext2D;
 paint(ctx, 0, 0, kind, own);
 return calls;
}
test('visual registry: unknown terrain never chooses a hidden terrain appearance', () => {
 const a = terrain({visibility:'unknown',terrain:'water'}), b = terrain({visibility:'unknown',terrain:'mountain'});
 assert.equal(a?.id, 'fog'); assert.deepEqual(a, b);
});
test('visual registry: all current terrain definitions are immutable and distinct', () => {
 const ids = new Set();
 for (const kind of ['plain','forest','hill','mountain','water']) {
  const value = terrain({visibility:'visible',terrain:kind}); assert.equal(value?.id,kind);
  assert.ok(Object.isFrozen(value)); assert.ok(Object.isFrozen(value.slab)); ids.add(value.id);
 }
 assert.equal(ids.size,5);
});
test('visual registry: missing unit artwork uses an explicit fallback, never pretends to be an archer', () => {
 const value = unit('future-unregistered-unit'); assert.equal(value?.id,'unidentified'); assert.ok(Object.isFrozen(value));
 assert.ok(draw('future-unregistered-unit').some(row => row[0] === 'fillText' && row[1] === '?'));
});
test('miniatures: three distinct standing silhouettes with deterministic drawing and faction cues', () => {
 const kinds=['infantry','scout','archer']; const scenes=kinds.map(kind=>draw(kind));
 assert.equal(new Set(scenes.map(scene=>JSON.stringify(scene))).size,3);
 for (let i=0;i<kinds.length;i++) {
  assert.ok(scenes[i].length>25); assert.deepEqual(draw(kinds[i]),scenes[i]);
  assert.notDeepEqual(draw(kinds[i],false),scenes[i]);
  assert.ok(scenes[i].some(row => row.slice(1).some(value => typeof value==='number' && value<=-28)),'standing miniature has a readable tall silhouette');
 }
});
test('visual registry: view status does not mutate shared known terrain or unit metadata', () => {
 const forest=terrain({visibility:'explored',terrain:'forest'}), scout=unit('scout');
 assert.equal(forest?.id,'forest'); assert.equal(scout?.id,'scout');
 assert.throws(()=>{forest.slab[0]='changed';},TypeError); assert.throws(()=>{scout.id='archer';},TypeError);
 assert.equal(terrain({visibility:'visible',terrain:'forest'}),forest); assert.equal(unit('scout'),scout);
});
