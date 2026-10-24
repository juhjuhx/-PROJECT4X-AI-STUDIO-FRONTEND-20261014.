/**
 * C1 審查後的正式型別；C2 runtime 由 src/session/game-session.ts 實作。
 * 規範：FRONTEND-CORE-CONTRACT.md；型別本身不可當作可呼叫 runtime。
 */
import type { Action, Actor, Observation, Point, Tech, UnitKind } from '../../src/core/types';

export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

export interface SessionStamp {
  readonly sessionId: string;
  readonly generation: number;
  readonly version: number;
}

export interface ActionRequest {
  readonly sessionId: string;
  readonly generation: number;
  readonly expectedVersion: number;
  readonly requestId: string;
  readonly action: DeepReadonly<Action>;
}

export type SessionErrorCode =
  | 'INVALID_REQUEST' | 'SESSION_MISMATCH' | 'STALE_GENERATION'
  | 'REQUEST_CONFLICT' | 'STALE_VERSION' | 'NOT_YOUR_TURN' | 'GAME_OVER'
  | 'RELIC_REQUIRED' | 'ILLEGAL_ACTION' | 'IMPORT_TOO_LARGE'
  | 'INVALID_SAVE' | 'INVALID_REPLAY' | 'UNSUPPORTED_VERSION'
  | 'SESSION_BUSY' | 'AI_NOT_PAUSED' | 'DISPOSED' | 'INTERNAL_ERROR';

export interface SessionError {
  readonly code: SessionErrorCode;
  readonly message: string;
}

export type AIStatus =
  | { readonly phase: 'idle' | 'running' | 'finished' }
  | { readonly phase: 'paused'; readonly reason: 'safety-limit' | 'no-action' | 'decision-error' | 'command-rejected' };

export interface SessionSnapshot {
  readonly contractVersion: 'project4x-frontend-1';
  readonly stamp: SessionStamp;
  readonly observation: DeepReadonly<Observation>;
  readonly ai: AIStatus;
  readonly hasUnsavedChanges: boolean;
}

export interface PresentationEnvelope {
  readonly schema: 'project4x-presentation-1';
  readonly viewer: Actor;
  readonly generation: number;
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly sequence: number;
  readonly id: string;
}

/** 事件 union；實際允許發送的範圍及證據條件見權威 Markdown。 */
export type PresentationChange =
  | { readonly type: 'UnitHealthChanged'; readonly unitId: string; readonly at: Point; readonly beforeHP: number; readonly afterHP: number }
  | { readonly type: 'OwnUnitDestroyed'; readonly unitId: string; readonly lastKnownAt: Point }
  | { readonly type: 'SiteOwnerChanged'; readonly siteId: string; readonly at: Point; readonly beforeOwner: Actor | null; readonly afterOwner: Actor | null }
  | { readonly type: 'UnitRecruited'; readonly siteId: string; readonly unitId: string; readonly kind: UnitKind; readonly at: Point }
  | { readonly type: 'TechResearched'; readonly tech: Tech }
  | { readonly type: 'RelicResolved'; readonly relicId: string; readonly choice: 'gold' | 'intel'; readonly revealedTiles: readonly Point[] }
  | { readonly type: 'PoliticalCenterChanged'; readonly beforeSiteId: string | null; readonly afterSiteId: string | null };

export type PresentationEvent = DeepReadonly<PresentationEnvelope & PresentationChange>;

export interface SessionUpdate {
  readonly snapshot: DeepReadonly<SessionSnapshot>;
  readonly events: readonly PresentationEvent[];
  readonly cause: 'initial' | 'command' | 'ai-status' | 'replacement' | 'save-acknowledged';
}

export type ActionResult =
  | { readonly ok: true; readonly disposition: 'applied' | 'duplicate'; readonly snapshot: DeepReadonly<SessionSnapshot>; readonly events: readonly PresentationEvent[] }
  | { readonly ok: false; readonly error: SessionError; readonly snapshot: DeepReadonly<SessionSnapshot> };

export type OperationResult =
  | { readonly ok: true; readonly snapshot: DeepReadonly<SessionSnapshot> }
  | { readonly ok: false; readonly error: SessionError; readonly snapshot: DeepReadonly<SessionSnapshot> };

/** 私有本機 I/O，不是可顯示的 Observation；text 可能包含完整世界／歷史。 */
export interface PrivateExport {
  readonly kind: 'save' | 'replay';
  readonly privacy: 'private-full-world';
  readonly stamp: SessionStamp;
  readonly suggestedFilename: string;
  readonly text: string;
}

export type ExportResult =
  | { readonly ok: true; readonly file: PrivateExport }
  | { readonly ok: false; readonly error: SessionError };

export type ReplayVerificationResult =
  | { readonly ok: true; readonly verified: true; readonly ruleset: 'g1-ccts-1'; readonly schema: 'project4x-replay-1' }
  | { readonly ok: true; readonly verified: true; readonly ruleset: 'demo03-preview-1'; readonly schema: 'project4x-replay-2' }
  | { readonly ok: false; readonly error: SessionError };

export type Unsubscribe = () => void;

/** actor 在建立時綁定；UI 沒有 setState / applyCommand / actor override。 */
export interface GameSessionPort {
  getObservation(): DeepReadonly<Observation>;
  getSnapshot(): DeepReadonly<SessionSnapshot>;
  getAvailableActions(): readonly DeepReadonly<Action>[];
  subscribe(listener: (update: DeepReadonly<SessionUpdate>) => void): Unsubscribe;
  submitAction(request: ActionRequest): ActionResult;
  save(): ExportResult;
  acknowledgeSave(stamp: SessionStamp): OperationResult;
  load(text: string, expected: SessionStamp): OperationResult;
  newGame(seed: string, expected: SessionStamp): OperationResult;
  exportReplay(): ExportResult;
  verifyReplay(text: string, expected: SessionStamp): ReplayVerificationResult;
  resumeAI(expected: SessionStamp): OperationResult;
  dispose(): void;
}

/** HUD／地圖只取得此 capability；不取得完整檔案 I/O。 */
export type GameplayPort = Pick<GameSessionPort,
  'getObservation' | 'getSnapshot' | 'getAvailableActions' | 'subscribe' | 'submitAction' | 'resumeAI'>;

/** 僅交給受信任的本機檔案 controls，由 composition root 接線。 */
export type LocalPersistencePort = Pick<GameSessionPort,
  'save' | 'acknowledgeSave' | 'load' | 'newGame' | 'exportReplay' | 'verifyReplay'>;
