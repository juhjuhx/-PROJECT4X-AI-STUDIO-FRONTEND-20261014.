# C5-R2 攻城僵局調查

2026-10-19。基線 `5b0483ec9431958d1852866368f2775557ab98f8`；原 AI `06402a6394082b71a12a3aa50fef270f0895cd9839c0b047185920747237ea40`。整局仍 TESTED_FAIL，非 Alpha 完成。

## 執行計畫與邊界

使用 writing-plans / executing-plans；依主創已授權的原生 TDD 流程續作，無須重選策略架構。產品限 src/core/ai.ts，診斷與測試另列；不改核心規則、GameState、Save/Replay 或版本。獨立 reviewer 初次遇服務額度限制；恢復後已實跑四項新反例、15項既有AI案例及三組邊界窄驗，第三切片另作增量複核。完整證據在專案外 C5-R2-independent-review。

- [x] 唯讀確認工作樹乾淨、HEAD、56/56 manifest、歷史 FAIL 與文件。
- [x] 以同 actor Observation 重建早期決策；診斷輸出逐筆比對正式 chooseAction。
- [x] 擷取最早確認反例、分類、建立預期斷言，確認原策略 RED。
- [x] 最小修補、同反例 GREEN、原 prefix 與完整 tests/check/build。
- [x] 小 gate 成立後才跑單一 seed010，保留800/40000限制；不跑 full100。
- [x] 獨立審查、更新 NEXT-ACTION / manifest / 驗證結果、checkpoint。

## 審查重點

保留原繞路與占領者保留測試；僅合法 Observation；不可使用 seed/history 還原秘密；輸入不可變與確定性；舊 replay 與 schema；不合成 winner、不降低 QA 門檻。私有完整 trace 僅在 ../evidence/C5-R2-private，未交 UI 或公開 replay。

## BEFORE

原 R1 prefix 3→0；完整 seed010 800 EndTurn / 17937 commands / winner=null。末局兩方仍有單位及據點，尚不足以確認攻城根因。此為 R1 歷史證據，保留原 FAIL。

## ROOT CAUSE（分立缺陷，非整局收斂證明）

| ID／分類 | 真實失效點 | 條件／機制 | 最小反例與修補 |
|---|---|---|---|
| R2-01 TACTICAL BLOCK | R1 cmd153（0起算）、turn18、actor1；已移動斥候對據點守軍可造成2傷，卻EndTurn；原分數-967 | scoutExplore只看世界是否有未知格，不看本回合是否仍能探索；已移動／封路時仍扣1000 | tests/ai-stalemate.test.ts前兩案原RED；只在同單位有合法Move且能揭未知地形時保留探索。保留真探索優先案例 |
| R2-02 PATHFINDING／排序 | R2-01候選cmd607 turn41等，兵28從(6,9)返回(6,8)；(7,9)同分同traffic/terrain進展卻更靠近目標 | 原座標y tie優先反覆回繞路入口。R1 paired-forward不是全局收斂保證 | 同分、同unit才比較到既有單點目標的曼哈頓距離；不套explore frontier，不改權重／必要detour。原prefix回歸曾檢出六次往返，修後1100指令0段 |
| R2-03 RECRUITMENT POLICY／順序 | R2-01+02候選cmd246 turn25 actor0；金9，駐軍可Move(11,10)再殺敵，卻在據點原地Attack耗掉moved，封招募格。cmd1395/1457也出現相似幾何，但需另檢兵額 | Attack一律在Move之前；無法做既有合法Move→Attack→Recruit的同回合銜接 | 新RED5pass/1fail→GREEN6pass；僅有金、未達既有AI兵額、同一lethal shot有合法移位位置才先離己據點。不是新增招募規則或必然更優的全局策略 |

R2-01固定100回合trace：2261 decisions全部與正式policy相同。R2-01+02：2345 decisions同樣逐筆相符；turn18漏攻擊已改Attack。完整世界不進AI。數字/座標僅描述當時actor合法可見局部，不公開整張生成地圖。

## MINIMAL FIX／不變量

產品只改 src/core/ai.ts；新增 tests/ai-stalemate.test.ts、測試專用 scripts/ai-decision-trace.mjs。沒有改規則成本、勝負、回合上限、GameState、session、types/game/persistence、lock、Save/Replay schema或ruleset。仍stateless／deterministic／Observation-only。

診斷以受檢source建立私有暫時副本，加讀取分數的seam；每筆都與正式chooseAction比對，輸入深比對不可變；seam失配立即FAIL。JSON中無窮分數寫成字串；未評分分支不冒稱0分。此copy只為測試，不進遊戲或第二套reducer。執行：`node --import tsx scripts/ai-decision-trace.mjs <專案外尚不存在的絕對路徑>`；需既存父目錄，輸出0700/0600，最多100回合/4000commands/60秒。路徑經realpath檢查，原證據不覆寫。

## AFTER／目前仍失敗

R2-01+02完整seed010：800 EndTurn、19514 commands、2941 Attack、10 Capture、856 Recruit、winner=null，exit1，130.479秒。不得將多攻擊或不同commands數稱為終局進步；full100／PLAYABILITY未驗。最新R2-03候選同門檻再次 TESTED_FAIL：800 EndTurn／19813 commands／2991 Attack／8 Capture／868 Recruit／winner=null，exit1、109.278秒。沒有整局改善證據；不跑full100。

## 測試完整性與已知限制

斥候測試初版探索保留fixture距目標2卻斷言可Attack，及手改座標後explored知識未同步造成淨格數斷言錯誤，已修成真相鄰fixture與『原unknown格確實變已知』行為斷言。原失敗log保留，不當產品RED。正式第一RED-confirmed為2失敗/1通過；check初版assert message漏undefined fallback也保留失敗log。

browser wrapper初次cwd誤傳交付根導致Missing script start，未啟動遊戲；更正project後真browser11與gameplay12通過，舊錯誤不寫成產品通過。第三切片改AI後將重跑真回歸。

## 最終驗證與下一個缺陷

三修AI SHA `e7721d53ae68ccd163ff1096bd266c3c0dd8a012a89c7af61a66ded4e41f3595`。最新110 tests／check／build、原1100prefix、11 browser、12 gameplay情境通過。真玩法旅程208追加human commands／207 policy steps，turn37，Attack後Capture與Replay驗證；不等同真人完整單局。兩次整局FAIL保留，不以工具exit0或更多shots替代終局。詳 `docs/verification/C5-R2/C5-R2-TEST-RESULTS.json`。

獨立review有初次4/4+15/15+3邊界群組及三修6/6+15/15+13群組；舊版敏感性分別3FAIL/1PASS、1FAIL/5PASS。沒有發現受審patch blocker；未驗長局。OpenCodeReview delegation v1.13.1只作清單/rule，宿主自行審查，未呼叫OCR外部LLM；Git2.39.5低於工具建議2.41之warning保留，不更新環境。

下一個獨立ENDGAME_SEARCH反例已重新建立：舊D02腳本MISSING，新診斷1000commands seen=false/winner=null。四角巡查未覆蓋中央，不能假設修過；也不能將中央反例當seed010仍交戰的原因。這項尚未修補，沒有加入中心座標作弊或合成winner。下一項最高優先仍為既有seed010 trace中turn56後的據點接近/增援問題，根因UNVERIFIED。較大策略架構必須另提具體設計，不在本輪隨意重寫。

本次無新依賴、UI改動、Save migration、push/merge/publish。FINAL-GIT-STATE與NEXT-ACTION記錄checkpoint；整體C5與Alpha維持PARTIAL／TESTED_FAIL。
