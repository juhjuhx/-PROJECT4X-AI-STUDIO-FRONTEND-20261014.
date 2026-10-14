# AI Studio Build｜使用 GitHub 真實專案匯入

目的：避免把 ZIP 當成文字貼在 prompt 造成二進位損壞或平台只生成空白 React 範本。

1. 在 Google AI Studio **Build** 模式，選 **Import from GitHub**，選擇目前這個 repo（名稱末端確實有一個 `.`）：`juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014.`。
2. 確認 Code 檔案系統確實有 `package.json`（name=`project-4x-mvp`）、`package-lock.json`、`src/main.ts`、`src/core/game.ts`、`src/core/ai.ts`、`src/ui/map.ts`、`docs/ai-studio/INTEGRATION-BOUNDARIES.md`；**若仍是 `react-example`、`src/App.tsx` 或 Android 範本則停止。**
3. 確認 baseline main commit SHA，依真實 package scripts 執行 `npm ci --ignore-scripts`、`npm run check`、`npm test`、`npm run build`。不因 UI 工作修改 lock 或 core。
4. 閱讀 `AGENTS.md`、`docs/ai-studio/FRONTEND-HANDOFF.md`、`INTEGRATION-BOUNDARIES.md`、`UI-UX-SPEC.md`、`SCREEN-INVENTORY.md`，改造等角地圖表現、HUD、手機手勢、縮放、安全區、易用性、無障礙及明確回合流程。
5. **禁止重新生成 React／Android 平行產品。** 保留 `GameState`、`Observation`、replay / requestId / 版本校驗。可變更 `src/styles.css`、`src/ui/map.ts` presentation 及 `src/main.ts` 已確認的 DOM/render 區段；禁動 ruleset 核心。
6. 匯出完整可還原的源碼 ZIP，提供 `baseline commit`、變更清單、實際 diff、桌機與手機真截圖、可重現操作測試和阻塞清單；交回獨立 Codex 審查，**不要直接覆蓋這個 main 的 GameState**。

官方說明：https://ai.google.dev/gemini-api/docs/aistudio-build-mode 。未經真人與完整 Gate 不宣稱正式遊戲發布。
