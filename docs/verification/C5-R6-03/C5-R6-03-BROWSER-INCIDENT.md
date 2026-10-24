# C5-R6-03 Browser 事件與 D3 資產交接

**Browser Gate：TESTED_FAIL。手機情境：UNVERIFIED。** 缺漏favicon尚未修復；本輪僅修補獨立QA收據缺口，不以局部回歸PASS升級Browser。

## Q-ICON：缺漏靜態資產

實際E產品SHA6007de6a…169f、AI972f564e…9b67。index.html沒有rel=icon，public/、assets/、src/assets/皆不存在；原E build只有HTML/JS/CSS。嚴格serve.mjs只服務dist真檔，未提供預設favicon。既有E Network probe的唯一console error location明確為/favicon.ico，pageErrors為空；舊B相同artifact也重現。probe的responses=[]不是「沒有404」，瀏覽器內建請求不一定進Playwright response事件；probe exit0僅代表診斷完成。

本輪先重新build，確認目前dist與原凍結E三檔SHA完全相同，JS是index-XheqdjvP.js；恢復前project/dist曾是舊B，不沿用它宣稱E驗證。新一次性HTTP probe：GET/HEAD /favicon.ico皆404；HTML及實際JS/CSS皆200且hash吻合，服務finally關閉。證據在專案外本輪STATIC-ASSET-PROBE.json。HTML未宣告icon＋請求URL支持「瀏覽器預設favicon請求」的推論，但沒有捕捉initiator，不將推論寫成實測。

恢復後第一次probe因舊本機服務已無法連線而失敗，另存STATIC-ASSET-PROBE-ATTEMPT1.json；這不是遊戲斷言，服務終止原因UNVERIFIED。後續一次性服務成功，不覆寫第一次失敗。

Vite設定未覆寫publicDir/copyPublicDir；其預設public資產會複製入dist，但此專案沒有資產可複製。沒有證據支持harness偽FAIL，不能忽略404、攔截假成功或降低零錯誤斷言。

## Q-EVIDENCE：桌面錯誤收據缺口

原browser-check.mjs的桌面const errors=[]只保存在區域陣列；assert失敗仍寫PRIMARY_TEST_FAILURE與stack，所以整體FAIL正確，但頂層evidence.errors空陣列造成調查不完整。

最小修補只有const errors = evidence.errors。console/pageerror及資產核對錯誤仍由原callback寫入，沒有吞錯、沒有改斷言／scenario contract／220門檻。

新增scripts/qa-browser-error-evidence-check.mjs為手動真Browser負測試：必須指定同源build URL與唯一evidence目錄，依賴尚未解決的真404 fixture。RED：child Browser仍404 FAIL且cleanup PASS，但errors[]空，所以第24行assert真正失敗。GREEN：child仍404 FAIL、cleanup PASS，errors現保留一筆404，負測試exit0。RED/GREEN同產品artifact與同負測試source SHA。

該工具沒有加入通用npm健康檢查；favicon修好後fixture消失，它應失敗。它檢驗任意404文字保存，不能單獨證明/favicon.ico身份，也沒有獨立覆蓋pageerror/warning；精確URL另由Network/HTTP probe證明。不能拿此GREEN當Browser PASS。

本輪fresh check／195tests／build PASS。原220 qa:gameplay實際209指令的真DOM旅程（Attack→Capture、Recruit、Research、ResolveRelic、EndTurn、Save/Load/Replay）與cleanup個別PASS；整體仍404 FAIL。手機迴圈位於零錯誤assert之後，未到達，不能沿用歷史11情境作本輪PASS。

## 交給Gemini D3的具體需求（PROPOSED／BLOCKED資產交付）

沿用主創已核定D3視覺，不另作品牌或UI改版。

| 檔案／owner | 必要交付 |
|---|---|
| public/favicon.ico／Gemini | 真ICO，包含常用16、32、48px版本；原創或授權清楚，不能用Polytopia專有素材 |
| index.html／Gemini提出小diff、Codex整合 | 明確rel=icon、相對href指向真資產；不改dispatch/session/UI規則 |
| 圖示來源與授權紀錄／Gemini | 作者、來源、授權、允許公開散布；與MIT/第三方授權邊界一致 |
| D3-CHANGELOG.md、D3-MODIFIED-FILES.json／Gemini | base HEAD、路徑、每檔實際SHA256與bytes，清楚列Q-ICON，不沿用舊manifest |
| FRONTEND-NEEDS.md／Gemini | 指出Codex需核對serve.mjs的.ico Content-Type；不由Gemini改工程腳本 |
| scripts/serve.mjs／Codex後續工程切片 | 資產到齊後最小加入合適.ico MIME並測試；本輪NOT_IMPLEMENTED，未改server |

Codex驗收：build後dist/favicon.ico與來源bytes/hash相同；strict production server GET/HEAD 200、正確Content-Type/Length；fresh Chromium實際load/reload無404；保留console/pageerror零錯誤與具名必要scenario/hash契約，完整browser11及原220 gameplay12（含真手機模擬及清理）全部實際執行。不能用空data URI、路由假回應或刪斷言取得PASS。

沒有向外部Agent／Gemini發送訊息，本文是本地可審查的交付需求。

