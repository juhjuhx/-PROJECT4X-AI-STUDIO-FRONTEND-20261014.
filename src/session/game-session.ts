import { applyCommand, createGame, observe, validCommand } from '../core/game';
import type { Command, GameState } from '../core/types';
import { serializeGame, exportReplay as serializeReplay } from '../core/persistence';
import type { AIStatus, ActionRequest, ActionResult, DeepReadonly, GameSessionPort, GameplayPort, LocalPersistencePort, PresentationEvent, SessionErrorCode, SessionSnapshot, SessionStamp, SessionUpdate } from './contracts';
import { freezePublic } from './immutable';
import { coreError, sessionError } from './errors';
import { createAIDriver } from './ai-driver';
import type { AIPolicy, Scheduler } from './ai-driver';
import { validateImport } from './persistence';
import { projectPresentationEvents } from '../presentation/events';

export interface SessionDiagnostic { readonly code: 'LISTENER_EXCEPTION' | 'AI_DECISION_ERROR' | 'AI_COMMAND_REJECTED'; readonly message: string }
export interface SessionOptions { seed: string; onDiagnostic?: (diagnostic: SessionDiagnostic) => void; scheduler?: Scheduler; aiPolicy?: AIPolicy; reducedMotion?: boolean }
export interface SessionPorts { readonly gameplay: GameplayPort; readonly files: LocalPersistencePort; readonly dispose: () => void }

