# Playable Demo 0.2 Candidate｜執行與恢復入口

版本0.2為PROPOSED；目前產品仍0.1.0／g1-ccts-1。主線改為交付可下載Web/PWA Demo，不等待C5全部收斂。

## 約束與順序
- 保全R605未提交研究與所有舊evidence；不把17個局部測試當實驗GO。
- 單一GameState/applyCommand；UI只用GameplayPort。軍事winner與Demo完成狀態分離。
- 不改正式AI；不push/merge main，不執行遠端安裝器。
- 沿用D3 D Hybrid的色彩與呈現；新增發行UI只做必要接線，重大美術另交Gemini。
- 新兵種／科技／地形數值、ruleset或schema變更先提案，不靜默升版。

## 垂直切片
- [x] P0 恢復來源、盤點、讀設計歷史、提交Initial Brief。
- [x] P1 固定Addy官方commit，審license／hooks／依賴，僅專案局部文件與registry。
- [x] P2 先修實際favicon缺資產，保留Browser零錯誤斷言，fresh Browser／原220 Gameplay。
- [x] P3 主選單＋已有合法玩法＋Observation-only敘事包＋獨立探索完成狀態；不合成winner。
- [x] P4 Web/PWA離線與更新策略、安裝說明、資產來源、可解壓啟動候選及SHA manifest。
- [x] P5 全功能矩陣、六兵候選／三科技路線／新地圖互動提案、Relic遷移評估；數值待裁決。
- [x] P6 fresh測試／桌機手機模擬／獨立review／來源封存／checkpoint。
- [ ] P7 [BLOCKED：無JRE/完整SDK，未自動安裝] Android具備才建置驗證；工具鏈缺失列BLOCKED，不自動下載大型SDK或宣稱APK成功。

## 目前位置

P0–P6工程與本機Demo/PWA候選已驗證；封包CRC/hash/解壓還原的最終狀態看交付根DELIVERY-VERIFICATION。P7 Android BLOCKED；真人/真機/公開HTTPS與完整Alpha仍未驗收。新玩法未實作，提案與驗收規格已整理，等主創試玩後裁決。唯一工程續作以NEXT-ACTION為準。
