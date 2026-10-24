import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createGame, observe } from '../src/core/game';
import type { KnownTile, Observation } from '../src/core/types';
import { WorldMap } from '../src/ui/map';

// 測試seam直接呼叫真renderer，記錄Canvas API；不新增產品state/debug入口。
const MapClass = process.env.PROJECT4X_MAP_MODULE
  ? (await import(pathToFileURL(process.env.PROJECT4X_MAP_MODULE).href)).WorldMap : WorldMap;
function renderer(view: Observation) {
  const calls: unknown[] = []; let gradient=0;
  const ctx=new Proxy({} as Record<string,unknown>,{
    get(_target,key){
      if(key==='createRadialGradient'||key==='createLinearGradient') return (...args: unknown[])=>{
        const id='gradient-'+(++gradient);calls.push([key,...args]);
        return {id,addColorStop:(...stops: unknown[])=>calls.push(['addColorStop',id,...stops])};
      };
      return (...args: unknown[])=>calls.push([key,...args]);
    },
    set(_target,key,value){calls.push(['set',key,value&&typeof value==='object'&&'id' in value?value.id:value]);return true;},
  });
  const map=Object.create(MapClass.prototype);
  Object.assign(map,{ctx,view,width:1000,height:600,tileW:76,tileH:42,camera:{x:0,y:120,zoom:1},selection:{tile:null,unitId:null},hoverPoint:null});
  return {calls,drawSite:(tile:KnownTile)=>map.drawSite(tile,{x:0,y:0}),draw:()=>map.draw()};
}
function site(owner:0|1|null|undefined,center=false):KnownTile {
  return {x:3,y:3,visibility:owner===undefined?'explored':'visible',terrain:'plain',relic:null,
    site:{id:'村莊-0',kind:'village',name:'遠岬新城',...(owner===undefined?{}:{owner}),...(center?{centerOf:0 as const}:{})}};
}
const texts=(calls:unknown[])=>calls.filter((r):r is unknown[]=>Array.isArray(r)&&r[0]==='fillText').map(r=>r[1]);

test('C3 地圖：未知owner不畫敵方屋頂或標籤；中立／敵方／己方明確區分',()=>{
  const view=observe(createGame('map-contract'),0);
  const scenes=([undefined,null,1,0] as const).map(owner=>{const r=renderer(view);r.drawSite(site(owner));return r.calls;});
  assert.ok(texts(scenes[0]).some(t=>String(t).includes('所有權未知')));
  assert.ok(!JSON.stringify(scenes[0]).includes('#8f4a3e'),'未知不可用敵方屋頂');
  assert.ok(JSON.stringify(scenes[2]).includes('#8f4a3e'),'已知敵方保留敵屋頂');
  assert.ok(texts(scenes[1]).some(t=>String(t).includes('村落')));
  assert.ok(texts(scenes[2]).some(t=>String(t).includes('敵方')));
  assert.ok(texts(scenes[3]).some(t=>String(t).includes('己方')));
});
test('C3 地圖：異地政治中心用Observation真實名稱，不硬編原首都',()=>{
  const r=renderer(observe(createGame('map-contract'),0));r.drawSite(site(0,true));
  assert.ok(texts(r.calls).some(t=>String(t).includes('遠岬新城')&&String(t).includes('政治中心')));
  assert.doesNotMatch(JSON.stringify(r.calls),/曙光城|暮星城/);
});
test('C3 Fog 非干擾：同Observation不同隱藏世界產生完全相同Canvas draw calls',()=>{
  const a=createGame('same-map-world'),b=structuredClone(a);
  b.factions[1].gold+=91;b.factions[1].techs=['archery'];b.units[2].hp=1;b.terrain[575]='forest';
  const av=observe(a,0),bv=observe(b,0);assert.deepEqual(av,bv);assert.notDeepEqual(a,b);
  const ra=renderer(av),rb=renderer(bv);ra.draw();rb.draw();
  assert.ok(ra.calls.length>100);assert.deepEqual(ra.calls,rb.calls);
});
