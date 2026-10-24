import { deserializeGame, replayGame } from '../core/persistence';
import type { GameState } from '../core/types';
import type { SessionErrorCode } from './contracts';

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
type Candidate = { ok: true; state: GameState } | { ok: false; code: SessionErrorCode };

/** 私有候選必須通過既有 core 的語意、history 重建與完整內容比對。 */
export function validateImport(text: string, kind: 'save' | 'replay'): Candidate {
  const invalid = kind === 'save' ? 'INVALID_SAVE' : 'INVALID_REPLAY';
  if (typeof text !== 'string') return { ok: false, code: invalid };
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) return { ok: false, code: 'IMPORT_TOO_LARGE' };
  try {
    const value: unknown = JSON.parse(text);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      if ((Object.hasOwn(record, 'schema') && record.schema !== `project4x-${kind}-1`) ||
          (Object.hasOwn(record, 'ruleset') && record.ruleset !== 'g1-ccts-1')) return { ok: false, code: 'UNSUPPORTED_VERSION' };
    }
    return { ok: true, state: kind === 'save' ? deserializeGame(text) : replayGame(text) };
  } catch { return { ok: false, code: invalid }; }
}
