# 可修改邊界與整合不變條件

## 可編輯

- src/styles.css：token、responsive、間距、排版、motion/a11y樣式。
- src/ui/map.ts：原創draw*、鏡頭與pointerUX；WorldMap只收Observation，onSelect(Point)語意及合法action提示保留。
- src/main.ts內presentation（DOM建立、renderInspection/Units/Tech/Journey、modal文案/布局）：可改元件表現，保持資料來自view、常數只讀、合法action dispatch。
- index.html：metadata/語言/視覺載入；#app與真入口保留。

## 禁止修改

src/core/**、tests/**、scripts/headless.ts、scripts/verify.mjs、package-lock.json，以及ruleset/bundle/contentHash/schema。不得降低門檻、變更seed勝負／battle／economy／research。新增dependency/package變更先回工程側評估，前端階段不自行安裝模型SDK。scripts其他驗證/serve應保留；若確需工具修正附獨立diff與原因。

main.ts是耦合最深的外層，**禁止整檔取代**：保護state ownership、dispatch:329–351、beginAI:354–410、stopAI、replaceGame:585–597、save/load/import:566–647、requestSession/generation/expectedVersion及validate-before-replace。顯示不可改state字段。保護relic cancel與updateRelic的必答機制。行號僅方便定位，以函數名與原source為準。

## 最小adapter建議（PROPOSED，未實作）

若UI元件化確有需要，將現有協調外層包為 `{ getObservation(): Observation; submit(action: Action): void; subscribe(listener): unsubscribe; }` 與save/load入口。adapter由工程側保有GameState；UI只收唯讀投影與能力回呼。不能讓UI收到setState或任意patch。Viewer Events專用投影型別尚NOT_IMPLEMENTED：ApplyResult.events目前只有通用成功字串，observe不含events；main手札由己方actionLabel/notify產生，不能把history/fullsave變UI event bus。這不是遠端API，也不增加backend。

不要為縮包提供只有mock的空頁：本前端包保留真引擎、真AI、tests和productiondist。fixture若新增只用observe輸出的投影，標來源與合成範圍；worldtruth不得送renderer。完整save含truth僅供私下備份。

## 回整合順序

1. 驗return包manifest與base hash，將UI檔變更放新isolatedcopy。
2. 審禁止範圍diff（任何變動須停止UI整合並列出原因）；不覆寫原未提交工作。
3. check→44tests→build→productionbrowser7情境＋新增UI場景。
4. 對照screens、console/asset hash、touch/keyboard/reduce-motion、fog/API契約。
5. 真機與真人playability另列；保留full100FAIL。無push/merge/publish授權。
