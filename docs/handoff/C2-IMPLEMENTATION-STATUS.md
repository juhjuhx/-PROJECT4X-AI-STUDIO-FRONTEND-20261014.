# C2 GameSession 實作與驗證狀態

2026-10-17。範圍僅 C2，依已審 C1 契約增量抽取。IMPLEMENTED 描述 source 存在，TESTED_PASS 僅指具名測試。本機 commit／最後結果見 C2-VERIFICATION.json 及交付根 FINAL-GIT-STATE.json；沒有推送、main merge、D3 採納或玩法擴充。

## 來源與保全

- CURRENT_BASELINE：重新查 main SHA `c21b16cd75572d069369f41426f7323c63c05083`；C2 使用獨立 worktree，分支 integration/project4x-c2。
- CORE_SOURCE：上述 baseline 的 core 四檔、AI policy、package/lock、既有四份測試均 byte-identical；只有單一 applyCommand。
- GEMINI_SOURCE：收到的是 D2，ZIP SHA `bf9a2ddee457e598f85345b53456749bf603ee490d18e4c25a8f142210450a5e`；D2/D3 工作區不修改。
- CONTRACT_STATUS：v1 介面不改，d.ts 只更新狀態註解；factory 回 gameplay/files/dispose 三 capability，runtime 不公開 GameState。
- INTEGRATION_RISKS：D3 缺件、遠端未含 C2、新 CI 未執行、橫式可視畫布有限、全玩法 Gate 歷史 FAIL。

## 模組與實作

| 路徑 | 功能／介面 | 對照測試 |
|---|---|---|
| src/session/contracts.ts | type-only re-export 唯一正式 d.ts | check；A capability keys |
| src/session/game-session.ts | 獨占 state，13 個正式方法透過限定 capabilities 提供；publication、duplicate、stamp、替換 | tests/session.test.ts 17 案 |
| src/session/ai-driver.ts | 只收觀測的決策與可取消 scheduler；1000 action 安全暫停 | session D 真 AI；tests/ai-driver.test.ts 13 案 |
| src/session/persistence.ts | 10MiB UTF-8、防版本不合；沿既有 core semantic/history parser | session E malformed/版本/語意/history與old callback |
| src/session/immutable.ts、errors.ts | 分離快照深凍結、固定公開錯誤碼，不外傳原始例外 | session A/B/C/D/E、readonly snapshot |
| src/presentation/events.ts | 僅前後 actor Observation + 本玩家成功 receipt；七類 deterministic envelope | tests/presentation.test.ts 23 案；session F |
| src/main.ts | GameplayPort 接線與 DOM render；files 只供本機 IO；無 canonical state／AI timer | boundary 2 案及真 browser |
| src/ui/map.ts | 僅 readonly 型別變更，無繪圖／手勢功能修改 | check、browser、diff |
| tests/helpers/terminal-journey.ts | 全知測試 planner，不是 production AI；91 真合法 commands 形成 winner0 | 保存/replay合法重建、終局 duplicate/metadata |

subscribe 是事件唯一播放通道；C2 尚無新視覺動畫、逐幀 replay player。AI 不收 GameState。拒絕命令不占 ledger；成功重送先依 core 去重，再查 stale／turn／terminal。load 完全驗證後才 stop driver/generation++/replace；失敗不改 snapshot/timer/dirty。callback 交易拒絕 SESSION_BUSY；例外隔離，dispose 立即停止其餘通知與 timer。下載不清 dirty，真正 IO 成功才能 ack 同 stamp。

## TDD 與驗證證據

原始 log 保存在隔離交付根 evidence/（Git 不收私有機器日誌）。每個 run_evidence JSON 記實際 UTC、命令、HEAD 與工作中 source aggregate、exit、耗時；Node／npm／作業系統另統一記在 C2-VERIFICATION.json；source.json 保留逐檔 hash。C2-VERIFICATION.json 記最終執行與 raw evidence hash。主要 RED/GREEN：

