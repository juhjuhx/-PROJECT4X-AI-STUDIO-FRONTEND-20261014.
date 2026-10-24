# 34｜世界層、星際尺度與不停機的後期 v0.4

**使用者確認**：選 C，進入外太空以後原本的大陸政體、生態與文化仍運作，玩家可在尺度間切換；玩法不是一張地圖無限放大。

## 分層地理
`SurfaceWorld -> Ocean/Air -> OrbitalLayer -> PlanetarySystem -> InterstellarLayer` 是**長期擴充的概念邊界**，不保證每層都實作。每層有 `MapTopology`, `TravelEdge`, `LocalTurnSchedule`, `AggregatedResourceFlows`, `ObservationRules`。單一 authoritative 世界版本統合多個層；不是每層各自隨機自行決定勝負。

## 多尺度必須讓玩家有選擇
地表維持人口、農業、文化與資源；軌道關係影響偵查、防禦與交通；星際地圖決定遠程外交、遷徙及世界秘密揭露。每個層級只在玩家可操作時展開細節，其他使用可重播的 region-level aggregate，避免 1,000 個星球每回合都做逐單位 AI。

## 征服以外的勝利與繼續
`MilitaryConquest` G1，日後 `AllianceHegemony`, `CulturalLegacy`, `SurvivalDominance`, `ScientificRevelation` 均為提案而非已實作；每種勝利需有**可觀測競爭進度、對抗方法、確定的觸發時點及冷卻條件**。完成勝利後可繼續 sandbox，保存 `VictorySnapshot` 並與不同世界層的勝利事件並存。

## 可維護性契約
原本地表世界不可在新增 orbit DLC 後被替換成『抽象分數』丟棄；顯示低解析不代表規則不運作。按地區稀疏更新，跨層交通走顯式 `TravelOrder` 而非瞬間移動；Worker 候選提案保持單一 commit 順序。引擎跟不上時先縮小有效單位粒度和採事件增量結算，不先全部重寫 Rust。
