import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameSession } from '../src/session/game-session';
import type { SessionPorts } from '../src/session/game-session';
import type { ActionRequest, DeepReadonly, SessionUpdate } from '../src/session/contracts';
import type { Action } from '../src/core/types';
import { deserializeGame, replayGame, serializeGame } from '../src/core/persistence';
import { applyCommand, canonicalHash, createGame } from '../src/core/game';
import { createTerminalJourney } from './helpers/terminal-journey';

function request(ports: SessionPorts, action: Action, requestId: string = crypto.randomUUID()): ActionRequest {
  const stamp = ports.gameplay.getSnapshot().stamp;
  return { sessionId: stamp.sessionId, generation: stamp.generation, expectedVersion: stamp.version, requestId, action };
}

test('C2-A：正式 runtime factory 與分離的 capability 必須存在', async () => {
  const runtimePath = '../src/session/game-session.ts';
  const runtime = await import(runtimePath);
  assert.equal(typeof runtime?.createGameSession, 'function', '缺少 C1 契約的 GameSession runtime factory');
  const ports = runtime!.createGameSession({ seed: '霧境初航-01' });
  assert.deepEqual(Object.keys(ports).sort(), ['dispose', 'files', 'gameplay']);
  assert.deepEqual(Object.keys(ports.gameplay).sort(), ['getAvailableActions', 'getObservation', 'getSnapshot', 'resumeAI', 'submitAction', 'subscribe']);
  assert.deepEqual(Object.keys(ports.files).sort(), ['acknowledgeSave', 'exportReplay', 'load', 'newGame', 'save', 'verifyReplay']);
  const view = ports.gameplay.getObservation();
  assert.equal(view.seed, '霧境初航-01');
  assert.equal(view.version, 0);
  assert.equal(view.faction.gold, 8);
  assert.equal(Object.isFrozen(view.faction), true);
  assert.throws(() => { view.faction.gold = 999; }, TypeError);
  assert.equal(ports.gameplay.getObservation().faction.gold, 8);
  ports.dispose();
});

function saved(p: SessionPorts): string { const result=p.files.save(); assert.equal(result.ok,true); if(!result.ok) throw new Error('save未實作'); return result.file.text; }

test('C2-B/D：真合法旅程終局後成功重送仍 duplicate，終局狀態不再排程 AI', () => {
  const journey=createTerminalJourney(),clock=new Clock(),p=createGameSession({seed:'霧境初航-01',scheduler:clock});
  assert.equal(p.files.load(serializeGame(journey.previous),p.gameplay.getSnapshot().stamp).ok,true);
  const stamp=p.gameplay.getSnapshot().stamp;
  const finalRequest={sessionId:stamp.sessionId,generation:stamp.generation,...journey.lastCommand};
  const {actor: _actor,...last}=finalRequest;
  const applied=p.gameplay.submitAction(last);assert.ok(applied.ok);
  assert.equal(p.gameplay.getObservation().winner,0);
  assert.deepEqual(p.gameplay.getSnapshot().ai,{phase:'finished'});
  const final=p.gameplay.getSnapshot(), ledger=saved(p);
  const {actor: _earlyActor,...early}=journey.earlyHumanCommand;
  for(const retry of [last,{...early,sessionId:stamp.sessionId,generation:stamp.generation}]){
    const result=p.gameplay.submitAction(retry);
    assert.equal(result.ok&&result.disposition,'duplicate');assert.deepEqual(result.ok&&result.events,[]);
    assert.equal(p.gameplay.getSnapshot(),final);assert.equal(saved(p),ledger);
  }
  assert.equal(clock.tasks.size,0);assert.equal(p.gameplay.getAvailableActions().length,0);
  assert.equal(!p.gameplay.resumeAI(final.stamp).ok,true);
  p.dispose();
});

