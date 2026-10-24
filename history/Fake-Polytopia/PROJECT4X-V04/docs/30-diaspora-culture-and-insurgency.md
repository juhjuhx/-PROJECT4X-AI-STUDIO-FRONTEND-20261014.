# 30｜文明不因滅國而死：難民、地下思想、復國 v0.4

**玩家確認**：帝國亡國後難民可流散、被吸收、游牧、成為地下教派、寄生於他國制度，最後可能以文明思想擴散完成另類勝利。這是長期核心得分路線，但不加入 G1。

## 不要把所有權和身份寫死為同一欄
`TerritoryOwner`、`PolityId`、`CivilizationIdentityId`、`PopulationCultureAffinities`、`ControllerId` 分層；軍隊被擊敗不代表人口／制度／語言／信仰立刻消滅。**統治權、控制權、認同、意識形態、制度採用**是不同狀態。

## 政權與文明生命週期
**政權** `ACTIVE -> CAPITAL_LOST -> TERRITORIAL_COLLAPSE -> EXILED/ABSORBED/RECONSTITUTED`。
**文明身份** `FLOURISHING -> DIASPORA -> PRESERVED/ASSIMILATING/UNDERGROUND/REVIVAL`。
兩個狀態機分開，允許領土=0、文化認同>0。『游牧』『地下』只是未來特殊控制模式，不等於 G1 玩家在亡國後可繼續操作整場戰爭。

## G1 明確規則與長期遠景
G1：失去首都即敗北（降低完成難度），`VictorySnapshot` 和歷史存檔可繼續觀看；**不生成可行動的流亡 faction**。長期大型沙盒：領土亡國觸發「繼續扮演該文明」提案，可選流亡、遷徙或地下，而非直接結束。

## 五種延續途徑（未來系統）
| 途徑 | 操作介面 | 主要條件 | 風險 |
|---|---|---|---|
| Refugee dispersal 流散 | 設定目的地與求生政策 | 人口存活／邊界與交通 | 同化或排斥 |
| Exile government 流亡政府 | 外交庇護與復國計畫 | 合法性、東道國支持 | 傀儡化、依賴 |
| Nomadic polity 游牧政權 | 遷徙線與牧場資源 | 生存路徑 | 環境、固定城壓迫 |
| Underground order 地下社團 | 秘密網路／宣傳／潛伏 | 群眾支持、隱密成本 | 被鎮壓、分裂 |
| Cultural inheritance 文化擴散 | 學術、制度、藝術或信仰 | 交流、長期採用 | 身份稀釋或錯誤詮釋 |

## 文化型勝利的可檢驗條件（遠期提案）
並非『所有別國都信我，我不需要國土』這種無成本勾選。`LegacyInfluence` 由可確認的制度/文化採用、長期維持、群眾/行政支持與公開反制機制計算；勝利需在明確 turn window 穩定達到條件，並允許對手政策抵制、反向吸收及共存。不把『傳播思想』設計為只能秘密洗腦才有效。

## 地下勢力不應是永久隱形的超級單位
建立、維持滲透網需具體招募成本、地理通路、風險；對方獲得可反制情報、選擇包容或鎮壓；失敗可能暴露。AI 擁有相同 fog 情報權利，地下勢力不越過 RuleValidator 改寫國家控制權。

## 契約示例（僅資料示意）
`PolityCollapsed{polityId,formerCapitalId,turn}`；`DiasporaMoved{cultureId,from,to,populationShare}`；`InstitutionAdopted{institutionId,polityId,sourceCultureId,uptake}`；`PolityReconstituted{oldId,newId,continuityEvidence}`；不可用 UI 動畫事件當成狀態來源。

## QA
領土歸零但文化資料仍存在；外交吞併不直接將所有人口身份改成佔領國；同一批流民不可在兩個城市重複記帳；未來文化勝利不是靠秘密資料直接篡改他國；存檔遷移不抹除 lineage。
