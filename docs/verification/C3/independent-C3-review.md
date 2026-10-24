# C3 最終獨立程式審查

審查日期：2026-10-18。基線為 C2 `e5bc16fedde9245e29284a4ec954299212089139`；讀取未提交的 C3 source、git diff、正式 frontend-core-v1 契約、C0 audit、新增 renderer/recruitment tests 與真 browser logs。使用 canonical code-review-excellence、systematic-debugging。reviewer 未修改 project；只寫外層報告與 `independent-C3-logs/`。

**結論：C3 的函式級 presentation 整合可採納；此範圍沒有尚未處理、足以阻擋本輪的 P0/P1/P2。** 本次找到的 P2 已經真實 RED→GREEN 修復。這是有範圍的工程審查，不是 Playable Alpha／完整無障礙／真人／實體手機驗收；full100、seed010、T3/T6 既有 FAIL 不受此結論覆蓋。

## 本次 finding 與修復複核

| ID | 原嚴重度／最終狀態 | 位置 | 證據與處理 |
|---|---|---|---|
| C3-R1 | P2，FIXED | `src/main.ts:340–353`；`src/styles.css:1531–1570` | compact UI 在 tech/journey 分頁點非己方單位格，原 clickTile 只改 selection 並 render，inspect 仍 display:none。reviewer 執行原函式片段，兩種分頁都維持舊 tab（exit1）；root 新增真 375px touchscreen.tap 回歸，真 browser RED 明確為 tech !== inspect。最小修正只在 selection=point 後加入 switchTab('inspect')（352）。reviewer 原片段再跑兩種 tab 均 GREEN；真 browser 顯示 inspect 可見、座標 4 · 5 且完整 privateSave 前後相同。 |
| C3-R2 | 格式檢查，FIXED | `src/styles.css:50,54` | git diff --check 原 exit2，僅 D3 帶入的兩行 trailing whitespace；root 清理後 exit0。逐行 rstrip 比對證明 CSS 僅此空白差異，無規則變化。 |

反例與複核保留 `map-to-inspection-counterexample.log`、`map-to-inspection-green.log`；第一次 VM harness 漏 HUMAN 的非產品失敗另存 attempt1-harness-error，未拿它當產品反例。root 真瀏覽器 RED 在 `C3-tab-red.log`／`C3-tab-red-artifacts/browser.json`，GREEN 在 `C3-final-browser-artifacts/browser.json`。

## 關鍵資料與操作邊界

- **canonical ownership 保留**：`src/main.ts:2–15` 仍只由 createGameSession 組合 gameplay/files/dispose；沒有重新匯入 core game/AI/persistence，也沒有 GameState、AI timer、第二 reducer。`src/core/**`、`src/session/**`、`src/presentation/**` 對 C2 git diff 均空白。
- **request/version/generation 保留**：`main.ts:369–386` dispatch 從同 snapshot stamp 取 sessionId/generation/version，submitAction 保留 request namespace、duplicate 直接返回；`main.ts:286–301` 保留 canAct、isLegal、makeActionButton。按鈕呈現不直接套用 command，不根據 UI 說明自造合法性。
- **檔案交易保留**：`main.ts:617–704` 的 updateSaveNotice/saveLocal/confirmReplacement/showReplacement/newGame/loadLocal/download/importFile 仍維持 C2 行為；localStorage 成功後才 acknowledgeSave(file.stamp)，下載不清 dirty，File.text 等待前取得 expected stamp，候選驗證與換局留在 files port。`main.ts:184` resumeAI 與 `728–737` subscribe/pagehide dispose 保留。
- **14 個關鍵函式內容一致**：canAct、sameAction、isLegal、makeActionButton、dispatch、render、updateSaveNotice、saveLocal、confirmReplacement、showReplacement、newGame、loadLocal、download、importFile 與固定 C2 正文一致；比較只剔除函式段末尾空白，完整 hash 表在 protected-functions-comparison-final.json。新增分頁與 HUD 沒有混入這些交易。
- **Fog／map 唯讀**：`map.ts:14,48` 維持 DeepReadonly<Observation>；draw 只由 view.tiles/view.units/view.legalActions 產生內容。renderer 不取得 files 或 canonical state。`map.ts:480,502` 對 undefined owner 明示未知並使用非敵方屋頂；null 中立、己方、已知敵方各有分支。centerOf 僅標政治中心，名稱來自 site.name，不以 site.kind 或陣營覆寫名稱。
- **招募說明使用公開資料**：`src/ui/recruitment.ts:7–15` 區分駐軍、待答遺跡、非己回合、合法候選、可知金幣限制；沒有從 Action 缺席斷言本回合曾徵召。`main.ts:481–539` 招募按鈕仍以原 makeActionButton 送既有 Recruit，敵方駐軍不提供可操作的己方移出按鈕。
- **native error safety 恢復**：原 D3 main 的全域 error/rejection guard 與三個 selector prototype patch 全部未採納。靜態來源審查與 boundary regression 均確認；真 browser 的 document/Element/DocumentFragment × querySelector/querySelectorAll 六次無效 selector 都拋 SyntaxError，第一方 error/rejection 都能被後續 listener 觀察且未 defaultPrevented。此 regression 是 synthetic event＋真 DOM，沒有宣稱故意觸發未捕獲產品例外。

## 真 UI 與測試證據

reviewer 獨立執行：

