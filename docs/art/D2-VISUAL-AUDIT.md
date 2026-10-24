# PROJECT-4X · D2 視覺稽核報告 (VISUAL AUDIT)
## 針對 D1 版本的缺點與 D2 改革對照

### 1. 視覺焦點與地圖佔比 (Visual Focus & Map Area)
* **CURRENT**：
  * 早期版本地圖外圍帶有大量留白，右側面板占用過多寬度，使得 24x24 大地圖在桌面版只能縮在左半邊。
* **EXPECTED**：
  * 地圖為主體沙盤，佔桌面可見視口 $\ge 60\%$ 以上；手機版首屏高度 $\ge 45\%$。
* **ROOT_CAUSE**：
  * 舊版採網頁 Dashboard 排版 (`display: grid; grid-template-columns: 1fr 380px`)，外加過大 margin/padding。
* **PROPOSED_CHANGE**：
  * 緊湊化標題欄（brand & resource banner），擴大地圖畫布比例；手機版保留安全邊界並使用緊湊控制條。
* **FILES**：`src/styles.css`
* **ACCEPTANCE_TEST**：`scripts/qa-stage2.mjs` 中的 `mobileMetrics` 量測，確認 canvasRatio $\ge 0.45$。

---

### 2. 單位辨識度與戰術層次 (Unit Readability)
* **CURRENT**：
  * 單位主要以圓形徽記內的線條符號標示，在小縮放比例下步兵、斥候與弓兵容易混淆。
* **EXPECTED**：
  * 微縮兵棋造型：步兵具備重盾與短劍輪廓；斥候具備披風與輕裝風鏡；弓兵具備巨大長弓弧線與腰間箭袋。
* **ROOT_CAUSE**：
  * 原先採用純抽象線條符號，缺乏體積與裝備輪廓。
* **PROPOSED_CHANGE**：
  * 重構 `drawUnit()`，加入實體金屬兵模底座、差異化裝備幾何、刻石血量條與休息印記。
* **FILES**：`src/ui/map.ts`
* **ACCEPTANCE_TEST**：Playwright 在 1440x900 與 390x844 下捕捉清晰的兵模截圖。

---

### 3. 據點招募與軍事操作路徑 (Recruitment Path)
* **CURRENT**：
  * 玩家點選城邦時，若城內有守軍，按鈕直接變灰或顯示錯誤，新手誤以為無法徵兵。
* **EXPECTED**：
  * 醒目的「城內已有部隊駐防」警示框，清楚指引「請先移開駐軍，才能在此招募」，並提供一鍵選取守軍按鈕；部隊移開後自動亮起招募指引。
* **ROOT_CAUSE**：
  * 缺乏據點占位防呆 UX 與駐軍引導。
* **PROPOSED_CHANGE**：
  * 在 `src/main.ts` 中的 `render()` 注入 garrison alert 與單位卡片防呆說明。
* **FILES**：`src/main.ts`, `src/styles.css`
* **ACCEPTANCE_TEST**：`scripts/browser-check.mjs` 中的移動守軍後成功招募測試 PASS。

---

### 4. 介面風格與材質一致性 (Style & Texture Discipline)
* **CURRENT**：
  * 部分按鈕與狀態外框仍帶有圓角藥丸（Pill Badges）或扁平網頁標籤感。
* **EXPECTED**：
  * 貫徹零藥丸紀律（Zero-Pill Discipline），採用微縮石板刻印銘牌、青銅金屬線、深松綠與暖羊皮紙配色。
* **ROOT_CAUSE**：
  * 早期殘留的 Bootstrap / Material 式樣。
* **PROPOSED_CHANGE**：
  * 全面替換為古典雙線鑿刻邊框與古典襯線體 (`Songti TC`, `Noto Serif TC`)。
* **FILES**：`src/styles.css`, `src/ui/map.ts`
* **ACCEPTANCE_TEST**：DOM 檢查無純裝飾性藥丸 pill classes。