test('C0-03：兩段合法 history 的隱藏科技/經濟不同，相同觀測只得相同事件與公開錯誤', () => {
  const runs = (['farm','archery'] as const).map(tech => {
    const clock=new Clock(), updates: DeepReadonly<SessionUpdate>[]=[];
    const p=createGameSession({seed:'霧境初航-01',scheduler:clock,aiPolicy:()=>({type:'Research',tech})});
    p.gameplay.subscribe(u=>updates.push(u));
    const end=request(p,{type:'EndTurn'});assert.equal(p.gameplay.submitAction(end).ok,true);
    const before=p.gameplay.getObservation();clock.tick();
    const after=p.gameplay.getObservation();
    const result=p.gameplay.submitAction(request(p,{type:'Research',tech:'farm'}));
    const canonical=deserializeGame(saved(p));
    const commandUpdates=updates.filter(u=>u.cause==='command');
    p.dispose();
    return {before,after,events:commandUpdates.map(u=>u.events),error:!result.ok&&result.error,canonical};
  });
  assert.notDeepEqual(runs[0].canonical.factions[1],runs[1].canonical.factions[1],'隱藏世界必須真的不同');
  assert.deepEqual(runs[0].before,runs[1].before);assert.deepEqual(runs[0].after,runs[1].after);
  assert.deepEqual(runs[0].events,runs[1].events);assert.deepEqual(runs[0].events,[[],[]]);
  assert.deepEqual(runs[0].error,runs[1].error);assert.equal(runs[0].error&&runs[0].error.code,'NOT_YOUR_TURN');
});

test('C2-C/E：通知期間寫入拒絕；私有只讀匯出與驗證允許，錯誤不洩漏輸入', () => {
  const p=createGameSession({seed:'霧境初航-01'}), outcomes: unknown[]=[];
  const replay=p.files.exportReplay();assert.ok(replay.ok);
  p.gameplay.subscribe(u=>{
    if(u.cause!=='command')return;
    for(const result of [p.files.load('{',u.snapshot.stamp),p.files.newGame('other',u.snapshot.stamp),p.files.acknowledgeSave(u.snapshot.stamp),p.gameplay.resumeAI(u.snapshot.stamp)]) outcomes.push(!result.ok&&result.error.code);
    outcomes.push(p.files.save().ok,p.files.exportReplay().ok,p.files.verifyReplay(replay.file.text,u.snapshot.stamp).ok);
  });
  assert.ok(p.gameplay.submitAction(request(p,{type:'Research',tech:'farm'})).ok);
  assert.deepEqual(outcomes,['SESSION_BUSY','SESSION_BUSY','SESSION_BUSY','SESSION_BUSY',true,true,true]);
  const damaged=JSON.parse(saved(p));damaged.factions[0].gold=9999;
  const previous=p.gameplay.getSnapshot();const rejected=p.files.load(JSON.stringify(damaged),previous.stamp);
  assert.equal(!rejected.ok&&rejected.error.code,'INVALID_SAVE');assert.equal(p.gameplay.getSnapshot(),previous);
  assert.doesNotMatch(JSON.stringify(rejected),/9999|history|requests|stack/);
  p.dispose();
});

test('C2-F 接線：成功研究/遺跡回執只發布一次，重送與替換沒有動畫', () => {
  const p=createGameSession({seed:'霧境初航-01'}), updates: DeepReadonly<SessionUpdate>[]=[];
  p.gameplay.subscribe(u=>updates.push(u));
  const move=request(p,{type:'Move',unitId:'兵-1',to:{x:5,y:3}});
  assert.equal(p.gameplay.submitAction(move).ok,true);
  assert.ok(p.gameplay.getObservation().pendingRelic,'必須真的觸發遺跡');
  const resolve=request(p,{type:'ResolveRelic',choice:'intel'});
  const resolved=p.gameplay.submitAction(resolve);assert.equal(resolved.ok,true);
  assert.equal(resolved.ok&&resolved.events[0]?.type,'RelicResolved');
  assert.equal(resolved.ok&&resolved.events[0]?.type==='RelicResolved'&&resolved.events[0].revealedTiles.length,3);
  const research=request(p,{type:'Research',tech:'farm'});
  const result=p.gameplay.submitAction(research);assert.equal(result.ok,true);
  assert.deepEqual(result.ok&&result.events.map(e=>e.type),['TechResearched']);
  const last=updates.at(-1)!;
  assert.equal(result.ok&&result.events,last.events);
  assert.equal(last.events[0].viewer,0);assert.equal(last.events[0].fromVersion,2);assert.equal(last.events[0].toVersion,3);
  const count=updates.length;
  assert.equal(p.gameplay.submitAction(research).ok,true);assert.equal(updates.length,count);
  assert.equal(p.files.load(saved(p),p.gameplay.getSnapshot().stamp).ok,true);
  assert.equal(updates.at(-1)!.cause,'replacement');assert.deepEqual(updates.at(-1)!.events,[]);
  assert.deepEqual(updates[0].events,[]);
  assert.ok(Object.isFrozen(last.events[0]));
  p.dispose();
});

