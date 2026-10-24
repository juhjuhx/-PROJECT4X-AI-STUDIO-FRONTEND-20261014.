# PROJECT-4X / Agent Engineering Contract

> 2026-10-19 CURRENT C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-19 歷史C5-R2快照：三項無記憶AI局部修補 IMPLEMENTED，110 tests/check/build、1100-command prefix0loop、11 browser與12真玩法情境 TESTED_PASS。最新seed010仍 TESTED_FAIL：800 EndTurn／19813 commands／winner=null；中央搜尋合成反例1000commands仍FAIL。新版full100未跑，Alpha仍PARTIAL。權威續作見NEXT-ACTION與C5-R2-TEST-RESULTS；不push main。

> 2026-10-18 歷史R1快照：C2/C3/C4工程candidate已通過。C5最小無記憶policy修補IMPLEMENTED；生成prefix三段振盪→0、104 tests/check/build/11 browser/12玩法情境TESTED_PASS。完整seed010仍TESTED_FAIL：800 EndTurn/17937 commands/winner=null；新版full100/T3/T6未完整重跑，不能沿用舊62/38當新終局率。主創確認保留D3分頁。詳C5-AI-DIAGNOSIS與NEXT-ACTION。



> 2026-10-18 C3 CHECKPOINT（4cddfb3）：C2已fresh驗證；C3隔離整合已完成103測試與11 browser情境，獨立審查與玩法QA複核完成。C3不改core/session/persistence/lock。下一步C4-R0真Attack/Capture旅程、C5-R0固定seed診斷。此工程candidate不等於整體Playable Alpha。



本檔為公開 Git 專案的當前執行約束；歷史設計請依 `docs/game-design/DECISION-REGISTER.md` 局部覆寫規則核對，不以最後修改時間推定主創裁決。使用繁體中文說明，程式碼識別字保留原文。

### 2026-10-17 C2 當前入口與分工

先讀 `docs/handoff/INTEGRATION-STATUS.md`。Codex 擁有 core/session/command/AI/persistence/tests/契約與 main 最終整合；Gemini 擁有 UI/Canvas/CSS/視覺 assets。完整所有權見 `docs/contracts/MODULE-OWNERSHIP.md`。

`docs/contracts/FRONTEND-CORE-CONTRACT.md` 與 `frontend-core-v1.d.ts` 是正式 v1 接口；runtime 位於 src/session/**，證據見 docs/handoff/C2-IMPLEMENTATION-STATUS.md。不可僅憑型別存在宣稱行為通過。UI 以 Observation、合法 Actions、安全事件接線，不得自行補 reducer 或讀 canonical truth。

本輪只收 D2；D3 缺交付標記。D2 與 main 的核心和交易函式未變，但新增全域吞錯、弱 QA 與未知據點錯標等阻擋，見 C0-SOURCE-AUDIT。不要整包直接覆寫 main。重新核對遠端 SHA 後才能整合。

本專案原創原始碼／文件依作者已批准的 MIT LICENSE；第三方授權另存。舊「尚未授權」敘述是歷史狀態，不能覆蓋現行 LICENSE。工程／玩法 gates 分列；本輪不 push/merge/publish。

**初次進入**：依序讀 `README.md` → `docs/PROJECT-STATUS.md` → `memory/session-handoff-LATEST.md` → 相關 `src/` → tests，先核對版本與真實 source。`npm run context:init` 只作記憶和固定 source hash 檢查，**不是測試 PASS**。

### 系統不變量

1. 唯一可變權威：`src/core/game.ts` 的 `GameState` 與 `applyCommand`；AI `chooseAction` 及 `WorldMap` 只接收 `Observation`。session/game-session.ts 獨占 canonical state，main 只接 GameplayPort／LocalPersistencePort，渲染不直接寫 core state。
2. 拒絕非法 command 不得產生副作用；同 requestId + payload 不可雙花，異 payload 拒絕。有效命令在相同規則、版本、seed 下具有可重現性。
3. Fog／ViewerEvent／回傳錯誤與動畫不得繞過 actor 可知世界，完整本機 save **包含世界真相**，不得視為可公開展示的 fog-safe replay。
4. G1：單位或據點任一仍在即可繼續，兩者皆零才淘汰；無流亡倒數。歷史首都與現時政治中心分離，持續控制據點跨完整敵方回合才可主動建中心。
5. 遺跡在 `pendingRelic` 階段必須立即解決；現行「看見即取得」是**舊實作**，主創新裁決是「發現權／取得權分離，實際抵達者優先」，不要用畫面假裝已修正。
6. Import 先驗完整版本／語意／history 才替換現局；失敗保留當前 GameState，不能部分套用。
7. 嚴禁加入 Polytopia 專有內容、未審查授權素材；不得聲稱 GPL 工具中的 code 可無限制直接複製。
8. Engineering Gate 與 Playability Gate 獨立。歷史 `full100=62/38 FAIL`、舊 `seed010 FAIL`、T3/T6 FAIL 必須保留版本。R3 seed010單局已TESTED_PASS；新版full100/T3/T6仍UNVERIFIED，不能省略或改門檻。
9. 不修改使用者其他專案，禁用 git reset/clean/force push。新增依賴、授權決定、長期玩法規則均需相應授權與測試。

### AI Studio 實作界線

✅ 原則允許：`src/styles.css`、`src/ui/map.ts` 的繪製與 camera/input 表現、`src/main.ts` 的 DOM/render 區段、`index.html` 的非規則性介面。**在 core 可視資料邊界內作 UI**。

⛔ 不得修改：`src/core/**`、`tests/**`、`scripts/headless.ts`、`scripts/verify.mjs`、依賴 lock、遊戲 reducer、勝負與遺跡決策、save/load/replay。`src/session/**`、`src/presentation/events.ts`、main 的 dispatch/import/save 接線與 generation/request/version/validate-before-replace 不得因 UI 重製而覆寫。

### 適用審查

先建立高信號反例；視工具可用性依需選用 `superpowers:using-superpowers`, `superpowers:receiving-code-review`, `superpowers:verification-before-completion`, `codex-engineering-guardrails:code-verification`, `alibaba/open-code-review`。後者需額外 CLI／服務條件，C2 使用本機 OCR delegation preview/rule 與宿主審查，沒有呼叫外部 LLM OCR review；參考 `docs/agent/SKILLS-ROUTING.md`。任何 PASS 都需附指令、exit code、測試版本與實際 log。不要只維護文件而不進展產品。