| 切片 | 失敗證據 → 通過證據 | 意義 |
|---|---|---|
| A | A-red → A-green | factory 不存在→受限 capability／immutable view |
| B | B-red → B-green | dispatch pending→扣費、去重、衝突、stale／非法拒絕 |
| C | C-red → C-green | subscription pending→重入、例外、退訂、dispose |
| D | D-red → D-green | driver 未實作→真 AI／取消／錯誤暫停；D-edge 13 案是事後補強，不假稱 RED |
| E | E-red → E-green | 四案皆因 pending→save/ack/import/replay與取消通過 |
| F | F-red → F-green-final；F-session-red → F-session-green | 缺投影／缺接線→事件及真遺跡流程；初期 fixture 錯誤另保留 F-red-initial |
| F-R1 | reviewer owner-filter mutation survived → 新測試 mutation killed | 合法 Recruit 新見敵兵，23 tests；無產品改動 |
| G | G-boundary-red → G-boundary-green | main 曾持 state／timer→正式 port 接線；靜態邊界不冒充 browser |
| D 終局 | D-terminal-red → D-terminal-green | 真合法最後 Capture 後 idle→finished；重送仍 duplicate；不改勝負 |
| Browser | G-browser FAIL → G-browser3 PASS → 最終 fresh run | 橫式原觸點被 footer 覆蓋；全手勢軌跡 hit-test 後保留位移／zoom強斷言 |

最終必跑 check/test/build/qa:browser，數量與耗時以 C2-VERIFICATION 為準。全 suite 應為原44＋session17＋driver13＋presentation23＋boundary2＝99，零 skipped。無可呼叫 lsp_diagnostics，使用 strict TypeScript check；沒有 lint script，沒有額外安裝依賴。

## Fog、獨立審查與 C0

Projector 由獨立 reviewer 檢查，在合法 receipt／同世代前提下未確認 P0/P1/P2；抓到 F-R1 測試缺口並補正。另一 reviewer 審 root 的 session/main，另跑 lifecycle、合法終局與 fog fixture；其本人寫過 projector，故不把該檔算第二次獨立驗收。報告在 evidence/independent-F-review.md、independent-C2-runtime-review.md。OpenCodeReview 只用本機 v1.13.0 delegate preview/rule + 宿主逐檔審查，未呼叫外部 OCR LLM。

Fog 測試先證明世界真的不同，再比較合法可見輸入：projector 三 hidden-world pairs；session 同 seed／合法 history 中 AI 研究 farm 或 archery，己方 Observation、事件、公開拒絕碼相同。這是明確局部非干擾證據，不保證所有輸入／聯網保密。PrivateExport 不交 HUD；Replay 驗證不回 canonicalHash/history。

C0-01 不採 D2 全域 guard，有 selector／error吞錯 regression。C0-02 真 CDP touch；C0-03 有上述非干擾；C0-04 強制 relic/intel/recruit/new soldier移動；C0-05/06 不採 D2 錯誤圖面，仍交 Gemini 修；C0-07 新 C2-SOURCE-MANIFEST.json 對本次 bytes。歷史 PUBLISH-MANIFEST／checkpoint 不當現行 source manifest；context:init 的舊 snapshot changed 不是新測試失敗或產品 PASS。

## 未完成與下一步

D3 integration、新城市成長／新科技兵種／AI策略調整／新版遺跡都未做。full100 62 COMPLETE/38 TURN_LIMIT、seed010 800 EndTurn/19696 commands/winner=null、T3/T6 仍歷史 TESTED_FAIL；本輪不昂貴重跑，沒有合成 winner。真人完整局、實體手機、45–90分鐘目標 UNVERIFIED。單一1440×960初局斥候畫面對C0 main同狀態PNG SHA完全相等、0不同像素（desktop-visual-regression.json），TESTED_PASS僅限此畫面；其他狀態／手機沒有golden像素比較。有真桌面與三模擬手機截圖供人工檢視。812×375 footer 交疊／可視畫布小交 Gemini C3，C2 不改 CSS。

下一 Agent 先核對 C2 source manifest／Git branch 與遠端最新 main，再把正式 source/API 交前端；等 D3 完整來源才 C3 函式級合併。禁止回舊 main 整檔覆寫 session 接線。C2 到此停止。
