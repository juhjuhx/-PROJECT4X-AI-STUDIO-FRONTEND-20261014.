# C5-R6-04 command6004：交通反例縮減

**交通機制 CONFIRMED；通用策略根因 UNVERIFIED_ROOT_CAUSE。沒有產品 RED/GREEN，AI 未改動。**

## 來源與合法決策

Baseline `479d327fd7dca7024aa747aa4a4bb96df7652a3b`，分支 `integration/project4x-c3`。E AI `972f564ea1bc795b269e4c5db066fe209623ffa42961d84eacc30ee374529b67`，21檔產品 `6007de6a13ff7a8a5503a8eb2b2e864770a194f6e13d945296d101f9ff12169f`；current／凍結E逐檔吻合。
6004是RECONSTRUCTED_FROM_ORIGINAL_E_HISTORY_FULL_LEDGER，沒有找回被覆寫的原始snapshot bytes。actor1／turn246，45單位、己方22、可見敵4、31個合法Action。A與B均指向同一已記憶site，owner UNKNOWN；不改寫成已知敵城。
B為兵-242，原向西至(14,14)，合法替代向北至(15,13)。兩者score都94，但替代terrain progress=-1，不入全軍forward；原移動terrain progress=+1，入forward。這不是單純同分排序，也牽涉保留必要繞路的既有政策。
原移動令A（兵-252）的合法北移仍存在，traffic progress +1→−1、score83.2857→負無限、forward true→false；替代維持+1且E下一步真的選A北移。原45態tiles／可見敵人／faction均不變；沒有穿友軍或非法換位。

## 有界縮減與軍事對照

預宣告48個機制檢查（1 control＋47刪減候選）、最多8組pair，實際遵守。所有機制接受態45／34／28／25／22／19／17／16單位均測pair，沒有依軍事結果挑樣。每pair相同初態、E雙方、原合法核心、8／16／32 EndTurn、1200診斷命令上限；正式800／40000門檻未改。
本輪最小機制接受態為16單位、24合法Action；保留原選擇、友軍依賴、合法替代、traffic精確反轉與同UNKNOWN目標。48案預算未完成單刪窮盡，不能稱全域最小或1-minimal。
下表為各態alternative減baseline，只可在同一列的相同初態比較。32ET均沒有新增己方據點、Capture、情報或winner。

| 初始單位 | 己兵Δ | 己HPΔ | 擊殺Δ | 招募數Δ | 花費Δ | 己損Δ |
|---:|---:|---:|---:|---:|---:|---:|
| 45 | +2 | +3 | +1 | +0 | +2 | -2 |
| 34 | -2 | -12 | +0 | -2 | -13 | +0 |
| 28 | -2 | -7 | +1 | +0 | -1 | +2 |
| 25 | +0 | +9 | +2 | +1 | +7 | +1 |
| 22 | +1 | +17 | +0 | +3 | +19 | +2 |
| 19 | +0 | -6 | -3 | +1 | +5 | +1 |
| 17 | -1 | -7 | -1 | +1 | +8 | +2 |
| 16 | +1 | +0 | -1 | -1 | -7 | -2 |

原45態32ET收益與額外成本成功重現；16ET己HP反而少4（多1兵、1擊殺，成本相同），不能只挑32ET。16態32ET少損2己兵、少花7金，但少擊殺1敵；8／16ET主要軍事聚合相同。七個縮減態均未保留預宣告的原同向軍事向量，但不等於沒有收益；所有取捨保留，沒有改predicate求綠燈。
刪兵會影響視野、招募、全軍排序及新兵ID，故衍生態均標SYNTHETIC_DERIVED。七個刪減態在B移動後tiles的可見度有變化；可見敵人與faction不變。不能像原45態一樣宣稱完全觀測不變。

## 等價與負面檢查

- 16態加已知山脈邊框整體平移、保序prefix改名、A/B識別碼交換，均保留原物理選擇與traffic機制。這是本案例決策層結果，不是全部ID置換或32ET收益證明。
- 包含所有實體的bbox可裁為18×18（324格）、22個合法Action，機制仍成立；裁圖可能影響長路／探索，沒有驗長局。
- 14單位負面態：原選擇與合法替代保留，但原移動後A的traffic仍+1，沒有阻塞損害。不能看到友軍接近就一律讓路。
- A已moved時沒有合法前進；替代格為山地時沒有合法讓路。兩者不滿足依賴條件，沒有生成非法Move。
- 另建可見敵弓手負面場景：替代後新增敵方即時合法Attack並造成2HP，原落點沒有同一Attack。這是威脅存在性，不是原6004的敵軍情報或最優防守證明。
- Fog：不同隱藏敵HP的兩個世界產生完全相同Observation（含legalActions）；20次clone／freeze／interleave選擇相同，輸入不變。
- 必要繞路／駐軍調位／Scout／Traffic／Frontier／反擊等既有195測試fresh通過。沒有新policy可供負面策略驗證；一般撤退最佳性仍UNVERIFIED。

## 軍事因果鏈的新增限制

既有R603三條完整分支另以原core重播，只讀結果、不新增對局。baseline的B有0次Attack／0傷害／0kill；替代B有3次Attack／8傷害／1kill。A則由2次Attack／6傷害變為2次Attack／4傷害，兩者均0kill。focal-first的A更早於turn260攻擊並有1kill，整體仍是不同代價取捨。
因此B改落點同時改變B自己的後續路線與A的可用forward。不能把32ET總收益全歸因為A交通開通，也不能由A更早攻擊推論整軍更好。這是角色貢獻觀察，尚非總效果的因果分解。

## Root Cause Gate 與驗證

合法來源、E選擇、介入合法性、公平對照、交通特徵縮減 TESTED_PASS；完整軍事因果與通用預期規則 PARTIAL／UNVERIFIED。沒有兼顧正負面的最小行為RED，因此不改ai.ts、不禁回頭、不固定N回合、不調權重。依任務第12節，交付同目錄架構評估，僅PROPOSED。
16 arms共12566命令逐步核對：每次E只收actor Observation；自然與介入動作都由合法集和原core接受；全部checkpoint／final canonical hash相符。刪history control兩arm與R603原full-ledger的動作、checkpoint、physical final hash完全相同，仍不證明刪兵fixture可從正常開局抵達或Save/Replay相容。
Fresh：check／195tests／build／prefix1100零loop／D02 673命令見敵且winner0／私人harness5tests通過。完整008／010、Browser／Gameplay、手機、新Full100／T3／T6未重跑。歷史008 FAIL、010 PASS及favicon404 FAIL保留，Alpha PARTIAL。
新診斷首輪因URL.pathname的CJK編碼而ENOENT，已修正並保存，屬QA wrapper錯誤，不是AI RED。run-phase v1來源快照未含source.json，已以v2與完整input SHA／core稽核補齊關聯，舊收據未覆寫。
私人入口：`../evidence/C5-R6-04-20261023-191459-512b87a2`。完整state／Observation／raw結果只留專案外；同目錄COUNTERFACTUAL／TEST-RESULTS／SOURCE-MANIFEST／INDEPENDENT-REVIEW提供安全摘要與SHA。
