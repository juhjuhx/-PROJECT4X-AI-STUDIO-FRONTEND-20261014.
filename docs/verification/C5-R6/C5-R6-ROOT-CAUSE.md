# C5-R6 Strategic Convergence｜局部修補已驗證，整局仍FAIL

BASELINE：5bd059b91a818f3f84c892df94cd57d8a3a66bdf；integration/project4x-c3；恢復clean；R5 manifest100/100吻合。R5 87/13、T3/T6 FAIL、Alpha PARTIAL保留。現行B局部反例與188測試通過；固定008／021／064／051仍TURN_LIMIT，010自然終局。下方187指A階段快照；沒有新Full100結論。

## 執行計畫／狀態

- [x] R0：讀權威文件、確認來源及R5封存hash；INITIAL STATUS已回報。
- [x] R1：真實seed008 Observation重建；辨別Siege／Reinforcement／Target Priority／Progress；沒有因果反例不改碼。
- [x] R2：縮減最小Observation fixture，舊policy RED；以合法Action和可驗證後果論證預期。
- [x] R3：僅ai.ts最小修正；原180＋7攻城＋1審查回歸共188，check/build/prefix/D02、fog/determinism/immutability通過。
- [x] R4：凍結候選，五個代表seed依原800/40000執行完畢；010終局SaveReplay、其餘四局部分SaveReplay通過，策略Gate TESTED_FAIL。量測同基準性能與路徑工作量。
- [x] R5：clean-context review與本地checkpoint完成；008仍失敗，R6 Full100未啟動，不能與R5混算。
- [x] R6：結果／NEXT／來源manifest與remaining failures同步；真人／真機未驗，Alpha PARTIAL。

## 工作邊界／決策

Native：root單一修改ai.ts；獨立代理只讀政策或公平性研究。依使用者已指定自主流程前進，不另重問執行方法；本文件沿用專案權威交接結構作計畫與ledger，不建立重複最新版。
只讀R5 evidence與public結果；新證據只寫../evidence/C5-R6-20261021-212438。R5-PRESERVATION-SEAL.json記錄原始bytes，完成時再核對。Observation實際定義在types.ts、observe在game.ts；不存在observation.ts不虛構補檔。
可產品修改僅src/core/ai.ts；GameState／reducer／schema／ruleset／單位科技數值／session／UI全凍結。沒有新依賴、沒有push main；七EOF欠項不在本輪優先處理。

## 假說（UNVERIFIED）

seed008持續交戰但占領停滯可能出自攻城動作排序、保留入城單位或目標交通。最後Capture455/464僅定位索引，不能直接當第一根因。須由actor合法Observation證實更佳合法選擇。

## R6-01：已確認的局部因果機制

由seed008原始合法history從起點掃描，先排除turn464已成功Capture的假陽性；direct現有射擊窗口未見損失。擴大至每個support最多一次Move再Attack、保留fresh鄰接入城者的有界同回合搜尋；最早經此predicate驗證的失效為零起算command11555／turn456／actor1。這不是所有可能戰略的全域最早性證明。

當時唯一fresh入城者是弓兵，守軍hp2、城防下弓兵傷害1。支援步兵當前不在守軍Attack射程，但有合法Move可到射程1，城防下傷害2足以擊殺。原policy選弓兵Attack（score28），清城支援的Move因attack分支先return而未進入Move評分，不能把未評估當成score0；原該回合其餘合法history沒有Capture。

有界替代只依同actor合法Observation列候選，原core逐步接受：support Move→support Attack→entry Move→Capture；無敵方回合穿插，據點控制實際改變。完整觀測／原始座標／world只在R6 private；最小測試將角色與位置平移至合成fixture，不公開原world。

造成失效：既有reserve只把目前射程內的兵算支援，且一般Attack在任何Move前執行；因此先消耗唯一occupier，錯失可實作的同回合窗口。修正只在既有攻擊段加已知據點的單擊清城候選，要求另一fresh鄰兵保留入城資格；direct合法Attack優先，否則回傳可移位後單擊清城的合法Move。沒有新增權重、規則、記憶或私有truth。

