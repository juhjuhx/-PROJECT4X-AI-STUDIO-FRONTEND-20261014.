# C0｜來源、交付與風險盤查

盤查日期：2026-10-17（Asia/Taipei）。本輪按使用者指示先完成 C0/C1，沒有整合 Gemini 程式、沒有修改規則、沒有 push／merge。D2 完整 bytes 保存在外層 `Gemini-original.zip` 與 `gemini-d2-readonly/`；所有執行在 `qa-d2/` 或 C1 工作樹。

## 基線與來源

| 欄位 | CONFIRMED |
|---|---|
| CURRENT_BASELINE | GitHub `juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014.`；重新查詢 main=`c21b16cd75572d069369f41426f7323c63c05083`，不是引用舊聊天 |
| CORE_SOURCE | 該 SHA 的 `src/core/**` 四檔；Gemini 四檔全部 byte-identical |
| GEMINI_SOURCE | 使用者 `untitled (1).zip`；SHA-256=`bf9a2ddee457e598f85345b53456749bf603ee490d18e4c25a8f142210450a5e`；200 entries、148 files、4,342,499 解壓 bytes；CRC 無壞項、無 traversal／symlink |
| 交付身份 | 有 D2 文件與 Stage 2 source manifest；缺 `FRONTEND-NEEDS.md`、`D3-CHANGELOG.md`、`D3-MODIFIED-FILES.json`，按 D2 盤查，不能稱 D3 已交付 |
| CONTRACT_STATUS | 現有 core API 已盤查；C1 正式目標契約 PROPOSED；runtime NOT_IMPLEMENTED |
| GitHub CI | 遠端該 SHA 的 Core checks run 38535576030，completed/success；只涵蓋既有 check/test/build，並非玩法驗收 |
| 舊本機專案 | `PROJECT-4X-MVP` 分支 mvp、無 HEAD／remote，41 staged entries、1 untracked entry；不是 GitHub main 的可直接整合 checkout，原狀保留 |
| 本輪工作樹 | `integration/project4x-c1`，從已核對 main 建立；本輪改動只含文件與 docs 目標型別 |

倉庫名的最後一個 `.` 是實際名稱的一部分。CI 原始來源：[main commit](https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./commit/c21b16cd75572d069369f41426f7323c63c05083)、[Core checks](https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./actions/runs/38535576030)。本次只讀查詢顯示 repository 為 public；沒有更改 visibility。

## 差異與保護面

相對 main：7 modified、38 added、0 removed。修改為 `src/main.ts`、`src/styles.css`、`src/ui/map.ts`、`index.html`、`package.json`、`vite.config.ts`、`LICENSE-STATUS.md`。新增多為 D2 設計／QA 文件、截圖、metadata、`.env.example` 與 `scripts/qa-stage2.mjs`。不是只有文件；有真實 UI/source 差異，也已在實際瀏覽器看見新版地圖與手機分頁。

`src/core/**`、`tests/**`、`package-lock.json`、既有 `scripts/**` 均與 main 相同；scripts 只有新增 qa-stage2。dispatch、beginAI、stopAI、replaceGame、saveLocal、loadLocal、importFile、newGame、download 的完整函式段逐 byte 相同，保留 requestId、expectedVersion、generation、去重與先驗後換局。這是靜態比較，不等於新 GameSession 已實作。

## Source manifest 與截圖

逐項驗 58 筆 hash：51 相符、7 不符。三筆來自舊 `PUBLISH-SOURCE-MANIFEST.json` 的 baseline UI hash，應明示為 historical，不能繼續對 D2 宣稱 unmodified。**當前 Stage 2 manifest 有四筆真正不符：main.ts、styles.css、證據/browser.json、證據/stage2-qa-report.json。** 未自行改寫原 manifest 讓它轉綠。

Stage 2 的 `evidenceAssets` 用 basename，稽核時明確解析為 `證據/<basename>`；不是把 basename 當根檔案而誤報缺失。10 張交付 PNG 的尺寸與 SHA 已記錄，PNG hash 符合該 manifest；但不能因此證明它們對應後來改過的 main/CSS。本輪另由真實 dist 服務重拍桌面 1440×960、375×812／812×375／320×640 模擬觸控與遺跡對話框；原圖保持不變。模擬 viewport 不是實體 iPhone／iPad。

