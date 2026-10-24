import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const url=new URL('../scripts/qa-map-probe.mjs',import.meta.url);
const browserSource=readFileSync(new URL('../scripts/browser-check.mjs',import.meta.url),'utf8');
const source=existsSync(url)?(await import(url)).monitorMapPaint.toString():browserSource.slice(browserSource.indexOf('function monitorMapPaint()'),browserSource.indexOf('async function verifyTouchGestures'));
// Test-only affine Canvas implementation: no production state or input shortcuts.
class Canvas {
 m={a:1,d:1,e:0,f:0};stack=[];
 save(){this.stack.push({...this.m});}restore(){this.m=this.stack.pop()??this.m;}
 scale(x,y){this.m.a*=x;this.m.d*=y;}
 translate(x,y){this.m.e+=x*this.m.a;this.m.f+=y*this.m.d;}
 getTransform(){return {...this.m};}fillText(){}
}
test('Canvas QA probe measures the world camera without treating nested miniature transforms as camera motion',()=>{
 const window={addEventListener(){}};class Context extends Canvas{}
 vm.runInNewContext('('+source+')()',{window,CanvasRenderingContext2D:Context,HTMLCanvasElement:class{}});
 const c=new Context();c.save();c.translate(400,300);c.scale(2,2);c.translate(-50,-50);
 const expected={a:2,d:2,e:300,f:200};
 assert.deepEqual({...window.__qaMapMetrics.paint.transform},expected);
 c.save();c.translate(100,60);c.scale(.5,.5);c.translate(4,7);c.restore();
 assert.deepEqual({...window.__qaMapMetrics.paint.transform},expected,'local model transforms must not corrupt the measured map camera');
 c.restore();c.save();c.translate(40,30);c.restore();
 assert.deepEqual({...window.__qaMapMetrics.paint.transform},expected,'HUD transforms after world restore are not camera motion');
});
