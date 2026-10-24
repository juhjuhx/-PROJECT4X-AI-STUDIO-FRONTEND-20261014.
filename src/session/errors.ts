import type { SessionError, SessionErrorCode } from './contracts';

const messages: Record<SessionErrorCode, string> = {
  INVALID_REQUEST: '請求格式不正確。', SESSION_MISMATCH: '此請求屬於另一個遊戲實例。',
  STALE_GENERATION: '此操作所屬的航程已失效。', REQUEST_CONFLICT: '此請求編號已使用其他指令。',
  STALE_VERSION: '遊戲已前進，請重新確認操作。', NOT_YOUR_TURN: '尚未輪到玩家行動。',
  GAME_OVER: '戰局已結束。', RELIC_REQUIRED: '必須先選擇遺跡獎勵。', ILLEGAL_ACTION: '此行動目前不合法。',
  IMPORT_TOO_LARGE: '檔案超過 10 MB。', INVALID_SAVE: '保存檔格式或內容無效。',
  INVALID_REPLAY: '回放檔格式或內容無效。', UNSUPPORTED_VERSION: '不支援此檔案版本。',
  SESSION_BUSY: '目前正在通知遊戲更新，請稍後重試。', AI_NOT_PAUSED: '對手目前沒有暫停。',
  DISPOSED: '此遊戲實例已關閉。', INTERNAL_ERROR: '操作未完成；目前進度保持不變。',
};
export const sessionError = (code: SessionErrorCode): SessionError => Object.freeze({ code, message: messages[code] });
const coreErrors: Record<string, SessionErrorCode> = {
  '指令格式不正確': 'INVALID_REQUEST', '此請求編號已使用其他指令': 'REQUEST_CONFLICT',
  '狀態版本已過期': 'STALE_VERSION', '尚未輪到此文明': 'NOT_YOUR_TURN',
  '戰局已結束': 'GAME_OVER', '必須先選擇遺跡獎勵': 'RELIC_REQUIRED', '此行動目前不合法': 'ILLEGAL_ACTION',
};
export const coreError = (message?: string): SessionError => sessionError(message && Object.hasOwn(coreErrors, message) ? coreErrors[message] : 'INTERNAL_ERROR');
