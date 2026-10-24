# PROJECT-4X 設計代幣 (DESIGN TOKENS)
## 樣式變數、色彩代碼與排版規範

### 1. 核心調色盤 (Core Palette Tokens)

```css
:root {
  /* 基礎主調：古代羊皮紙與石材 */
  --color-parchment: #ece5d4;
  --color-parchment-deep: #dfd8c3;
  --color-parchment-light: #f7f3e8;
  
  /* 深邃文明基底色 */
  --color-pine-deep: #243b34;
  --color-pine-surface: #1a2f29;
  --color-pine-border: #365349;
  
  /* 戰術青銅與黃金 */
  --color-bronze: #b88c4a;
  --color-bronze-light: #d8af6e;
  --color-bronze-dark: #8c6328;
  --color-gold-glow: rgba(216, 175, 74, 0.35);

  /* 自然植被與大地 */
  --color-moss: #657955;
  --color-moss-light: #8fa679;
  --color-limestone: #b3a58c;
  --color-ocean: #457987;
  --color-ocean-deep: #2c515c;
  
  /* 戰損與警戒 */
  --color-vermilion: #a83e30;
  --color-vermilion-soft: #fbf0ee;
  --color-vermilion-border: #dca39a;

  /* 文字墨水 */
  --color-ink: #182823;
  --color-ink-muted: #4f6158;
  --color-ink-subtle: #798c83;
}
```

---

### 2. 字體系統 (Typography System)

* **主標題與城邦史詩字體 (Epic Serif Titles)**：
  - `font-family: "Songti TC", "Noto Serif TC", "Cinzel", Georgia, serif;`
  - 沉穩厚重、具備古典文明刻印感。
* **戰略數值與軍備文字 (Tactical & Numerical Data)**：
  - `font-family: "PingFang TC", "Noto Sans TC", system-ui, -apple-system, sans-serif;`
  - `font-feature-settings: "tnum" 1;`（等寬數字，確保金幣、生命值、回合數絕不抖動）。
* **座標與系統代碼 (Monospace Data)**：
  - `font-family: ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, monospace;`

---

### 3. 邊框與陰影語彙 (Chiseled Borders & Depth)

* **雕琢石板邊框 (Chiseled Stone Border)**：
  - `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 3px 8px rgba(18, 32, 28, 0.16);`
* **青銅邊線 (Burnished Metal Line)**：
  - `border: 1px solid var(--color-bronze);`
* **實體按鈕點擊感 (Physical Tactile Buttons)**：
  - 未按下：`transform: translateY(0); box-shadow: 0 3px 0 var(--color-bronze-dark);`
  - 按下（Active）：`transform: translateY(2px); box-shadow: 0 1px 0 var(--color-bronze-dark);`
