// Browser-only QA instrumentation. Local figure transforms are not camera motion.
export function monitorMapPaint() {
  const metrics = window.__qaMapMetrics = { paint: null, active: [], maxTouchPointers: 0, events: [] };
  const active = new Set();
  for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
    window.addEventListener(type, event => {
      if (!(event.target instanceof HTMLCanvasElement)) return;
      if (event.pointerType === 'touch') {
        if (type === 'pointerdown') active.add(event.pointerId);
        if (type === 'pointerup' || type === 'pointercancel') active.delete(event.pointerId);
        metrics.active = [...active];
        metrics.maxTouchPointers = Math.max(metrics.maxTouchPointers, active.size);
      }
      metrics.events.push({ type, pointerType: event.pointerType, pointerId: event.pointerId, trusted: event.isTrusted });
    }, true);
  }
  const prototype = CanvasRenderingContext2D.prototype;
  const originalScale = prototype.scale, originalTranslate = prototype.translate, originalFillText = prototype.fillText;
  const originalSave = prototype.save, originalRestore = prototype.restore;
  const frames = new WeakMap(), depths = new WeakMap();
  prototype.save = function() { const result=originalSave.call(this); depths.set(this,(depths.get(this)??0)+1); return result; };
  prototype.restore = function() {
    const result=originalRestore.call(this),depth=Math.max(0,(depths.get(this)??0)-1); depths.set(this,depth);
    if(frames.get(this)?.depth>depth)frames.delete(this);
    return result;
  };
  prototype.scale = function(x, y) {
    const result = originalScale.call(this, x, y);
    const depth=depths.get(this)??0,frame=frames.get(this);
    if(!frame || depth<=frame.depth)frames.set(this, { zoom: x, zoomY: y, transform: null, depth });
    return result;
  };
  prototype.translate = function(x, y) {
    const result = originalTranslate.call(this, x, y), frame = frames.get(this);
    if (frame && frame.depth===(depths.get(this)??0)) {
      const m = this.getTransform();
      frame.transform = { a: m.a, d: m.d, e: m.e, f: m.f };
      // 直接量測世界scale/translate，不依賴會隨視覺版本變動的角落文案。
      metrics.paint = { ...frame };
    }
    return result;
  };
  prototype.fillText = function(text, ...args) {
    const result = originalFillText.call(this, text, ...args);
    if (/^24 × 24.*\d+%$/.test(String(text))) {
      const frame = frames.get(this);
      if (frame?.transform) metrics.paint = { ...frame, label: String(text) };
    }
    return result;
  };
}