## INTEGRATION_RISKS

| ID | 嚴重度／結果 | 精確來源與影響 | 最小處理方向 |
|---|---|---|---|
| C0-01 | 高，CONFIRMED | D2 `main.ts:15–87` 以 querySelectorAll/shadowRoot/<anonymous> 等字串吞第一方 error/rejection，改寫原生 selector API；反例取消錯誤且阻擋後續 listener | D3 刪除該 guard；不以全域吞錯取代修 bug |
| C0-02 | 高，CONFIRMED | `qa-stage2.mjs:135–160` 僅 mouse drag，卻報 touch/pinch PASS；比 turn-status 不能證明無誤觸 Move | 真正多點 touch、camera zoom 與 state version 前後斷言；未測則 UNVERIFIED |
| C0-03 | 高，CONFIRMED | `qa-stage2.mjs:221–229` 兩個 DOM regex 可漏過含隱藏敵軍的文字，未測 Observation／Canvas 非干擾 | 觀測對等 fixture + rendering/event 差分，不把 regex 當完整 fog gate |
| C0-04 | 高，CONFIRMED | `qa-stage2.mjs:243–282,377–385` 找「移動至」但 D2 `main.ts:602` 實際按鈕只有座標；移動／遺跡可全跳過仍 gameplayCore PASS；只保存沒讀取 | 強制走必經遺跡與 load path；缺條件立即 fail；沿用舊 browser-check 的精確流程 |
| C0-05 | 中，CONFIRMED | D2 `map.ts:441,463` owner undefined 被畫敵色、標敵方據點 | 明確 own/known-enemy/neutral/unknown 四分支；不查 truth 補 owner |
| C0-06 | 中，CONFIRMED | D2 `map.ts:463` 將異地政治中心硬標成曙光城／暮星城 | 使用觀測中的 site.name，區分歷史首都與政治中心 |
| C0-07 | 中，CONFIRMED | Stage 2 當前 manifest 四筆不符 | D3 以最後實際 bytes 重算，附真實 source/bundle 關係 |
| C0-08 | 中，既有 | main 的 state/driver/persistence/render 耦合；download 發起即清 dirty；同步重建長歷史成本 | C2 漸進抽出；acknowledgeSave 與取消交易需回歸測試 |
| C0-09 | 玩法阻擋，歷史 TESTED_FAIL | 同版 full100 62/38、seed010 winner=null、T3/T6 FAIL | 本輪未重跑／修復，交 C5 建反例，不改門檻或 winner |
| C0-10 | 設計落差，NOT_IMPLEMENTED | game.ts:97–106 仍可見取得遺跡，與抵達優先的新裁決不同 | C6 migration proposal，保護舊版 save/replay |
| C0-11 | 文件風險，CONFIRMED | D2 STAGE2-KNOWN-GAPS 將 T3/T6 說成遺跡規則，並未附分析即斷定山谷／補給平衡是 seed010 根因 | 依真實命名空間與反例更新，不能用推測根因影響後續修復 |

C0-05 是錯誤情報表現，不是已證實讀到了隱藏 owner。C0-02/03/04 是 QA 證據不足，不等於觸控、fog、遺跡核心本體失效。原瀏覽器測試真的觸發遺跡，已通過；不能用它代替尚未存在的完整 touch／presentation-event 契約測試。

T3 是當前待辦的 AI 整局可靠性，T6 是整體審查／工程驗收；不是 npm test 的測試名，也不是遺跡規則 ID。歷史計畫另有同 ID 的回合／戰鬥項目，不能混用。full100 由 scripts/headless.ts 定義 `QA-001`–`QA-100`、4 workers、每局 800 EndTurn／40,000 commands 的診斷上限；scripts/verify.mjs 要求 100/100 真正 COMPLETE、source/method 同版，否則停止。詳原 `docs/handoff/TEST-RESULTS.md:26–30`；本輪保留定義，未重跑約 51 分鐘的 full100，也不宣稱 seed010 的第一策略失效點已定位。

