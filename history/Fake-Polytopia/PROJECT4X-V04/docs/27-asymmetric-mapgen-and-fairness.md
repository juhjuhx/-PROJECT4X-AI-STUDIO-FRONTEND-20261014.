# 27｜非對稱地圖生成與可生存的公平 v0.4

**使用者確認**：希望模式 B（開局不同但透過地理／能力達成可競爭的公平）；先保證有意義的取捨，不追求每一格鏡像對稱。

## 公平不是等量
地圖公平要量的是**可生存、可決策、可反制**。河谷文明的好地是農田，機械文明的好地是能修建供能鏈的位置，修行文明的好地可能是靈脈。簡單量每方初始金幣或土地數會誤導。

## WorldGen Pipeline (可拆可測)
```text
Seed + Ruleset + ContentPackSet
 -> Climate / Elevation / Coast / Biome
 -> TerrainPassability and Routes
 -> Local resource potential by civ profile
 -> Candidate Spawn Regions
 -> ViabilityConstraints (hard reject)
 -> SoftBalanceScore (rank or bounded reroll)
 -> Anomaly/Artifact Placement with traceable clues
 -> Faction Spawn / Fog Projection
 -> Signed GenerationReport (not shared with players)
```
每層使用衍生子種子 `hash(worldSeed, stageId, version)`，新增裝飾不改既有大尺度世界生成；不允許依 renderer 貼圖資產當地理規則。

## Hard constraints（P0）
- 所有起始文明首都有合法鄰格、到最近中立據點／生產地可達，且初始幾回合具有合理的收益/招募/移動選擇。
- G1 兩方都有走到彼此首都的可行交通圖；初始地形不能使對局無限卡死。
- 未知高科技內容不在第 1 回合生成必死的無解即時入侵；若允許不可擊敗勢力出現，必須有合理撤退／避險／其他目標途徑。
- 每個文明有可在指定 horizon 內取得的**最小生存配方網絡**：輸入產地、路徑、工廠能力、可用作替代的第二途徑。
- 反制機會至少有一條現實可行的探索線索；線索可消失需保留另一條資訊獲得途徑。

## Soft scores（不宣稱實測平衡）
- `effectiveAccessibleYield(civ, radiusOrTurns)`：依文明配方換算的可用產量，不將不同資源盲目等價。
- `neutralReachTurns`、`defensiveChokeValue`、`expansionCorridors`、`counterplayOpportunity`、`contactThreatHorizon`。
- 使用 Pareto/加權分數提供候選地圖，不盲目最小化所有差距；每次版本變更必須重新跑種子分佈。
- 修正方式優先**交換起始區域、移動中立據點、補足關鍵輸入或連接路徑**；必要才拒絕 seed。有最大重試次數，超限使用預留安全模板並留下診斷理由。

## 公開遊戲模式
`BALANCED_MATCH`：有限規則池、對等的早期反制窗口、部分鏡像地理也可。`LIVING_WORLD`：容許遠方古老帝國與極端文明，但新玩家安全窗、撤退及接觸線索受控。兩者同一個 rules engine，差異在內容／生成設定，不依 UI 另造規則。

## 程序化測試案例
- 10,000 seed **目標樣本**（不是已執行）：P0 無路／無生存輸入＝0；每個 seed 產出 `GenerationReport` 帶可讀理由。
- 交換玩家勢力起點，勝率大幅偏向同一地區時須報告，不因平均值合理而放過尾部壞 seed。
- 四類單局地圖：河谷肥地但門戶脆弱；機械能源高地但缺補給；修行脈絡邊疆；跨域遺跡有意義但不免費送勝利。
- 專用器物測試：只留一條線索時仍可找到；線索被敵方控制時需能交易、間諜或繞路取得反制機會。

## 研究參考
Freeciv/Freeciv21 map generator 的 fair-islands 以及資源生成流程，可研究多階段與起點設定；Wesnoth 地圖生成可研究村莊/起點參數。但 GPL 專案**僅作演算法思路參考，不複製實作**。
