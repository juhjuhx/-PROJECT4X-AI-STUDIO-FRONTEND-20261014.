# PROJECT-4X｜續接記憶（現況由NEXT-ACTION維護）

## 2026-10-19 C5-R3 當前入口

先讀 `docs/handoff/NEXT-ACTION.md` → `docs/verification/C5-R3/C5-R3-ROOT-CAUSE.md` → `C5-R3-TEST-RESULTS.json`。integration/project4x-c3，R3基線8acc526…；本輪只改ai.ts與3個回歸測試。113/113、check/build、prefix1100commands/0loop、browser11／真玩法12通過。seed010現版形成合法終局：winner0，534EndTurn／15418commands，terminalSaveReplayChecked=true。先前R1/R2與R3第一候選FAIL均保留為歷史，不當現版結果。

新版full100/T3/T6 UNVERIFIED；中央D-02 fresh1000commands／seen=false／winnernull仍TESTED_FAIL；Alpha PARTIAL。下一任務是合法Observation/frontier的中央搜尋最小反例；不使用truth或未知中心座標。若需持久記憶／save/schema改動先另行裁決。實際HEAD及已測source tree對應交付根FINAL-GIT-STATE.json；本機沒有push main或外部自動排程。下方均為有日期的歷史快照，不覆蓋本段。

## 2026-10-18 C5-R1歷史入口

讀docs/handoff/NEXT-ACTION.md → C5-AI-DIAGNOSIS.md → C5-VERIFICATION.json。C3/C4可玩接口與真UI旅程已通過；C5最小無記憶paired-potential修補已實作、prefix0loop/104tests通過，原繞路test不改。完整seed010新policy仍FAIL：800 EndTurn/17937commands/winnernull；不可把局部修補當全局終局完成。新版full100未重跑，不沿用舊62/38為新比例。下一步C5-R2真攻城/補兵/佔領反例；沒有push/main merge或自動排程。


2026-10-18 C5歷史快照：先讀 docs/handoff/NEXT-ACTION.md／C5-AI-DIAGNOSIS.md。可攜qa:ai:oscillation故意保持TESTED_FAIL（3段實際生成prefix振盪），不是build/unit test故障；主創已答：先修現有無記憶policy最小反例、保留D3分頁。

## 2026-10-18 C3 歷史入口

讀 docs/handoff/NEXT-ACTION.md → C3-IMPLEMENTATION-STATUS.md → C3-VERIFICATION.json。integration/project4x-c3 已保留C2權威session，採D3呈現並修未知owner/中心名稱/徵召原因/手機選格；103 tests、11 browser、12-case連續玩法（209追加人類命令，先Attack再Capture）通過，獨立審查完成。完整Alpha仍PARTIAL，seed010 fresh FAIL，局部振盪已證但策略未修；下一步由主創grill-me裁決最小policy修正或記憶層設計。沒有push/main merge或外部續作排程。舊「停止C2／等D3」已被2026-10-18主創master harness授權取代，不能照舊停工。


## 2026-10-17 C2 續接優先入口

目前隔離分支 integration/project4x-c2，已實作 src/session/**、src/presentation/events.ts 並讓 main 用 GameplayPort／LocalPersistencePort。讀 docs/handoff/C2-IMPLEMENTATION-STATUS.md → C2-VERIFICATION.json → contracts。核心四檔與 policy 不變；沒有 push/main merge/D3整合。最終 commit 見 git HEAD 與交付根 FINAL-GIT-STATE.json；不要把 parent f884de6 當成最後 C2 commit。D3仍缺，full100/seed010/T3/T6仍歷史FAIL。下一步核對遠端與manifest，交正式接口給前端，等待真D3；本輪停止C2。

## C0/C1 歷史續接（已由上段局部更新）

讀 `docs/handoff/INTEGRATION-STATUS.md` → `docs/handoff/C0-SOURCE-AUDIT.md` → `docs/contracts/FRONTEND-CORE-CONTRACT.md` → `docs/contracts/MODULE-OWNERSHIP.md`。本工作樹分支 integration/project4x-c1，基線 c21b16cd75572d069369f41426f7323c63c05083；只有文件／目標型別改動，沒有 runtime 抽取、UI 採納或遠端提交。

使用者 ZIP bf9a2ddee457e598f85345b53456749bf603ee490d18e4c25a8f142210450a5e 是 D2；缺 D3 三標記。兩份 source 各 44 tests/check/build/browser 7 scenarios 通過；Stage 2 證據仍 PARTIAL，full100/T3/T6/seed010 仍歷史 FAIL。下一步交契約給 Gemini、等真 D3；若先 C2，必須先寫交易／換局／AI 取消反例再增量實作。以下為歷史記憶，不能覆蓋本段狀態。

這是**專案工程交接資訊**，不是 ChatGPT 個人記憶或私人對話記錄。正式主創裁決見 `docs/game-design/DECISION-REGISTER.md`。

**CURRENT** TypeScript 7.0.2／Vite 8.3.4／Canvas2D；`src/core/game.ts` 唯一規則權威。AI 和 WorldMap 只收 `Observation`。版本來源：AI Studio 前端 ZIP SHA256 `c048fc51178a107d4683810075e5c61c7bc5b8c30864a1a4f0015ea231d9eb63`，source snapshot `f132db11dd8842a59100ad994c7abc7c6ed64053ce63adf25de7bba114249e4c`（**僅指封存時既有程式檔；公開新增文件會產生新 Git commit**）。

**TESTS** 2026-10-14 Mac 原始日誌：44/44 tests PASS、check/build PASS、production browser 7/7 PASS、audit0（原始證據保存在未公開的完整工程封存）。同版 full100 62COMPLETE/38TURN_LIMIT FAIL。seed010：800 EndTurn、19696 command，無 winner，FAIL。這些不是新 GitHub CI 結果。

**P0** AI 長局卡局（central map 探索反例、策略失效），仍需根因與回歸；不能調高上限。**P1** 遺跡取得規則：主創最新決定發現與占有分開、真正抵達取得，現 core 仍為看見即領取；需版本化避免破壞舊存檔。**P2** 產品 UX 的桌面/手機可操作性與真人體驗。**LATER** G1.5 非對稱文明經濟與真人驗收；政權／文化深層模型、神器、跨星際未實作。

**GOOGLE AI STUDIO** 透過 GitHub Import 讀此倉庫。先核對 `src/core/game.ts`、`src/ui/map.ts`、`package.json`，執行基線測試；僅改 UI 部分，回交完整程式、diff、基線 commit SHA、截圖、操作測試。不要重建 React 範本。

**NEXT CODING AGENT** 複製乾淨工作樹後對照真正的主線 SHA；先修 seed010，下一步再處理遺跡規則；UI 改造獨立分支整合。禁止把 zip 封存成功當成產品驗收完成。
