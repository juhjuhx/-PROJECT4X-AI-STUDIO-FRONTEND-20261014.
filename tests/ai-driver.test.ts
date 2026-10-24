import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCommand, createGame, observe } from '../src/core/game';
import type { Action, Observation } from '../src/core/types';
import { createAIDriver } from '../src/session/ai-driver';
import type { AIHooks, AIPolicy, Scheduler } from '../src/session/ai-driver';
import type { AIStatus, DeepReadonly } from '../src/session/contracts';

// 此檔是現存 driver 的事後邊界驗證，不宣稱 test-first RED。
// hooks 只隔離排程與發布；1000 次接受不代表核心允許連續 1000 次此行動。
class ManualScheduler implements Scheduler {
  private next = 0;
  readonly pending = new Map<number, () => void>();
  readonly callbacks: (() => void)[] = [];
  set(callback: () => void, _delay: number): unknown {
    const handle = ++this.next;
    this.pending.set(handle, callback);
    this.callbacks.push(callback);
    return handle;
  }
  clear(handle: unknown): void { this.pending.delete(handle as number); }
  tick(): void {
    const task = this.pending.entries().next().value;
    assert.ok(task, '預期仍有待執行排程');
    this.pending.delete(task[0]);
    task[1]();
  }
}

function aiObservation(): Observation {
  const state = createGame('霧境初航-01');
  const result = applyCommand(state, {
    actor: 0, requestId: 'driver-fixture', expectedVersion: 0, action: { type: 'EndTurn' },
  });
  assert.equal(result.ok, true);
  return observe(result.state, 1);
}

function harness(policy?: AIPolicy) {
  const clock = new ManualScheduler();
  let view = aiObservation();
  let status: AIStatus = { phase: 'idle' };
  let generation = 0;
  let disposed = false;
  const statuses: AIStatus[] = [];
  const submitted: { action: DeepReadonly<Action>; version: number }[] = [];
  const diagnostics: Parameters<AIHooks['diagnose']>[0][] = [];
  let publishStatus: (next: AIStatus) => void = () => {};
  let publishSubmit: () => boolean = () => true;
  const driver = createAIDriver({
    view: () => view,
    generation: () => generation,
    disposed: () => disposed,
    status: () => status,
    setStatus(next) { status = next; statuses.push(next); publishStatus(next); },
    submit(action, version) { submitted.push({ action, version }); return publishSubmit(); },
    diagnose: code => diagnostics.push(code),
  }, { scheduler: clock, policy: policy ?? (current => current.legalActions[0] ?? null) });
  return {
    driver, clock, statuses, submitted, diagnostics,
    get view() { return view; },
    get status() { return status; },
    replaceView(next: Observation) { view = next; },
    nextGeneration() { generation++; },
    dispose() { disposed = true; driver.stop(); },
    onStatus(callback: typeof publishStatus) { publishStatus = callback; },
    onSubmit(callback: typeof publishSubmit) { publishSubmit = callback; },
    idle() { status = { phase: 'idle' }; },
  };
}

