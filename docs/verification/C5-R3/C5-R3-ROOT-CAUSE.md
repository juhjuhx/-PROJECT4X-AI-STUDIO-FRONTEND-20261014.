# C5-R3 戰略收斂：根因、最小修正與驗證

基線 `8acc52698b9553e74961d38c54e11dfa301268e5`；分支 `integration/project4x-c3`。恢復時工作樹乾淨，R2 manifest **69/69**吻合。GitHub main 唯讀重查仍 `c21b16cd75572d069369f41426f7323c63c05083`；未 push。

本輪兩項 policy 修正 **IMPLEMENTED**，各自有 RED→GREEN。最終 **113/113 tests、check/build、1100-command prefix 0 loop、11 browser、12真玩法情境 TESTED_PASS**。seed010 **SINGLE-SEED TESTED_PASS**：核心自然判 `winner=0`，534 EndTurn／15418 commands／harness turn535，終局 Save/Replay 重建驗證 true。**full100 UNVERIFIED，中央 D-02 TESTED_FAIL，整體 Alpha PARTIAL**。

## 計畫與證據來源

- [x] Source recovery、Git／manifest身份；未覆寫既有工作。
- [x] 先讀既有2331筆合法Observation，再找反例；沒有一開始重跑800/full100。
- [x] 根因→最小fixture→RED→只改ai.ts→GREEN；保留R2三項修補。
- [x] 全suite、prefix、確定性／不可變／fog／Replay、真UI回歸。
- [x] 小gate後才跑固定seed010；第一候選FAIL完整保存，第二候選合法終局。
- [x] 兩片獨立審查、較強等待斷言納入suite；manifest／續作入口更新。
- [ ] 新版full100/T3/T6、中央搜尋修復、真人／實體手機／45–90分鐘驗收：尚未完成，不以單seed取代。

既有trace SHA256 `7fcc8e2399633100fcb30b0f4f2e6ea588c02b01e1d809512e6faca77b043ce8`，2331筆、163767666bytes。turn56–100重點1313筆，Attack205／Move1005／Capture1／Recruit57／EndTurn45。cmd是trace零起算編號。這些次數不當進步證明。

私有 `../evidence/C5-R3-private/structured-decisions.jsonl` 逐筆保留 actor／turn／unit／position、known objectives、selected target／action、legal action count與candidate scores、terrain／traffic／enemy-only距離、friendly blockers、可見敵守軍、招募／佔領機會。Observation不支持的隱藏敵力／據點旗標／預期戰略成果標UNKNOWN。完整Observation、world與failure payload只留專案外私有evidence（0700／0600），不交HUD／Replay／Git。

## R3-01：TARGET PRIORITY 的不正確前四剪枝

**真正失效觀測**：cmd1234／turn62／actor1，兵36在(19,12)。舊policy選北(19,11)，追兵46(17,5)；terrain11、traffic17，原有價值650/(17+4)=30.95238。terrain排序第五的兵29(10,13)實為terrain12／traffic12，650/(12+4)=40.625；合法西(18,12)能接近它。改後在同一凍結Observation確實選同兵往西。

**造成失敗條件**：`promising.slice(0,4)`先依忽略佔位的距離截斷；只要前四任何一個完整交通可達，就完全不看後面的更佳實際路線。terrain排序不是traffic排序。cmd1046的排名差異因最後Move相同被排除，沒有把較弱排名證據冒充真正動作斷點。

**最小反例**：`tests/ai-stalemate.test.ts` 的「第五個更可達的已知據點」。平地，唯一fresh兵(3,5)，己方已行動友軍牆x4,y2..8；五個合法已知敵據點terrain距離2/3/3/3/4，traffic10/9/9/11/4。舊policy向北(3,4)，斷言應南(3,6)失敗；沒有隱藏資訊、探索或射擊利益混入。

**最小修正**：保留原權重與value公式，以terrain value作交通value的樂觀上界。依上界遞減評估，只有下一上界**嚴格小於**目前最好實際值才停止。佔位圖只刪路徑邊，故距離不會小於terrain；等上界仍須評估以保留既有y/x tie。獨立equal-bound mutant與256地圖完整枚舉oracle另驗。

**RED／GREEN**：`C5-R3-pruning-RED.log` 6pass/1fail、exit1；GREEN 7pass、exit0。第一候選111tests/check/build/prefix PASS後整局仍 **TESTED_FAIL**：800EndTurn／19898commands／winner=null。此結果保留，不能因局部GREEN宣稱整局已解。

## R3-02：REINFORCEMENT 的完整交通路徑前置條件

**真正失效觀測**：原trace cmd1370／turn66／actor1，fresh兵75(22,21)有四個合法Move。兵46(18,5)為可見目標，已知terrain路徑20步，只被友軍兵53(19,7)截斷；四Move全部score=-Infinity、target=null，實際EndTurn。可合法先北到(22,20)，原trace直到turn68才做同Move。本例證明一己回合接近延誤，不單獨宣稱造成整局800回合失敗。

