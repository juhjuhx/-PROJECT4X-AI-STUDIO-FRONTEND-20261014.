# 工程狀態、可驗證證據與風險

本檔隨 2026-10-14 Google AI Studio 公開 Git 初始化整理；**沒有在此次容器重新安裝鎖定依賴或重跑 44 個 TypeScript 測試**。原專案 Mac 2026-10-14 的證據保存在完整工程 ZIP（不公開，避免洩露作者本地路徑與 canonical 世界資料）。

| Gate | 狀態 | 證據 | 接下來 |
|---|---|---|---|
| Source 比對 | PASS（封存） | 前端ZIP SHA `c048fc5…63`；core/src 對完整包逐 byte 一致 | 初始化 Git commit SHA 後凍結版本 |
| Typecheck | Mac 2026-10-14 PASS；此環境 BLOCKED | 原 `clean-check.txt`；此環境缺 Vite 8／TS7 鎖包 | GitHub Actions `npm ci --ignore-scripts && npm run check` |
| Unit/review tests | Mac 44/44 PASS；此環境 BLOCKED | `clean-tests.txt` | GitHub Actions / 新環境重跑 |
| Build | Mac PASS；此環境 BLOCKED | clean build logs | GitHub Actions 驗證 |
| Browser | Mac Chromium 7/7 PASS；此環境 UNVERIFIED | 原有截圖與 browser log | UI 改動後在真瀏覽器重測 |
| full100 | TESTED_FAIL | 原同版 62 COMPLETE/38 TURN_LIMIT；本輪未全部重跑 | 根因修 AI，保持種子 001–100 |
| seed010 | TESTED_FAIL | 800 EndTurn，19,696 commands，winner null | 最小重現／回歸測試 |
| 遺跡新裁決 | NOT_IMPLEMENTED | `src/core/game.ts` 舊可見觸發 | 設計版本化後另切修復 |
| 實體手機／真人局／45–90分鐘 | UNVERIFIED | 無本人驗收 | 後續玩家測試 |

**不要**將 harness 的固定上限當成遊戲規則勝負，不得藉改失敗測試、略過或刪掉 38 個失敗 seed 宣稱通過。現公開 Git 提供真實程式與具體重現，**不是正式遊戲發行版**。
