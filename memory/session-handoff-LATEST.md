# PROJECT-4X｜續接記憶（2026-10-14 Git 基線）

這是**專案工程交接資訊**，不是 ChatGPT 個人記憶或私人對話記錄。正式主創裁決見 `docs/game-design/DECISION-REGISTER.md`。

**CURRENT** TypeScript 7.0.2／Vite 8.3.4／Canvas2D；`src/core/game.ts` 唯一規則權威。AI 和 WorldMap 只收 `Observation`。版本來源：AI Studio 前端 ZIP SHA256 `c048fc51178a107d4683810075e5c61c7bc5b8c30864a1a4f0015ea231d9eb63`，source snapshot `f132db11dd8842a59100ad994c7abc7c6ed64053ce63adf25de7bba114249e4c`（**僅指封存時既有程式檔；公開新增文件會產生新 Git commit**）。

**TESTS** 2026-10-14 Mac 原始日誌：44/44 tests PASS、check/build PASS、production browser 7/7 PASS、audit0（原始證據保存在未公開的完整工程封存）。同版 full100 62COMPLETE/38TURN_LIMIT FAIL。seed010：800 EndTurn、19696 command，無 winner，FAIL。這些不是新 GitHub CI 結果。

**P0** AI 長局卡局（central map 探索反例、策略失效），仍需根因與回歸；不能調高上限。**P1** 遺跡取得規則：主創最新決定發現與占有分開、真正抵達取得，現 core 仍為看見即領取；需版本化避免破壞舊存檔。**P2** 產品 UX 的桌面/手機可操作性與真人體驗。**LATER** G1.5 非對稱文明經濟與真人驗收；政權／文化深層模型、神器、跨星際未實作。

**GOOGLE AI STUDIO** 透過 GitHub Import 讀此倉庫。先核對 `src/core/game.ts`、`src/ui/map.ts`、`package.json`，執行基線測試；僅改 UI 部分，回交完整程式、diff、基線 commit SHA、截圖、操作測試。不要重建 React 範本。

**NEXT CODING AGENT** 複製乾淨工作樹後對照真正的主線 SHA；先修 seed010，下一步再處理遺跡規則；UI 改造獨立分支整合。禁止把 zip 封存成功當成產品驗收完成。