export function createGameSession(options: SessionOptions): SessionPorts {
  let state = createGame(options.seed);
  const sessionId = crypto.randomUUID();
  let generation = 0, dirty = false;
  let disposed = false, publishing = false;
  let ai: AIStatus = { phase: 'idle' }, aiRequestNumber = 0;
  type Listener = { callback: (update: DeepReadonly<SessionUpdate>) => void; active: boolean; initial: boolean };
  const listeners = new Set<Listener>(), initials: Listener[] = [];
  const makeSnapshot = () => freezePublic<SessionSnapshot>({
    contractVersion: 'project4x-frontend-1',
    stamp: { sessionId, generation, version: state.version },
    observation: observe(state, 0), ai, hasUnsavedChanges: dirty,
  });
  let snapshot = makeSnapshot();
  function diagnose(diagnostic: SessionDiagnostic): void {
    try {
      if (options.onDiagnostic) options.onDiagnostic(freezePublic(diagnostic));
      else console.error('[PROJECT4X session]', diagnostic.code, diagnostic.message);
    } catch { console.error('[PROJECT4X session] 診斷接收器發生錯誤。'); }
  }
  function deliver(entry: Listener, update: DeepReadonly<SessionUpdate>): void {
    if (!entry.active || disposed) return;
    try { entry.callback(update); }
    catch { diagnose({ code: 'LISTENER_EXCEPTION', message: '遊戲更新訂閱者發生錯誤；已隔離，不影響已提交命令。' }); }
  }
  function flushInitials(): void {
    while (initials.length && !disposed) {
      const entry = initials.shift()!;
      entry.initial = false;
      deliver(entry, freezePublic({ snapshot, events: [], cause: 'initial' as const }));
    }
  }
  function publish(cause: SessionUpdate['cause'], events: readonly PresentationEvent[] = []): void {
    if (disposed) return;
    publishing = true;
    try {
      const update = freezePublic({ snapshot, events, cause });
      for (const entry of [...listeners]) if (!entry.initial) deliver(entry, update);
      flushInitials();
    } finally { publishing = false; }
  }
  const subscribe: GameSessionPort['subscribe'] = callback => {
    if (disposed) throw new Error('此遊戲實例已關閉。');
    if (typeof callback !== 'function') throw new TypeError('訂閱者必須是函式。');
    const entry: Listener = { callback, active: true, initial: true };
    listeners.add(entry); initials.push(entry);
    if (!publishing) { publishing = true; try { flushInitials(); } finally { publishing = false; } }
    return () => { entry.active = false; listeners.delete(entry); };
  };
  function dispose(): void {
    if (disposed) return;
    disposed = true; generation++;
    driver.stop();
    for (const entry of listeners) entry.active = false;
    listeners.clear(); initials.length = 0;
  }
  const fail = (code: SessionErrorCode): Extract<ActionResult, { ok: false }> => ({ ok: false, error: sessionError(code), snapshot });
  function guardStamp(expected: SessionStamp, mutation = true): SessionErrorCode | null {
    if (disposed) return 'DISPOSED';
    if (mutation && publishing) return 'SESSION_BUSY';
    if (!expected || typeof expected !== 'object' || Object.keys(expected).length !== 3 ||
      !['sessionId','generation','version'].every(k=>Object.hasOwn(expected,k)) || typeof expected.sessionId !== 'string' ||
      !Number.isSafeInteger(expected.generation) || expected.generation < 0 || !Number.isSafeInteger(expected.version) || expected.version < 0) return 'INVALID_REQUEST';
    if (expected.sessionId !== sessionId) return 'SESSION_MISMATCH';
    if (expected.generation !== generation) return 'STALE_GENERATION';
    if (expected.version !== state.version) return 'STALE_VERSION';
    return null;
  }
  const driver = createAIDriver({
    view: () => observe(state, 1), generation: () => generation, disposed: () => disposed, status: () => ai,
    setStatus: status => { if (!disposed) { ai = status; snapshot = makeSnapshot(); publish('ai-status'); } },
    submit: (action, expectedVersion) => {
      const before = snapshot.observation;
      const result = applyCommand(state, { actor: 1, requestId: `ai-${sessionId}-${generation}-${++aiRequestNumber}`, expectedVersion, action });
      if (!result.ok || result.state === state) return false;
      state = result.state; dirty = true; snapshot = makeSnapshot();
      publish('command', projectPresentationEvents(before, snapshot.observation, generation)); return true;
    },
    diagnose: code => diagnose({ code, message: '對手回合發生錯誤，已暫停；目前進度保留。' }),
  }, { scheduler: options.scheduler, policy: options.aiPolicy, reducedMotion: options.reducedMotion });
  function submitAction(request: ActionRequest): ActionResult {
    if (disposed) return fail('DISPOSED');
    if (publishing) return fail('SESSION_BUSY');
    if (!request || typeof request !== 'object' || Object.keys(request).length !== 5 ||
      !['sessionId', 'generation', 'expectedVersion', 'requestId', 'action'].every(k => Object.hasOwn(request, k)) ||
      typeof request.sessionId !== 'string' || !request.sessionId.length || request.sessionId.length > 256 ||
      !Number.isSafeInteger(request.generation) || request.generation < 0) return fail('INVALID_REQUEST');
    const command: Command = { actor: 0, requestId: request.requestId, expectedVersion: request.expectedVersion, action: request.action };
    if (!validCommand(command)) return fail('INVALID_REQUEST');
    if (request.sessionId !== sessionId) return fail('SESSION_MISMATCH');
    if (request.generation !== generation) return fail('STALE_GENERATION');
    const result = applyCommand(state, command);
    if (!result.ok) return { ok: false, error: coreError(result.error), snapshot };
    if (result.state === state) return { ok: true, disposition: 'duplicate', snapshot, events: [] };
    const before = snapshot.observation;
    state = result.state; dirty = true;
    if (state.winner !== null) ai = { phase: 'finished' };
    snapshot = makeSnapshot();
    const events = projectPresentationEvents(before, snapshot.observation, generation, command.action);
    publish('command', events);
    driver.begin();
    return { ok: true, disposition: 'applied', snapshot, events };
  }
  const resumeAI: GameSessionPort['resumeAI'] = expected => {
    const error = guardStamp(expected); if (error) return fail(error);
    if (state.winner !== null) return fail('GAME_OVER');
    if (state.active === 0) return fail('NOT_YOUR_TURN');
    if (ai.phase !== 'paused') return fail('AI_NOT_PAUSED');
    ai = { phase: 'idle' }; driver.begin();
    return { ok: true, snapshot };
  };
  function replace(candidate: GameState, saved: boolean): void {
    driver.stop();
    generation++; state = candidate; dirty = !saved;
    ai = { phase: state.winner === null ? 'idle' : 'finished' };
    snapshot = makeSnapshot(); publish('replacement'); driver.begin();
  }
  const load: GameSessionPort['load'] = (text, expected) => {
    const error = guardStamp(expected); if (error) return fail(error);
    const candidate = validateImport(text, 'save'); if (!candidate.ok) return fail(candidate.code);
    replace(candidate.state, true); return { ok: true, snapshot };
  };
  const newGame: GameSessionPort['newGame'] = (seed, expected) => {
    const error = guardStamp(expected); if (error) return fail(error);
    let candidate: GameState;
    try { candidate = createGame(seed); } catch { return fail('INVALID_REQUEST'); }
    replace(candidate, false); return { ok: true, snapshot };
  };
  function exportFile(kind: 'save' | 'replay'): ReturnType<GameSessionPort['save']> {
    if (disposed) return { ok: false, error: sessionError('DISPOSED') };
    return { ok: true, file: freezePublic({ kind, privacy: 'private-full-world', stamp: snapshot.stamp,
      suggestedFilename: `PROJECT4X-${kind}-turn${state.turn}.json`,
      text: kind === 'save' ? serializeGame(state) : serializeReplay(state) }) };
  }
  const acknowledgeSave: GameSessionPort['acknowledgeSave'] = expected => {
    const error = guardStamp(expected); if (error) return fail(error);
    if (dirty) { dirty = false; snapshot = makeSnapshot(); publish('save-acknowledged'); }
    return { ok: true, snapshot };
  };
  const verifyReplay: GameSessionPort['verifyReplay'] = (text, expected) => {
    const error = guardStamp(expected, false); if (error) return { ok: false, error: sessionError(error) };
    const candidate = validateImport(text, 'replay');
    if (!candidate.ok) return { ok: false, error: sessionError(candidate.code) };
    return { ok: true, verified: true, ruleset: 'g1-ccts-1', schema: 'project4x-replay-1' };
  };
  const port: GameSessionPort = {
    getObservation: () => snapshot.observation,
    getSnapshot: () => snapshot,
    getAvailableActions: () => snapshot.observation.legalActions,
    submitAction, subscribe, save: () => exportFile('save'), acknowledgeSave,
    load, newGame, exportReplay: () => exportFile('replay'), verifyReplay, resumeAI,
    dispose,
  };
  return Object.freeze({
    gameplay: Object.freeze({ getObservation: port.getObservation, getSnapshot: port.getSnapshot, getAvailableActions: port.getAvailableActions, submitAction: port.submitAction, subscribe: port.subscribe, resumeAI: port.resumeAI }),
    files: Object.freeze({ save: port.save, acknowledgeSave: port.acknowledgeSave, load: port.load, newGame: port.newGame, exportReplay: port.exportReplay, verifyReplay: port.verifyReplay }),
    dispose: port.dispose,
  });
}
