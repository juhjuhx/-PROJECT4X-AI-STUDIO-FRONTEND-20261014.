# C5-R6-02 因果診斷與條件式修補計畫

> Agent執行：沿用使用者指定的Native單一AI writer；executing-plans逐步執行，其他代理僅唯讀。這份文件同時維護研究狀態，不建立第二套LATEST。

**Goal：** 從seed008 turn242–252六個合法觀測找出第一個可由公平反事實證實的策略失效；未過Root Cause Gate不改產品。
**Architecture：** 既有GameState／applyCommand為唯一權威；私人工具從合法Observation選替代動作，core僅驗證後果。相同B政策與對手，介入是唯一變因；結果按獨立指標比較，不合成總分。
**Tech Stack：** TypeScript、Node／tsx、現有core與既有private history；不安裝依賴。
**Spec：** 本輪使用者C5-R6-02指令；權威基線見NEXT-ACTION、C5-R6-ROOT-CAUSE、SOURCE-BOUNDARY與R6-02 ROUTE-PACKET。

## Global Constraints

- 恢復HEAD d8138de003e558d6387da5b4c273ece289759557，branch integration/project4x-c3，原工作樹clean。
- AI939d641f…fecc，產品d212303f…2843，產品／QA manifest檔案逐檔吻合；188tests等為歷史結果，不冒稱本輪fresh。
- g1-ccts-1／project4x-save-1／project4x-replay-1不變；不改core規則、GameSession、UI或數值。
- 如有充分因果證據，只准root修改ai.ts；Stateless、Deterministic、Observation-only。
- 不增加返回禁令、固定目標N回合、seed座標特例或非法跨友軍Move。
- 私人world不進Git／HUD／玩家Replay；R5及R6原始證據只讀。新run UUID、exclusive creation、資料／receipt分路徑，保留ORIGINAL／RECONSTRUCTED沿革。
- 不先跑Full100、不push／merge main。正式代表對局上限仍800 EndTurn／40000 commands。

## Review Focus

- 介入是否利用未來或hidden truth：生成只收同actor Observation；oracle資料與決策隔離。
- 對照是否公平：同初始state、B／對手政策、2/4/8 EndTurn與命令上限；baseline必須重現，不以不同回合結果混比。
- 讓位／協同是否合法：每一步重新取legalActions，再由原applyCommand接受；無非法換位。
- 指標是否偷換：距離、Attack窗口、支援到達與實際控制／損失分列，不能用距離當勝利。
- 是否篩結果後硬湊修法：先記錄候選／horizon與排除條件，所有失敗與無效介入保留；必要繞路必須保護。

## 任務與狀態

- [x] R0：唯讀Git／文件／inspector source與實跑核對；INITIAL STATUS已回報。約14.16GiB可用。
- [x] R1：六觀測重建candidate goals／routes／legal choices／結果，插樁副本與B parity；完整資料只在private，公開安全摘要。
- [x] R2：建立有界多單位介入及2/4/8 EndTurn對照；對照公平性／exclusive artifacts先小測與獨立審查。
- [x] R3：依控制、戰力交換、合法窗口、支援與情報等逐項比較。若無收益，保留UNVERIFIED並轉查獨立窗口，不猜改碼。
- [x] R4（局部切片已完成；008整局仍FAIL）：具體收益→最小fixture→舊AI RED→ai.ts最小修正→GREEN；全套regression與008／010，通過才擴代表021／064／051。
- [x] R5：clean-context審查、source manifest、舊證據seal再核對、精確NEXT及本地checkpoint。

## Root Cause Gate

初始研究階段為 **UNVERIFIED_ROOT_CAUSE**；後續T01僅局部覆寫，沒有宣告全局目標切換根因。需要全部成立：真實合法Observation、原選擇重現、另一合法策略、具體戰略收益、排除偶然與洩漏、可縮減fixture、原AI真正RED。

PRIVATE_EVIDENCE：../evidence/C5-R6-02-20261022-133143-828d4da7。舊六觀測來源為RECONSTRUCTED，A/B完整history相等支持可達性，不能改稱原始bytes。新封存ORIGINAL-EVIDENCE-SEAL保留舊資料現有SHA；R5另依既有591檔seal核對。


## 2026-10-23 執行證據：R6-02-T01

**局部根因 CONFIRMED；最小修補 IMPLEMENTED／局部 TESTED_PASS。整個 seed008 及目標切換的全局根因仍未宣告解決。**

