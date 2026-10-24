# 整合現況｜C5-R3

> 2026-10-19 CURRENT C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-19 歷史C5-R2快照：三項無記憶AI局部修補 IMPLEMENTED，110 tests/check/build、1100-command prefix0loop、11 browser與12真玩法情境 TESTED_PASS。最新seed010仍 TESTED_FAIL：800 EndTurn／19813 commands／winner=null；中央搜尋合成反例1000commands仍FAIL。新版full100未跑，Alpha仍PARTIAL。權威續作見NEXT-ACTION與C5-R2-TEST-RESULTS；不push main。

> 2026-10-18 歷史R1快照：C2/C3/C4工程candidate已通過。C5最小無記憶policy修補IMPLEMENTED；生成prefix三段振盪→0、104 tests/check/build/11 browser/12玩法情境TESTED_PASS。完整seed010仍TESTED_FAIL：800 EndTurn/17937 commands/winner=null；新版full100/T3/T6未完整重跑，不能沿用舊62/38當新終局率。主創確認保留D3分頁。詳C5-AI-DIAGNOSIS與NEXT-ACTION。



> 2026-10-18 C3 CHECKPOINT（4cddfb3）：2026-10-18：C2fresh通過；D3候選9959a72a…cb451經CRC/SHA與40/40 manifest確認。C3在integration/project4x-c3以C2為parent、函式級採D3呈現，103 tests/11 browser通過。獨立審查P2選格切頁與QA弱斷言已修並複核。不要採原D3整份main；不要push main。C4/C5狀態以NEXT-ACTION為續作入口。



更新：2026-10-17。當前工程入口是 [C2-IMPLEMENTATION-STATUS](C2-IMPLEMENTATION-STATUS.md) 與 [C2-VERIFICATION.json](C2-VERIFICATION.json)。C0 原始來源／獨立稽核保留於 C0-SOURCE-AUDIT.md、C0-VERIFICATION.json，不以較新文件刪除歷史裁決。

| 階段 | 狀態 | 實際範圍 |
|---|---|---|
| C0 | CONFIRMED | ZIP 是 D2，整包採納 NOT_PASS；最新 main SHA 再查見 C2-VERIFICATION |
| C1 | 規格審查完成 | 正式 signature 沒有重新設計；型別唯一來源 docs/contracts/frontend-core-v1.d.ts |
| C2 | IMPLEMENTED；工程實測結果分列 | session、只讀 capabilities、安全事件、main 接線、contract/fog/save/AI/browser；不等於全玩法驗收 |
| C3 | BLOCKED | D3 未交付，不能把 D2 自動當 D3 |
| C4 | PARTIAL | C2 回歸已驗既有招募→下一己回合移動；城市成長 PROPOSED，未新增規則 |
| C5 | 歷史 TESTED_FAIL | full100 62 COMPLETE/38 TURN_LIMIT；seed010 winner=null；本輪不重平衡或昂貴重跑 |
| C6 | PROPOSED | 遺跡發現／抵達取得分離未實作，舊 g1-ccts-1 不變 |
| C7／發布 | NOT_PASS | 本機 C2 回歸不代表 GitHub 新 CI；沒有 push/merge/publish，整體玩法 FAIL 仍有效 |

D2 工作區不變。C1 文件已先保留到 f884de635b22d1b82b0848bddbad14b66d479552，C2 使用獨立 integration/project4x-c2。下一階段交契約與此 C2 source 給前端，取得真 D3 才 C3；不得直接覆寫 main 或主線。
