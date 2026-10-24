# 25｜文明代謝、資源配方與通用貨幣裁決 v0.4

**裁決**：接受 OpenCode 指出「只有金幣導致異文明淪為 skin」的架構風險，但不採其『各文明只能佔地取得、禁止交易與轉換』的永久規則。選用 **IV：shared substrate + civilization-specific recipes**。此文件屬 [DESIGN-PROPOSED]；經濟多資源不加入 G1 Runtime。

## 玩家與規則分層
- G1：金幣只是為了驗證最短征服回合的**抽象支出/經濟代理**，不宣稱每一種文明的最終資源皆等於金幣。G1 的 2 文明保持大致對稱；未知遺跡選擇延續。
- G1.5：headless 驗證三類文明的 `SurvivalNeed` 與 `ProductionRecipe`；無需多資源 UI。此 Gate 是大規模文明內容發展前的 BLOCKING 實驗。
- G3 之後：加入資源取得／不足／交易的情境化互動；一般玩家預設只看『本回合瓶頸』、『下一個需求』，而非 20 欄資源。

## 資源不是等價數字
| 分類 | 例 | 帳面語意 | 是否可直接互換 |
|---|---|---|---|
| Material | wood/ore/food/biomass/spare-parts | 可存量、可運輸、有容量 | 必須通過配方或貿易 |
| EnergyCarrier | fuel/electricity/qi | 可用能或虛構跨域載體，局域機制需註明 | 依設備／知識及場域條件 |
| Capacity | labor/workshop-hours/meditation-time | 週期限制及產能 | 不是存量貨幣 |
| Knowledge | doctrines/engineering/programs | 學習／擴散／遺忘／禁止知識 | 不因付錢即可瞬間精通 |
| Currency | coin/credits/barter tokens | 制度化記帳／交易媒介 | 受市場與雙方承認限制 |

## 配方權威契約 (示意 schema；不是可運行程式)
```ts
interface ResourceDef {
  id: string; kind: 'MATERIAL'|'ENERGY_CARRIER'|'CAPACITY'|'KNOWLEDGE'|'CURRENCY';
  storage: 'stock'|'flow'|'capability'; transportable: boolean;
  precision: 'integer'|'fixed'; decay?: {perTurn: number};
  visibility: 'public'|'owned'|'discovered'; unit: string;
}
interface RecipeDef {
  id: string; inputs: Record<string, number>; outputs: Record<string, number>;
  byproducts: Record<string, number>; requires: string[];
  locationPredicate: string[]; throughputPerTurn: number;
  sourceDomain?: string; // 跨域輸入須有實際邊界規則
  wasteTags?: string[]; environmentalDelta?: Record<string, number>;
}
interface MetabolismDef {
  civilizationId: string; upkeep: Record<string, number>;
  eligibleRecipes: string[]; shortagePolicies: string[];
  adaptationCapabilities: string[];
}
```
所有內容以 namespace ID 登錄，不允許自定義 `eval` 或腳本任意修改 authoritative state。

## 端到端生產回合（規範性提案）
1. 結束玩家行動後取得該回合確定的領土、工廠與配方快照；排程工廠按 `cityId, productionSlotId, recipeId` 字典序排序。
2. 驗證權利、儲存上限、材料與能力；先**原子性預留**整套必要輸入，再扣款與出產；任一條件不成立，則此配方不得部分扣資源。
3. 輸出產品與副產物，環境改變/耗散產生正式 domain events；阻塞與不足有 `ReasonCode`，無聲吞錯為失敗。
4. 執行生存維護與不足影響，明確標示本回合預設不做『吃不夠就直接滅國』的突發致死式懲罰。
5. 產生事件、更新知識投影、驗證勝負；按照 canonical 版本 hash 入存檔。

## 重要負例
- 不能 `-1` 輸入，不能負成本配方；同資源自循環配方如果轉換效率無損且可無限執行須擋下或定義 throughput/time 限制。
- `Gold` 買不到沒有賣方、沒有連線、不能交易的物理資源；`Currency != Resource`，市場需匹配出價、交付、雙方庫存、運輸與合法外交。
- 同一原料若兩工廠競爭，不得雙花。配方執行 0/1 次，不依 list iteration 隨機結果，連鎖加工的同回合或下回合規則要版本化。
- 知識不能當成被工廠消耗掉的物質；研發費用可為金錢／工作時間，但知識本身由 capability 解鎖。

## 三種文明 G1.5 切片
**Riverborn**：糧食+人力，農地加產，遭封鎖有糧食壓力。
**Ascetics**：地區靈力流量+修行時間，少量精銳單位，能以儀式轉換特定物資，但非無成本。
**Machina**：能源+零件，用礦產／可燃物加工，供能不足降低產能而非整張棋盤爆炸。

選擇取捨：搶沃土／守靈脈／控制能源點；每個文明至少兩個有效的求生策略，任一瓶頸至少有兩種**可觀測且成本不同**的對策（搶地／貿易／改配方／省能源等）。

## UI 契約
`ResourceSummaryVM = {bottlenecks, predictedNextTurn, suggestedResponses, hiddenDetailsToken}`；每個地圖情境頁最多顯示 1–3 個主要瓶頸、展開才看數據。不能每新增一個資源就在首頁新增永久欄位與子頁。
