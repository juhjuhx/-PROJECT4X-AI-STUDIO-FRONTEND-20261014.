# Demo03 隔離玩法預覽實作計畫

> 執行：root 依 executing-plans 逐切片 TDD；獨立 reviewer 只讀全分支。主創已授權持續執行與 D03-PREVIEW-001 測試基準，不重問已批准數值。

**Goal:** 在新局專用預覽提供盾衛、機動偵察及兩項研究，舊 G1 戰局逐 bytes 相容。

**Architecture:** 唯一 applyCommand 按固定內建 ruleset 讀不可變定義；GameSession 維持唯一狀態，UI/AI 仍只用 Observation。第一版不做任意外掛、局中升版或第二套 reducer。

**Tech Stack:** 既有 TypeScript / Vite / Canvas2D / Native DOM / node:test；無新增依賴。

**Spec:** DEMO03-GAMEPLAY-DECISIONS.md、DECISION-REGISTER D03-PREVIEW-001、既有 FRONTEND-CORE-CONTRACT。

## Global Constraints

- Demo02 Tag、g1-ccts-1、save-1、replay-1、R5/R6 原始證據保留。
- 新局預覽 ID `demo03-preview-1`，Save2/Replay2 明確配對，內容 SHA-256 與 generator ID `g1-mapgen-1`；名稱是工程版本標記，不是正式平衡批准。
- 盾衛 cost6/HP10/attack3/defense2/range1/move1/sight2；機動偵察 cost7/HP7/attack3/defense0/range1/move3/sight3。
- defensiveEngineering cost7 無前置；militaryMobility cost6，前置 pathfinding。只解鎖新種，無護衛光環、衝鋒等新效果。
- 尋徑 +1 視野仍僅舊 scout；未裁決的新種額外加成不啟用。舊移動/戰鬥/收入/遺跡/勝敗機制不改。
- 220 玩家指令、800 EndTurn/40000 commands 不降低；不在本片重跑 Full100。
- 新 schema 不原地轉換舊局；所有 import 完整驗證後 replace。預覽本機槽與正式槽分開。

## Review Focus

1. 混搭 schema/ruleset/content hash/generator 或未知內容拒絕，失敗 import 不取消 AI/改 dirty。
2. 舊局不能藉新 Action ID 越權；既有 G1 Save/Replay 序列化與 canonical hash 符合變更前 golden。
3. 機動偵察不能穿山水/友軍或因名稱獲未批准視野；盾衛防禦仍服從最低傷害1。
4. AI/事件/UI 不能讀 canonical state；新種素材 fallback 不能冒稱舊種或洩漏未知格。
5. 載入 G1 後再 New Game 使用 factory 明確預覽設定；Replay 驗證回報實際版本而非硬編碼 G1。

## Task 1: G1 相容基準與固定內容 Registry（D03-001 第一片）

**Files:** 新增 src/core/rulesets.ts、tests/rulesets.test.ts、tests/legacy-compatibility.test.ts、tests/fixtures/g1-compatibility.json。

**Interfaces:** `getRuleset(id: string): RulesetDefinition`；`validateRuleset(value: unknown): asserts value is RulesetDefinition`。定義包含 namespace/id/version/generatorVersion、unit/tech 有序陣列、素材 fallback、科技先決與白名單效果；內建內容唯讀。先保留 G1 原 UNIT_STATS/TECH_STATS，不接 runtime。

- [x] Step 1: 由發布版本 core（獨立來源）產生合法指令 recipe 與 Save/Replay SHA golden；公開只放 recipe/hash，不放完整 world。
- [x] Step 2: 測重複 ID、缺 fallback、未知引用、循環科技、非法效果/數值、未知 ruleset、輸入/回傳不變性。新介面缺失時先觀測 RED；不得把 fixture/import typo 當有效 RED。
- [x] Step 3: 最小兩內建 registry；保留 G1 3/3，預覽5/5。runtime 驗證形狀/DAG；固定 content hash 由 Node crypto 測試驗證，瀏覽器不新增 crypto/遠端依賴。
- [x] Step 4: node --import tsx --test tests/rulesets.test.ts tests/legacy-compatibility.test.ts；npm test；npm run check；npm run build，預期全通過。
- [x] Step 5: 檢查 diff/來源摘要、獨立審查、提交第一片 checkpoint。D03-001 整體可玩閉環仍 IN_PROGRESS。

## Task 2: 唯一 Core 的版本化研究／招募／戰鬥／移動