測試：siege-minimal-RED 3pass/4fail exit1；GREEN 7/7 exit0；real-window-GREEN四步真Capture；candidateA-suite187/187。新增test訊息string|undefined造成check/build首輪FAIL已保存，改為字串fallback後兩Gate PASS；產品AI沒有因此再改。candidateA-prefix1100/0loop與D02 673commands／seen=true／winner0 PASS。

候選AI SHA：15bc1ef14371f57a7d1ec3c3675f2c57f9274b4c4e006f363beefc4f0a7a19fe；產品SHA6bdedcc762261118c1b131890f540d4fe1a22658f0805aa2299a100fb15cc6ec。完整seed008／010及其他代表組尚UNVERIFIED，不能從局部綠燈推論整局。

## Candidate A 凍結與整局驗證｜2026-10-22 階段快照

候選副本 `../evidence/C5-R6-20261021-212438/frozen-candidateA` 唯讀；原始政策決定正式Action，私有shadow只收同一Observation副本作等價與工作量核對。shadow SHA `9e81d805a76f97afabc65d189cd8752f9ff9f492c220a1dba0365a673d11610f`；實際方法fingerprint `498cb1cca7aab512387596d4f64738d63bb26f30c6aa6bb52db9f96105c9b380`。方法與R5不同是因shadow加入R6候選枚舉計數，正式800／40000與遊戲規則不變；不可混算兩輪。

seed008／010已啟動，每局獨立ledger與報告，使用同一產品／方法。續作時先讀報告、attempt與程序，不重跑或覆蓋已有結果。完整世界只寫專案外private。凍結時剩餘約14.2GiB，與前次21.2GiB不同；未清理不明使用者資料。

效能：相同原始合法攻城Observation，100次串行微基準R5 median0.0821ms／p95 3.1978ms；R6 median0.1157ms／p95 0.6279ms。兩者BFS皆0，R6本次檢查1守軍、1入城者及63個合法Move候選。這不是整局效能、尾延遲改善或普遍成本上限的證明。另一串行64兵基準延遲高度波動，且沒有進入新增攻城分支，工作量相同；保留原始樣本，不把不同時段的毫秒差當政策效果。

## Review → Candidate B

A直接清城early return繞過R2招募調位，獨立review找到實際退化；root追加完整Capture與Recruit、扣款／兵數斷言，7pass/1fail RED。B抽取原有guard為firingMoveFor供一般Attack與direct clearance共用，8/8 GREEN。新總數188（原180＋7攻城＋1review回歸），check／build／prefix1100無loop／D02／browser11與原220 Gameplay12（209commands）均通過，清理另列PASS。原raw失敗沒有刪除。reviewer只讀複審局部APPROVE，不能當整局或Full100證據。

B AI `939d641f000035489def1df7e3cdde040c35b31c58f5fcfd05b75e455a36fecc`；產品 `d212303ff7006b8195b10bbc933160245c247d6997c95543b28605de1c8c2843`；方法 `aa2df7b9b853ad87091bd39319a6b32e876764931ca5bf7232fc954cca1e957f`。B使用全新frozen-candidateB／performanceB／targetedB，未覆寫A。

A008完整TURN_LIMIT：800 EndTurn／20706commands／winnernull，部分SaveReplay通過；不能把局部占領改善寫成終局改善。A010與B010各自真正COMPLETE：winner1／319 EndTurn／8729commands、終局SaveReplay通過。A的021／064在review確認回歸後停止探索，保留進度與interruption收據，未製造比賽結果。A008／021／064外層wrapper會如實顯示原工作目錄A→B變化；真正執行的frozen-candidateA sourceStart/sourceEnd與method均不變，這與UI或正式AI中途換版不同。

B008／021／064／051當時仍在驗證，最終五局結果見下方收尾。新R6 Full100暫不啟動；不得與R5 87/13混算。進一步有界診斷最初只把A真實合法history當Observation來源、以B測當下策略；後續以完整state/history相等證據確認B可達性，未有新因果反例前不再改權重或產品。

## 整局邊界與下一個獨立缺陷

B008已完整TURN_LIMIT：800／20706／winnernull，部分SaveReplay通過。A與B的008完整state（含history／requests）逐值相等，私有收據A-B-008-EQUIVALENCE.json，因此可確認同一組合法觀測也出現在真正B生成history中，仍不混合兩種source的完成率。R6-01是局部窗口修復，不是seed008整局根因全部解除。

