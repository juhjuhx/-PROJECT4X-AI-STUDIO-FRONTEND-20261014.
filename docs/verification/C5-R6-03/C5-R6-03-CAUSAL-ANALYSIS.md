# C5-R6-03 因果分析與執行計畫

> 單一root writer按executing-plans執行；代理僅唯讀研究／審查。沿用使用者已授權的Native流程，這份文件同時保存計畫與證據，不另建LATEST。

**Goal：** 證明或排除E六往返中可由合法協同介入改善的策略缺口；Browser資產事件獨立處理。
**Architecture：** core/applyCommand唯一權威，AI只收Observation；替代序列每步重取legalActions。相同完整初態／E／對手／預算，介入為唯一變因。
**Tech Stack：** 現有TypeScript／tsx／Node／Canvas2D／Vite與原core，不安裝依賴。
**Spec：** 使用者C5-R6-03指令；AGENTS、NEXT-ACTION、C5-R6-02-SOURCE-MANIFEST。

## 不變量與來源

HEAD 605d6c09818c180def6fbaf3f54786efa19d4fca，branch integration/project4x-c3，初始clean。E產品6007de6a13ff7a8a5503a8eb2b2e864770a194f6e13d945296d101f9ff12169f／AI972f564ea1bc795b269e4c5db066fe209623ffa42961d84eacc30ee374529b67。使用者列939d641f屬歷史B，不能當E。

g1-ccts-1／project4x-save-1／project4x-replay-1與所有玩法數值不變。不修改session/UI/main、GameState或勝敗；AI修改只准ai.ts且須過8項Root Cause Gate。Stateless、Deterministic、Observation-only；不禁返回、不固定N回合、無seed特例／truth推導。

私人目錄：LOCAL_HOME/Desktop/Fake-Polytopia/工程整合/C3-20261018-074653/evidence/C5-R6-03-20261023-092731-fb2e9b4e。上輪545份私有證據manifest逐檔吻合；新exclusive run／receipt／資料分路徑，完整world不進公開文件。舊六B與新六E分開，不稱RECONSTRUCTED為原bytes復原。不push/merge main。

## 執行矩陣

| 工作 | 可觀測驗收 | 證據／範圍 |
|---|---|---|
| E provenance | 原history SHA、6state/Observation/selected/legal parity | 原始history與RECONSTRUCTED snapshots，candidate score另作RECOMPUTED |
| 目標／交通 | 六決策完整chain；未知欄位UNKNOWN | Observation-only插樁，與真E parity |
| 合法協同 | 原core接受每步、同初態／E對手／預算 | 預宣告候選與2/4/8 EndTurn，不以距離當勝利 |
| meaningful progress | 控制／可見傷害／己損／情報／成本分列 | 不合成單一神奇分數；完整oracle只在private |
| AI修補 | 原E真RED→最小ai.ts修補→GREEN | 根因未成立則UNVERIFIED，不為交付硬改 |
| Browser | 精確404 URL／實際asset路由／正式錯誤斷言 | 獨立incident；缺資產交D3，harnessbug另TDD |
| 回歸／交接 | fresh適用gates、independent review、checkpoint | 保留FAIL與未達手機，不把單局當Full100 |

## 待辦

- [x] R0：唯讀恢復、CURRENT INITIAL STATUS；21產品SHA吻合。
- [x] R1：E六觀測state/observe/selected/history parity與完整決策鏈。
- [x] R2：受控多單位CF方法小測與獨立審查，再執行預宣告候選。
- [x] R3：完成分項收益與Root Cause Gate審議；尚缺通用最小fixture／RED，因此未修改AI。
- [x] R4：Browser來源獨立判定及D3 handoff或必要QA最小修補。
- [x] R5：適用回歸／008/010條件式驗證、獨立review、更新NEXT與checkpoint。

## 初始狀態

ROOT_CAUSE_STATUS：UNVERIFIED_ROOT_CAUSE。歷史E195tests/check/build/prefix/D02及010終局PASS；008仍800 EndTurn/20682 TURN_LIMIT。browser與gameplay整體FAIL，209/220連續玩法及cleanup個別PASS，手機UNVERIFIED。新版Full100/T3/T6未驗；Alpha PARTIAL。此段是上輪證據，沒有冒稱本輪fresh測試。

第一假說：全域forward與交通距離評估可能壓過有價值的合法協同讓路。須先證明收益，不能以往返或開路直接當根因。



## E六決策：已排除本窗口的target-switch假說

| index／turn | goal | terrain potential | full traffic potential | enemy-only potential | selected Move score | 全軍forward數 |
|---|---|---:|---:|---:|---:|---:|
| 5896／242 | 同一記憶據點 | 13 | 17 | 15 | 115 | 14 |
| 5959／244 | 同上 | 12 | 44 | 14 | 63.2979 | 3 |
| 6013／246 | 同上 | 11 | 35 | 23 | 72.3684 | 0 |
| 6044／248 | 同上 | 12 | 12 | 12 | 145 | 16 |
| 6114／250 | 同上 | 11 | 53 | 11 | 57.1429 | 0 |
| 6150／252 | 同上 | 12 | 14 | 14 | 130.8824 | 14 |