test('C2-E：失敗匯入保持 snapshot/dirty/AI timer/ledger，byte 限制與版本錯誤明確', () => {
  const clock=new Clock();const p=createGameSession({seed:'霧境初航-01',scheduler:clock});
  p.gameplay.submitAction(request(p,{type:'EndTurn'}));
  const before=p.gameplay.getSnapshot(), text=saved(p), scheduled=[...clock.tasks.keys()];
  for(const [bad,code] of [['{','INVALID_SAVE'],['{}','INVALID_SAVE'],['{"schema":"future"}','UNSUPPORTED_VERSION'],['😀'.repeat(2621441),'IMPORT_TOO_LARGE']] as const){
    const result=p.files.load(bad,before.stamp);
    assert.equal(!result.ok && result.error.code,code);
    assert.equal(p.gameplay.getSnapshot(),before);
    assert.equal(saved(p),text);assert.deepEqual([...clock.tasks.keys()],scheduled);
  }
  clock.tick(); assert.ok(p.gameplay.getObservation().version>before.stamp.version);
  p.dispose();
});

test('C2-E：已驗候選才替換、舊 callback/舊 generation/舊 version 無法污染新局', () => {
  const clock=new Clock(),p=createGameSession({seed:'霧境初航-01',scheduler:clock});
  const initial=saved(p),oldRequest=request(p,{type:'Research',tech:'farm'});
  p.gameplay.submitAction(request(p,{type:'EndTurn'}));const oldCallback=clock.callbacks[0];
  const invalid=p.files.newGame('',p.gameplay.getSnapshot().stamp);assert.equal(invalid.ok,false);assert.equal(clock.tasks.size,1);
  const loaded=p.files.load(initial,p.gameplay.getSnapshot().stamp);assert.equal(loaded.ok,true);
  assert.equal(p.gameplay.getSnapshot().stamp.generation,1);
  assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,false);assert.equal(clock.tasks.size,0);
  const clean=p.gameplay.getSnapshot();oldCallback();assert.equal(p.gameplay.getSnapshot(),clean);
  const rejected=p.gameplay.submitAction(oldRequest);assert.equal(!rejected.ok && rejected.error.code,'STALE_GENERATION');
  const oldStamp=clean.stamp;
  p.gameplay.submitAction(request(p,{type:'Research',tech:'farm'}));
  const stale=p.files.load(initial,oldStamp);assert.equal(!stale.ok && stale.error.code,'STALE_VERSION');
  assert.equal(p.gameplay.getObservation().faction.gold,3);
  assert.equal(p.files.newGame('new-seed',p.gameplay.getSnapshot().stamp).ok,true);
  assert.equal(p.gameplay.getObservation().seed,'new-seed');assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,true);
  p.dispose();
});

test('C2-E：只有正確保存確認清 dirty；匯出不清 dirty；replay 驗證不替換現局', () => {
  const p=createGameSession({seed:'霧境初航-01'});
  p.gameplay.submitAction(request(p,{type:'Research',tech:'farm'}));
  const export1=p.files.save();assert.equal(export1.ok,true);if(!export1.ok)throw new Error('save');
  assert.equal(export1.file.privacy,'private-full-world');assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,true);
  const replay=p.files.exportReplay();assert.equal(replay.ok,true);if(!replay.ok)throw new Error('replay');
  const before=p.gameplay.getSnapshot();
  assert.deepEqual(p.files.verifyReplay(replay.file.text,before.stamp),{ok:true,verified:true,ruleset:'g1-ccts-1',schema:'project4x-replay-1'});
  assert.equal(p.gameplay.getSnapshot(),before);
  const invalid=p.files.verifyReplay('{',before.stamp);assert.equal(!invalid.ok&&invalid.error.code,'INVALID_REPLAY');
  assert.equal(p.gameplay.getSnapshot(),before);
  const ack=p.files.acknowledgeSave(export1.file.stamp);assert.equal(ack.ok,true);assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,false);
  p.gameplay.submitAction(request(p,{type:'Research',tech:'pathfinding'})); // 金幣不足，拒絕。
  p.gameplay.submitAction(request(p,{type:'Move',unitId:'兵-0',to:{x:4,y:3}})); // 友軍佔位，拒絕。
  p.gameplay.submitAction(request(p,{type:'Move',unitId:'兵-0',to:{x:3,y:2}}));
  assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,true);
  const stale=p.files.acknowledgeSave(export1.file.stamp);assert.equal(!stale.ok&&stale.error.code,'STALE_VERSION');
  assert.equal(p.gameplay.getSnapshot().hasUnsavedChanges,true);
  p.dispose();
  assert.equal(p.files.save().ok,false);assert.equal(p.files.exportReplay().ok,false);
  const disposed=p.files.verifyReplay(replay.file.text,before.stamp);assert.equal(!disposed.ok&&disposed.error.code,'DISPOSED');
});