六個真 Observation 均重建並與 B 及插樁副本逐值吻合。記憶據點 owner 為 UNKNOWN，沒有把它補成敵方真相。六次最後一個目標變化是記憶據點A→B，並非六次全是 site／enemy 交替。

| Turn | 選定目標類別 | Terrain／Traffic | 全域雙距離 forward 候選 |
|---|---|---:|---:|
| 242 | 記憶據點 | 18／26 | 0 |
| 244 | 可見敵兵 | 11／11 | 4 |
| 246 | 記憶據點 | 18／22 | 0 |
| 248 | 可見敵兵 | 13／17 | 1 |
| 250 | 記憶據點 | 18／26 | 0 |
| 252 | 另一記憶據點 | 18／20 | 4 |

### 因果鏈與實際收益

turn248 的當前 legalActions 沒有 Attack，但存在合法 Move→Attack，能清除可見 HP1 威脅。B 的移動政策只對既定目標評分；該射位在交通距離上不是前進、沒有新探索或騰空己城，因此被判負無限，接著讓已耗盡友軍承受攻擊。

預宣告16個分支，包含 baseline、原首步 identity、兩種 focal-only、讓位與方向控制，以及五組 two-unit 序列。每步經原 applyCommand 接受；後續雙方均使用同 B 政策、同初態、2／4／8雙方合計EndTurn、500命令診斷上限。這不是正式長局上限，正式對局仍800／40000。所有16個結果已完整落盤；只續跑缺少完整結果的分支，保留第一次600秒超時。

關鍵射位分支在同回合由 B 自行接致命 Attack；到8 EndTurn相較baseline，多存活一支己軍，己方總HP多5，招募花費同為9。它與對應two-step的收益相同；focal-only、原首步及不開路方向控制沒有此收益。沒有新增Capture或情報。敵軍死亡後可能再招募，不能將任一時間點canonical HP總和直接當成軍事優劣；完整私有oracle僅用於獨立核對，未進策略輸入／公開資料。

### 最小RED與修補範圍

六格見方的合成合法局面不含私人種子或歷史座標。測試先以原core確認移動射擊可移除威脅、原路線後相同對手政策會擊殺友軍，再檢查政策選擇；舊B真RED為2 FAIL／3 PASS，並非fixture失效。

只改 src/core/ai.ts：保留現成Capture／Occupation／Attack；當完全沒有合法Attack時，從合法Move尋找可一擊清除、已在射程威脅acted己軍的可見敵人。下一步仍重新取真legalActions，不增加持久target或第二套reducer。既有傷害公式僅抽共用函式，規則與所有數值不變。

獨立review發現首版C也會介入既有攻城預留的負分Attack fallback，令後續改射守軍。新增第六反例真RED 5／6→以無Attack guard最小修正→GREEN 6／6，D才是本輪候選；C結果不混入D。

### 當前驗證邊界

D：check、194 tests、build、1100-command prefix／0loop、D02 673commands真揭露及核心winner0，均TESTED_PASS。新增加的6項為最小反例、非致命排除、無威脅排除、現成攻擊保全、攻城fallback保全、Fog／freeze／交錯決定性。20個舊測試檔及15個QA scripts未修改。

D獨立審查APPROVE：親自33聚焦tests、typecheck、24合成變形、真turn248兩步合法命令；不以review意見替代root的全套Gate。

seed010已COMPLETE，winner0／258 EndTurn／7269commands，終局Save與Replay均true；D seed008仍TURN_LIMIT：800 EndTurn／20703commands；部分SaveReplay通過，沒有終局；本段D歷史後續由E覆寫，未啟動新版Full100，不將兩局當完成率。Alpha維持PARTIAL。

### 保全與曾發生的環境／工具失敗

R5原591、R6原371檔seal逐檔吻合。首次baseline npm test為184／188，prefix及harness有ETIMEDOUT，兩CLI status=null；當時8GB主機swap約5.5GB、load約144。未改任何門檻，同bytes後續188／188通過，原錯誤保留，不宣稱每個錯誤都已獨立證實同一根因。

來源重建首次全ledger重播120秒超時；加速僅用於重建，逐筆驗request唯一及payload，前100步每步full state深比較一致，端點還原完整prefix ledger；正式CF沒有清空ledger。六觀測標RECONSTRUCTED，舊命名碰撞歷史不抹除。

