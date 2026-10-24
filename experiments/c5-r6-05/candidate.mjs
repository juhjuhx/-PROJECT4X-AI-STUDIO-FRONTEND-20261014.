// Isolated research policy. No GameState, reducer, persistence or history imports.
import {chooseAction as baseline} from '../../src/core/ai.ts';
import {UNIT_STATS} from '../../src/core/types.ts';
const LIMITS=Object.freeze({moves:32,friends:24,enemies:8,expansions:8192});
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const same=(a,b)=>a.x===b.x&&a.y===b.y;
const spatial=(a,b)=>a.y-b.y||a.x-b.x||(a.id<b.id?-1:a.id>b.id?1:0);
export function evaluateCooperative(view){
 const base=baseline(view),own=view.units.filter(u=>u.owner===view.actor).sort(spatial),enemies=view.units.filter(u=>u.owner!==view.actor).sort(spatial);
 const moves=view.legalActions.filter(a=>a.type==='Move'),sites=view.tiles.filter(t=>t.site?.owner===view.actor);
 const d={reason:'NO_CERTIFICATE',overflow:false,firstMoves:moves.length,expansions:0,certificates:0,branches:0,retainedCandidates:0,unknownPathsRejected:0,riskRejected:0};
 const out=(a=base,reason=d.reason)=>({action:a?structuredClone(a):null,diagnostics:{...d,reason}});
 // Limits apply to the complete call. Never silently select a preferred subset.
 if(own.length>LIMITS.friends||enemies.length>LIMITS.enemies||moves.length>LIMITS.moves){d.overflow=true;return out(base,'INPUT_BUDGET');}
 if(!base||!enemies.length)return out();
 const tileAt=p=>view.tiles[p.y*view.width+p.x];
 const damage=(u,t)=>{
  const tile=tileAt(t),cover=tile.terrain==='forest'||tile.terrain==='hill'||tile.site?.owner===t.owner?1:0;
  return Math.max(1,UNIT_STATS[u.kind].attack-UNIT_STATS[t.kind].defense-cover);
 };
 const attacks=view.legalActions.filter(a=>a.type==='Attack');
 if(attacks.some(a=>{const u=own.find(u=>u.id===a.unitId),t=enemies.find(t=>t.id===a.targetId);return u&&t&&damage(u,t)>=t.hp;}))return out(base,'EXISTING_LETHAL_OR_R2');
 if(!['Move','Attack','EndTurn'].includes(base.type))return out(base,'EXISTING_PRIORITY');
 if(base.type==='Move'){
  const u=own.find(u=>u.id===base.unitId),t=tileAt(base.to);
  if(sites.some(t=>same(t,u))||(t.site&&t.site.owner!==view.actor))return out(base,'SITE_WINDOW');
  if(enemies.some(t=>dist(base.to,t)<=UNIT_STATS[u.kind].range&&damage(u,t)>=t.hp))return out(base,'EXISTING_MOVE_TO_KILL');
 }
 const visibleAfter=(target,mover,to)=>own.some(u=>dist(u.id===mover.id?to:u,target)<=UNIT_STATS[u.kind].sight+(u.kind==='scout'&&view.faction.techs.includes('pathfinding')?1:0))||sites.some(s=>dist(s,target)<=1);
 const reachable=(u,mover,to)=>{
  const occupied=new Set(view.units.filter(x=>x.id!==u.id&&x.id!==mover.id).map(x=>x.y*view.width+x.x));
  occupied.add(to.y*view.width+to.x);
  const start=u.y*view.width+u.x,seen=new Set([start]),queue=[{x:u.x,y:u.y,steps:0}],result=[];
  for(let n=0;n<queue.length;n++){
   if(++d.expansions>LIMITS.expansions){d.overflow=true;return [];}
   const at=queue[n];if(at.steps===UNIT_STATS[u.kind].move)continue;
   for(const [x,y] of [[at.x,at.y-1],[at.x-1,at.y],[at.x+1,at.y],[at.x,at.y+1]]){
    if(x<0||y<0||x>=view.width||y>=view.height)continue;const k=y*view.width+x,t=view.tiles[k];
    if(seen.has(k)||occupied.has(k))continue;seen.add(k);
    if(t.visibility!=='visible'||t.terrain===null){d.unknownPathsRejected++;continue;}
    if(t.terrain==='mountain'||t.terrain==='water')continue;
    const point={x,y,steps:at.steps+1};queue.push(point);result.push(point);
   }
  }
  return result;
 };
 // At most one certificate per first Move is retained. Future positions are advisory,
 // never legalActions or canonical truth. The runner must re-observe after every action.
 const ranked=[];
 for(const first of moves){
  const b=own.find(u=>u.id===first.unitId),landing=tileAt(first.to);
  if(!b||landing.visibility!=='visible'||landing.terrain===null||['mountain','water'].includes(landing.terrain))continue;
  if(sites.some(s=>same(s,b)||same(s,first.to)))continue;
  let best=null;
  for(const a of own){
   if(a.id===b.id||a.moved||a.acted)continue;
   d.branches++;const reachablePoints=reachable(a,b,first.to);
   if(d.overflow)return out(base,'SEARCH_BUDGET');
   for(const target of enemies){
    if(damage(a,target)<target.hp||!visibleAfter(target,b,first.to))continue;
    const alreadyPossible=dist(a,target)<=UNIT_STATS[a.kind].range||moves.some(m=>m.unitId===a.id&&dist(m.to,target)<=UNIT_STATS[a.kind].range);
    if(alreadyPossible)continue;
    const tile=tileAt(target),city=!!tile.site;
    const entry=own.filter(u=>u.id!==a.id&&u.id!==b.id&&!u.moved&&!u.acted&&dist(u,target)===1);
    if(city&&(tile.site.owner===undefined||tile.site.owner===view.actor||!entry.length))continue;
    if(base.type==='Attack'&&(base.targetId!==target.id||(base.unitId!==b.id&&!entry.some(u=>u.id===base.unitId))))continue;
    for(const firing of reachablePoints){
     if(dist(firing,target)>UNIT_STATS[a.kind].range)continue;
     // Conservative visible geometry, not an enemy legal-action oracle.
     // Ignore only the enemy the conditional one-shot certificate removes.
     if(enemies.some(e=>e.id!==target.id&&(dist(e,first.to)<=UNIT_STATS[e.kind].move+UNIT_STATS[e.kind].range||dist(e,firing)<=UNIT_STATS[e.kind].move+UNIT_STATS[e.kind].range))){d.riskRejected++;continue;}
     const c={first:structuredClone(first),followerId:a.id,firing:{x:firing.x,y:firing.y},targetId:target.id,entryIds:entry.map(u=>u.id),city,
      order:[city?0:1,target.y,target.x,b.y,b.x,first.to.y,first.to.x,a.y,a.x,firing.y,firing.x]};
     d.certificates++;
     if(!best||compare(c,best)<0)best=c;
    }
   }
  }
  if(best)ranked.push(best);
 }
 d.retainedCandidates=ranked.length;
 if(!ranked.length)return out();
 ranked.sort(compare);const selected=ranked[0];
 if(!view.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(selected.first)))throw new Error('EXPERIMENT_ILLEGAL_CURRENT_ACTION');
 return {...out(selected.first,'VACANCY_SUPPORT'),certificate:selected};
}
function compare(a,b){
 for(let i=0;i<a.order.length;i++)if(a.order[i]!==b.order[i])return a.order[i]-b.order[i];
 const aa=JSON.stringify(a.first),bb=JSON.stringify(b.first);return aa<bb?-1:aa>bb?1:0;
}
export const chooseCooperative=view=>evaluateCooperative(view).action;
