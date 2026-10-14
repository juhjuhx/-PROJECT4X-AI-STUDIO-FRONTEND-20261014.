# PROJECT-4X · 霧境初航 / First Playable

> **Status — experimental MVP, engineering gate NOT PASS.** This is the actual TypeScript/Canvas2D game, not a design mockup, React clone, or polished release. 目前優先支援 Google AI Studio 以 **GitHub Import** 取得真正原始碼。

## 專案概要

原創 2.5D 等角迷霧探索與征服回合策略遊戲。G1 MVP 包含 24×24 地圖、玩家對 AI、三兵種、三科技、據點、金幣、迷霧、四個簡化遺跡、軍事流亡及異地／故土建國、存檔和確定性重播。長期設計包括文明非對稱代謝、不同認知方式、政權和文化分離、荒誕但具有因果的文明、跨尺度世界及非領土生存；**長期設計絕不等於目前已實作**。

此倉庫直接保留 2026-10-14 前端交接基線的 `src/**`、`tests/**`、`scripts/**`、`package.json` 和 `package-lock.json`。公開前未授權改寫規則或補造功能，故保留已知失敗以便工程審查。

## 本機執行

Node.js 應使用鎖定依賴相容的版本；封存驗證環境為 Node 26。必須從本專案根目錄執行：

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
npm run dev
```

開發網址 `http://127.0.0.1:5173`。也可完成 build 後 `npm start`，由 `scripts/serve.mjs` 啟動靜態服務（預設 `http://127.0.0.1:4173`）。如需瀏覽器測試，安裝對應 Playwright Chromium 後依 `docs/qa/REPRODUCE.md` 執行。無 AI API、登入或伺服器依賴；`dist` 是 build 產物，**不納入 Git**。

## 工程與品質現況

| 範圍 | 2026-10-14 封存證據 | 現在是否完成正式驗收 |
|---|---|---|
| 對戰與 UI 基礎 | 原 Mac `npm test` 44/44、`check/build` PASS，Production Chromium 7/7 | **否**；只有基礎檢查通過 |
| headless 100 局 | 62 COMPLETE / 38 TURN_LIMIT（同版歷史結果） | **FAIL** |
| seed010 | 800 EndTurn、19,696 commands，winner=null | **FAIL，可重現** |
| 取得遺跡 | **程式仍是看見即處置** | **與最新主創裁決不一致** |
| 真人和實體手機 | 無完整驗收 | **UNVERIFIED** |

最新 GitHub CI 執行結果尚待首次 push 後確認。不要把上述 Mac 歷史驗證誤稱為 GitHub Actions PASS。詳見 [狀態與阻塞](docs/PROJECT-STATUS.md)及[重現方法](docs/qa/REPRODUCE.md)。

## 重要入口

- [Agent 工作約束](AGENTS.md) · [AI 續接記憶](memory/session-handoff-LATEST.md)
- [系統架構](docs/architecture/SYSTEM-ARCHITECTURE.md) · [介面契約](docs/architecture/API-CONTRACTS.md)
- [遊戲規則](docs/game-design/GAME-RULEBOOK.md) · [主創裁決](docs/game-design/DECISION-REGISTER.md)
- [Google AI Studio 匯入流程](docs/ai-studio/IMPORT-FROM-GITHUB.md) · [可編輯邊界](docs/ai-studio/INTEGRATION-BOUNDARIES.md)
- [開源研究與第三方元件](docs/research/OPEN-SOURCE-INTEGRATION.md) · [本專案授權現況](LICENSE-STATUS.md)
- [階段性技能路由矩陣](docs/agent/SKILLS-ROUTING.md)

## 著作權與授權

**本專案目前沒有對遊戲原始碼授予公開重利用授權。** GitHub 公開可見不代表 MIT、Apache-2.0 或公有領域；不要任意把第三方資產或 code 複製進來。第三方依賴有各自授權，詳 `docs/research/LICENSE-MATRIX.md`；遊戲專案對外授權仍待作者決定。

## 開發邊界

`src/core/**` 是規則來源，AI 和地圖 UI 不應讀取秘密世界狀態；詳 AGENTS.md。AI Studio 工作只變更 presentation、UI，並保留真功能。不要藉改 UI 同時改動 AI 勝負邏輯、遺跡裁決或 save/replay schema。