test('C2-D 邊界：policy 回 null 時 no-action 暫停，不送替代 EndTurn 或虛構 winner', () => {
  const h = harness(() => null);
  const before = structuredClone(h.view);
  h.driver.begin(); h.clock.tick();
  assert.deepEqual(h.status, { phase: 'paused', reason: 'no-action' });
  assert.deepEqual(h.submitted, []);
  assert.deepEqual(h.diagnostics, []);
  assert.deepEqual(h.view, before);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：沒有合法 action 時不呼叫 policy，直接 no-action 暫停', () => {
  let decisions = 0;
  const h = harness(() => { decisions++; throw new Error('不應執行'); });
  h.replaceView({ ...h.view, legalActions: [] });
  h.driver.begin(); h.clock.tick();
  assert.equal(decisions, 0);
  assert.deepEqual(h.status, { phase: 'paused', reason: 'no-action' });
  assert.deepEqual(h.submitted, []);
  assert.deepEqual(h.diagnostics, []);
  assert.equal(h.view.winner, null);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：submit 拒絕時只嘗試一次並 command-rejected 暫停', () => {
  const h = harness();
  const before = structuredClone(h.view);
  h.onSubmit(() => false);
  h.driver.begin(); h.clock.tick();
  assert.deepEqual(h.submitted, [{ action: before.legalActions[0], version: before.version }]);
  assert.deepEqual(h.status, { phase: 'paused', reason: 'command-rejected' });
  assert.deepEqual(h.diagnostics, ['AI_COMMAND_REJECTED']);
  assert.deepEqual(h.view, before);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：恰好接受 1000 次後 safety-limit 暫停，沒有第 1001 次決策或 winner', () => {
  let decisions = 0;
  const h = harness(current => { decisions++; return current.legalActions[0]; });
  const initialVersion = h.view.version;
  h.onSubmit(() => {
    // 僅模擬已接受後的新觀測版本，沒有模擬 reducer 或宣稱核心玩法結果。
    h.replaceView({ ...h.view, version: h.view.version + 1 });
    return true;
  });
  h.driver.begin();
  for (let count = 0; count < 1000; count++) h.clock.tick();
  assert.equal(h.submitted.length, 1000);
  assert.equal(decisions, 1000);
  assert.deepEqual(h.submitted.map(entry => entry.version), Array.from({ length: 1000 }, (_, i) => initialVersion + i));
  assert.deepEqual(h.status, { phase: 'running' });
  assert.equal(h.clock.pending.size, 1);
  h.clock.tick();
  assert.deepEqual(h.status, { phase: 'paused', reason: 'safety-limit' });
  assert.equal(h.submitted.length, 1000);
  assert.equal(decisions, 1000);
  assert.equal(h.view.winner, null);
  assert.deepEqual(h.diagnostics, []);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：stop 後強制執行已取消 callback 也不決策、提交或發布', () => {
  let decisions = 0;
  const h = harness(current => { decisions++; return current.legalActions[0]; });
  h.driver.begin();
  const stale = h.clock.callbacks[0];
  h.driver.stop(); h.driver.stop();
  const published = [...h.statuses];
  stale();
  assert.equal(decisions, 0);
  assert.deepEqual(h.submitted, []);
  assert.deepEqual(h.statuses, published);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：generation 改變使舊 callback 失效，即使尚未呼叫 stop', () => {
  let decisions = 0;
  const h = harness(current => { decisions++; return current.legalActions[0]; });
  h.driver.begin(); h.nextGeneration();
  const published = [...h.statuses];
  h.clock.tick();
  assert.equal(decisions, 0);
  assert.deepEqual(h.submitted, []);
  assert.deepEqual(h.statuses, published);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：stop 後重開，同世代舊 callback 不得消耗新一批排程', () => {
  const h = harness(() => null);
  h.driver.begin();
  const stale = h.clock.callbacks[0];
  h.driver.stop(); h.idle(); h.driver.begin();
  stale();
  assert.deepEqual(h.status, { phase: 'running' });
  assert.deepEqual(h.submitted, []);
  assert.equal(h.clock.pending.size, 1);
  h.clock.tick();
  assert.deepEqual(h.status, { phase: 'paused', reason: 'no-action' });
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：running 狀態發布內 stop，不建立第一個 timer', () => {
  const h = harness();
  h.onStatus(next => { if (next.phase === 'running') h.driver.stop(); });
  h.driver.begin();
  assert.deepEqual(h.statuses, [{ phase: 'running' }]);
  assert.deepEqual(h.submitted, []);
  assert.equal(h.clock.callbacks.length, 0);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：成功 submit 的同步發布內 stop，保留已提交結果但不再排程', () => {
  const h = harness();
  const before = h.view.version;
  h.onSubmit(() => {
    h.replaceView({ ...h.view, version: before + 1 });
    h.driver.stop();
    return true;
  });
  h.driver.begin(); h.clock.tick();
  assert.equal(h.submitted.length, 1);
  assert.equal(h.view.version, before + 1);
  assert.deepEqual(h.statuses, [{ phase: 'running' }]);
  assert.equal(h.clock.callbacks.length, 1);
  assert.equal(h.clock.pending.size, 0);
  h.clock.callbacks[0]();
  assert.equal(h.submitted.length, 1);
});

test('C2-D 邊界：submit 發布內切換 generation，舊批次不得接著排程', () => {
  const h = harness();
  h.onSubmit(() => { h.nextGeneration(); return true; });
  h.driver.begin(); h.clock.tick();
  assert.equal(h.submitted.length, 1);
  assert.deepEqual(h.statuses, [{ phase: 'running' }]);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：policy 內 stop 後即使回傳 action 仍不可提交', () => {
  const h = harness(current => { h.driver.stop(); return current.legalActions[0]; });
  h.driver.begin(); h.clock.tick();
  assert.deepEqual(h.submitted, []);
  assert.deepEqual(h.statuses, [{ phase: 'running' }]);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：policy 拋錯只發布一般診斷碼與 decision-error，不外洩例外內容', () => {
  const h = harness(() => { throw new Error('隱藏敵方資料與堆疊不能公開'); });
  const before = structuredClone(h.view);
  h.driver.begin(); h.clock.tick();
  assert.deepEqual(h.status, { phase: 'paused', reason: 'decision-error' });
  assert.deepEqual(h.diagnostics, ['AI_DECISION_ERROR']);
  assert.doesNotMatch(JSON.stringify([h.statuses, h.diagnostics]), /隱藏敵方|堆疊/);
  assert.deepEqual(h.submitted, []);
  assert.deepEqual(h.view, before);
  assert.equal(h.clock.pending.size, 0);
});

test('C2-D 邊界：dispose 後強制執行舊 callback 不產生任何後續發布', () => {
  const h = harness();
  h.driver.begin(); h.dispose();
  const published = [...h.statuses];
  h.clock.callbacks[0]();
  assert.deepEqual(h.statuses, published);
  assert.deepEqual(h.submitted, []);
  assert.equal(h.clock.pending.size, 0);
});