對A完整history再做B有界同回合Move／Attack／Capture反事實搜尋：僅3個符合條件的機會狀態，沒有找到另一個「已可同回合占領卻被選擇破壞」窗口。這是有限搜尋負面結果，不是所有攻城序列的不存在證明。

R6-02（TARGET／TRAFFIC，根因UNVERIFIED）：最早六次同兵兩格往返出現在command5904–6165（零起算）、turn242–252；該兵HP7不變、沒有新探索／Attack／Capture，六個當下B選擇均與真history相同。目標在site與enemy之間切換；實測terrain／traffic距離為18/26→11/11→18/22→13/17→18/26→18/20。此為第一個符合本六次往返predicate的症狀，尚未證明EndTurn、另一Move或讓路能產生較好的合法戰略後果，不據此直接改權重。

額外私人QA由A的上限state延伸六次交接、157個B合法Observation決策：25Attack／119Move／7Recruit、0Capture、控制不變；有14次兩步反向，其中10次目標相同。這是超出正式800上限的獨立診斷，不計入對局結果，不證明首個因果斷點。

## 證據保全與診斷事故

R5封存591個檔案SHA／size再次全吻合，原公開R5 Full100 JSON不變；沒有刪改任何首次R5結果。AI code checkpoint `894e8f97f966635378c950f38945606575d27847` 的產品bytes與已驗B完全吻合，測試命令本身在前一HEAD執行，不能將Git提交動作冒充重跑測試。

一次R6私人診斷檔名與run.py收據同名，原始六筆觀測被收據覆寫；原log／收據／生成history都保留，未影響R5或對局ledger。已從相同不可變history重建至獨立private檔名，清楚標RECONSTRUCTED，首次與重建的index／turn／policy parity一致。私有runner改為exclusive建立收據，隔離反例先RED（確實覆寫marker）再GREEN（拒絕覆寫且保留marker）；不以重建資料冒充原始bytes保全。正式headless腳本與method未因此修改。

## 五局收尾與效能

| B seed | 結果 | EndTurn | Commands | Save／Replay |
|---|---|---:|---:|---|
| 008 | TURN_LIMIT | 800 | 20706 | 部分通過 |
| 010 | COMPLETE，winner1 | 319 | 8729 | 終局通過 |
| 021 | TURN_LIMIT | 800 | 22010 | 部分通過 |
| 064 | TURN_LIMIT | 800 | 24020 | 部分通過 |
| 051 | TURN_LIMIT | 800 | 24117 | 部分通過 |

五局不是Full100完成率估計。008／021／064最後100 EndTurn沒有Capture，仍有交戰招募；051有一次Capture（actor0 turn723），屬持續爭奪症狀，不與其他局預設同根因。四局策略根因仍需分別確認，0ERROR與部分Replay通過不等於終局成功。

五局99582次正式決策／shadow parity，median3.887ms、p95 11.593ms；分批交錯1-worker程序與不同軌跡，不能和R5全100 median1.708／p95 5.757直接作政策成本因果比較。路徑工作量、每局耗時與原始樣本在ledger／TEST-RESULTS.json。

所有本輪對戰程序結束後，串行同機微基準R5→B：已知巡查median3.154→3.066ms、p95 3.263→3.276ms，皆104 BFS／47169展開；未知frontier median0.960→0.918ms，皆41 Dijkstra／8181展開；traffic-wall median7.549→7.324ms，皆450 BFS。這些場景未進入新增clearance分支，不能宣稱本修補提升效能。真攻城觀測100次median0.0257→0.0346ms、p95 0.0393→0.0446ms；0 BFS，B枚舉63個合法Move，約增加0.0089ms中位數，非全局成本上限。先前A的高噪音資料仍保留，不拿重測覆蓋。

真B turn242／250有界CF僅改一個合法Move，再用原B六次EndTurn：沒有任何分支增加據點控制或情報；242的初始目標距離18，原路最終19，替代18或19；250各路最終17。尚不足以建立「更佳戰略行動」RED，不再修改政策。NEXT-ACTION保留完整觀測、合法動作與目標／交通資料的讀取入口，續查R6-02。
