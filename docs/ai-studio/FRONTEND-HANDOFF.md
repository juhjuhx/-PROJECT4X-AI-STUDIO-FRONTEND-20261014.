# Google AI Studio 前端交接

> 2026-10-18 CURRENT：以integration/project4x-c3的最新commit為整合基線，保留D3分頁（主創已確認）、Canvas2D/Native DOM與既定D Hybrid。GameSession v1唯一權威；Gemini只交presentation diff，不回灌舊main/core/AI/save。最新可執行程式、限制與下一步見[工程入口](../handoff/NEXT-ACTION.md)。真截圖及viewport/source/state索引見[SCREEN-INDEX](../verification/C5/C5-paired-gameplay-artifacts/SCREEN-INDEX.json)。下方為歷史基線說明，若版本不同以上述入口為準。

目前是真實TypeScript＋Vite＋原生DOM＋Canvas2D可玩MVP，不是React/Vue，也沒有AI模型API要求。版本0.1.0、ruleset g1-ccts-1。用保留引擎供真實資料：這份前端包含src/core、tests及lock，因main.ts持局面並處理AI/保存，無法只拿CSS/畫面獨立運作。核心只供執行與驗證，禁止更改。

開始先讀專用README、INTEGRATION-BOUNDARIES、API-CONTRACTS、SCREEN-INVENTORY。執行 `npm ci --ignore-scripts`、`npm run check`、`npm test`、`npm run build`、`npm start`。已附從本source本輪build的dist；具Node可直接npm start。GUI需測試Chromium；安裝測試瀏覽器是新環境步驟，封存沒有新增工具。

## 本輪交接目的

只改視覺、layout、輸入易用性、資訊層級，保留2.5D等角策略地圖、探索未知文明與簡潔資訊。風格方向已由本次需求給定；文件描述現有token，沒有生成新概念圖或替主創選新風格。

真Chromium桌面1440×960、touch375×812／812×375／320×640已跑7/7，另拍保存/玩法4圖。這些是模擬device viewport，不是實體手機PASS、真人完整遊戲或45–90分鐘體驗驗收。AI full100 FAIL38局，不得把改UI後畫面說成已解決AI。

## 安全展示

WorldMap.update只收observe(state,HUMAN)產生的Observation。渲染不要接GameState；未知格不讀terrain、敵軍、owner真相。本機完整save/replay含世界真相，不能直接用作公開安全觀戰fixture。需要storybook式展示時，優先由createGame＋合法命令生成，再observe後輸出只讀Observation；不得以虛構fixture冒稱真人局或可載入正式save。

## 交回Codex

回傳完整可build source ZIP、修改檔清單、每screen真實截圖、操作流程與known gaps；附base-source hash，別動core/lock/test。Codex在新隔離副本對照manifest審diff、check/test/build、browser7情境及新增UI流程；檢查fog與事件邊界、requestId/generation取消、壞匯入保留現局。UI回歸通過後仍保留T3/full100 FAIL，AI修正另立工程任務與主創規則變更版本化。