**造成失敗條件**：沒有任何完整traffic可達目標→沒有unitGoal→所有進展為零／-Infinity。這與前四剪枝不同，遍歷所有目標仍無法解。

**最小反例**：四格平地廊道，fresh補兵0、空格1、已行動友軍2、合法可見敵兵3；無據點／金幣／未知地形。唯一Move0→1合法且真reducer接受，舊policy卻EndTurn。另測mountain真隔絕仍EndTurn。

**最小修正**：完整traffic候選為空時才以「仍擋敵軍、暫不把友軍當永久路障」potential選目標。實際Move始終從原legalActions取，不穿兵、不改地形規則；若任何完整traffic路線存在，仍先用原完整路線，必要繞路不被直線取代。抵達瓶頸前可接近，抵達後fresh且有合法退路仍等待。

**RED／GREEN**：`C5-R3-approach-RED.log` 8pass/1fail、exit1；GREEN9pass。採納獨立review的較強fresh等待斷言後，`C5-R3-final-waiting.log`9/9、全suite113/113。未引入歷史記憶、全知seed重建或新的數值。

## 攻城／佔領與其他假說的排除邊界

唯讀掃描turn56–100的1313筆：只有cmd1018在有界「保留fresh入城者且其他火力足夠」檢查中具同回合窗口，實際cmd1018 Attack→1019入格→1020 Capture成功。cmd1180擊殺後敵方cmd1205補兵是症狀，但沒有足夠支援火力與fresh入格者的證據，沒有憑症狀重寫reserve政策。掃描不枚舉多人互相讓路或未知路線，不能推論所有攻城無缺陷。

另確認歷史cmd1116→1171，兵42對同目標受友軍traffic方向變化影響，兩次合法Move回原格。該類機制仍是一般化風險，本輪不冒稱全面解決；必要探索與繞路反例表明不能一律禁止terrain退步。真實最早失效不只一類；本輪選擇有精確選擇斷言與最小修法的兩項，不以任意權重處理全部假說。

## 整局前後、來源邊界與獨立審查

| 候選 | EndTurn | Commands | Winner | 結果 |
|---|---:|---:|---|---|
| R2歷史基線 | 800 | 19813 | null | TESTED_FAIL |
| R3只修剪枝 | 800 | 19898 | null | TESTED_FAIL；保留原log與私有完整報告 |
| R3再修部分接近 | 534 | 15418 | 0 | SINGLE-SEED TESTED_PASS；534EndTurn、turn535 |

第二候選真正19次Capture／1次elimination、4次流亡／3次重建；這些只作該局過程證據，成功依核心winner與terminalSaveReplayChecked=true，不依更多Attack／Recruit次數。seed上限仍800／40000，methodFingerprint與核心／schema／ruleset均未變。harness總status仍PARTIAL（只跑1局，並非100局總驗收），不是隱藏的FAIL或full100PASS。

最終AI SHA256 `c16c640e5453b85c0939b405d43067c5d00bccab180dd4bac1c3bb96c73caddd`；最終測試snapshot `41634a1e510aa070707df358019a53c8ddb5050f2091322c8c2553b43beb3f05`。長局snapshot8c0e355…與最終只差test的fresh等待斷言；所有src/scripts/config及實際browser bundle相同。raw snapshot包含ignored macOS `.DS_Store` hash，該非產品metadata不入Git；portable hash及逐檔證據見SOURCE-BOUNDARY。

第一片獨立14/14，第二片獨立20/20與strict typecheck，無blocker。256地圖（128fog）、同Observation異truth、輸入deepfreeze／clone／穿插決策、合法Move／scout不能穿友軍、完整detour優先、equal-bound剪枝均測。64兵/10目標/30calls有界性能第二片median7.91ms、p959.30ms；僅微基準，不能當全局效能保證。review frozen test較早，之後僅採納較強等待斷言並fresh全suite；AI bytes相同。

## Remaining failures／下一個任務

**D-02中央搜尋 fresh TESTED_FAIL**：1000commands、seen=false、winner=null、turn871，與seed010根因分列。新版full100/T3/T6 UNVERIFIED，舊62/38 FAIL保留；真人／實體手機／時長／像素golden尚未驗，Alpha PARTIAL。未改UI或新城市／科技／兵種／遺跡權利規則。

下一個安全切片：先讀本JSON與NEXT-ACTION，處理D-02的Observation-only frontier最小反例，先RED，不把未知敵座標或未探索中心當目標。若要引入持久觀測記憶／存檔欄位，先獨立設計裁決；不在本R3偷偷加入。full100在新的單seed進步已成立後可另排固定001–100受控驗證，不以一局結果估計通關率。

重現指令、UTC時間、環境、exit、原始log、來源快照全見 `C5-R3-TEST-RESULTS.json`；raw world不入Git。沒有push/merge/main發布、沒有外部自動續作排程。