QA包裝器來源gate補上實際frozen source與間接方法hash；改為明確raise避免Python -O移除assert。續跑例外必存ERROR再拋出；未完成request／失敗結果不靜默重做。自然終局另列TERMINAL_RESULT_REQUIRES_REVIEW，不冒充截斷；目前16分支皆FINISHED。只允許單一coordinator手動順序執行。

首版隔離副本漏docs/contracts，造成typecheck FAIL；另新測試assert訊息型別有TS2769。舊日誌保留，D已補完整snapshot並實測通過。未git init、未改核心來取得綠燈。

## 2026-10-23 追加：R6-02-T02 射手暴露反例

正式B/D008的共同動作prefix為726指令，turn47首次分歧。以相同完整初態、雙方後續B政策、2/4/8 EndTurn及500命令對照，只替換D首步。D能移後擊殺可見HP1敵軍，但兩名可見敵軍後續合法移攻擊殺原HP7射手；到2ET己軍少1，8ET同為22兵但HP178對176、補兵22對16。這是具體交換代價，不能只挑+HP當作改善，也不能把此短窗等同整局失敗根因。兩arm原結果與預宣告保留。

根因是新反擊捷徑沒有檢查射位的其他可見敵軍風險。以合成局面先由core證實合法敵方Move→Attack致命，原路線沒有同樣單回合射擊機會；D真RED為6 PASS/1 FAIL。E僅在捷徑中保守排除「其他可見敵人距離射位不大於其move+range」。這是幾何上界，不推測合法敵方Action、不穿透未知地形，也不禁止原路線政策承擔必要風險；不新增權重或記憶。

E真GREEN7/7，195tests/check/build/prefix/D02通過；6個真B觀測中仍只有turn248改選，原致命後續由core接受。E正式seed008/010與最終獨立review續驗；D的APPROVE只覆蓋追加T02前的局部範圍，追加review曾因額度失敗，不冒稱完成。完整結果以TEST-RESULTS及NEXT-ACTION最新段為準。

### 瀏覽器環境缺陷 Q-ICON

D原qa:browser於7個桌面情境後，因console favicon.ico 404 FAIL；原220 qa:gameplay連續旅程209指令PASS、cleanup PASS，但同404使整體FAIL，手機情境未到達。新probe在完全相同舊B build artifact（3檔SHA與原B browser證據逐檔吻合）亦重現favicon404，無pageerror；故不是D新增AI才引入，不能據此把D gate改成PASS。沒有改server、HTML、UI或忽略console。E重驗中。


## 最終E驗證與剩餘邊界

Code checkpoint 4b5e50aadd464c00746e4299391f59f18814d4a1；AI972f564e…9b67／產品6007de6a…169f。E clean-context reviewer親跑7反例、28既有AI、18過濾core/review、check、D RED及6真觀測parity，局部PASS；root完整195與check/build/prefix/D02 PASS。

E seed008：TURN_LIMIT800／20682／winner=null，部分SaveReplay true，TESTED_FAIL。E seed010：COMPLETE／winner1／247 EndTurn／6705commands，終局SaveReplay true。D008800/20703與D010winner0/258/7269保留，未混為E。未達008終局條件，未擴代表021/064/051或Full100。

E原220連續Gameplay實際209 commands，真DOM及Attack→Capture、Recruit、Research、ResolveRelic、EndTurn、Save/Load/Replay通過；cleanup PASS。整體qa:browser及qa:gameplay因已在相同B artifact重現的favicon404 FAIL，手機迴圈未到達，不沿用歷史11/12宣稱E fresh完整通過。

閒置後480樣本交錯微基準：B median0.821917ms/p951.334750ms，E median0.804334ms/p951.428167ms；中位約-2.1%、p95約+7.0%，僅六個同B合法觀測，不推論Full100速度。初次並行QA的噪聲樣本保留；正式兩局decision時耗與BFS/Dijkstra工作量另見TEST-RESULTS，沒有為追效能改policy。

原R6 371及R5 591檔最後seal皆0差異。E正式history新六往返：turn242–252／indices5896、5959、6013、6044、6114、6150，真E選擇parity6/6；與舊B indices不同。這仍是症狀，未證實新E協同收益，不再盲調。NEXT-ACTION保留精確續作與Q-ICON阻塞。R6 Full100/T3/T6 UNVERIFIED，Alpha PARTIAL。
