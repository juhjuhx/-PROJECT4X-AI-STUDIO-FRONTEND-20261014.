# C5-R4：Observation-only Frontier／D-02 修復

2026-10-20。D-02 **TESTED_PASS**；seed010 **TESTED_PASS**；本輪整合驗收 **PARTIAL**，追加的完整 browser gameplay 因下載清理錯誤及 ENOSPC **BLOCKED**。完整指令、UTC、exit code、耗時及來源見 C5-R4-TEST-RESULTS.json，不能以本文件取代原始 log。

## SOURCE SNAPSHOT

基線 HEAD：2d7da2a5808ddd58292f160a7a908bc7347e8279，分支 integration/project4x-c3。恢復時 clean，R3 manifest 72/72 吻合。實測在此 HEAD 加未提交 candidate 進行，不能宣稱當時在後來的 checkpoint SHA 執行。提交後由交付根 FINAL-GIT-STATE.json 對照 tree。

最終 AI SHA-256：82618e54129d96274c2dd5d4a8c1a430bf17714d4b4aba1d7cbf122b8004005e。raw test snapshot b33f0d9268c250a937023b908e590492e4841f426fadb58c47202d90a20647ce 包含 ignored src/.DS_Store；不含該 metadata 的 portable snapshot 為 e45f3cda4a0ba008a57262f9549cd857cee83cec9189dfb7a5a68773b2fdc196。詳細逐檔保護界線見 C5-R4-SOURCE-BOUNDARY.json。

唯一產品修改：src/core/ai.ts；新增 tests/ai-frontier.test.ts 共10項，既有測試未改。其他42個已追蹤 src/tests/scripts/config 檔與基線 byte-identical。game/types/persistence/session/UI/main、lock、勝負與數值、g1-ccts-1、project4x-save-1、project4x-replay-1 均未改。候選差異保存 AI-SOURCE-DIFF.patch。

## BEFORE／真正失效觀測

原 D-02 腳本先 fresh 執行 exit1：1000 commands、seen=false、winner=null。它把 explored/surveyed 全填 true，因此初始 Observation 是33 visible、543 explored、0 unknown；這不是未知地形 frontier 的直接反例。實際 observe 在 src/core/game.ts；候選 src/core/observation.ts 不存在，沒有建立假檔。

舊 policy 只在 unknown 格生成探索目標。無未知格與其他目標時，輪流巡查四角；第一個目標就是己方斥候所在(2,2)，12個合法 Move 都不改善距離，所以選 EndTurn。單次等待不足以證明永久缺陷：另有400-command獨立 trace，50次 Move 僅走外圍矩形，unionVisible=456、120格一直不可見，中央10×10無覆蓋。這證明四角 coverage 缺口，沒有把隱藏敵軍位置補入 AI。

另一個獨立未知探索反例：唯一 unknown 被已知山脈包圍；真視野不受地形遮蔽，已知可走 vantage 仍可揭露該格，但舊「相鄰可走邊界」完全沒有 goal。這與全已知再偵察分開修補。

## MINIMAL REPRODUCTION／RED

新增最小已知七格廊道：步兵(2,2)，合法候選只有往西、往東、EndTurn。往東(3,2)是真 reducer 能接受且唯一能揭露已知(5,2)的選擇；舊 policy 等待。中央未知山圈則要求走向合法觀測位置，並以最多80個真命令確認 unknown 真的被揭露，沒有只驗方向。

初版9測試在原策略下6 PASS／3 FAIL；另將獨立 review 找出的 occupied-vantage 做成第10個測試，先見9 PASS／1 FAIL。低視野 spent 友軍佔據(6,2)時，斥候必須保留經(6,1)→下一己回合(7,1)的合法繞行。所有 fixture 都經真 observe/applyCommand，新增前失敗原因與斷言吻合；log 原樣保留。

## MINIMAL FIX／IMPLEMENTED

1. **Primary frontier 保留 R3 potential。** 由合法 Observation 中「已知可走、相鄰 unknown」的位置當 source，初始 cost=1。舊 unknown boundary cost=0 對 known 端點的最短路，第一次進入 unknown 就已到 boundary；前段全為 known 可走。新表示保留該距離，且不把 unknown 內容或可通行性當已知真相。舊 boundary 代表 tile、權重與 tie-break 保留。
2. **只在該單位沒有地形可達 primary 時啟用 sight fallback。** 真 UNIT_STATS sight／pathfinding 加成，僅以 unknown 幾何估資訊；從已知可走 vantage 的幾何 gap（1..sight）起算，以整數 bucket Dijkstra 傳播 known 路線。這是觀測 potential，不聲稱能走入 unknown。已佔據 source 受 traffic 排除，避免舊 scout 梯度被全零 source 攤平。
3. **已知區域再偵察。** 沒有其他 goal 且沒有 unknown 時，用真 sight 尺寸的均勻蛇行網格取代四角。排程只讀 Observation 的 ownTurns、unit ID、尺寸與已知可達 component；無中心／敵軍硬編座標，無持久記憶。可達 land 全可見則不為巡查空走。
4. **成本控制。** 幾何資訊按 sight 共用；component、同 waypoint terrain field 只在單次 chooseAction 內快取。沒有 module-level cache 或跨回合狀態。

真正 Action 始終取自 legalActions，仍經 applyCommand。Attack／Capture／Recruit／Research／Relic／政治中心順序與既有軍事目標評估未另改。本輪沒有任意調權重、第二 reducer、隱藏歷史、seed 重建或合成 winner。