全部actor1，site visibility=explored、owner UNKNOWN，不是已知敵城或中立。goal weight1800源自原AI。site路線容許unknown格作樂觀potential，不能稱為已知全程合法路線。額外goal診斷是RECOMPUTED；production routesThrough有upper-bound break，不宣稱它曾逐個評估所有候選。root插樁副本與真E／saved selected／實際observe 6/6吻合。

246/250全軍沒有雙距離forward，於是保留必要繞路的fallback容許terrain退一步、traffic前進一步。當下可縮短route的critical友軍均已moved，無合法讓位；不能用靜態移除blocker冒充可執行序列。

## 往前追蹤與真正的症狀因果

從已驗E5959端點以完整ledger重播至6114，156次E action parity；6013/6114 full-state深相等。新5991、6004明確標RECONSTRUCTED，不稱原raw bytes復原。

6004：友軍原合法Move後，focal同一合法向前Move的traffic progress +1→−1、terrain progress仍+1，score83.2857→負無限／forward true→false；known tiles、visible enemies、faction內容完全相同。此一步友軍佔位改變評估的機制由root直接重放CONFIRMED。5991等更早變化還伴隨新可見敵軍，不能全部當純交通。

但「原選擇造成評估往返」不自動等於「有更好的戰略」。收益須另由公平CF證明。

## 三輪有界對照

- 晚起點12arm：6013/6114，各baseline／identity／兩條focal替代／兩個支援順序；2/4/8 ET，500命令。全部FINISHED；每起點所有控制、己方兵數/HP/gold、可見傷害/擊殺、補兵成本及情報相同，只改位置。
- 早起點13arm：5991/6004，加入focal提前、blocker替代及順序控制；同2/4/8 ET與500。全部FINISHED；8ET共享友軍HP +3/-2，總HP+1，無Capture或新情報。新招ID／位置也分岔，不跨分支把缺少同ID當額外傷亡。
- 延長3arm：因已有實際戰術取捨，僅6004 baseline、alt-blocker、focal-first，同8/16/32 ET及1200診斷命令。每個8ET完整checkpoint／actions與早起點實驗一致，沒有改正式800／40000。

| 相對baseline | 16ET | 32ET |
|---|---|---|
| alt-blocker | 兵+1、HP−4、擊殺+1、補兵成本相同 | 兵+2、HP+3、擊殺+1、成本+2 |
| focal-first | 兵相同、HP−16、擊殺−1、成本+5 | 兵相同、HP+7、擊殺−2、成本+21 |

三者各horizon均控制3據點、Capture0、新情報0；32ET仍winner=null。alt-blocker有有限軍事收益及額外花費；focal-first是混合取捨，不能只由總HP說改善，也不能說已證明整局更差。順序可交換及E自然接續造成多個等價控制，不把28arm當28獨立收益樣本。

## Root Cause Gate

| 條件 | 狀態 |
|---|---|
| 真合法Observation與完整原history可追溯 | CONFIRMED |
| 真E原策略與selected重現 | TESTED_PASS |
| 不同合法動作／原core接受 | TESTED_PASS |
| 同初態／E對手／預算公平對照 | TESTED_PASS |
| 具體收益與代價 | PARTIAL：32ET有限軍事取捨，無控制／情報／終局 |
| 排除truth輸入／未來資訊 | TESTED_PASS於本方法範圍 |
| 可合理泛化的合法最小策略fixture | NOT_IMPLEMENTED |
| 原E真正行為RED | NOT_IMPLEMENTED |

因此ROOT_CAUSE_STATUS仍UNVERIFIED_ROOT_CAUSE，AI product fix NOT_IMPLEMENTED；沒有為交付硬調權重、禁返回、引入記憶或改ruleset。下一步為縮減6004協同落點；若縮減後無合理收益規則，保留反事實而改查實際軍事前線。

## 獨立Browser切片與驗收

Q-ICON缺資產CONFIRMED，交D3需求；Browser仍TESTED_FAIL，手機UNVERIFIED。另一個desktop errors未進收據的缺口已真RED→一行alias→GREEN；child仍404 FAIL，沒有弱化斷言。QA checkpoint58dcaffdb8d740edb4786781c817470f8a199856。fresh195tests/check/build PASS；原220連續玩法實際209指令與cleanup個別PASS，整體仍FAIL。

完整結果／來源／限制見同目錄COUNTERFACTUAL-RESULTS、TEST-RESULTS、SOURCE-BOUNDARY、INDEPENDENT-REVIEW及BROWSER-INCIDENT。本輪未重跑800/40000或Full100，沒有用有界診斷宣稱seed008修復；原E008 FAIL／010 PASS、R5歷史均保留。Alpha PARTIAL。
