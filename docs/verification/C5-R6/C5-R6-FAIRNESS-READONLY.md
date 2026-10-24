# C5-R6 勝者分布｜獨立唯讀研究

R5歷史100局為actor0勝76、actor1勝11、13未終局；本文件與R6-01攻城反例分開。沒有修改生成器、先手、資源、數值或勝負規則，也沒有把控制實驗與正式Full100混算。

`r6_fairness_readonly` 審閱 `src/core/game.ts`、`ai.ts`、`persistence.ts` 後回報；root另實跑100次 `createGame('獨立QA-001'…'獨立QA-100')` 與地形可通行BFS，沒有執行AI、applyCommand、observe或鏡像對戰。安全數值收據在專案外R6 `fairness-readonly.json`。這是QA讀取生成世界，未提供給AI。

| 村莊數 | 地圖數 | actor0最近中立村莊平均步數 | actor1平均步數 |
|---|---:|---:|---:|
| 3 | 35 | 6 | 17.286 |
| 4 | 33 | 6 | 13.242 |
| 5 | 32 | 6 | 6 |

計算忽略單位交通與視野、只計既有地形通行，不是玩家已知路程。actor0較近68張、同距32張、actor1較近0張；100張地形皆非完整180度鏡像。

CONFIRMED：`game.ts` 的固定村莊座標清單採前3–5筆，非依兩側配對抽樣；actor0固定先手、ownTurns初值1/0。雙方初始gold8、同兵種與HP、起始位置為旋轉對應；單位／科技成本及CCTS存續／勝負條件對稱。AI依view.actor選己方，未發現actor0專屬策略，但絕對座標與單位ID的確定性tie-break不保證旋轉／重新命名等價。

UNVERIFIED：以上各項對76：11的因果貢獻。地形不鏡像本身也不能證明偏向特定actor。不能用相關性宣稱已查明勝率根因。

PROPOSED：獨立比較先手交換、初始位置／單位ID交換、旋轉世界控制。不得簡單改active後冒充正式可Save/Replay對局：`persistence.ts` 會重建createGame(seed)並驗history與初始turn關係。控制實驗需要獨立QA方法及清楚來源，不在本輪修改權威schema或合法性驗證。
