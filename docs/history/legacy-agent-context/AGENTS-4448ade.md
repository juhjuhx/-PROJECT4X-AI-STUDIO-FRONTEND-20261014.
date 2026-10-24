> 2026-10-24 CURRENT Demo02 Candidate：主創確認先既有規則＋探索敘事＋Web/PWA，新兵科技地形後審。分支integration/project4x-demo-02，runtime checkpoint6bfbb98；AI972f564e未改，core/session/presentation/ui/config/lock17檔原bytes保留。fresh203tests/check/build、prefix1100零loop/D02673、Browser11、原220 Gameplay12（209指令）＋cleanup、Demo桌面/手機模擬4情境及本機PWA根/巢狀/離線/等待更新通過；乾淨還原亦通過、11產物SHA一致。真人/真機/公開HTTPS未驗證，APK缺工具鏈BLOCKED；C5全局收斂與Alpha仍PARTIAL。R5原87/13與T3/T6 FAIL不改，E新版Full100未跑，R605僅未完成實驗。詳docs/verification/DEMO02，唯一續作NEXT-ACTION；未push/merge/deploy。

> 2026-10-23 CURRENT C5-R6-04：E AI972f564e…9b67／產品6007de6a…169f不變。48個有界機制檢查（含1 control／47刪減）縮為16單位交通機制（裁圖324格／22合法動作僅決策檢查）；8組同態pair／16arms／48checkpoints及12566命令原core重播通過。七個縮減態未保留原同向軍事收益向量，仍有不同取捨；無通用RED，不改AI，轉PROPOSED協同架構評估。fresh195tests／check／build／prefix1100零loop／D02 PASS。Browser與Gameplay沿用R603 favicon404 FAIL，手機UNVERIFIED；008 FAIL／010 PASS為歷史同E，未重跑整局，新Full100／T3／T6 UNVERIFIED，Alpha PARTIAL。NEXT-ACTION唯一續作，不push main。

> 2026-10-23 CURRENT C5-R6-03：E產品6007de6a…169f／AI972f564e…9b67未變；六觀測目標未切換，已證實友軍移動能改變traffic／forward，但通用協同根因UNVERIFIED。完成28個有界分支；替代blocker32ET有軍事收益及成本取捨，沒有Capture／情報／終局，尚無最小fixture/RED，不改AI。QA checkpoint58dcaffdb8d740edb4786781c817470f8a199856僅修desktop errors收據與新增standalone負測試；fresh195/check/build PASS，連續Gameplay209/220與cleanup PASS，整體仍favicon404 FAIL，手機UNVERIFIED。Q-ICON缺資產交D3；R6新Full100/T3/T6未跑，Alpha PARTIAL。NEXT-ACTION唯一續作，不push main。

> 2026-10-23 CURRENT C5-R6-02：合法移後反擊窗口T01與射位暴露T02以RED→GREEN最小修補；code checkpoint 4b5e50aadd464c00746e4299391f59f18814d4a1。E AI972f564e…9b67／產品6007de6a…169f；195tests/check/build/prefix1100零loop/D02及局部獨立review TESTED_PASS。E008仍TURN_LIMIT800／20682，部分SaveReplay PASS；E010自然終局winner1／247／6705，終局SaveReplay PASS。原220連續玩法209指令與cleanup PASS，但browser及qa:gameplay整體因B相同build也重現的favicon404 TESTED_FAIL，手機本次未執行。C5與Alpha PARTIAL；新版Full100/T3/T6、E021/064/051 UNVERIFIED。R5原87/13及T3/T6 FAIL保留。唯一續作NEXT-ACTION，沒有push main。

> 2026-10-22 CURRENT C5-R6：局部攻城窗口與招募回歸修補已驗證；code checkpoint894e8f97f966635378c950f38945606575d27847。B AI939d641f…fecc／產品d212303f…2843；188tests／check／build／prefix／D02／browser11／原220 Gameplay12及cleanup PASS。固定五局全部有結果：010自然終局，008／021／064／051仍TURN_LIMIT，故策略收斂TESTED_FAIL、C5與Alpha PARTIAL，新R6 Full100／T3／T6未跑。R5原87/13及其T3/T6 FAIL保留；R6-02轉查242–252往返，尚無更佳合法替代證據，不再盲調權重。NEXT-ACTION是唯一續作入口。不push main。

> 2026-10-21 CURRENT C5-R5：QA checkpoint74c87dcb6b82be3b1167898e7df9a91b002707e1；產品／AI／GameSession／UI／規則／schema未變。fresh check／180tests／build、D02、prefix、browser11、原220 Gameplay12與cleanup TESTED_PASS。固定Full100已100/100有紀錄：87 COMPLETE／13 TURN_LIMIT／0 COMMAND_LIMIT／0 ERROR；87終局與13部分SaveReplay均通過；Harness TESTED_PASS，T3／T6 TESTED_FAIL，Alpha PARTIAL。下一步只讀C5-R6失敗反例擷取；詳NEXT-ACTION及C5-R5-VERIFICATION。沒有push/merge main。

# PROJECT-4X / Agent Engineering Contract

> 2026-10-20 C5-R5 preflight：fresh來源身份確認，Gate A磁碟仍BLOCKED，未重跑Gameplay／Gate C或full100；產品與QA code未改。先讀NEXT-ACTION及docs/verification/C5-R5/C5-R4-GAMEPLAY-RECOVERY.md；不要把下列R4舊PASS當新鮮結果。

> 2026-10-20 CURRENT C5-R4：Observation-only frontier／已知地形再偵察 IMPLEMENTED；123 tests/check/build、prefix1100/0loop、原D02 673commands真揭露／winner0、seed010 winner0／534EndTurn／15418commands／終局SaveReplay true，TESTED_PASS。qa:browser11與獨立review通過。追加完整qa:gameplay因download.delete canceled及ENOSPC維持BLOCKED；本輪整體PARTIAL。full100/T3/T6 UNVERIFIED，Alpha PARTIAL；唯一續作NEXT-ACTION，詳細docs/verification/C5-R4/C5-R4-TEST-RESULTS.json；沒有push。

> 2026-10-19 歷史C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

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
