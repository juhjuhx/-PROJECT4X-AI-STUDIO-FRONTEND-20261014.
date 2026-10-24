> 2026-10-24 Demo02：Codex新增`src/demo/**`的Observation-only目標、內建敘事包與選單；`local-progress.ts`屬本機可信檔案邊界，只hash save bytes，不將DTO送HUD。main仍是唯一composition root；session/core/presentation及正式v1 Port未改。Gemini可改善shell外觀與CSS，不能重寫load意圖token、stamp預驗或sidecar綁定。`public/`發行圖示與PWA、`scripts/build-pwa.mjs`由Codex整合並審license；D3地圖與HUD方向不變。

# 模組所有權與整合程序

> 2026-10-18 CURRENT：2026-10-18：C3 worktree獨立，root唯一writer；UI採D3但GameSession/PresentationEvent/LocalPersistencePort契約不變。新增src/ui/recruitment.ts是Observation-only呈現helper；Codex維護合法資料分類測試，Gemini可改善文案/樣式。原D3 main的state/driver/guard未採用。


日期：2026-10-17。這是當前工程分工（USER_CONFIRMED）；C2 session 與 presentation 目錄已實作；未有 runtime 者才標 PROPOSED。接口權威為 [FRONTEND-CORE-CONTRACT](FRONTEND-CORE-CONTRACT.md)，現行行為仍由 core source 證明。

| 路徑／責任 | 寫入 owner | 其他 Agent 的合作方式 |
|---|---|---|
| `src/core/**`：GameState、applyCommand、Observation、legalActions、AI policy、persistence | Codex | Gemini 提需求／反例，不直接改規則 |
| `src/session/**`（IMPLEMENTED）：唯一 state holder、command envelope、AI driver、換局、Save/Replay orchestration | Codex | HUD／地圖只透過 GameplayPort；本機檔案 controls 另取 LocalPersistencePort |
| `src/presentation/**`（IMPLEMENTED）：actor-scoped 安全事件、只讀 view model | Codex 維護資料邊界；Gemini 提演出需求 | 不接 canonical truth；視覺播放端放 `src/ui/**` |
| `src/ui/**`：Canvas 畫圖、鏡頭、選取、手勢、HUD、dialogs | Gemini | Codex 可做必要接線；行為與 fog 由 Codex review |
| `src/styles.css`、視覺 assets、非規則性 `index.html` | Gemini | 保留授權／來源；不從 HTML 嵌秘密 state |
| `src/main.ts`：最終 composition root | Codex | Gemini 交 UI diff／函式片段，不整檔覆寫 |
| `tests/**`：規則、契約、隔離、整合測試 | Codex | Gemini 可提出／提交獨立 UI 測試候選，由 Codex 合併 |
| `scripts/browser-check.mjs`、`scripts/headless.ts`、`scripts/verify.mjs`、CI | Codex | 不改驗收上限換綠燈 |
| 視覺專用 QA 腳本 | Gemini 提交、Codex 審查斷言 | mouse 不當 touch；未觸發流程不可 PASS；附真實 bundle hash |
| package manifest、lockfile、tsconfig、Vite、存檔版號 | Codex 最終整合 | 新依賴須明示理由；Gemini 不改生成器或 runtime tech stack |
| `docs/contracts/**`、工程狀態、roadmap、規則與決策簿 | Codex | Gemini 的 FRONTEND-NEEDS 是輸入，不能取代正式 API |
| `docs/art/**`、視覺規格及逐版 UI changelog | Gemini | 清楚區分設計目標、實作、實測；歷史來源不回寫 |

## baseline main.ts 函式級保護面（歷史位置）

遠端基線：state/request/generation 欄位 `main.ts:14–25`；dispatch `330–351`；beginAI `353–409`；stopAI `411–415`；replaceGame `585–597`；save/load/import `572–654`。D2 因前置 guard 與 UI 增補行號不同：state 欄位 `96–110`、dispatch `461–482`、beginAI `484–539`、stopAI `542–546`、replaceGame `807–819`、save/load/import `794–878`。整合時以函式／AST 語意核對，不靠行號或整檔選邊。

C0 確認 baseline 交易函式在 D2 未修改。C2 已從同一 baseline 抽出 session，保留既有 DOM/render；目前保護面改為 game-session.ts:submitAction/replace/load/newGame/acknowledgeSave、ai-driver.ts:createAIDriver、main.ts:dispatch/importFile/saveLocal。C3 再把通過審查的 D3 UI 片段接上 port。新增 `GameState` setter、讓 UI 呼叫 observe/canonicalHash/applyCommand、手動改 gold/hp/winner、第二 reducer 均不符合契約。

## 工作區與交付

1. 原 ZIP 不修改；每包記 CRC、SHA-256、base SHA、逐檔 source manifest。D2/D3 身份以實際交付標記與內容判定，不按 ZIP 名稱猜。
2. Codex 使用獨立 Git worktree；C1 文件已保留 commit f884de6；C2 runtime 位於獨立 `integration/project4x-c2`。Gemini 不往該 worktree 寫入。
3. Gemini D3 應提供 `FRONTEND-NEEDS.md`、`D3-CHANGELOG.md`、`D3-MODIFIED-FILES.json`、完整可建置 source、新截圖與真正執行證據。manifest 必須對本包 bytes，舊 manifest 清楚標 historical。
4. 先檢查 protected paths、main 安全函式與 UI 差異，獨立 review，再函式級整合。禁止覆寫不明遠端提交、force push、reset --hard、clean -fd。
5. 重新讀遠端 main SHA；若移動，記錄新的比較基線與重跑影響面，不能偷偷選舊 SHA 當最新。
6. Gate：source/provenance → check/test/build → 契約、save/replay、fog/AI → 真正瀏覽器操作、觸控／視覺回歸 → 獨立 code review → CI。缺哪一項就明記 PARTIAL/BLOCKED/FAIL；整體玩法失敗不能寫 Playable Alpha 完成。

本輪沒有 main merge、push 或發布。GitHub 主線發布在來源一致與必要 gates 通過後另作最後整合決策；未取得的 D3 不能被 D2 自動替代。

C2 的 src/ui/map.ts 僅改 DeepReadonly 型別接收，不改 camera、手勢或繪圖。main 仍有 DOM/render 與檔案 controls，同檔是 composition root 的受信任範圍；後續 Gemini 可移動純 UI 函式，不能把 files 注入通用 HUD／map。已供事件資料尚不等於視覺播放器。