test('C2-E：相同合法 Command 對 session/core 完全一致，保存重建與 replay 決定性', () => {
  const clock=new Clock(),p=createGameSession({seed:'霧境初航-01',scheduler:clock,aiPolicy:v=>v.legalActions.find(a=>a.type==='EndTurn')!});
  let canonical=createGame('霧境初航-01');
  const actions: Action[]=[{type:'Research',tech:'farm'},{type:'Move',unitId:'兵-0',to:{x:3,y:2}}];
  for(const [i,action] of actions.entries()){
    const command=request(p,action,`suffix-${i}`);assert.equal(p.gameplay.submitAction(command).ok,true);
    const applied=applyCommand(canonical,{actor:0,requestId:command.requestId,expectedVersion:command.expectedVersion,action});assert.equal(applied.ok,true);canonical=applied.state;
  }
  assert.deepEqual(deserializeGame(saved(p)),canonical);
  const save=saved(p),replay=p.files.exportReplay();assert.equal(replay.ok,true);if(!replay.ok)throw new Error('replay');
  assert.deepEqual(replayGame(replay.file.text),canonical);
  assert.equal(canonicalHash(replayGame(replay.file.text)),canonicalHash(canonical));
  assert.equal(p.files.load(save,p.gameplay.getSnapshot().stamp).ok,true);
  const retry={sessionId:p.gameplay.getSnapshot().stamp.sessionId,generation:p.gameplay.getSnapshot().stamp.generation,expectedVersion:0,requestId:'suffix-0',action:actions[0]};
  assert.equal(p.gameplay.submitAction(retry).ok,true);
  assert.deepEqual(deserializeGame(saved(p)),canonical);
  p.dispose();
});

class Clock {
  next = 0;
  tasks = new Map<number, () => void>();
  callbacks: (() => void)[] = [];
  set = (callback: () => void, _delay: number): unknown => { const id = ++this.next; this.tasks.set(id, callback); this.callbacks.push(callback); return id; };
  clear = (handle: unknown): void => { this.tasks.delete(handle as number); };
  tick(): void { const task = this.tasks.entries().next().value; assert.ok(task, '預期有排程'); this.tasks.delete(task[0]); task[1](); }
}

test('C2-D：真實 AI 使用 Observation，完成回合；舊成功 command 在 AI 前進後仍可重送', () => {
  const clock = new Clock();
  const p = createGameSession({ seed:'霧境初航-01', scheduler:clock, reducedMotion:true });
  const end = request(p, {type:'EndTurn'});
  assert.equal(p.gameplay.submitAction(end).ok, true);
  assert.equal(p.gameplay.getSnapshot().ai.phase,'running');
  assert.equal(clock.tasks.size, 1);
  const duplicate = p.gameplay.submitAction(end);
  assert.equal(duplicate.ok && duplicate.disposition,'duplicate');
  assert.equal(clock.tasks.size, 1);
  let steps = 0;
  while (p.gameplay.getObservation().active===1 && steps++<50) clock.tick();
  assert.equal(p.gameplay.getObservation().active,0);
  assert.equal(p.gameplay.getObservation().turn,3);
  assert.equal(p.gameplay.getSnapshot().ai.phase,'idle');
  const after = p.gameplay.getSnapshot();
  const retry = p.gameplay.submitAction(end);
  assert.equal(retry.ok && retry.disposition,'duplicate');
  assert.deepEqual(retry.ok && retry.events,[]);
  assert.equal(p.gameplay.getSnapshot(),after);
  assert.equal(clock.tasks.size,0);
  p.dispose();
});

