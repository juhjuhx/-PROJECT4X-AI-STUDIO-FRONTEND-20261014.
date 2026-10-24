import { chooseAction } from '../core/ai';
import type { Action, Observation } from '../core/types';
import type { AIStatus, DeepReadonly } from './contracts';
import { freezePublic } from './immutable';

export interface Scheduler { set(callback: () => void, delay: number): unknown; clear(handle: unknown): void }
export type AIPolicy = (view: DeepReadonly<Observation>) => DeepReadonly<Action> | null;
export interface AIHooks {
  view(): Observation;
  generation(): number;
  disposed(): boolean;
  status(): AIStatus;
  setStatus(status: AIStatus): void;
  submit(action: DeepReadonly<Action>, expectedVersion: number): boolean;
  diagnose(code: 'AI_DECISION_ERROR' | 'AI_COMMAND_REJECTED'): void;
}
const defaultScheduler: Scheduler = {
  set: (callback, delay) => setTimeout(callback, delay),
  clear: handle => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/** 只持有觀測、排程與取消 token；canonical state 始終留在 GameSession。 */
export function createAIDriver(hooks: AIHooks, options: { scheduler?: Scheduler; policy?: AIPolicy; reducedMotion?: boolean }) {
  const scheduler = options.scheduler ?? defaultScheduler;
  const policy: AIPolicy = options.policy ?? (view => chooseAction(structuredClone(view) as Observation));
  let timer: unknown, epoch = 0;
  function stop(): void {
    epoch++;
    if (timer !== undefined) scheduler.clear(timer);
    timer = undefined;
  }
  function begin(): void {
    if (hooks.disposed() || hooks.status().phase === 'running' || hooks.status().phase === 'paused') return;
    const initial = hooks.view();
    if (initial.active === 0 || initial.winner !== null) return;
    const run = ++epoch, generation = hooks.generation();
    const current = () => !hooks.disposed() && run === epoch && generation === hooks.generation();
    let actions = 0;
    const pause = (reason: Extract<AIStatus, { phase: 'paused' }>['reason']) => {
      if (current()) hooks.setStatus({ phase: 'paused', reason });
    };
    const step = () => {
      if (!current()) return;
      timer = undefined;
      const view = freezePublic(hooks.view());
      if (view.active === 0 || view.winner !== null) { hooks.setStatus({ phase: view.winner === null ? 'idle' : 'finished' }); return; }
      if (actions >= 1000) { pause('safety-limit'); return; }
      if (!view.legalActions.length) { pause('no-action'); return; }
      let action: DeepReadonly<Action> | null;
      try { action = policy(view); }
      catch { hooks.diagnose('AI_DECISION_ERROR'); pause('decision-error'); return; }
      if (!current()) return;
      if (!action) { pause('no-action'); return; }
      if (!hooks.submit(action, view.version)) { hooks.diagnose('AI_COMMAND_REJECTED'); pause('command-rejected'); return; }
      if (!current()) return;
      actions++;
      const after = hooks.view();
      if (after.active === 0 || after.winner !== null) { hooks.setStatus({ phase: after.winner === null ? 'idle' : 'finished' }); return; }
      timer = scheduler.set(step, options.reducedMotion ? 20 : 95);
    };
    hooks.setStatus({ phase: 'running' });
    if (current()) timer = scheduler.set(step, options.reducedMotion ? 20 : 180);
  }
  return { begin, stop };
}