**Files:** src/core/types.ts、game.ts；tests/preview-gameplay.test.ts。

**Interfaces:** `createGame(seed: string, ruleset?: RulesetId): GameState` 預設 G1；`validAction(value, ruleset?)`/`validCommand(value, ruleset?)` 預設 G1。每個 runtime consumer 明確帶 state.ruleset；legacy 常數相容 alias 不擴成5種。

- [ ] Step 1: RED：預覽初局有 defense 研究/G1 無新 Action；未知版本拒絕。研究7扣款後合法招募盾衛費6，新兵當回合不可動/攻；下己回合可動。機動研究先決與移動3、障礙/友軍負例；plain/cover 盾衛實傷與 minimum1。
- [ ] Step 2: registry lookup 接到唯一 reducer，保持 RNG 呼叫/地圖/舊 Action 順序及交易語意；只預覽增加 metadata。
- [ ] Step 3: GREEN focused + 全套/G1 golden；check/build；checkpoint。

## Task 3: Save2/Replay2 與 Session capability

**Files:** core/persistence.ts、session/persistence.ts、session/game-session.ts、frontend-core-v1.d.ts 與權威 Markdown；tests/preview-persistence.test.ts、preview-session.test.ts。

**Interfaces:** 原 `newGame(seed, expected)` 兩參數保留；factory options 增可選 ruleset。ReplayVerificationResult 成功型別擴為已知版本配對，回報真實 candidate。舊 DTO keys 不變；新 DTO 明確 contentHash/generatorVersion。

- [ ] Step 1: RED 新 Save/Replay roundtrip、篡改內容/配對/generator/前置/新 unit HP 拒絕；舊 golden bytes/重播/延續/去重。
- [ ] Step 2: 只按已知版本重建同一 reducer；Session 預設不變，新預覽 load legacy 不轉換，newGame 回 factory ruleset。
- [ ] Step 3: duplicate不扣款/加version/重播事件，failed import 不改局/AI/dirty，stale generation、dispose/AI cancellation 全回歸；GREEN/check/build/checkpoint。

## Task 4: AI 與安全事件

**Files:** core/ai.ts、presentation/events.ts、tests/preview-ai.test.ts、preview-events.test.ts。

**Interfaces:** chooseAction(Observation) 不改；依 view.ruleset 解析公開定義。只擴已知兩版事件白名單，未知版本仍不投影。

- [ ] Step 1: RED 合法研究/招募/移攻新兵、同 Observation 不同 truth、freeze/clone/interleaved deterministic；新研究/招募事件僅 own 合法資訊。
- [ ] Step 2: 最小合法候選政策接線，G1 分支決策不變；不引入持久記憶或新協同演算法。
- [ ] Step 3: GREEN 全套、oscillation、D-02、舊 AI 反例及必要代表 seed；記錄行為/效能與限制，不宣稱 Full100。

## Task 5: 真實 UI 閉環與預覽交付

**Files:** main.ts composition、ui/recruitment.ts、map.ts/visual registry、demo/content/sidecar 僅必要明確版本相容；新 preview QA。

**Interfaces:** 明確 URL/入口選 preview factory，default G1 不變；HUD 讀 GameplayPort + 公開 definitions，檔案控件才 LocalPersistencePort；分開 autosave key。

- [ ] Step 1: RED 真 DOM 新研究→調位→招募→EndTurn/AI→新兵行動→Save/Load/Replay；mobile/desktop，無 console/pageerror。
- [ ] Step 2: 明確「隔離玩法預覽」標識/新種 fallback/真 legalActions；不假造 UI、第二 reducer 或 scenario winner。
- [ ] Step 3: GREEN npm check/test/build、既有 Browser/Gameplay220/Demo/PWA、preview journey、獨立 whole-branch review、正式 PR；真人/真機維持 UNVERIFIED。

## Pre-flight 與狀態

Task1→2：registry 的效果/先決是唯一資料來源，legacy alias 保留避免 G1 Action 集被意外擴充。
Task2→3：metadata/版本配對必須先定，rebuild 使用同 createGame 版本，無局中遷移。
Task3→4→5：Session 回報真實 ruleset、AI/事件白名單與 UI definitions 按 Observation 同版，不能固定舊成功摘要。
本計畫以既有 docs/handoff/MASTER-TODO 與 NEXT-ACTION 為權威入口；執行細節 ledger 在本 plan 專用 ignored workspace，證據在專案外。主創已批准隔離方法/數值，計畫不新增玩法裁決。
