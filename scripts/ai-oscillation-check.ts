import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createGame, applyCommand, observe } from '../src/core/game';
import { chooseAction } from '../src/core/ai';
import type { Point } from '../src/core/types';

// C5診斷Gate：生成局的有限prefix；不是800回合終局測試的替代品。
// 回傳exit1表示發現持續兩格往返，不能把『成功重現缺陷』當遊戲PASS。
const seed = '獨立QA-010';
const maxCommands = 1100;
const started = performance.now();
const sources = ['src/core/ai.ts', 'src/core/game.ts', 'src/core/types.ts', 'package-lock.json'];
const hashes = () => Object.fromEntries(sources.map(path => [path,
  createHash('sha256').update(readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)))).digest('hex'),
]));
const sourceStart = hashes();
type MoveSample = { command: number; turn: number; from: Point; to: Point; hp: number; newlyKnown: number };
const tracks = new Map<string, MoveSample[]>();
const loops = new Map<string, MoveSample[]>();
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
let state = createGame(seed);
let commands = 0;
for (; commands < maxCommands && state.winner === null; commands++) {
  assert.ok(performance.now() - started < 60_000, '診斷prefix超時；結果UNVERIFIED');
  const actor = state.active;
  const before = observe(state, actor);
  const action = chooseAction(before); // 只給合法Observation，無全知state或歷史。
  assert.ok(action, '進行中遊戲應有合法action');
  const result = applyCommand(state, {
    actor, expectedVersion: state.version, requestId: `headless-10-${commands}`, action,
  });
  assert.ok(result.ok, result.error ?? '診斷policy回傳的合法command遭拒');
  assert.equal(result.state.version, state.version + 1);
  if ('unitId' in action) {
    const key = `${actor}:${action.unitId}`;
    if (action.type === 'Attack' || action.type === 'Capture') tracks.delete(key);
    if (action.type === 'Move') {
      const unit = before.units.find(u => u.id === action.unitId && u.owner === actor)!;
      const after = observe(result.state, actor);
      const newlyKnown = after.tiles.filter(t => t.visibility !== 'unknown').length
        - before.tiles.filter(t => t.visibility !== 'unknown').length;
      const sample = { command: commands + 1, turn: state.turn, from: { x: unit.x, y: unit.y },
        to: { ...action.to }, hp: unit.hp, newlyKnown };
      const recent = [...(tracks.get(key) ?? []), sample].slice(-6);
      tracks.set(key, recent);
      const twoCells = new Set(recent.flatMap(m => [JSON.stringify(m.from), JSON.stringify(m.to)]));
      if (!loops.has(key) && recent.length === 6 && twoCells.size === 2
        && recent.every(m => m.newlyKnown === 0 && m.hp === recent[0].hp)
        && recent.slice(1).every((m, i) => same(m.from, recent[i].to) && same(m.to, recent[i].from))) {
        loops.set(key, recent);
      }
    }
  }
  state = result.state;
}
assert.deepEqual(hashes(), sourceStart, '執行中核心source不得改變');
const report = {
  schema: 'project4x-ai-oscillation-1', seed, maxCommands, commands,
  terminalWinner: state.winner,
  status: loops.size ? 'TESTED_FAIL' : 'TESTED_PASS',
  scope: 'six consecutive unit Moves alternating two cells, no new exploration/Attack/Capture or HP change; finite generated prefix only',
  policyBoundary: 'chooseAction(observe(state, actor))', sourceStart,
  milliseconds: Math.round(performance.now() - started),
  loops: [...loops].map(([unit, moves]) => ({ unit, moves })),
  limitations: 'Does not establish global causality, completion, or full100 rate. Output is QA-only; never a HUD data source.',
};
console.log(JSON.stringify(report, null, 2));
assert.equal(loops.size, 0, '固定生成prefix出現六次無探索兩格往返；AI尚未修復');
