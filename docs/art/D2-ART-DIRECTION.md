# PROJECT-4X · D2 美術總監指導方針 (D2 ART DIRECTION)
## 核心代號：PROJECT4X-MISTBOUND-DIORAMA-D2
**主創裁決狀態**：`USER_CONFIRMED`

### 1. 三維比例構成 (The Tri-Ratio Constitution)
* **70% — Grounded Miniature Diorama (實體微縮沙盤)**：
  * 地貌如同一塊精雕細琢的桌上地形模型，擁有具備重量感的岩石厚度、自然起伏的泥土草甸、真實的樹木量感。
* **20% — Hand-Painted Civilization Atmosphere (手繪文明史詩氣氛)**：
  * 邊框猶如古典軍事地圖集的青銅裝訂與羊皮紙記錄，字體帶有歷經風霜的史詩感，而非冷冰冰的科技軟體。
* **10% — Restrained Cinematic Animation (克制的光影演出)**：
  * 精準的選取光輝、晨光反射、戰鬥揮砍反饋、遺跡共鳴，絕不用炫目廉價的粒子特效破壞沙盤的肅穆靜謐。

---

### 2. 嚴格設計禁令 (Strict Prohibitions)
1. **禁止 Google Material Design**：不允許浮動半透明白卡片、大半徑圓角藥丸按鈕。
2. **禁止 SaaS 控制台排版**：這是一款文明策略遊戲，不是電商後台或系統監控儀表板。
3. **禁止抄襲競品素材**：借鑑 Polytopia 的可讀性、Bad North 的微縮質感與 Dorfromantik 的地形連續性，但所有向量頂點與幾何代碼均為原創。
4. **禁止虛偽的 Mock UI**：未實作的科技與建築僅作為「時代展望概念預覽」，絕不提供無法產生 GameState 效果的假按鈕。

---

### 3. 主光源與光影契約 (Directional Lighting Contract)
* **光源方向**：西北方向晨曦斜射光 (North-West Directional Light, Vector [-1, -1, 1.5])。
* **頂面 (Top Face)**：吸收天空漫反射，呈現純淨鮮明的自然色調。
* **左面 (Lit Facet)**：受晨光正面照拂，中間調帶有微弱環境高光。
* **右面 (Shadow Facet)**：處於陰影背光面，濃郁暗調，強調地盤量感。
* **接觸陰影 (Contact Shadow)**：單位基座與建築底部具備精準的橢圓形地面吸收陰影 (`rgba(12, 26, 21, 0.38)`)。