## 新執行證據

環境 macOS 15.8.1 arm64／Apple M1、Node v26.10.0、npm 11.19.1、鎖定 TypeScript 7.0.2／Vite 8.3.4／Playwright 1.64.0，Chromium 156.0.8078.4。兩份來源均使用 `npm ci --ignore-scripts --offline`，沒有更新依賴。

| Source | 命令 | exit | 結果與限制 |
|---|---|---:|---|
| main | npm run check | 0 | TESTED_PASS |
| main | npm test | 0 | 44 pass / 0 fail / 0 skip |
| main | npm run build | 0 | TESTED_PASS |
| main | npm run qa:browser | 0 | 7 scenarios pass；含真正遺跡、保存、匯出、replay、壞檔、重讀及 tap |
| D2 | npm run check | 0 | TESTED_PASS |
| D2 | npm test | 0 | 44 pass / 0 fail / 0 skip |
| D2 | npm run build | 0 | TESTED_PASS |
| D2 | npm run qa:browser | 0 | 7 scenarios pass；真實載入新 dist，served asset hash 與本輪 build 相同 |
| D2 | npm run qa:stage2 | 0 | 腳本回 ALL_PASS；證據覆蓋 PARTIAL，C0-02/03/04 不接受其擴大主張 |
| D2 片段 | node evidence/c0-counterexamples.mjs（外層） | 0 | 反例成立；驗證吞錯、未知據點錯標、異地中心錯名、regex 假陰性；不是產品 PASS |

每次開始／結束 UTC、耗時、命令、exit、HEAD／無 Git 身份、source snapshot hash、完整 log 見 `C0-VERIFICATION.json` 索引與外層 evidence。main source snapshot=`f25cdc30535b79b619cd149209ccfd613522be52e5fd82d26858585bed5cd0a0`；D2=`675c365d0291106d33aad6c58cbf97fb054a9e77aa087aa64199d7bbcef470fd`。算法為指定 src/tests/scripts 及 package/lock/tsconfig/vite/index 的 path→SHA256 map，路徑排序、compact JSON、ensure_ascii=true 後 SHA256；完整 map 已保留。

未驗：完整雙指縮放／拖曳不產生 command 的不變量、視覺回歸自動 golden、真人／實體手機、45–90 分鐘、新契約 runtime、D3、C4/C5/C6。沒有 lsp_diagnostics callable tool；目標型別另用 tsc 嚴格檢查，不冒稱執行 LSP。

## 審查方式

已實際使用本機 OpenCodeReview v1.13.0 的 `delegate preview/rule --format json`，依專案規則由宿主審查；沒有呼叫外部 LLM endpoint。D2 workspace 45 個差異，OCR 選出 32 reviewable、排除 13（含截圖等）；每項 reviewed/skipped 理由在 coverage 記錄。舊 Git 2.39.5 低於 CLI 建議 2.41.0，命令仍 exit0；保留警告、不升級系統。

另委派獨立 reviewer，實際報告在外層 `evidence/independent-c0-review.md`，提出 6 個具體 findings 及記憶體反例；其最終對話因額度中斷，但已寫出的報告完整保留。協調者重新核對 protected functions、重跑片段反例與兩份工程／browser checks。這份 review 不代表 C1 型別已有獨立實作驗收，也不允許直接合併 D2。

結論：**C0 來源盤查已完成；D2 整包採納 NOT_PASS。C1 契約文件可交前端規劃；runtime 未完成。Playable Alpha NOT_PASS。**

C1 另完成獨立 spec review：publication 中 dispose/subscribe 的一處 P2 歧義已澄清並複核；其餘未發現 P0/P1/P2。review 對應契約最後 bytes `bac4afeb433838a445792b7c9cfdfce8d10212cf66f590228de41448753b18c5`，不取代 C2 實作測試，也不消除 C0 的 D2 採納阻擋。
