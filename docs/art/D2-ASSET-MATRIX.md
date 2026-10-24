# PROJECT-4X · D2 資產矩陣 (D2 ASSET MATRIX)
## 向量圖元清單、渲染函式與授權合規

| 圖元名稱 | 實作檔案與方法 | 技術參數 | 風格層次 | 授權狀態 |
|---|---|---|---|---|
| **平原地盤** | `src/ui/map.ts` `drawTile()` | 多邊形填充 + 雙切面陰影 | A (70% Diorama) | 原創向量 (MIT) |
| **林地松樹** | `src/ui/map.ts` `drawScenery()` | 3 棵獨立坐標樹冠 + 樹幹投影 | A (70% Diorama) | 原創向量 (MIT) |
| **積雪岩峰** | `src/ui/map.ts` `drawScenery()` | 5 塊受光/背光幾何岩壁 + 雪頂 | A (70% Diorama) | 原創向量 (MIT) |
| **梯田丘陵** | `src/ui/map.ts` `drawScenery()` | 3 階等高抬升平台 | A (70% Diorama) | 原創向量 (MIT) |
| **海岸浪沫** | `src/ui/map.ts` `drawTile()` | 程式化平行白色半透明曲線 | A (70% Diorama) | 原創向量 (MIT) |
| **迷霧星軌** | `src/ui/map.ts` `drawTile()` | 弧度曲線 + 隨機種子光點 | B (20% Hand-Painted) | 原創向量 (MIT) |
| **重步兵兵模** | `src/ui/map.ts` `drawUnit()` | 28px 車削底座 + 方盾短劍輪廓 | A (70% Diorama) | 原創向量 (MIT) |
| **斥候兵模** | `src/ui/map.ts` `drawUnit()` | 28px 車削底座 + 斗篷獵弓風鏡 | A (70% Diorama) | 原創向量 (MIT) |
| **長弓兵模** | `src/ui/map.ts` `drawUnit()` | 28px 車削底座 + 長弓滿弦弧線 | A (70% Diorama) | 原創向量 (MIT) |
| **石刻生命條** | `src/ui/map.ts` `drawUnit()` | 26x5px 內嵌陰影石板條 | B (20% Hand-Painted) | 原創向量 (MIT) |
| **城堡要塞** | `src/ui/map.ts` `drawSite()` | 3 層城垛要塞 + 金穹頂 + 雙尾旗 | A (70% Diorama) | 原創向量 (MIT) |
| **遠古方尖碑** | `src/ui/map.ts` `drawRelic()` | 懸浮巨石 + 金色符文 + 光暈 | B (20% Hand-Painted) | 原創向量 (MIT) |
| **戰術目標十字** | `src/ui/map.ts` `drawUnit()` | 赤紅四角托架 + 可攻擊石牌 | C (10% Animation) | 原創向量 (MIT) |
| **羅盤指針** | `src/ui/map.ts` `drawCompass()` | 古典航海青銅圓盤 + 北向針 | B (20% Hand-Painted) | 原創向量 (MIT) |
