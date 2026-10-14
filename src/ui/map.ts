import type { KnownTile, Observation, Point, Unit } from '../core/types';
import { UNIT_STATS } from '../core/types';

type MapSelection = { tile: Point | null; unitId: string | null };
type Pointer = { x: number; y: number };

/** The atlas receives only the player's projected knowledge. It never owns game state. */
export class WorldMap {
  private readonly ctx: CanvasRenderingContext2D;
  private view: Observation | null = null;
  private selection: MapSelection = { tile: null, unitId: null };
  private width = 1;
  private height = 1;
  private camera = { x: 0, y: 0, zoom: 1 };
  private queued = false;
  private pointers = new Map<number, Pointer>();
  private gesture: { origin: Pointer; last: Pointer; moved: boolean } | null = null;
  private pinchDistance = 0;
  private readonly tileW = 76;
  private readonly tileH = 42;
  private readonly observer: ResizeObserver;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly onSelect: (point: Point) => void) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('此瀏覽器無法建立 Canvas2D 畫面。');
    this.ctx = ctx;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
    canvas.addEventListener('pointerdown', (event) => this.pointerDown(event));
    canvas.addEventListener('pointermove', (event) => this.pointerMove(event));
    canvas.addEventListener('pointerup', (event) => this.pointerUp(event));
    canvas.addEventListener('pointercancel', (event) => this.pointerUp(event, true));
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const r = canvas.getBoundingClientRect();
      this.zoomBy(Math.exp(-event.deltaY * 0.0015), { x: event.clientX - r.left, y: event.clientY - r.top });
    }, { passive: false });
  }

  update(view: Observation, selection: MapSelection): void {
    const first = this.view === null;
    this.view = view;
    this.selection = selection;
    if (first) this.home();
    this.requestDraw();
  }

  focus(point: Point): void {
    const p = this.project(point);
    this.camera.x = p.x;
    this.camera.y = p.y;
    this.requestDraw();
  }

  home(): void {
    if (!this.view) return;
    const center = this.view.tiles.find((t) => t.site?.id === this.view?.faction.centerId);
    const unit = this.view.units.find((u) => u.owner === this.view?.actor);
    this.camera.zoom = this.width < 600 ? 0.86 : 1.12;
    this.focus(center ?? unit ?? { x: this.view.width / 2, y: this.view.height / 2 });
  }

  overview(): void {
    if (!this.view) return;
    this.camera.zoom = Math.max(0.24, Math.min(this.width / (this.view.width * this.tileW + 80), this.height / (this.view.height * this.tileH + 80)));
    this.focus({ x: (this.view.width - 1) / 2, y: (this.view.height - 1) / 2 });
  }

  zoomBy(factor: number, anchor?: Pointer): void {
    const before = this.camera.zoom;
    this.camera.zoom = Math.max(0.24, Math.min(2.2, before * factor));
    if (anchor) {
      this.camera.x += (anchor.x - this.width / 2) * (1 / before - 1 / this.camera.zoom);
      this.camera.y += (anchor.y - this.height / 2) * (1 / before - 1 / this.camera.zoom);
    }
    this.requestDraw();
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.requestDraw();
  }

  private project(p: Point): Point {
    return { x: (p.x - p.y) * this.tileW / 2, y: (p.x + p.y) * this.tileH / 2 };
  }

  private pointAt(p: Pointer): Point | null {
    const wx = (p.x - this.width / 2) / this.camera.zoom + this.camera.x;
    const wy = (p.y - this.height / 2) / this.camera.zoom + this.camera.y;
    const x = Math.floor((wx / (this.tileW / 2) + wy / (this.tileH / 2)) / 2 + 0.5);
    const y = Math.floor((wy / (this.tileH / 2) - wx / (this.tileW / 2)) / 2 + 0.5);
    return this.view && x >= 0 && y >= 0 && x < this.view.width && y < this.view.height ? { x, y } : null;
  }

  private pointerPosition(event: PointerEvent): Pointer {
    const r = this.canvas.getBoundingClientRect();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  }

  private pointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.canvas.focus({ preventScroll: true });
    this.canvas.setPointerCapture(event.pointerId);
    const point = this.pointerPosition(event);
    this.pointers.set(event.pointerId, point);
    if (this.pointers.size === 1) this.gesture = { origin: point, last: point, moved: false };
    else {
      if (this.gesture) this.gesture.moved = true;
      const ps = [...this.pointers.values()];
      this.pinchDistance = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
    }
  }

  private pointerMove(event: PointerEvent): void {
    if (!this.pointers.has(event.pointerId)) return;
    const p = this.pointerPosition(event);
    this.pointers.set(event.pointerId, p);
    if (this.pointers.size > 1) {
      const ps = [...this.pointers.values()];
      const distance = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (this.pinchDistance > 0) this.zoomBy(distance / this.pinchDistance, { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 });
      this.pinchDistance = distance;
    } else if (this.gesture) {
      if (Math.hypot(p.x - this.gesture.origin.x, p.y - this.gesture.origin.y) > 7) this.gesture.moved = true;
      if (this.gesture.moved) {
        this.camera.x -= (p.x - this.gesture.last.x) / this.camera.zoom;
        this.camera.y -= (p.y - this.gesture.last.y) / this.camera.zoom;
        this.requestDraw();
      }
      this.gesture.last = p;
    }
  }

  private pointerUp(event: PointerEvent, cancelled = false): void {
    if (!this.pointers.has(event.pointerId)) return;
    if (!cancelled && this.pointers.size === 1 && this.gesture && !this.gesture.moved) {
      const point = this.pointAt(this.pointerPosition(event));
      if (point) this.onSelect(point);
    }
    this.pointers.delete(event.pointerId);
    this.pinchDistance = 0;
    if (!this.pointers.size) this.gesture = null;
    else {
      const point = [...this.pointers.values()][0];
      this.gesture = { origin: point, last: point, moved: true };
    }
  }

  private requestDraw(): void {
    if (this.queued) return;
    this.queued = true;
    requestAnimationFrame(() => { this.queued = false; this.draw(); });
  }

  private polygon(points: number[][], fill: string, stroke?: string, lineWidth = 1): void {
    const c = this.ctx;
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lineWidth; c.stroke(); }
  }

  private diamond(x: number, y: number, fill: string, stroke?: string, lineWidth = 1, inset = 0): void {
    const w = this.tileW / 2 - inset, h = this.tileH / 2 - inset / 2;
    this.polygon([[x, y - h], [x + w, y], [x, y + h], [x - w, y]], fill, stroke, lineWidth);
  }

  private circle(x: number, y: number, radius: number, fill: string, stroke?: string): void {
    this.ctx.beginPath(); this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fill; this.ctx.fill();
    if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = 1.5; this.ctx.stroke(); }
  }

  private draw(): void {
    const c = this.ctx;
    c.clearRect(0, 0, this.width, this.height);
    const bg = c.createRadialGradient(this.width * 0.45, this.height * 0.4, 10, this.width * 0.5, this.height * 0.5, this.width * 0.8);
    bg.addColorStop(0, '#2e4c45'); bg.addColorStop(1, '#172e2d');
    c.fillStyle = bg; c.fillRect(0, 0, this.width, this.height);
    if (!this.view) return;
    c.save();
    c.translate(this.width / 2, this.height / 2);
    c.scale(this.camera.zoom, this.camera.zoom);
    c.translate(-this.camera.x, -this.camera.y);
    const tiles = [...this.view.tiles].sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.x - b.x);
    const moveKeys = new Set(this.view.legalActions.flatMap((a) => a.type === 'Move' && a.unitId === this.selection.unitId ? [`${a.to.x},${a.to.y}`] : []));
    const targetIds = new Set(this.view.legalActions.flatMap((a) => a.type === 'Attack' && a.unitId === this.selection.unitId ? [a.targetId] : []));
    const unitMap = new Map(this.view.units.map((u) => [`${u.x},${u.y}`, u]));
    for (const tile of tiles) {
      const p = this.project(tile);
      const sx = (p.x - this.camera.x) * this.camera.zoom + this.width / 2;
      const sy = (p.y - this.camera.y) * this.camera.zoom + this.height / 2;
      if (sx < -100 || sx > this.width + 100 || sy < -130 || sy > this.height + 100) continue;
      this.drawTile(tile, p);
      const key = `${tile.x},${tile.y}`;
      if (moveKeys.has(key)) {
        this.diamond(p.x, p.y, 'rgba(235,223,160,.16)', '#e4ce8d', 1.5, 4);
        this.circle(p.x, p.y + 3, 3, '#f1dca1');
      }
      if (this.selection.tile?.x === tile.x && this.selection.tile?.y === tile.y) {
        this.diamond(p.x, p.y, 'rgba(228,179,92,.12)', '#f3c478', 3, 1);
      }
      if (tile.visibility !== 'unknown') {
        this.drawScenery(tile, p);
        if (tile.site) this.drawSite(tile, p);
        if (tile.relic && !tile.relic.resolved) this.drawRelic(p);
        const unit = unitMap.get(key);
        if (unit) this.drawUnit(unit, p, targetIds.has(unit.id));
        if (tile.visibility === 'explored') this.diamond(p.x, p.y, 'rgba(19,43,42,.33)');
      }
    }
    c.restore();
    this.drawCompass();
    c.font = '12px ui-monospace, monospace'; c.fillStyle = '#b7c6b3';
    c.textAlign = 'left'; c.fillText(`24 × 24   /   ${Math.round(this.camera.zoom * 100)}%`, 20, this.height - 20);
  }

  private drawTile(tile: KnownTile, p: Point): void {
    const palette: Record<string, string> = { plain: '#aab58b', forest: '#779783', hill: '#adb294', mountain: '#929d93', water: '#648f91' };
    const unknown = tile.visibility === 'unknown';
    const fill = unknown ? '#2b4941' : palette[tile.terrain ?? 'plain'];
    this.polygon([[p.x - 38, p.y], [p.x, p.y + 21], [p.x, p.y + 29], [p.x - 38, p.y + 8]], unknown ? '#233e38' : '#67735a');
    this.polygon([[p.x, p.y + 21], [p.x + 38, p.y], [p.x + 38, p.y + 8], [p.x, p.y + 29]], unknown ? '#203b36' : '#526951');
    this.diamond(p.x, p.y, fill, unknown ? '#38564a' : '#bac39f', 0.7);
    if (unknown) {
      const n = (tile.x * 17 + tile.y * 31) % 7;
      this.ctx.strokeStyle = 'rgba(137,158,125,.18)'; this.ctx.lineWidth = 1;
      this.ctx.beginPath(); this.ctx.ellipse(p.x + n - 3, p.y - 3, 16, 5, 0, Math.PI, 2 * Math.PI); this.ctx.stroke();
      this.ctx.beginPath(); this.ctx.ellipse(p.x - n + 3, p.y + 3, 11, 3, 0, 0, Math.PI); this.ctx.stroke();
    } else if (tile.terrain === 'water') {
      this.ctx.strokeStyle = '#abc3b3'; this.ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) { this.ctx.beginPath(); this.ctx.moveTo(p.x - 10 + i * 3, p.y + i * 6); this.ctx.lineTo(p.x + 11 + i * 3, p.y + i * 6 - 1); this.ctx.stroke(); }
    } else if (tile.terrain === 'plain') {
      this.ctx.strokeStyle = '#899c6c'; this.ctx.lineWidth = 1;
      this.ctx.beginPath(); this.ctx.moveTo(p.x - 16, p.y + 3); this.ctx.lineTo(p.x - 17, p.y - 1); this.ctx.moveTo(p.x - 14, p.y + 3); this.ctx.lineTo(p.x - 12, p.y); this.ctx.stroke();
    }
  }

  private drawScenery(tile: KnownTile, p: Point): void {
    if (tile.terrain === 'forest') {
      for (const [dx, dy, h] of [[-16, -1, 23], [5, -5, 31], [19, 5, 22]]) {
        this.ctx.fillStyle = '#536f54'; this.ctx.fillRect(p.x + dx - 1.5, p.y + dy - 6, 3, 9);
        this.polygon([[p.x + dx, p.y + dy - h], [p.x + dx + 10, p.y + dy - 5], [p.x + dx - 10, p.y + dy - 5]], '#305d4c');
        this.polygon([[p.x + dx, p.y + dy - h], [p.x + dx - 10, p.y + dy - 5], [p.x + dx, p.y + dy - 8]], '#47775a');
      }
    } else if (tile.terrain === 'mountain') {
      this.polygon([[p.x - 26, p.y + 4], [p.x - 5, p.y - 39], [p.x + 19, p.y + 7]], '#6d8179');
      this.polygon([[p.x - 5, p.y - 39], [p.x + 19, p.y + 7], [p.x + 1, p.y + 2]], '#4d6863');
      this.polygon([[p.x - 5, p.y - 39], [p.x - 13, p.y - 22], [p.x - 5, p.y - 26], [p.x + 3, p.y - 21]], '#dee0c7');
      this.polygon([[p.x + 3, p.y + 6], [p.x + 18, p.y - 22], [p.x + 31, p.y + 7]], '#89998a');
    } else if (tile.terrain === 'hill') {
      this.polygon([[p.x - 26, p.y + 3], [p.x - 3, p.y - 17], [p.x + 23, p.y + 4], [p.x, p.y + 14]], '#bdc09d');
      this.polygon([[p.x - 3, p.y - 17], [p.x + 23, p.y + 4], [p.x, p.y + 14]], '#919d7b');
    }
  }

  private drawSite(tile: KnownTile, p: Point): void {
    const site = tile.site!;
    const own = site.owner === this.view?.actor;
    const enemy = site.owner !== undefined && site.owner !== null && !own;
    const flag = own ? '#ebc26e' : enemy ? '#c17a63' : '#d7d4b6';
    this.ctx.fillStyle = 'rgba(24,48,42,.18)'; this.ctx.beginPath(); this.ctx.ellipse(p.x, p.y + 6, 23, 10, 0, 0, Math.PI * 2); this.ctx.fill();
    const capital = site.centerOf !== undefined;
    const h = capital ? 26 : 19;
    this.polygon([[p.x - 14, p.y - h], [p.x, p.y - h - 7], [p.x + 14, p.y - h], [p.x, p.y - h + 7]], '#eeead0');
    this.polygon([[p.x - 14, p.y - h], [p.x, p.y - h + 7], [p.x, p.y + 7], [p.x - 14, p.y]], '#bdbca2');
    this.polygon([[p.x, p.y - h + 7], [p.x + 14, p.y - h], [p.x + 14, p.y], [p.x, p.y + 7]], '#9fa895');
    this.polygon([[p.x - 17, p.y - h - 1], [p.x, p.y - h - 13], [p.x + 17, p.y - h - 1], [p.x, p.y - h + 5]], capital ? '#4d6d57' : '#92765c');
    this.ctx.fillStyle = '#3c5547'; this.ctx.fillRect(p.x - 7, p.y - 12, 4, 8);
    this.ctx.strokeStyle = '#d7d3aa'; this.ctx.lineWidth = 2; this.ctx.beginPath(); this.ctx.moveTo(p.x + 18, p.y + 1); this.ctx.lineTo(p.x + 18, p.y - 34); this.ctx.stroke();
    this.polygon([[p.x + 19, p.y - 33], [p.x + 34, p.y - 28], [p.x + 19, p.y - 23]], flag);
    if (this.camera.zoom > 0.54) {
      this.ctx.font = 'bold 11px "PingFang TC", sans-serif'; this.ctx.textAlign = 'center';
      const label = capital ? '中心' : site.owner === null ? '村莊' : '據點';
      this.ctx.fillStyle = '#1d3b31'; this.ctx.fillRect(p.x - 22, p.y + 10, 44, 16);
      this.ctx.fillStyle = '#eee5c7'; this.ctx.fillText(label, p.x, p.y + 22);
    }
  }

  private drawRelic(p: Point): void {
    this.ctx.fillStyle = 'rgba(237,211,134,.2)'; this.ctx.beginPath(); this.ctx.ellipse(p.x, p.y + 1, 17, 9, 0, 0, Math.PI * 2); this.ctx.fill();
    this.polygon([[p.x - 6, p.y - 22], [p.x + 3, p.y - 26], [p.x + 7, p.y - 1], [p.x - 4, p.y + 3]], '#b0baa6', '#dedcbd');
    this.polygon([[p.x + 3, p.y - 26], [p.x + 7, p.y - 1], [p.x + 1, p.y + 1]], '#82978d');
    this.ctx.strokeStyle = '#efd391'; this.ctx.lineWidth = 2; this.ctx.beginPath(); this.ctx.moveTo(p.x - 1, p.y - 17); this.ctx.lineTo(p.x + 1, p.y - 9); this.ctx.stroke();
    this.circle(p.x - 12, p.y - 15, 2, '#ecd390');
  }

  private drawUnit(unit: Unit, p: Point, target: boolean): void {
    const own = unit.owner === this.view?.actor;
    const chosen = unit.id === this.selection.unitId;
    const c = this.ctx;
    const x = p.x, y = p.y - 10;
    c.fillStyle = 'rgba(23,42,32,.3)'; c.beginPath(); c.ellipse(x, y + 11, 15, 7, 0, 0, Math.PI * 2); c.fill();
    if (chosen) this.circle(x, y - 2, 19, 'rgba(245,219,142,.16)', '#f3d898');
    this.circle(x, y - 2, 13, own ? '#263f35' : '#754e43', own ? '#ebd491' : '#e6aa90');
    c.strokeStyle = own ? '#f2dfad' : '#f4d7b4'; c.lineWidth = 2.3; c.lineCap = 'round';
    c.beginPath();
    if (unit.kind === 'infantry') {
      c.moveTo(x - 5, y - 8); c.lineTo(x + 5, y + 3); c.moveTo(x + 5, y - 8); c.lineTo(x - 5, y + 3);
      c.moveTo(x - 8, y + 1); c.lineTo(x - 3, y + 6); c.moveTo(x + 8, y + 1); c.lineTo(x + 3, y + 6);
    } else if (unit.kind === 'scout') {
      c.moveTo(x - 6, y + 4); c.lineTo(x, y - 7); c.lineTo(x + 6, y + 4); c.moveTo(x, y - 7); c.lineTo(x, y + 5);
    } else {
      c.arc(x - 4, y - 2, 8, -Math.PI / 2, Math.PI / 2); c.moveTo(x - 4, y - 10); c.lineTo(x - 4, y + 6); c.moveTo(x - 6, y - 2); c.lineTo(x + 8, y - 2);
    }
    c.stroke(); c.lineCap = 'butt';
    c.fillStyle = '#263c31'; c.fillRect(x - 12, y + 16, 24, 4);
    c.fillStyle = own ? '#e8d699' : '#d3967e'; c.fillRect(x - 12, y + 16, 24 * unit.hp / UNIT_STATS[unit.kind].hp, 4);
    if (unit.moved && unit.acted) this.circle(x + 12, y - 12, 4, '#a8b89c');
    if (target) {
      c.strokeStyle = '#f2b79b'; c.lineWidth = 2; c.strokeRect(x - 22, y - 24, 44, 46);
      c.font = 'bold 10px "PingFang TC", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#f2d0b6'; c.fillText('可攻擊', x, y - 29);
    }
  }

  private drawCompass(): void {
    const c = this.ctx, x = this.width - 42, y = this.height - 48;
    c.strokeStyle = '#a9b89a'; c.lineWidth = 1;
    c.beginPath(); c.arc(x, y, 20, 0, Math.PI * 2); c.stroke();
    this.polygon([[x, y - 17], [x + 5, y + 8], [x, y + 3], [x - 5, y + 8]], '#bbcea6');
    c.font = '10px ui-monospace, monospace'; c.fillStyle = '#c5d0b5'; c.textAlign = 'center'; c.fillText('N', x, y - 27);
  }
}
