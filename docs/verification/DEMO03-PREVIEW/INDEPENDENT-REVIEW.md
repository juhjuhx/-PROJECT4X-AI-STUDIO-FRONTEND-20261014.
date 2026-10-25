# Demo03 Preview 全分支獨立審查及單次修復

Reviewer：demo03_preview_final_review；來源620669e→1f0b9b1e5115efcdc6f3fd97a22f2dcd5b32058b；原結論REQUEST_CHANGES，1項P2，沒有核心隔離/資料安全blocker。此原結論保留，不能冒稱獨立reviewer重新批准修正後版本。

P2：預覽入口匯入G1後選單呈現G1，開始/重新開局卻仍依固定factory開預覽，按下前沒有清楚說明下一新局規則。審查者用真Chromium重現；要求對稱G1入口載入preview也說明。

root單次TDD修復：新增preview-version-check，原版真Browser RED（必須存在下一新局說明，0!==1）；保留factory設計，只在選單/航行紀錄/按鈕及確認文案明示下一新局規則。桌機/phone觸控雙向4情境GREEN，原兩個20指令預覽旅程重新GREEN；最後完整254/check/build/Browser11/Gameplay12/Demo4/PWA及更新PASS，清理PASS。未降低220門檻、未改Core/AI/Session/Schema。

Reviewer親跑check、254tests PASS（初跑6個sandbox listen EPERM，放行後全過），diff check PASS；35 product/28 method SHA、7份收據logSHA、private各QA摘要與dist全部對上。手機實圖已檢視；自有4189服務/Chromium已清理。review時未另重跑完整Browser/Gameplay/PWA；核對原收據。沒有真人/真機/平衡/Full100驗收。

結果：重要finding已由root實測關閉，精確RED/GREEN來源與日志SHA見TASK5-RESULTS。正式新規則仍是隔離批准基準；維持獨立預覽PR，不merge main或宣稱正式Demo03 Release。