## 候選失敗如何處理

第一候選63d643…雖 D-02 PASS，但全套121/122與獨立 occupied-source 反例 FAIL。加權候選0197…雖局部與D-02 PASS，全套122/123及 prefix1loop FAIL，均沒有接受。

私有100-turn診斷2373筆合法 Observation，定位同部隊在兩個site目標間切換；同六筆 Observation 的 R3 也選相同行動。因此沒有擴大到本輪之外的軍事重設，而是縮小探索漂移，採上列 primary 等價表示＋per-unit fallback。最終 prefix 回到1100 commands／0 loops，seed010終局 hash 也與R3相同。這不是通用無振盪證明。

所有候選、工具準備錯誤、FAIL與timeout保留；C5-R4-DEVELOPMENT-HISTORY.md是時間序列舊ledger，不能蓋過本最終結果。

## AFTER／新鮮驗證

| Gate | 實測結果 | 範圍 |
|---|---|---|
| check／build | exit0 | 真 TypeScript／Vite；無 callable LSP，不冒稱已跑 |
| npm test | 123/123，fail0 skip0 | 新10項與全部舊測試 |
| 固定 prefix | 1100 commands／0 loops | 原門檻，非full100 |
| 原D-02 | 673 commands／seen=true／winner0／turn639 | 原1000 command上限；合成反例 |
| seed010 | winner0／534 EndTurn／15418 commands／turn535 | 原800／40000；核心自然終局；終局Save/Replay true |
| qa:browser | 11情境 PASS | 真DOM與CDP雙touch，非實體手機 |
| qa:gameplay | BLOCKED，兩次原始結果FAIL | download.delete: canceled；第二次runner寫receipt收到ENOSPC；220上限未改，完整Attack後Capture未驗完 |
| 獨立審查 | APPROVE，無blocker | frozen AI82618…，33/33 focused；另16真projector maps與距離oracle |

seed010第一次外部240秒timeout為exit124、RUNNING_NOT_PASS，不當遊戲TURN_LIMIT。保留後以600秒外部預算重跑，同樣800／40000，在143.374秒正常結束。source/method start=end。安全摘要 SEED010-SAFE-SUMMARY.json；private canonical report不入Git。完整harness仍PARTIAL（只跑1局），不是全量通過。

獨立 reviewer 首次外部副本缺原版type:module，32/33；補入未修改package.json後相同測試33/33。此工具環境失敗完整保留。最終獨立另比較48 primary fields／21549 known格、16 weighted oracle、blocked sources、跨component5個真命令揭露、Fog twins與seed-read guard，見 independent-review/最終獨立審查.md。

## PERFORMANCE／有限基準

同機同一批、每scenario4 warmup＋30 calls；無instrumentation的 chooseAction latency，計數另跑instrumented副本並驗action parity：

| 合成Observation | R3 median／p95 ms | R4 median／p95 ms |
|---|---:|---:|
| 64兵10goals交通 | 7.652／10.592 | 7.498／7.980 |
| 315unknown交通 | 1.655／2.336 | 0.962／1.896 |
| 全已知巡查交通 | 1.828／2.114 | 3.121／3.340 |

全已知巡查 median +70.7%／+1.293ms：更廣coverage需104 BFS／47169 expansions，R3為64／24094；單次component cache 39 hits／1 miss避免每兵重算。未知fixture有93幾何vantages，但實際primary sources46、fallback0、41 weighted calls／8181 expansions。不能把93當實際fallback數量。所有候選性能資料保留，前批不同系統負載不可拼成同批比較。這是微型基準，非完整對局效能，也不宣稱全面效能改善。原始計數與samples在performance/。

## REMAINING FAILURES／NEXT TASK

- D-02驗收8項具直接證據，局部狀態TESTED_PASS；一般迷宮／兵流下無記憶巡查完備性未證。
- 本輪完整browser gameplay **BLOCKED**；已確認低磁碟容量與ENOSPC，下載取消的精確根因UNVERIFIED。不再重試、不降低門檻、不改產品來避開。
- full100、T3/T6當前版UNVERIFIED；歷史62/38與舊FAIL保留。真人、實體手機、45–90分鐘驗收UNVERIFIED，Alpha PARTIAL。
- 下一步先恢復能承受現有Chromium／下載QA的磁碟容量，重跑未改qa:gameplay。成功後才進入獨立C5-R5受控001–100驗證；不修改seed／800／40000／勝負，逐局記COMPLETE／TURN_LIMIT／COMMAND_LIMIT／ERROR與終局Save/Replay。現有harness只每10th seed驗終局Save/Replay；全100逐局驗證需先補QA層並審查，不能假稱已涵蓋。
- 完整world／actor長trace只在專案外private evidence；本輪trace160290142 bytes無損壓縮9180515 bytes，解壓SHA一致才移除原始重複副本。舊trace／ZIP／工作區未動，receipt可覆核。
- 本機checkpoint可保存；不push main、不改Gemini、不設定外部自動續作。

已知路線使用hop potential，非地形MP成本最優路徑保證；真地形移動成本始終由legalActions／reducer限制。參考僅用於演算法選型，未複製外部程式或新增依賴：[Red Blob pathfinding introduction](https://www.redblobgames.com/pathfinding/a-star/introduction.html)、[implementation](https://www.redblobgames.com/pathfinding/a-star/implementation.html)。
