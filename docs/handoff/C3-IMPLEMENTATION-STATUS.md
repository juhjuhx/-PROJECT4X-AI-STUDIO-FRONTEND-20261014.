# C2–C3 整合候選：實作與驗證

2026-10-18。此文件說明本次真實變更與有限驗收；不是完整 Playable Alpha。續作權威入口為 [NEXT-ACTION](NEXT-ACTION.md)。完整原始證據在專案外 `../evidence/`；可攜證據節選在 `../verification/C3/`，個別版本由JSON中的HEAD與source snapshot區分。

## 來源與範圍

- REMOTE_MAIN：本輪起始與收尾再次查詢均 c21b16cd75572d069369f41426f7323c63c05083。
- C2_PARENT：e5bc16fedde9245e29284a4ec954299212089139；C3分支 integration/project4x-c3，獨立worktree；未推送／合併main。
- D3原ZIP SHA-256：9959a72a39c163a93c611651d8b761eff9d72193c21214d4fdbd898ecd3cb451，CRC通過；201 entries，原ZIP/quarantine不修改。
- 原D3的STAGE3 manifest真實40/40。根LICENSE／C2／D3／manifest均 bbf159bfa50d6f1f088504e822cfe2d7964b80fd504a64386b6151e99e03ea4e。早先39/40是basename碰撞到第三方LICENSE的稽核錯誤；本輪已更正，沒有改正確MIT內容。
- 不採D3整份main；保留C2之session、dispatch、requestId/version/generation、AI取消、Save/Load/Replay、subscribe/dispose。core/session/presentation/lock對C2 diff空白。

## 已實作／可追溯測試

| 需求 | 實作 | 證據／狀態 |
|---|---|---|
| C2正式13方法與7安全事件 | src/session/**、src/presentation/events.ts，沿用C2 | fresh 99 tests、9 browser；獨立55窄測與6公共API probes。TESTED_PASS，非僅型別 |
| D3視覺與HUD | src/ui/map.ts、styles.css、index.html；main僅DOM/render片段 | 真桌面/375×812/812×375/320×640截圖；有限美術觀察，非主創最終美術批准 |
| 全域guard不得遮蔽第一方錯誤 | C2組合root不採原D3 guard／selector覆寫 | 原D3六反例；整合browser六種invalid selector拋SyntaxError、兩事件可觀察且未取消。TESTED_PASS |
| owner own/enemy/neutral/unknown | map.ts drawSite，Observation-only | ui-map.test.ts原D3 RED兩fail；修正後3 tests PASS |
| 異地政治中心名稱 | site.name＋政治中心標記，不硬編舊首都 | 同上直接呼叫renderer，不以DOM regex代替 |
| UI Fog Non-Interference | 相同Observation，不同hidden truth的Canvas呼叫相同 | ui-map.test.ts；另保留session/projector真合法history與hidden-world契約測試。僅有限fixtures |
| 招募原因資訊 | src/ui/recruitment.ts＋main renderInspection | opponent turn/pending relic/駐軍/合法action/金幣測試；不從缺action推定『已徵召』 |
| 手機科技分頁後點空格 | main clickTile新增switchTab('inspect') | independent finding C3-R1；真tap RED tech!==inspect；GREEN含座標4·5、inspect可見、完整保存不變 |
| 真touch與Save/Replay | scripts/browser-check.mjs | 兩個trusted touch pointers、transform pan/pinch、私有保存等值；壞載入保局、storage失敗不ack、reload/load兩次、replay摘要不曝hash |
| 既有玩法閉環 | qa:gameplay，真DOM/keyboard，production敵方AI | 招募新兵→下一己回合移動→研究→戰鬥→再佔領；完整action序列＋傷害公式＋owner變化＋replay驗證。最終結果見C3-VERIFICATION.json |

數值與八個核心Action不變；未加城市人口、科技、兵種、流亡倒數、遺跡新版或AI全知能力。PresentationEvent已供契約，不等於所有視覺動畫已播放。

## Fresh gates與失敗保留

C3最終適用命令：npm run check、npm test、npm run build、npm run qa:browser、npm run qa:gameplay；額外 strict tsc --skipLibCheck false。沒有lint script，也沒有可呼叫lsp_diagnostics工具；不宣稱已跑。測試數103（0 fail/0 skip），browser標準11情境，完整玩法加1情境。各gate精確版本/耗時/exit/log見C3-VERIFICATION.json。

保留真失敗：map原D3 2 fail；recruit helper未實作RED；殘留siteRecruited造成typecheck失敗；第一次browser量測綁舊caption而timeout；手機選格RED；第一次gameplay座標4誤配14造成strict-selector失敗。這些沒有被刪除或當成最終PASS。前兩份gameplay PASS後，獨立審查發現完整Action序列與command計數可漏判，建立真合法反例再加強；最終另要求Attack後Capture，早期結果不回寫成新強Gate。

原D3副本fresh check/test/build/browser/qa:stage2 exit0（44個tests），但原Stage2以mouse代pinch、DOM regex代fog、遺跡可未觸發仍PASS；其ALL_PASS不等於本次標準。原副本只在隔離runtime-audit建置，不回寫Gemini來源。

## 獨立審查與限制

[程式審查](../verification/C3/independent-C3-review.md)：root外的reviewer只讀，獨立6窄測通過、14保護函式與C2相同，發現並複核C3-R1/R2已修。新增QA另有 [玩法審查](../verification/C3/independent-gameplay-review.md)，對wrong relic choice、額外human command、221指令的反例與修正複核。OCR僅本機delegate preview/rule＋host審查，不聲稱外部LLM OCR／PR審查已跑。

整體Alpha仍PARTIAL：seed010本輪fresh TESTED_FAIL（800 EndTurn/19696 commands/winner=null）；full100 62/38與T3/T6是歷史FAIL，本輪未重跑。局部AI振盪機制已確定，整局因果PARTIAL，未修AI。遺跡新版NOT_IMPLEMENTED；新城市數值PROPOSED。真機／真人45–90分鐘、完整無障礙APG tabs、核准pixel golden與跨瀏覽器未驗；沒有GitHub CI新結果，因未push。

原始證據保全例外：完整 staged `git diff --check` exit2，僅原始log空白與未清洗D3 docs/art/DESIGN-TOKENS.md三行尾空白；程式/腳本/測試/新權威文件的同檢查exit0。保留raw bytes，不把全域檢查寫成PASS；明細留外層C3-git-diff-check-raw.log。