```text
node --import tsx --test tests/ui-map.test.ts tests/recruit-presentation.test.ts tests/session-boundaries.test.mjs
```

exit 0，6 pass / 0 fail / 0 skip；最終 log 為 `independent-C3-logs/narrow-tests-final.log`。包括實 renderer Canvas recorder 的 owner 四分類、異地政治中心，以及隱藏世界不同但 Observation 相同時 Canvas calls 完全相同；招募測試用真 core command 形成對手回合／pendingRelic。不是只驗 UI 文案 regex。

reviewer 另執行 clickTile 原實碼 VM（RED 與 GREEN）及 git diff --check（最終 exit0），沒有安裝依賴或另開 browser/server。root 執行的 browser/build 不冒稱 reviewer 自行重跑，以下為實際讀 log 並核對 source/artifact 的結果：

| root 命令／證據 | exit／狀態 | 可支持的主張 |
|---|---|---|
| npm test；C3-test-regression.log | 0，103 tests pass | 既有 core/session/AI/persistence/presentation 與新增 UI 窄測在該紀錄版本通過；不當全玩法 PASS。 |
| npm run build；C3-final-build.json/log | 0 | 同一 tested source snapshot 可型別檢查並產生 production bundle。 |
| npm run qa:browser；C3-final-browser.json/log | 0，11 scenarios PASS、errors=[] | 真遺跡／強制選擇、研究、移動、收入、招募、storage 故障、匯出不 ack、replay 摘要、壞檔保留、reload/load/request namespace、下一己回合新兵真 Move、鍵盤選格、native safety、mobile 分頁選格及 375/812/320 模擬 viewport 觸控／layout。 |

browser mobile 流程以 trusted CDP touch 輸入量測實 Canvas transform，單指平移／雙指縮放後 privateSave 完全相同；不是只看 turn-status。新增分頁回歸是 375px 真 touchscreen.tap、inspect 可見與座標斷言且 privateSave 不變。

reviewer 逐項核對最終 browser artifactHashes／servedAssets／servedIndexSha256 與當時 dist 檔案，**3/3 相符**。完整結果在 `artifact-and-diff-verification.json`。root 後續若再次 build，該證據只對記錄中的 bundle bytes 生效。

## 版本與 source hash

測試、build、11-case browser 的一致 snapshot：
`f6ad93e19df4762df2782796de041e518d9ca0e3c48a772bd39d55d587e3f4e3`。

清理兩行 CSS 尾空白後，本次最後審閱 snapshot：
`b4fcd134fe756fde4d337a86d948f6b9ce00b7946f4f206cd36bcb2a02e55aa5`。

兩者清單只有 src/styles.css bytes 變動，已驗僅行尾空白；root 將再以最終 source 重建／跑 browser 並收斂 manifest。後續新增 QA scenarios、文件或測試不能追溯改寫這次檢查所用的 snapshot。算法與完整逐檔 hash 見 `independent-C3-logs/reviewed-source.json`、`reviewed-source-tested-snapshot.json`。

| 審閱檔案 | SHA256 |
|---|---|
| src/main.ts | 02b2f8da137c70f193cc3fc8ab057f26a19a9fe96722b428825e9f4cc3fbd117 |
| src/ui/map.ts | 11312217cb0ff52adc559e5c16a130489ebfbc1d7e66c8279700029643b9857f |
| src/ui/recruitment.ts | b7d68346c63abcebb3e717706cd1dd3ea0e44dd99a9b589583db99f0299a31cb |
| src/styles.css | ba57e96af49d9970d40acb694bcc315491bfdffa6a4e29d3c2b55f6ea208b7b2 |
| scripts/browser-check.mjs | 3cabb2e21dfd6de3ce584cc399e1670931c16819f17ce5559488216b7d02794e |
| index.html | 2cba9dfddf627290207fd7411f778e1f00597c23b9f3e4bbbe89a84005f466fe |

## 保留的缺口與歷史資料解讀

- 真 Attack/Capture 連續 browser 旅程目前不在這 11 個 scenarios 中；不能從 Move/Recruit PASS 推定戰鬥／占領 UI 已驗。root 正另補 QA，不應改玩法來造通過條件。
- tabs 標準鍵盤行為與 tab/panel ARIA 關聯仍是 FRONTEND-NEEDS 已列後續；本審查不宣稱完整 a11y PASS。實體手機、真人長局、視覺美術核准也未完成。
- docs/art 原 D3 美術方向／規範是歷史來源與設計觀察；原文若提到完成／合規，不等於新的 C3 產品驗收。重建 D3-CHANGELOG/FRONTEND-NEEDS/D3-MODIFIED-FILES 有 RECONSTRUCTED_BY_CODEX，不能冒充 Gemini 原交付。
- 原 quarantine 的 Stage 3 manifest 以完整相對路徑核對是 **40/40**，根 LICENSE／C2／D3／manifest 均為 bbf159bfa50d6f1f088504e822cfe2d7964b80fd504a64386b6151e99e03ea4e。39/40 是已更正的 basename 稽核假陰性，沒有授權差異 finding。
- 最後 source manifest／重建文件的 integratedSha256 應由 root 依最終 bytes 更新，不能保留 tab 修復／CSS 清理前 hash。這是後續交付收斂，不把原始 D3 manifest 改寫成整合版證據。

本報告不涉及 PR、push、merge、publish 或外部訊息；沒有變更原 D3 quarantine。
