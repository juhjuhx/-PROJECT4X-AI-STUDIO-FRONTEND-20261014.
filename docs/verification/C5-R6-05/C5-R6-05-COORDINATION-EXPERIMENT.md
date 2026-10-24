# C5-R6-05 無記憶協同排序實驗
狀態：UNVERIFIED；正式AI不修改。

## 已授權範圍與計畫
這是使用者明確指定的隔離研究，不是正式新子系統。採root實作、獨立唯讀審查；不再為同一probe或每個文件要求確認。正式整合仍需獨立裁決。
1. 恢復來源與R604證據。
2. 預註冊反駁條件、收益／成本向量、8類以上負面、通用性與效能上限。
3. 先以原core建立短合成正負fixture，確認E實際行為；實驗stub先做RED，不冒稱一般產品RED。
4. 最小candidate只收Observation，回一個現有legal Action；後續重新觀測，不保存計畫。
5. 比較原45／16／crop324同初態2/4/8ET，不跑Full100。
6. 同觀測交錯benchmark、fresh既有回歸、獨立review、GO/NO-GO、checkpoint。

## 先固定的判準
預註冊完整bytes位於本輪專案外PREDECLARED.json，Source Manifest完成時索引其SHA。主要維度是據點、可用攻擊／佔領窗口、雙方兵力、己方損失、招募成本；只接受至少一維更好且其餘不劣的Pareto改善。其他交換列TRADEOFF，不加權求總分。
上限：32個第一步Move、24友軍、8可見敵，整次8192 BFS展開；超限整次回退E。證書最多兩次Move＋條件Attack，並非未來合法性保證。效能同批view交錯100樣本，additional median≤3ms、p95≤10ms、absolute p95≤20ms，與完整對局效能分開。
R604交通機制CONFIRMED，但通用RED仍UNVERIFIED_ROOT_CAUSE；本輪不將舊混合收益改寫成PASS。

## 2026-10-24 優先序切換與未完成項目
使用者改以Playable Demo為最高目標。此實驗保存但未整合：正式AI／schema完全未改。
目前17個隔離tests通過，兩個合成探針曾取得實驗stub RED→GREEN；未知路徑手改view僅為投影健壯性，不能稱正常core觀測。真實45／16／crop對照、通用性、matched效能與GO／NO-GO尚未執行。
Reviewer提出「讓位後fallback E未必完成條件證書」等待驗風險；不能把證書數當擊殺／Capture實現率。城市證書也包含中立據點上的敵兵，沒有全部當已知敵城。
私人原始紀錄：../evidence/C5-R6-05-20261023-210415-6b8596e7，含預註冊與全部失敗attempt。後續研究另立切片，不阻塞Demo，不將此中間成果宣稱GO。
