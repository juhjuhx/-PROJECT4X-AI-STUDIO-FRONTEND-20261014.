# D3 原始候選獨立審查（整合前）

審查日期：2026-10-18。範圍是 `gemini-d3-quarantine/` 原始 D3 與固定 C2 commit `e5bc16fedde9245e29284a4ec954299212089139`；不是後續 C3 整合結果。沒有改 project 或 quarantine 的任何檔案。已讀 canonical `code-review-excellence`、`systematic-debugging`、C0-SOURCE-AUDIT 與正式前後端契約。

結論：原 D3 **整包採納 REQUEST_CHANGES**；可把四個 presentation 檔案的變更拆成函式級移植。下列反例成立不等於整局玩法修復或瀏覽器驗收。

## 阻擋與可重現反例

| ID | 優先級 | 原 D3 精確位置 | 根因、反例與最小處理 |
|---|---|---|---|
| D3-01 | P1 | `src/main.ts:15–60` | 用錯誤訊息 `querySelectorAll`、`shadowRoot` 或 stack `<anonymous>` 推定外掛錯誤；第一方 `http://127.0.0.1:5173/src/main.ts` 的 `TypeError: querySelectorAll failed…` 被 preventDefault 並 stopImmediatePropagation，後續 error listener 收到 0 次；第一方 anonymous rejection 也被吞。整段不採納，保留原生 error/rejection 可觀測性。 |
| D3-02 | P1 | `src/main.ts:63–87` | 改寫 Element/Document/DocumentFragment 原生 selector prototype，將 `''/#/./:` 從 SyntaxError 改成 null/empty NodeList，掩蓋呼叫端 bug，影響全部第三方與第一方 DOM。整段不採納；修錯誤 selector 的真正呼叫點。 |
| D3-03 | P1 | `src/main.ts:89–110,461–546,788–877` | D3 仍直接持有 canonical GameState、AI timer、dirty 與 core persistence，基線是舊 `c21b16c`。覆寫 C2 main 會移除 GameSession、實例 stamp、session publication、stale-version 匯入保護及檔案 capability 分離。不得整檔覆寫。 |
| D3-04 | P2 | `src/ui/map.ts:479,501` | owner undefined 的 explored site 走敵方屋頂 `#8f4a3e`、`敵方據點`；flag 才走中性色。實碼 drawSite 記錄證實四分類中的 unknown 被誤標，不是已證實洩露真 owner。依 Observation 四分支處理 own／known enemy／null neutral／undefined unknown；不可查 GameState 補資料。 |
| D3-05 | P2 | `src/ui/map.ts:501` | centerOf 存在便硬編碼 own=`曙光城 · 首都`、enemy=`暮星城 · 敵都`。`name=聚落1,owner=0,centerOf=0` 的合法異地中心被畫成曙光城。使用觀測 site.name，centerOf 僅決定「政治中心」標記；site.kind 只代表歷史類型。 |
| D3-06 | P2 | `src/main.ts:636–638,655,674–675` | 從「沒有合法 Recruit、空據點、gold>=4」推斷本回合已徵召。真 core 依序執行己方 infantry Move 與 EndTurn 後，據點 canonical recruited=false、gold=8，但合法行動為空，D3 顯示本回合已徵召。只以 action 決定可操作性；無明示公開原因時顯示通用不可招募或精確已知條件，不反推秘密/未公開規則狀態。 |

## C2 必須保護的接線

C2 main 原始函式完整切片與 SHA256 在 `independent-D3-logs/C2-protected-functions.json`。至少保護：

- composition root `createGameSession` 與 `DeepReadonly` imports、`gameplay/files/dispose` 分離；不得重新匯入 applyCommand/observe/chooseAction/deserializeGame。
- `canAct`（C2:244）從 snapshot.ai.phase 讀狀態；`isLegal/makeActionButton`（252/256）仍以正式合法 Actions 禁用按鈕。
- `dispatch`（324）：同 snapshot 讀 sessionId/generation/version，提交 requestId；duplicate 不重複通知或行動，讀 result.snapshot.observation。
- `render`（344）只用 gameplay.getObservation 與 snapshot AI phase；D3 只能加 data-tab 等 DOM 更新。
- `updateSaveNotice`（494）、`saveLocal`（500）、`confirmReplacement`（512）：dirty 來自 snapshot；localStorage 成功後才 acknowledgeSave(file.stamp)。
- `showReplacement/newGame/loadLocal/download/importFile`（516/524/533/545/557）：保留 stamp、先驗後換局、檔案私有文字界線；下載不自動清 dirty；File.text 等待前取得 expected stamp，等待後由 session 拒絕 stale version/generation。
- `continueAI`（143）呼叫 gameplay.resumeAI；`gameplay.subscribe`（604）是唯一事件入口，`pagehide`（614）呼叫 dispose；不移植 D3 beginAI/stopAI/replaceGame。

