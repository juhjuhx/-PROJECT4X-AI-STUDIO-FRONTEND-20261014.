# PROJECT-4X · 霧境初航 / First Playable

> 2026-10-19 CURRENT C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-18 CURRENT：C2/C3/C4工程candidate已通過。C5最小無記憶policy修補IMPLEMENTED；生成prefix三段振盪→0、104 tests/check/build/11 browser/12玩法情境TESTED_PASS。完整seed010仍TESTED_FAIL：800 EndTurn/17937 commands/winner=null；新版full100/T3/T6未完整重跑，不能沿用舊62/38當新終局率。主創確認保留D3分頁。詳C5-AI-DIAGNOSIS與NEXT-ACTION。



> 2026-10-18 C3 CHECKPOINT（4cddfb3）：當前 integration/project4x-c3 保留C2 GameSession、增量採D3地圖/HUD。fresh check/test(103)/build/browser(11)通過；可 `npm ci` → `npm run dev`，正式本機服務 `npm run build` → `npm start`。詳docs/handoff/NEXT-ACTION.md及C3-IMPLEMENTATION-STATUS.md。尚未push/main merge；AI可靠終局與真人/真機尚未驗收。



2026-10-17 C2：GameSession runtime 已實作，main 已接受限接口；先讀 [C2 狀態](docs/handoff/C2-IMPLEMENTATION-STATUS.md)、[正式契約](docs/contracts/FRONTEND-CORE-CONTRACT.md)與[模組所有權](docs/contracts/MODULE-OWNERSHIP.md)。D3 尚未交付，本分支未推送；整局玩法 Gate 仍 FAIL。

> **Status — experimental MVP, engineering gate NOT PASS.** This is the actual TypeScript/Canvas2D game, not a design mockup, React clone, or polished release. 目前優先支援 Google AI Studio 以 **GitHub Import** 取得真正原始碼。

## 專案概要

原創 2.5D 等角迷霧探索與征服回合策略遊戲。G1 MVP 包含 24×24 地圖、玩家對 AI、三兵種、三科技、據點、金幣、迷霧、四個簡化遺跡、軍事流亡及異地／故土建國、存檔和確定性重播。長期設計包括文明非對稱代謝、不同認知方式、政權和文化分離、荒誕但具有因果的文明、跨尺度世界及非領土生存；**長期設計絕不等於目前已實作**。

C2 以 2026-10-14 GitHub 基線增量抽出 session／事件與強化測試；core 四檔、玩法數值、AI policy、package 與 lock 保持 byte-identical。已知整局失敗保留，不以架構變更宣稱玩法修復。

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

2026-10-17 已查得 main `c21b16cd75572d069369f41426f7323c63c05083` 的 [GitHub Core checks 成功](https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./actions/runs/38535576030)，並在隔離副本重跑 main/D2 各 44 tests、check/build、7 個 browser scenarios 通過。這不覆蓋 full100/T3/T6 的玩法 FAIL、真人與真機缺口。詳見 [C0 稽核](docs/handoff/C0-SOURCE-AUDIT.md)及[重現方法](docs/qa/REPRODUCE.md)。

## 重要入口

- [Agent 工作約束](AGENTS.md) · [AI 續接記憶](memory/session-handoff-LATEST.md)
- [系統架構](docs/architecture/SYSTEM-ARCHITECTURE.md) · [介面契約](docs/architecture/API-CONTRACTS.md)
- [遊戲規則](docs/game-design/GAME-RULEBOOK.md) · [主創裁決](docs/game-design/DECISION-REGISTER.md)
- [Google AI Studio 匯入流程](docs/ai-studio/IMPORT-FROM-GITHUB.md) · [可編輯邊界](docs/ai-studio/INTEGRATION-BOUNDARIES.md)
- [開源研究與第三方元件](docs/research/OPEN-SOURCE-INTEGRATION.md) · [本專案授權現況](LICENSE-STATUS.md)
- [階段性技能路由矩陣](docs/agent/SKILLS-ROUTING.md)

## 著作權與授權

**本專案原創程式碼與文件依作者已批准的 [MIT License](LICENSE) 授權。** 適用條件以 LICENSE 正文為準；第三方依賴與素材各有其授權，詳 [授權現況](LICENSE-STATUS.md)及 `docs/research/LICENSE-MATRIX.md`。MIT 不會把外部 GPL／CC 素材自動改成 MIT，也不代表可把研究參考專案的程式直接納入。

## 開發邊界

`src/core/**` 是規則來源，AI 和地圖 UI 不應讀取秘密世界狀態；詳 AGENTS.md。AI Studio 工作只變更 presentation、UI，並保留真功能。不要藉改 UI 同時改動 AI 勝負邏輯、遺跡裁決或 save/replay schema。