test('C2-D：dispose 後連已取消 callback 強制執行也不可更動局面', () => {
  const clock = new Clock();
  const p = createGameSession({ seed:'霧境初航-01', scheduler:clock });
  p.gameplay.submitAction(request(p,{type:'EndTurn'}));
  assert.equal(clock.callbacks.length,1);
  const last = p.gameplay.getSnapshot();
  p.dispose(); assert.equal(clock.tasks.size,0);
  clock.callbacks[0]();
  assert.equal(p.gameplay.getSnapshot(),last);
});

test('C2-D：policy 只看觀測、決策錯誤暫停可恢復，不合成勝負或洩漏例外', () => {
  const clock = new Clock(); const diagnostics: unknown[]=[]; let failPolicy=true;
  const p = createGameSession({seed:'霧境初航-01',scheduler:clock,onDiagnostic:d=>diagnostics.push(d),aiPolicy:view=>{
    assert.equal('terrain' in view,false); assert.equal('history' in view,false); assert.equal('factions' in view,false);
    assert.equal(Object.isFrozen(view.faction),true);
    if(failPolicy) throw new Error('敵方金幣私人測試');
    return view.legalActions.find(a=>a.type==='EndTurn')!;
  }});
  p.gameplay.submitAction(request(p,{type:'EndTurn'}));clock.tick();
  assert.deepEqual(p.gameplay.getSnapshot().ai,{phase:'paused',reason:'decision-error'});
  assert.equal(p.gameplay.getObservation().winner,null);
  assert.equal(diagnostics.length,1);assert.doesNotMatch(JSON.stringify(diagnostics),/私人測試/);
  const stale = p.gameplay.resumeAI({...p.gameplay.getSnapshot().stamp,version:0});
  assert.equal(!stale.ok && stale.error.code,'STALE_VERSION');
  failPolicy=false;
  assert.equal(p.gameplay.resumeAI(p.gameplay.getSnapshot().stamp).ok,true);clock.tick();
  assert.equal(p.gameplay.getObservation().active,0);
  const notTurn=p.gameplay.resumeAI(p.gameplay.getSnapshot().stamp);
  assert.equal(!notTurn.ok && notTurn.error.code,'NOT_YOUR_TURN');
  p.dispose();
});

test('C2-C：initial、通知後版本、listener exception、重入拒絕與退訂', () => {
  const diagnostics: unknown[] = [];
  const p = createGameSession({ seed: '霧境初航-01', onDiagnostic: d => diagnostics.push(d) });
  const order: string[] = [];
  const stopA = p.gameplay.subscribe(update => {
    order.push('A:'+update.cause+':'+update.snapshot.stamp.version);
    const nested = p.gameplay.submitAction(request(p, { type: 'Research', tech: 'farm' }));
    assert.equal(!nested.ok && nested.error.code, 'SESSION_BUSY');
    if (update.cause === 'command') throw new Error('包含私人測試字串，不得外傳');
  });
  const stopB = p.gameplay.subscribe(update => order.push('B:'+update.cause+':'+update.snapshot.stamp.version));
  p.gameplay.submitAction(request(p, { type: 'Research', tech: 'farm' }));
  assert.deepEqual(order, ['A:initial:0','B:initial:0','A:command:1','B:command:1']);
  assert.equal(diagnostics.length, 1);
  assert.doesNotMatch(JSON.stringify(diagnostics), /私人測試/);
  stopA(); stopA(); stopB();
  p.gameplay.submitAction(request(p, { type: 'EndTurn' }));
  assert.equal(order.length, 4);
  p.dispose();
});

