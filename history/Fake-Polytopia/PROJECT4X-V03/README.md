# PROJECT-4X｜非線性文明生存策略：設計基線 v0.3

**版號**：0.3.0 / 2026-10-11｜**狀態**：`DESIGN PROPOSAL / NOT IMPLEMENTED / USER REVIEW REQUIRED`

## 產品定位
從直覺的 Polytopia 式探索／征服戰棋出發，但世界不按單一科技時代前進：地圖另一端可能有修仙、魔法、工業、賽博、機械、異星蟲巢或超現實文明。**一切文明為生存而奮鬥。** MVP 以征服勝利做清楚可玩閉環，後續可延展軍團指揮、外交、信仰、政治、資源鏈、跨星系世界。遊戲為獨立原創；不複製 Polytopia 具體資產或規則數值。

## 一分鐘產品摘要
- **玩什麼**：探索迷霧、奪中立村莊、累積城市收入、選科技、佈軍攻首都；途中遇到打破認知的異文明線索。
- **怎麼玩**：大地圖為主，少量情境按鈕；後期靠軍團命令，避免無止境逐個點兵。
- **先完成什麼**：24×24、一名玩家+一名 AI、三兵種、三科技、金幣、征服與至少一件可互動的未知遺跡；真人必須完成一局。
- **不急著做什麼**：全科技時代、文明國際組織、信仰人口、星際戰、十幾種資源、連線、真 3D 模擬。
- **技術**：headless deterministic Core + fog observation + 可換 renderer/projection + 內容包；Web-first 提案；Pixi 8 / Phaser 4 待原型驗證，Rust 非預設。

## 權威閱讀順序
1. `AGENTS.md`（不變量 1–10 原樣保留；新增玩法 Gate）。
2. `docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md`（本輪上位產品設計）。
3. `docs/15-world-bible-nonlinear.md`、`16-survival-and-discovery.md`（世界／玩法）。
4. `docs/17-first-playable-spec.md`（第一個可玩的切片與驗收）。
5. `docs/18-faction-evolution-and-content-packs.md`、`19-army-command-and-low-micro.md`（未來擴充但有明確邊界）。
6. `docs/21-system-contracts-v03.md`、`22-playtest-metrics-and-review.md`（低耦合、高聚合、驗證）。
7. `docs/20-open-source-integration.md`、`docs/23-v03-design-decisions-and-questions.md`（依賴／決策）。
8. `docs/adr/ADR-0003..0006` 和舊版 `docs/00..14`（背景/沿用細節）；`docs/13-roadmap.md` 是目前 Gate 基線。
9. `HANDOFF-START-HERE.md` 給下一位 Agent 執行。

## 版本優先順序
當舊 v0.1 文件與本次 v0.3 提案不同時，以 **v0.3 MVP/架構文件**為當前設計提案來源。`REQ` 是使用者已確認的方向，`PROPOSED` 尚待使用者審閱，`VERIFY` 為實驗/授權/部署待證。任何代理不能以文件優先順序取代使用者新決策。

## 工程真相
本包僅含文件，不含可玩的前後端／Rust 模組／編譯產物／測試案例或真機性能結果；尚未在本包創建任何 GitHub repo、commit 或 PR。`MANIFEST.json` 只證明文件完整性，不能代表玩法、代碼或授權驗收。OpenCode R0 原始 Markdown 未在本次工作區看到，僅依使用者貼出的回報調整。
