import {getUnitVisual, MINIATURE_MATERIALS as materials} from './visual-registry';

/** 只畫已提供的兵種與陣營關係；不接收或查詢任何遊戲真相。 */
export function paintMiniature(c: CanvasRenderingContext2D, x: number, y: number, kind: string, own: boolean): void {
 const visual = getUnitVisual(kind), m = own ? materials.own : materials.enemy;
 const polygon = (points: number[][], fill: string, stroke = materials.ink) => {
  c.beginPath(); points.forEach(([px,py],i) => i ? c.lineTo(px,py) : c.moveTo(px,py)); c.closePath();
  c.fillStyle=fill; c.fill(); c.strokeStyle=stroke; c.lineWidth=0.8; c.stroke();
 };
 const line = (points: number[][], color: string, width=1.5) => {
  c.beginPath(); points.forEach(([px,py],i) => i ? c.lineTo(px,py) : c.moveTo(px,py)); c.strokeStyle=color; c.lineWidth=width; c.stroke();
 };
 const head = (px: number, py: number, fill: string) => {
  c.beginPath(); c.ellipse(px,py,4.2,4.8,0,0,Math.PI*2); c.fillStyle=fill; c.fill(); c.strokeStyle=materials.ink; c.lineWidth=0.8; c.stroke();
 };
 c.save(); c.translate(x,y);
 try {
  // A low oval plinth leaves the standing silhouette free above the board.
  c.beginPath(); c.ellipse(0,2,12,4.5,0,0,Math.PI*2); c.fillStyle=m.base; c.fill(); c.strokeStyle=m.trim; c.lineWidth=1.4; c.stroke();
  if (visual.silhouette==='unidentified') {
   c.fillStyle=m.trim; c.font='bold 18px serif'; c.textAlign='center'; c.fillText('?',0,-10); return;
  }
  polygon([[-4,-10],[-1,-10],[-1,0],[-6,0]],materials.ink);
  polygon([[1,-10],[4,-10],[6,0],[1,0]],materials.ink);
  if (visual.silhouette==='wanderer') {
   polygon([[-5,-26],[5,-26],[10,-5],[-10,-5]],m.shade);
   polygon([[-4,-23],[3,-23],[5,-8],[-5,-8]],m.cloth);
   polygon([[-6,-28],[0,-35],[6,-28],[4,-21],[-4,-21]],m.cloth);
   polygon([[-2,-29],[3,-29],[2,-24],[-2,-24]],materials.skin);
   line([[-5,-20],[4,-9]],m.trim,1.3);
   polygon([[-8,-14],[-3,-13],[-3,-7],[-8,-8]],materials.wood);
   line([[9,-35],[9,1]],materials.wood,2);
   c.beginPath(); c.arc(9,-34,2.4,0,Math.PI*2); c.fillStyle=m.trim; c.fill();
   line([[5,-17],[9,-16]],materials.skin,2.5);
  } else {
   polygon([[-5,-23],[5,-23],[6,-9],[-6,-9]],m.cloth);
   polygon([[0,-23],[5,-23],[6,-9],[0,-9]],m.shade);
   line([[-5,-11],[6,-11]],m.trim,1.5);
   head(0,-28,materials.skin);
   if (visual.silhouette==='soldier') {
    polygon([[-5,-29],[-4,-34],[3,-35],[6,-30],[3,-27],[-4,-27]],materials.steel);
    polygon([[0,-34],[3,-35],[6,-30],[3,-27],[0,-28]],materials.steelShade);
    line([[-1,-35],[2,-38],[4,-35]],m.trim,2);
    polygon([[-13,-23],[-4,-24],[-3,-10],[-8,-4],[-13,-11]],m.trim);
    polygon([[-11,-21],[-6,-22],[-5,-11],[-8,-7],[-11,-12]],m.shade);
    line([[-8,-19],[-8,-11]],m.trim,1.2);
    polygon([[7,-21],[10,-29],[11,-20],[8,-10]],materials.steel);
    line([[6,-17],[12,-15]],materials.wood,2);
   } else {
    polygon([[-5,-29],[-3,-34],[4,-33],[6,-28]],m.shade);
    polygon([[-9,-23],[-5,-24],[-3,-11],[-7,-10]],materials.wood);
    line([[-8,-25],[-10,-30]],'#e8e6ce'); line([[-6,-25],[-7,-31]],'#e8e6ce');
    c.beginPath(); c.moveTo(10,-30); c.quadraticCurveTo(23,-16,10,-2); c.strokeStyle=materials.wood; c.lineWidth=2.2; c.stroke();
    line([[10,-30],[5,-16],[10,-2]],'#e9dfbd',0.8);
    line([[3,-18],[12,-16]],materials.skin,2.5); line([[3,-16],[18,-16]],materials.steel,1);
   }
  }
 } finally { c.restore(); }
}