## 最小函式級採納方案

1. 以 C2 main 為底，採用 D3 的 deckNav/tab DOM（216–266）與 switchTab（243）；在 C2 inspectCenter/selectUnit/clickTile 加切回 inspect 的 UI 操作。配套 CSS 的 `[data-tab]` 隱藏規則在 1531–1570，兩端必須同步，避免手機無法到達科技/城邦面板。
2. 移植 D3 renderInspection（580）、renderUnits（707）、renderTech（727）的 DOM 結構，保留 C2 DeepReadonly/view/action helpers；刪除 D3-06 推論。招募/研究按鈕只能呼叫原 C2 makeActionButton/dispatch；概念科技不得新增 Actions。
3. map 可採 D3 drawing/camera/hover 方法，但保留 C2 DeepReadonly<Observation/KnownTile/Unit> 接收型別與唯讀意義；修 D3-04/05。map 不取得 files 或 canonical state，不解析存檔補畫。getCamera/screenToWorld 只提供相機資料；`window.__map` 除 QA 需要外不宜額外公開。
4. CSS 與 HTML 是 presentation 可採範圍；本審查未跑瀏覽器，不能核准實際觸控、對比、排版或真機。原 CSS 無新增外部 url/@import，HTML 只有 meta 增補。
5. 本輪不可用 package/vite/license-status 等整包改動附帶取代 C2 工程設定。D3 三份標記文件缺失，由 root 以 RECONSTRUCTED_BY_CODEX 重建時需清楚區別原件。

## Source／LICENSE 驗證

精確清單在 `independent-D3-logs/source-identity.json`。C2 與 D3 的 core 四檔、package-lock、根 LICENSE byte-identical；UI 四檔有差異。

`STAGE3-SOURCE-MANIFEST.json` **40/40 SHA256 相符**。解析規則：一般項目以 quarantine 根目錄的完整 relative path；只有 evidenceAssets 明確解析為 `證據/<name>`，沒有通用 basename 搜尋。完整逐項路徑見 `manifest-exact-path-verification.json`。

根 `quarantine/LICENSE`、根 `project/LICENSE`、C2 commit `LICENSE`、Stage 3 manifest LICENSE 都是 `bbf159bfa50d6f1f088504e822cfe2d7964b80fd504a64386b6151e99e03ea4e`。先前 39/40 是路徑稽核假陰性，不能列為 D3 授權缺陷。

## 本次窄驗證與限制

- 命令：`node --input-type=module -`，完整 stdin、UTC、stdout/stderr、exit 0 在 `independent-D3-logs/counterexamples.log`；Node v26.10.0。使用現有 esbuild 在記憶體轉譯，未安裝依賴，未寫 source。
- 六項反例 assert 通過：第一方 error 被吞、anonymous rejection 被吞、selector 原生契約被改、unknown owner 敵方表現、異地政治中心錯名、對手回合誤報徵召。
- guard 實碼在 VM/EventTarget 執行；selector 的 DOM 以 mock 建立 SyntaxError 基線，不聲稱已驗實際瀏覽器。map 是原 WorldMap.drawSite 實碼搭配 Canvas recorder；招募推論是原 main 的三行實碼，輸入取真 core 的兩條合法 command 後 Observation。
- `counterexamples.json` 是結構化結果；`C2-D3-source-diff.log` 是固定 C2 commit 對原 D3 UI 四檔差異。
- 沒有啟動 browser/server、沒有新 dependency、沒有改 project/quarantine、沒有 full100 或玩法 gate 擴大主張。此報告不取代 root 的 C3 最終驗證。
