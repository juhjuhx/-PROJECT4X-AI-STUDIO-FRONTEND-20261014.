import type { KnownTile, Observation, Point, Unit } from '../core/types';
import type { DeepReadonly } from '../session/contracts';
import { UNIT_STATS } from '../core/types';
import { getTerrainVisual } from './visual-registry';
import { paintMiniature } from './miniatures';

type MapSelection = { tile: Point | null; unitId: string | null };
type Pointer = { x: number; y: number };

/**
 * WorldMap: 2.5D 等角地圖 Canvas2D 渲染器
 * 依據專案邊界：僅接收玩家投影的 Observation，絕不存取或修改 GameState 核心真相。
 */
export class WorldMap {
  private readonly ctx: CanvasRenderingContext2D;
  private view: DeepReadonly<Observation> | null = null;
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
  private hoverPoint: Point | null = null;

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
    canvas.addEventListener('pointerleave', () => { this.hoverPoint = null; this.requestDraw(); });
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const r = canvas.getBoundingClientRect();
      this.zoomBy(Math.exp(-event.deltaY * 0.0015), { x: event.clientX - r.left, y: event.clientY - r.top });
    }, { passive: false });
  }

  update(view: DeepReadonly<Observation>, selection: MapSelection): void {
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
    this.camera.zoom = Math.max(0.24, Math.min(2.4, before * factor));
    // Maintain current focus center (screen center) when zooming with +/- buttons
    const a = anchor ?? { x: this.width / 2, y: this.height / 2 };
    this.camera.x += (a.x - this.width / 2) * (1 / before - 1 / this.camera.zoom);
    this.camera.y += (a.y - this.height / 2) * (1 / before - 1 / this.camera.zoom);
    this.requestDraw();
  }

  getCamera(): { x: number; y: number; zoom: number } {
    return { ...this.camera };
  }

  screenToWorld(p: Pointer): Pointer {
    return {
      x: (p.x - this.width / 2) / this.camera.zoom + this.camera.x,
      y: (p.y - this.height / 2) / this.camera.zoom + this.camera.y,
    };
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
    // Match the visible upright figure before the ground behind its head.
    // Last-painted/frontmost units win; unknown tiles never create hit targets.
    if (this.view) {
      const visible = new Set(this.view.tiles.filter(tile => tile.visibility !== 'unknown').map(tile => `${tile.x},${tile.y}`));
      const units = [...this.view.units].sort((a,b) => (b.x+b.y)-(a.x+a.y) || b.x-a.x);
      for (const unit of units) {
        if (!visible.has(`${unit.x},${unit.y}`)) continue;
        const foot = this.project(unit);
        if (wx >= foot.x-15 && wx <= foot.x+24 && wy >= foot.y-40 && wy <= foot.y+7) return {x:unit.x,y:unit.y};
      }
    }
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
    const p = this.pointerPosition(event);
    const gridP = this.pointAt(p);
    if (gridP?.x !== this.hoverPoint?.x || gridP?.y !== this.hoverPoint?.y) {
      this.hoverPoint = gridP;
      if (!this.gesture?.moved) this.requestDraw();
    }
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, p);
    if (this.pointers.size > 1) {
      const ps = [...this.pointers.values()];
      const distance = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (this.pinchDistance > 0) this.zoomBy(distance / this.pinchDistance, { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 });
      this.pinchDistance = distance;
    } else if (this.gesture) {
      if (Math.hypot(p.x - this.gesture.origin.x, p.y - this.gesture.origin.y) > 6) this.gesture.moved = true;
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
    this.requestDraw();
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

  private circle(x: number, y: number, radius: number, fill: string, stroke?: string, lineWidth = 1.5): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  private draw(): void {
    const c = this.ctx;
    c.clearRect(0, 0, this.width, this.height);

    // Deep atmospheric celestial mist background (Diorama miniature tabletop setting)
    const bg = c.createRadialGradient(
      this.width * 0.48,
      this.height * 0.42,
      20,
      this.width * 0.5,
      this.height * 0.5,
      Math.max(this.width, this.height) * 0.92
    );
    bg.addColorStop(0, '#1d342d');
    bg.addColorStop(0.45, '#142520');
    bg.addColorStop(1, '#0b1512');
    c.fillStyle = bg;
    c.fillRect(0, 0, this.width, this.height);

    // Subtle table grain vignette lines
    c.strokeStyle = 'rgba(215, 230, 205, 0.025)';
    c.lineWidth = 1;
    for (let gy = 24; gy < this.height; gy += 48) {
      c.beginPath();
      c.moveTo(0, gy);
      c.lineTo(this.width, gy);
      c.stroke();
    }

    if (!this.view) return;

    c.save();
    c.translate(this.width / 2, this.height / 2);
    c.scale(this.camera.zoom, this.camera.zoom);
    c.translate(-this.camera.x, -this.camera.y);

    // Isometric depth sorting (back to front: row + col)
    const tiles = [...this.view.tiles].sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.x - b.x);
    const moveKeys = new Set(this.view.legalActions.flatMap((a) => a.type === 'Move' && a.unitId === this.selection.unitId ? [`${a.to.x},${a.to.y}`] : []));
    const targetIds = new Set(this.view.legalActions.flatMap((a) => a.type === 'Attack' && a.unitId === this.selection.unitId ? [a.targetId] : []));
    const unitMap = new Map(this.view.units.map((u) => [`${u.x},${u.y}`, u]));

    for (const tile of tiles) {
      const p = this.project(tile);
      const sx = (p.x - this.camera.x) * this.camera.zoom + this.width / 2;
      const sy = (p.y - this.camera.y) * this.camera.zoom + this.height / 2;
      if (sx < -120 || sx > this.width + 120 || sy < -160 || sy > this.height + 120) continue;

      this.drawTile(tile, p);
      const key = `${tile.x},${tile.y}`;

      // Move Destination Beacon (Golden ancient compass runic glyph)
      if (moveKeys.has(key)) {
        this.diamond(p.x, p.y, 'rgba(240, 222, 142, 0.28)', '#f2db8a', 2.2, 2);
        this.circle(p.x, p.y, 4.5, '#fff4cc', '#c29d47', 1.6);
        // Cardinal pointers
        c.strokeStyle = '#f5df94';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(p.x - 8, p.y); c.lineTo(p.x + 8, p.y);
        c.moveTo(p.x, p.y - 5); c.lineTo(p.x, p.y + 5);
        c.stroke();
      }

      // Hover Tile indicator (Tactical faint grid highlight)
      if (this.hoverPoint && this.hoverPoint.x === tile.x && this.hoverPoint.y === tile.y && !moveKeys.has(key)) {
        this.diamond(p.x, p.y, 'rgba(255, 255, 255, 0.09)', 'rgba(235, 240, 215, 0.5)', 1.2, 1);
      }

      // Selection Marker (Chiseled Golden Tactical Double Frame)
      if (this.selection.tile?.x === tile.x && this.selection.tile?.y === tile.y) {
        this.diamond(p.x, p.y, 'rgba(242, 194, 98, 0.24)', '#f8ce6d', 2.8, 1);
        this.diamond(p.x, p.y, 'transparent', '#fff2cf', 1.2, 4);
      }

      if (tile.visibility !== 'unknown') {
        this.drawScenery(tile, p);
        if (tile.site) this.drawSite(tile, p);
        if (tile.relic && !tile.relic.resolved) this.drawRelic(p);
        const unit = unitMap.get(key);
        if (unit) this.drawUnit(unit, p, targetIds.has(unit.id));

        // Explored fog veil (historical cartographic memory ink wash)
        if (tile.visibility === 'explored') {
          this.diamond(p.x, p.y, 'rgba(11, 23, 20, 0.46)');
          // Fine antique hatching lines
          c.strokeStyle = 'rgba(180, 195, 175, 0.12)';
          c.lineWidth = 0.8;
          c.beginPath();
          c.moveTo(p.x - 18, p.y); c.lineTo(p.x + 18, p.y);
          c.moveTo(p.x - 9, p.y - 4); c.lineTo(p.x + 9, p.y + 4);
          c.stroke();
        }
      }
    }

    c.restore();

    this.drawCompass();
    this.drawMiniOverlay();
  }

  private drawTile(tile: DeepReadonly<KnownTile>, p: Point): void {
    const unknown = tile.visibility === 'unknown';
    const c = this.ctx;

    if (unknown) {
      // 3D Isometric Unknown Tile Slab (Deep Obsidian Tabletop Pedestal)
      this.polygon([[p.x - 38, p.y], [p.x, p.y + 21], [p.x, p.y + 31], [p.x - 38, p.y + 10]], '#172924');
      this.polygon([[p.x, p.y + 21], [p.x + 38, p.y], [p.x + 38, p.y + 10], [p.x, p.y + 31]], '#111e1a');
      this.diamond(p.x, p.y, '#1f3630', '#29453d', 1);

      // Arcane Cloud Mist & Constellation Swirl
      const seed = (tile.x * 23 + tile.y * 37) % 11;
      c.strokeStyle = 'rgba(164, 188, 155, 0.26)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(p.x - 4 + seed, p.y - 2, 8, 0.2 * Math.PI, 1.4 * Math.PI);
      c.stroke();
      c.beginPath();
      c.arc(p.x + 5 - (seed % 5), p.y + 3, 7, 1.1 * Math.PI, 2.2 * Math.PI);
      c.stroke();
      if (seed % 3 === 0) {
        c.fillStyle = 'rgba(220, 235, 200, 0.42)';
        c.beginPath();
        c.arc(p.x + 2, p.y - 1, 1.6, 0, Math.PI * 2);
        c.fill();
      }
      return;
    }

    // Known Visible/Explored Terrain (Grounded Diorama Palette)
    const terrain = tile.terrain ?? 'plain';
    const [topFill, leftSide, rightSide] = getTerrainVisual(tile).slab;

    // Front-left facet (Lit morning sun facet)
    this.polygon([[p.x - 38, p.y], [p.x, p.y + 21], [p.x, p.y + 31], [p.x - 38, p.y + 10]], leftSide);
    // Front-right facet (Shaded bedrock facet)
    this.polygon([[p.x, p.y + 21], [p.x + 38, p.y], [p.x + 38, p.y + 10], [p.x, p.y + 31]], rightSide);

    // Bedrock strata fissure line
    c.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(p.x - 38, p.y + 5); c.lineTo(p.x, p.y + 26); c.lineTo(p.x + 38, p.y + 5);
    c.stroke();

    // Top Diamond Slab Face
    this.diamond(p.x, p.y, topFill, 'rgba(240, 245, 225, 0.25)', 1);

    // Decorative procedural ground details
    if (terrain === 'water') {
      // Shoreline gentle foam ripples and surface depth
      c.strokeStyle = 'rgba(215, 242, 246, 0.52)';
      c.lineWidth = 1.3;
      c.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(p.x - 15 + i * 4, p.y + i * 5);
        c.lineTo(p.x + 11 + i * 4, p.y + i * 5 - 1.5);
        c.stroke();
      }
      c.lineCap = 'butt';
    } else if (terrain === 'plain') {
      // Stylized grass blades & clover spots
      c.strokeStyle = '#6b8253';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(p.x - 12, p.y + 4); c.lineTo(p.x - 14, p.y - 2);
      c.moveTo(p.x - 10, p.y + 4); c.lineTo(p.x - 9, p.y - 1);
      c.stroke();
      c.fillStyle = '#b7c79e';
      c.beginPath();
      c.arc(p.x + 11, p.y - 2, 1.5, 0, Math.PI * 2);
      c.fill();
    }
  }

  private drawScenery(tile: DeepReadonly<KnownTile>, p: Point): void {
    const c = this.ctx;
    if (tile.terrain === 'forest') {
      // 3D Multi-tiered low-poly pine trees with shaded trunks & directional light
      const trees = [
        { dx: -15, dy: 0, h: 23, r: 8.5 },
        { dx: 4, dy: -6, h: 29, r: 10.5 },
        { dx: 17, dy: 4, h: 22, r: 7.5 },
      ];
      const variation = (tile.x * 17 + tile.y * 11) % 3;
      for (const original of trees) {
        const t = { ...original, h: original.h + variation * 2, dx: original.dx + (variation - 1) * 2 };
        const tx = p.x + t.dx;
        const ty = p.y + t.dy;
        // Shadow puddle
        c.fillStyle = 'rgba(18, 38, 28, 0.32)';
        c.beginPath();
        c.ellipse(tx, ty + 1, t.r + 2, 4, 0, 0, Math.PI * 2);
        c.fill();

        // Wood trunk
        c.fillStyle = '#423321';
        c.fillRect(tx - 1.5, ty - 6, 3, 9);

        // Lower tier
        this.polygon([[tx, ty - t.h * 0.65], [tx + t.r, ty - 4], [tx - t.r, ty - 4]], '#284f3f');
        this.polygon([[tx, ty - t.h * 0.65], [tx + t.r, ty - 4], [tx, ty - 2]], '#1e3e31');
        // Upper tier (sunlit peak)
        this.polygon([[tx, ty - t.h], [tx + t.r * 0.8, ty - t.h * 0.45], [tx - t.r * 0.8, ty - t.h * 0.45]], '#3f6e57');
        this.polygon([[tx, ty - t.h], [tx - t.r * 0.8, ty - t.h * 0.45], [tx, ty - t.h * 0.4]], '#52856c');
      }
    } else if (tile.terrain === 'mountain') {
      // Faceted alpine peak with snowcap (height balanced to avoid obscuring units)
      // Base shadow / mountain footprint
      this.polygon([[p.x - 29, p.y + 4], [p.x - 4, p.y - 41], [p.x + 23, p.y + 7]], '#62736b');
      this.polygon([[p.x - 4, p.y - 41], [p.x + 23, p.y + 7], [p.x + 3, p.y + 3]], '#475650');
      // Sunlit facet
      this.polygon([[p.x - 29, p.y + 4], [p.x - 4, p.y - 41], [p.x - 8, p.y + 2]], '#7d8f86');
      // Snowcap summit
      this.polygon([[p.x - 4, p.y - 41], [p.x - 12, p.y - 25], [p.x - 4, p.y - 29], [p.x + 5, p.y - 24]], '#f4f8f2');
      this.polygon([[p.x - 4, p.y - 41], [p.x + 5, p.y - 24], [p.x - 4, p.y - 29]], '#dbe4d8');
      // Secondary crag
      this.polygon([[p.x + 2, p.y + 6], [p.x + 19, p.y - 22], [p.x + 31, p.y + 7]], '#85968c');
      this.polygon([[p.x + 19, p.y - 22], [p.x + 13, p.y - 12], [p.x + 24, p.y - 10]], '#eaf0e6');
    } else if (tile.terrain === 'hill') {
      // Terraced tiered hill plateau with a readable pale upper contour
      this.polygon([[p.x - 26, p.y + 3], [p.x - 3, p.y - 18], [p.x + 23, p.y + 4], [p.x, p.y + 14]], '#abb391');
      this.polygon([[p.x - 3, p.y - 18], [p.x + 23, p.y + 4], [p.x, p.y + 14]], '#889472');
      this.polygon([[p.x - 16, p.y], [p.x - 2, p.y - 12], [p.x + 13, p.y + 1], [p.x, p.y + 7]], '#d1c6a0');
      c.strokeStyle = 'rgba(245, 236, 203, 0.5)'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(p.x - 16, p.y); c.lineTo(p.x - 2, p.y - 12); c.lineTo(p.x + 13, p.y + 1); c.stroke();
    }
  }

  private drawSite(tile: DeepReadonly<KnownTile>, p: Point): void {
    const site = tile.site!;
    const own = site.owner === this.view?.actor;
    const enemy = site.owner !== undefined && site.owner !== null && !own;
    const flag = own ? '#f3ce6d' : enemy ? '#d96c55' : '#e6e3c8';
    const c = this.ctx;

    // Ground footprint shadow
    c.fillStyle = 'rgba(15, 32, 28, 0.34)';
    c.beginPath();
    c.ellipse(p.x, p.y + 7, 26, 11, 0, 0, Math.PI * 2);
    c.fill();

    const capital = site.centerOf !== undefined;
    const h = capital ? 28 : 20;

    // Fortress / Citadel structure
    this.polygon([[p.x - 15, p.y - h], [p.x, p.y - h - 8], [p.x + 15, p.y - h], [p.x, p.y - h + 8]], '#f2eee0');
    this.polygon([[p.x - 15, p.y - h], [p.x, p.y - h + 8], [p.x, p.y + 8], [p.x - 15, p.y]], '#c9c7ae');
    this.polygon([[p.x, p.y - h + 8], [p.x + 15, p.y - h], [p.x + 15, p.y], [p.x, p.y + 8]], '#a8b09d');

    // Roof & Turrets
    if (capital) {
      // Grand Center: Tiered citadel keep
      this.polygon([[p.x - 18, p.y - h - 2], [p.x, p.y - h - 16], [p.x + 18, p.y - h - 2], [p.x, p.y - h + 6]], '#3a5f4c');
      this.polygon([[p.x - 18, p.y - h - 2], [p.x, p.y - h - 16], [p.x, p.y - h + 6]], '#4b755e');
      // Gilded dome spire
      this.circle(p.x, p.y - h - 18, 3.5, '#ffd978', '#b58f3c', 1);
    } else {
      // Outpost / Village roof
      const roofColor = site.owner === undefined ? '#66756a' : site.owner === null ? '#9c7b5d' : own ? '#4a6d59' : '#8f4a3e';
      this.polygon([[p.x - 16, p.y - h - 1], [p.x, p.y - h - 12], [p.x + 16, p.y - h - 1], [p.x, p.y - h + 5]], roofColor);
    }

    // Portal door
    c.fillStyle = '#27382f';
    c.fillRect(p.x - 5, p.y - 10, 4.5, 9);

    // Mast and Banner Flag (Long Dovetail Pennant)
    c.strokeStyle = '#e2dfc0';
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(p.x + 19, p.y + 2);
    c.lineTo(p.x + 19, p.y - 36);
    c.stroke();
    // Pennant Flag
    this.polygon([[p.x + 20, p.y - 35], [p.x + 36, p.y - 30], [p.x + 20, p.y - 25]], flag, '#23382c', 0.8);

    // Zero-Pill Architecture Title Plinth (Carved stone label at base)
    if (this.camera.zoom > 0.52) {
      c.font = 'bold 11px "Songti TC", "Noto Serif TC", serif';
      c.textAlign = 'center';
      const label = capital ? `${site.name} · 政治中心` : site.owner === undefined ? '所有權未知' : site.owner === null ? '中立村落' : own ? '己方據點' : '敵方據點';
      const plinthBg = capital ? '#1a3a30' : own ? '#244537' : enemy ? '#662f27' : '#33443b';
      const plinthText = capital ? '#ffecb3' : own ? '#f4eedb' : enemy ? '#ffded4' : '#e6e6dc';

      // Chiseled plaque frame
      c.fillStyle = plinthBg;
      c.fillRect(p.x - 30, p.y + 11, 60, 16);
      c.strokeStyle = own ? '#d8bf79' : 'rgba(255,255,255,0.25)';
      c.lineWidth = 1;
      c.strokeRect(p.x - 30, p.y + 11, 60, 16);

      c.fillStyle = plinthText;
      c.fillText(label, p.x, p.y + 23);
    }
  }

  private drawRelic(p: Point): void {
    const c = this.ctx;
    // Ambient golden aura
    const grad = c.createRadialGradient(p.x, p.y - 12, 4, p.x, p.y - 12, 26);
    grad.addColorStop(0, 'rgba(245, 215, 125, 0.45)');
    grad.addColorStop(0.7, 'rgba(230, 190, 80, 0.15)');
    grad.addColorStop(1, 'rgba(230, 190, 80, 0)');
    c.fillStyle = grad;
    c.beginPath();
    c.arc(p.x, p.y - 12, 26, 0, Math.PI * 2);
    c.fill();

    // Floating Ancient Obelisk / Monolith
    this.polygon([[p.x - 7, p.y - 24], [p.x + 3, p.y - 30], [p.x + 8, p.y - 3], [p.x - 4, p.y + 2]], '#b6c2ac', '#e8e5c8', 1.2);
    this.polygon([[p.x + 3, p.y - 30], [p.x + 8, p.y - 3], [p.x + 2, p.y + 1]], '#879e92');

    // Ancient Golden Inscription Rune
    c.strokeStyle = '#ffd973';
    c.lineWidth = 2.2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(p.x - 1, p.y - 19);
    c.lineTo(p.x + 2, p.y - 10);
    c.stroke();
    c.lineCap = 'butt';

    // Orbiting particles
    this.circle(p.x - 13, p.y - 16, 2.5, '#ffe58f', '#b89434', 1);
    this.circle(p.x + 14, p.y - 8, 1.8, '#ffe58f');
  }

  private drawUnit(unit: DeepReadonly<Unit>, p: Point, target: boolean): void {
    const own = unit.owner === this.view?.actor;
    const chosen = unit.id === this.selection.unitId;
    const c = this.ctx;
    const x = p.x, y = p.y - 11;
    const maxHp = UNIT_STATS[unit.kind].hp;

    // Unit shadow
    c.fillStyle = 'rgba(12, 26, 21, 0.4)';
    c.beginPath();
    c.ellipse(x, y + 13, 16, 7.5, 0, 0, Math.PI * 2);
    c.fill();

    // Tactical Golden selection pulse ring
    if (chosen) {
      this.circle(x, y - 2, 20, 'rgba(245, 218, 135, 0.24)', '#fbd77f', 2.5);
      this.circle(x, y - 2, 23, 'transparent', 'rgba(255, 235, 175, 0.45)', 1);
    }

    paintMiniature(c, x, p.y, unit.kind, own);

    // Chiseled Stone HP Bar (Zero-pill flat slate)
    const barW = 26;
    const barH = 5;
    const barX = x - barW / 2;
    const barY = y + 15;
    const hpRatio = Math.max(0, Math.min(1, unit.hp / maxHp));

    c.fillStyle = 'rgba(18, 30, 24, 0.92)';
    c.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    c.strokeStyle = 'rgba(255,255,255,0.25)';
    c.lineWidth = 0.8;
    c.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

    const hpColor = hpRatio > 0.6 ? (own ? '#62bd79' : '#e06f58') : hpRatio > 0.3 ? '#e3af42' : '#e8453c';
    c.fillStyle = hpColor;
    c.fillRect(barX, barY, Math.max(3, barW * hpRatio), barH);

    // Turn Spent Badge (subtle bronze rest seal when moved and acted)
    if (unit.moved && unit.acted) {
      this.circle(x + 13, y - 13, 4.5, '#7b8774', '#e2e7dc', 1.2);
    }

    // Target Attack Crosshairs Bracket
    if (target) {
      c.strokeStyle = '#ff6b57';
      c.lineWidth = 2.4;
      const r = 21;
      const len = 7;
      // Top-left
      c.beginPath(); c.moveTo(x - r, y - r + len); c.lineTo(x - r, y - r); c.lineTo(x - r + len, y - r); c.stroke();
      // Top-right
      c.beginPath(); c.moveTo(x + r - len, y - r); c.lineTo(x + r, y - r); c.lineTo(x + r, y - r + len); c.stroke();
      // Bottom-left
      c.beginPath(); c.moveTo(x - r, y + r - len); c.lineTo(x - r, y + r); c.lineTo(x - r + len, y + r); c.stroke();
      // Bottom-right
      c.beginPath(); c.moveTo(x + r - len, y + r); c.lineTo(x + r, y + r); c.lineTo(x + r, y + r - len); c.stroke();

      // "可攻擊" Tactical Plaque
      c.fillStyle = '#b32d20';
      c.fillRect(x - 22, y - 37, 44, 16);
      c.strokeStyle = '#ffd8cc';
      c.lineWidth = 1;
      c.strokeRect(x - 22, y - 37, 44, 16);

      c.font = 'bold 10px "Songti TC", "Noto Serif TC", serif';
      c.textAlign = 'center';
      c.fillStyle = '#fff0eb';
      c.fillText('可攻擊', x, y - 25);
    }
  }

  private drawCompass(): void {
    const c = this.ctx;
    const x = this.width - 42;
    const y = this.height - 48;

    c.fillStyle = 'rgba(19, 36, 32, 0.88)';
    c.beginPath();
    c.arc(x, y, 22, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#b88c4a';
    c.lineWidth = 1.6;
    c.stroke();

    // North Needle
    this.polygon([[x, y - 17], [x + 5, y + 6], [x, y + 2], [x - 5, y + 6]], '#d6e8c0');
    // South Needle
    this.polygon([[x, y + 17], [x + 5, y + 6], [x, y + 2], [x - 5, y + 6]], '#45594b');

    c.font = 'bold 11px ui-monospace, monospace';
    c.fillStyle = '#f4eedb';
    c.textAlign = 'center';
    c.fillText('N', x, y - 26);
  }

  private drawMiniOverlay(): void {
    const c = this.ctx;
    c.font = '12px ui-monospace, monospace';
    c.fillStyle = '#b7c6b3';
    c.textAlign = 'left';
    c.fillText(`24 × 24  ·  等角沙盤  ·  ${Math.round(this.camera.zoom * 100)}%`, 20, this.height - 20);
  }
}
