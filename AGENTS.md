# PROJECT-4X / Agent Engineering Contract

本檔為公開 Git 專案的當前執行約束；歷史設計請依 `docs/game-design/DECISION-REGISTER.md` 局部覆寫規則核對，不以最後修改時間推定主創裁決。使用繁體中文說明，程式碼識別字保留原文。

**初次進入**：依序讀 `README.md` → `docs/PROJECT-STATUS.md` → `memory/session-handoff-LATEST.md` → 相關 `src/` → tests，先核對版本與真實 source。`npm run context:init` 只作記憶和固定 source hash 檢查，**不是測試 PASS**。

### 系統不變量

1. 唯一可變權威：`src/core/game.ts` 的 `GameState` 與 `applyCommand`；AI `chooseAction` 及 `WorldMap` 只接收 `Observation`。`src/main.ts` 作編排協調，渲染不直接寫 core state。
2. 拒絕非法 command 不得產生副作用；同 requestId + payload 不可雙花，異 payload 拒絕。有效命令在相同規則、版本、seed 下具有可重現性。
3. Fog／ViewerEvent／回傳錯誤與動畫不得繞過 actor 可知世界，完整本機 save **包含世界真相**，不得視為可公開展示的 fog-safe replay。
4. G1：單位或據點任一仍在即可繼續，兩者皆零才淘汰；無流亡倒數。歷史首都與現時政治中心分離，持續控制據點跨完整敵方回合才可主動建中心。
5. 遺跡在 `pendingRelic` 階段必須立即解決；現行「看見即取得」是**舊實作**，主創新裁決是「發現權／取得權分離，實際抵達者優先」，不要用畫面假裝已修正。
6. Import 先驗完整版本／語意／history 才替換現局；失敗保留當前 GameState，不能部分套用。
7. 嚴禁加入 Polytopia 專有內容、未審查授權素材；不得聲稱 GPL 工具中的 code 可無限制直接複製。
8. Engineering Gate 與 Playability Gate 獨立。`full100=62/38 FAIL`、`seed010 FAIL`、T3/T6 FAIL，不能省略、擅自改門檻或當平手。
9. 不修改使用者其他專案，禁用 git reset/clean/force push。新增依賴、授權決定、長期玩法規則均需相應授權與測試。

### AI Studio 實作界線

✅ 原則允許：`src/styles.css`、`src/ui/map.ts` 的繪製與 camera/input 表現、`src/main.ts` 的 DOM/render 區段、`index.html` 的非規則性介面。**在 core 可視資料邊界內作 UI**。

⛔ 不得修改：`src/core/**`、`tests/**`、`scripts/headless.ts`、`scripts/verify.mjs`、依賴 lock、遊戲 reducer、勝負與遺跡決策、save/load/replay。`src/main.ts` dispatch、AI generation、requestId、expectedVersion、import-before-replace 邏輯不得因 UI 重製而移動或刪除。

### 適用審查

先建立高信號反例；視工具可用性依需選用 `superpowers:using-superpowers`, `superpowers:receiving-code-review`, `superpowers:verification-before-completion`, `codex-engineering-guardrails:code-verification`, `alibaba/open-code-review`。後者需額外 CLI／服務條件，本次**沒有在本工作環境執行新 OCR 掃描**；參考 `docs/agent/SKILLS-ROUTING.md`。任何 PASS 都需附指令、exit code、測試版本與實際 log。不要只維護文件而不進展產品。
