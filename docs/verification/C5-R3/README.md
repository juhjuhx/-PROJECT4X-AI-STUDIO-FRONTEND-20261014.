# C5-R3 證據入口

先讀C5-R3-ROOT-CAUSE.md → C5-R3-TEST-RESULTS.json → C5-R3-SOURCE-BOUNDARY.json。當前工作入口仍為../../handoff/NEXT-ACTION.md；review*/frozen與R2-*只是有來源的歷史快照，不是另一套最新文件。

每個C5-R3-*.json記精確指令、UTC、exit、duration與基線HEAD；同名.source.json與.log保存測試版本與原始輸出。RED的exit1為已重現缺陷；pruning整局FAIL與central-search FAIL均保留，不當最終產品PASS。

seed010正式原上限800/40000；approach候選winner0／534EndTurn／15418commands且terminalSaveReplayChecked true。harness總PARTIAL是只執行一局，單局COMPLETE不可改寫成FULL100 PASS。canonical完整報告／2331筆Observation trace未入Git，專案外private（0700/0600）保存；公開摘要只含彙總／雜湊。

review-slice1及review-slice2是獨立審查的frozen原碼、合成oracle／mutant與輸出，絕不作runtime import。從專案根可重跑已保存的第二片審查：

```sh
node --import tsx --test docs/verification/C5-R3/review-slice2/tests/ai-stalemate.test.ts docs/verification/C5-R3/review-slice2/獨立審查.test.ts docs/verification/C5-R3/review-slice2/第二片獨立審查.test.ts
```

root已實跑20/20（C5-R3-review-restoration.*）；原review精確命令包含舊機絕對路徑是原始紀錄，上述相對路徑用於新副本。final-doc-review是文件／來源核對，不重跑長局；FINAL-REVIEW-RECEIPT.json記兩項已修文件缺陷。

原始raw run快照含ignored .DS_Store metadata，未將該檔交付；SOURCE-BOUNDARY提供移除它後可攜hash。C5-SOURCE-MANIFEST.json只列可追蹤檔，避免乾淨checkout缺檔。raw logs／patch原bytes不為空白整理而修改；authored diff check exit0與整包raw-log空白exit2分列DIFF-CHECK-RESULTS.json。

OCR僅本機preview/rule與host review，沒有呼叫外部OCR模型；版本／規則／逐檔ledger見OCR-*。Git版本警告不靠更新環境消除。真實戰鬥佔領旅程.png為本候選瀏覽器真執行截圖，非概念圖；無pixel golden／真人／實體手機PASS宣稱。
