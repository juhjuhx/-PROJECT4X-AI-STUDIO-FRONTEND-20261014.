# MVP 架構與路線圖

2026-10-12重新核對。黑白工程樹延續已確認方向；遊戲美術另採原創紙色與墨綠。從玩家呼叫看，輸入只提出command，權威core產生新狀態，再投影成可見世界。

```text
輸入：seed + 版本化規則 + command
  |
  +-- src/core/types.ts                 共同契約（唯一串行編輯）
  |
  +-- src/core/game.ts                  唯一權威
  |     +-- 地圖生成 / 連通出生點
  |     +-- 行動驗證 → 無效原狀返回
  |     +-- 回合 / 金幣 / 招募 / 科技 / 戰鬥
  |     +-- 遺跡必答 / 流亡 / 持續控制 / 主動建都 / 淘汰
  |     +-- 三態迷霧 → Observation
  |     +-- canonicalHash（權威狀態與重播對照）
  |
  +-- Observation（遮蔽敵方位置、科技與收入）
  |     +-- src/ui/map.ts               Canvas2D 2.5D / 鏡頭 / 拾取
  |     +-- src/core/ai.ts              僅觀測資料與合法行動
  |
  +-- src/main.ts                      協調外層（持完整GameState）
  |     +-- dispatch / beginAI → applyCommand → observe → DOM / map
  |     +-- localStorage / 匯入 → persistence驗證 → 原子替換現局
  |     +-- generation取消過時AI或匯入；不自行寫遊戲規則
  |
  +-- src/core/persistence.ts           版本 / 語意驗證 / 命令回放
        +-- localStorage / JSON匯入匯出  完整本機存檔，非公開秘密邊界

工程驗收
  +-- tests/core.test.ts                開發者規則驗證
  +-- tests/review.test.ts              獨立反例驗證
  +-- scripts/headless.ts               固定001–100 gate；指定seed抽查PARTIAL
  +-- scripts/browser-check.mjs         桌面 / 模擬觸控 / console / 截圖
  +-- OCR delegate                     檔案選取 → 規則 → 逐檔審查
  +-- tsc + build + npm audit           實際執行證據
  +-- 啟動遊戲.command → serve.mjs      僅本機 127.0.0.1，服務dist
  +-- context:init                      短記憶 / 待辦 / 雜湊核對（不跑測試）

後續（依初版試玩改進，不預定日程）
  [MVP] 整局可玩 → [本人試玩] 可理解 / 策略 / 疲勞 / 重玩意願
     → [G1.5] 文明代謝差異與非對稱生存探針
     → [G2] 文化與政治分離 / 外交 / 生態 / 美術深化
     → [需要線上功能時] 同核心後端權威 + Observation傳輸
```

入口：`main.ts:dispatch` 接玩家動作，`beginAI` 接AI計時協調；`game.ts:createGame/applyCommand/observe` 提供規則邊界；`persistence.ts:deserializeGame/replayGame` 提供完整重建驗證。外部caller是browser外層、core/review測試及headless harness；它們共用同一core。

隱性依賴：`types.ts` 的單位／科技數值與Observation合法行動是AI和畫面的共同契約；`main.ts` 的generation／requestSession是續局及取消過時工作的一致性邊界；save／replay依賴相同ruleset、生成器與命令語意，變更時須版本化。完整本機保存不構成反逆向保密。

核對結論：唯一權威與觀測邊界目前清楚，未找到可證實必須立即重構的耦合問題。`main.ts` 同時承擔DOM、回合協調與保存介接；未來這些變更相互干擾時再拆adapter。目前主要未過gate是AI整局驗收，不能將它歸咎為已證實的組件架構錯誤。

接入後端的條件是「有多人、跨裝置存檔或權威防作弊需求」。本版以模組邊界預備，不先增加伺服器、登入或資料庫。真正手機、真人完整一局、45–90分鐘節奏與文明異構樂趣分開驗收，不能以100局AI數字代替。
