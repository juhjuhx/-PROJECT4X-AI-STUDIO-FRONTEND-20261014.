# PROJECT-4X 資產與圖元指南 (ASSET GUIDE)
## Canvas2D 向量圖元、裝飾符紋與圖形渲染規範

### 1. Canvas2D 程式化圖元清單 (Procedural Primitives)

PROJECT-4X 採用零外部未授權圖片相依性（Zero External Proprietary Assets）的架構，完全藉由 HTML5 Canvas2D 程式化向量幾何建立微縮模型世界。

#### A. 地形切面 (Terrain Slabs)
- `drawTile(tile, p)`：
  - 頂面菱形 (Top Diamond)：`p.x ± 38, p.y ± 21`。
  - 左切面 (Left Facet)：`[p.x-38, p.y], [p.x, p.y+21], [p.x, p.y+30], [p.x-38, p.y+9]`。
  - 右切面 (Right Facet)：`[p.x, p.y+21], [p.x+38, p.y], [p.x+38, p.y+9], [p.x, p.y+30]`。
  - 陰影與立體階梯：山脈（高 42px 岩峰）、丘陵（多層梯田平台）、森林（三棵交錯立體松樹）、平原（柔和草甸）、水域（深淺浪沫）。

#### B. 建築物圖元 (Settlement Structures)
- **歷史首都**：
  - 基底巨大石造城垛（主城厚重基座）。
  - 中層八角瞭望塔樓。
  - 頂部精金星穹圓頂（Gilded Dome）與高達 36px 的雙尾燕尾旗（Dovetail Banner）。
- **一般據點**：
  - 雙層方石守衛要塞，配備木質橫樑與小防衛旗。
- **中立村落**：
  - 圓形石木土墩部落、茅草屋頂與木柱走廊。
- **遠古遺跡**：
  - 懸浮神經方碑，附帶金黃色能量裂紋與呼吸光暈（Pulsing Amber Rune）。

#### C. 微縮兵模 (Miniature Figurine Primitives)
- **重裝步兵**：
  - 重型盾牌（雕刻十字橫紋）。
  - 戰術短劍（鋼鐵受光面與刃口反光）。
  - 羽冠重盔剪影。
- **斥候探險隊**：
  - 靈動輕裝剪影，斜挎疾風披風。
  - 探路風鏡與指向前方的探路標記。
- **長弓箭手**：
  - 巨大紫杉長弓弧線。
  - 滿弦待發的弓弦與羽箭箭鏃。

---

### 2. 授權與合規宣告 (License Compliance)
所有圖元皆為 PROJECT-4X 原創程式化幾何圖形，無任何自 Polytopia、Bad North 或 Dorfromantik 抽取的二進位圖片或專有資源，符合 MIT 開源授權規約。