test('C2-C：通知中 subscribe 延後 initial、不遞迴；退訂尚未通知的 B', () => {
  const p = createGameSession({ seed: '霧境初航-01' });
  const order: string[] = []; let depth = 0, maxDepth = 0;
  let stopB = () => {}; const nestedEvents: unknown[] = [];
  p.gameplay.subscribe(update => {
    depth++; maxDepth = Math.max(maxDepth, depth);
    if (update.cause === 'command') {
      order.push('A'); stopB();
      p.gameplay.subscribe(next => { maxDepth = Math.max(maxDepth, depth + 1); order.push('C:'+next.cause); nestedEvents.push(next.events); });
      order.push('A-end');
    }
    depth--;
  });
  stopB = p.gameplay.subscribe(update => { if (update.cause==='command') order.push('B'); });
  p.gameplay.submitAction(request(p, { type:'Research', tech:'farm' }));
  assert.deepEqual(order, ['A','A-end','C:initial']);
  assert.equal(maxDepth, 1); assert.deepEqual(nestedEvents, [[]]);
  p.dispose();
});

test('C2-C：callback dispose 立即停止其餘通知，保留已提交快照並拒絕後續操作', () => {
  const p = createGameSession({ seed: '霧境初航-01' });
  let bCalls = 0;
  p.gameplay.subscribe(update => { if (update.cause==='command') p.dispose(); });
  p.gameplay.subscribe(update => { if (update.cause==='command') bCalls++; });
  const result = p.gameplay.submitAction(request(p, { type:'Research', tech:'farm' }));
  assert.equal(result.ok, true); assert.equal(p.gameplay.getObservation().version, 1);
  assert.equal(bCalls, 0);
  p.dispose();
  const rejected = p.gameplay.submitAction(request(p, { type:'EndTurn' }));
  assert.equal(!rejected.ok && rejected.error.code,'DISPOSED');
  assert.throws(() => p.gameplay.subscribe(() => {}), /關閉/);
});

test('C2-B：成功一次、同 payload 重送不雙花；異 payload/conflict 優先於 stale', () => {
  const p = createGameSession({ seed: '霧境初航-01' });
  const command = request(p, { type: 'Research', tech: 'farm' }, '__proto__');
  const first = p.gameplay.submitAction(command);
  assert.equal(first.ok, true);
  assert.equal(first.ok && first.disposition, 'applied');
  assert.equal(p.gameplay.getObservation().faction.gold, 3);
  assert.equal(p.gameplay.getObservation().version, 1);
  const once = p.gameplay.getSnapshot();
  const again = p.gameplay.submitAction(command);
  assert.equal(again.ok && again.disposition, 'duplicate');
  assert.deepEqual(again.ok && again.events, []);
  assert.equal(p.gameplay.getSnapshot(), once);
  assert.equal(p.gameplay.getObservation().version, 1);
  assert.equal(p.gameplay.getObservation().faction.gold, 3);
  const conflict = p.gameplay.submitAction({ ...command, action: { type: 'EndTurn' } });
  assert.equal(!conflict.ok && conflict.error.code, 'REQUEST_CONFLICT');
  const stale = p.gameplay.submitAction({ ...command, requestId: 'new-stale' });
  assert.equal(!stale.ok && stale.error.code, 'STALE_VERSION');
  assert.equal(p.gameplay.getSnapshot(), once);
  p.dispose();
});

test('C2-B：格式、actor override、世代、instance 與非法行動拒絕原狀；失敗不占 request', () => {
  const p = createGameSession({ seed: '霧境初航-01' });
  const initial = p.gameplay.getSnapshot();
  const bad = request(p, { type: 'Move', unitId: '兵-0', to: { x: 23, y: 23 } }, 'reusable');
  const cases: [unknown, string][] = [
    [null, 'INVALID_REQUEST'], [{ ...bad, actor: 1 }, 'INVALID_REQUEST'],
    [{ ...bad, generation: 1 }, 'STALE_GENERATION'],
    [{ ...bad, sessionId: 'other-session' }, 'SESSION_MISMATCH'],
    [{ ...bad, expectedVersion: -1 }, 'INVALID_REQUEST'],
    [bad, 'ILLEGAL_ACTION'],
  ];
  for (const [value, code] of cases) {
    const result = p.gameplay.submitAction(value as ActionRequest);
    assert.equal(!result.ok && result.error.code, code);
    assert.equal(p.gameplay.getSnapshot(), initial);
  }
  const accepted = p.gameplay.submitAction({ ...bad, action: { type: 'Research', tech: 'farm' } });
  assert.equal(accepted.ok && accepted.disposition, 'applied');
  assert.equal(p.gameplay.getObservation().faction.gold, 3);
  p.dispose();
});
