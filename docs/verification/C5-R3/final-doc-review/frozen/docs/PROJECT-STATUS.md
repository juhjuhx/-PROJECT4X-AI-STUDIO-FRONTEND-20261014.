# 工程狀態、可驗證證據與風險

> 2026-10-19 CURRENT C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-19 歷史C5-R2快照：三項無記憶AI局部修補 IMPLEMENTED，110 tests/check/build、1100-command prefix0loop、11 browser與12真玩法情境 TESTED_PASS。最新seed010仍 TESTED_FAIL：800 EndTurn／19813 commands／winner=null；中央搜尋合成反例1000commands仍FAIL。新版full100未跑，Alpha仍PARTIAL。權威續作見NEXT-ACTION與C5-R2-TEST-RESULTS；不push main。

> 2026-10-18 歷史R1快照：C2/C3/C4工程candidate已通過。C5最小無記憶policy修補IMPLEMENTED；生成prefix三段振盪→0、104 tests/check/build/11 browser/12玩法情境TESTED_PASS。完整seed010仍TESTED_FAIL：800 EndTurn/17937 commands/winner=null；新版full100/T3/T6未完整重跑，不能沿用舊62/38當新終局率。主創確認保留D3分頁。詳C5-AI-DIAGNOSIS與NEXT-ACTION。



> 2026-10-18 C3 CHECKPOINT（4cddfb3）：C2 runtime fresh TESTED_PASS（99 tests/9 browser）；C3增量候選103 tests/11 browser TESTED_PASS，獨立審查與玩法QA已複核。D3原包guard/weak Stage2被拒絕，未知owner/異地中心/徵召文案已修。最新來源、品質限制及續作見handoff/C3-IMPLEMENTATION-STATUS.md與NEXT-ACTION.md；不是完整Alpha。



## 2026-10-17 C2 更新（歷史入口）

GameSession runtime 已實作並接上 main；精確執行結果、風險、Git/證據入口見 [C2-IMPLEMENTATION-STATUS](handoff/C2-IMPLEMENTATION-STATUS.md) 與 [C2-VERIFICATION.json](handoff/C2-VERIFICATION.json)。C1 signature 維持，沒有新 reducer 或玩法改動。D3 未交付，沒有合併／push。full100 62/38、seed010、T3/T6 仍歷史 TESTED_FAIL，真人／真機未驗。下方為 2026-10-14 舊環境快照，不取代本次結果。

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
