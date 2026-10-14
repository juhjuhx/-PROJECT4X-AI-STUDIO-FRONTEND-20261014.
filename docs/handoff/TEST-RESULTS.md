# 本輪測試與驗證結果

整體工程Gate：TESTED_FAIL。來源固定、功能程式未修改。所有逐項command/env/time/exit/count/log/Git-null/snapshot信息見TEST-MATRIX.json。LSP工具未提供；TS strict實際check代替可執行型別診斷，沒有宣稱執行lsp_diagnostics。

| 檢查 | 狀態 | 結果／限制 | log |
|---|---|---|---|
| context-init | TESTED_PASS | exit=0；pass=None/fail=None/skip=None；0.297秒 | evidence/current/context-init.txt |
| typecheck | TESTED_PASS | exit=0；pass=None/fail=None/skip=None；0.448秒 | evidence/current/typecheck.txt |
| tests | TESTED_PASS | exit=0；pass=44/fail=0/skip=0；1.054秒 | evidence/current/tests.txt |
| build | TESTED_PASS | exit=0；pass=None/fail=None/skip=None；0.567秒 | evidence/current/build.txt |
| seed001 | PARTIAL | exit=0；pass=1/fail=0/skip=0；52.133秒；harnessPARTIAL，一局真終局，不能當full100PASS | evidence/current/seed001.txt |
| seed010 | TESTED_FAIL | exit=1；pass=0/fail=1/skip=0；102.922秒 | evidence/current/seed010.txt |
| clean-npm-ci | TESTED_PASS | exit=0；pass=None/fail=None/skip=None；12.247秒 | evidence/current/clean-npm-ci.txt |
| clean-check | TESTED_PASS | exit=0；pass=None/fail=None/skip=None；4.524秒 | evidence/current/clean-check.txt |
| clean-tests | TESTED_PASS | exit=0；pass=44/fail=0/skip=0；22.399秒 | evidence/current/clean-tests.txt |
| clean-build | TESTED_PASS | exit=0；pass=None/fail=None/skip=None；14.635秒 | evidence/current/clean-build.txt |
| browser | TESTED_PASS | exit=0；pass=7/fail=0/skip=0；9.287秒 | evidence/current/browser/browser-run.txt |
| core-counterexample | TESTED_FAIL | exit=0；pass=0/fail=1/skip=0；2.228秒；exit0反例成立，合成fixture，不是產品PASS | evidence/current/core-counterexample.txt |
| full100-current-source-historical | TESTED_FAIL | exit=1；pass=62/fail=38/skip=0；3061.409秒；歷史run，source/method本輪重新hash核對完全相同，非本輪重跑100 | 證據/恢復-20261012T135206Z/完整驗證/4-完整對局.txt |
| lint | NOT_IMPLEMENTED | exit=None；pass=None/fail=None/skip=None；N/A秒 | 沒有lint script/config/package，沒有擅加依賴或假設npm run lint |
| physical-mobile | UNVERIFIED | exit=None；pass=None/fail=None/skip=None；N/A秒 | 未取得實體手機執行 |
| human-playability | UNVERIFIED | exit=None；pass=None/fail=None/skip=None；N/A秒 | 無使用者完整真人45–90分鐘驗收 |
| drag-pinch-e2e | UNVERIFIED | exit=None；pass=None/fail=None/skip=None；N/A秒 | 現有browser僅touch tap；兩指/拖曳source存在但未測 |
| schema-migration | NOT_IMPLEMENTED | exit=None；pass=None/fail=None/skip=None；N/A秒 | 未實作schema migration；拒絕舊版本不是migration |

## T3／T6／full100真實定義

這些不是npm test篩選名稱。現行待辦T3=AI整局可靠性，T6=整體審查與工程驗收；歷史計畫用相同ID指狀態回合/戰鬥，需保留命名空間。full100在scripts/headless.ts為種子獨立QA-001至100、4workers、每局800半回合/40000命令harness限額，真winner才算COMPLETE。fixtures不冒充生成局。verify要求100/100COMPLETE/source与method不變，否則exit1且停止audit/browser。

原交接仍稱RUNNING，但最終historical report已100finished/62complete/38fail，3061.409秒。新010為801turn/19696command/hash830ceea9eadb39e0，與舊相同；001為493turn/10774command/winner0，報告PARTIAL。超限不是draw或勝負。

## 覆蓋界線

44測試涵蓋生成連通、確定性、非法原狀、request冪等、战鬥邊界、收入招募/科技、fog與情報、流亡重建、save/replay/壞版本/語意、worker錯誤及產物hash變更。具名case/原始碼在FEATURE-MATRIX，沒有以測試存在代替新執行。全測試日誌已保存，failcount0不消除headlessFail。

browser7情境是真桌面/Chromium模擬touch、探索遺跡/Research/Move/income/Recruit、save/export/replay/invalidimport/reload兩次、keyboard及3mobile尺寸。實體手機、drag/pinch、勝負UI、a11y全量、45–90分鐘節奏未通過验收。另補4modal截圖只證可展示，不算新增功能tests。

沙盒localhost bind EPERM原證據保留browser-sandbox-blocked；獲本機測試執行權限後同源7/7。原verify全run後半audit/browser未執行，本輪獨立補跑browser與audit，不能因此把原verify的FAIL改成PASS。

## 2026-10-14續接：依賴審計

首次沙盒DNS ENOTFOUND registry.npmjs.org為BLOCKED，exit1，完整logs保留。只讀官方registry安全公告允許連線後實際npm audit --json exit0，info/low/moderate/high/critical/total全部0。此TESTED_PASS只證本次公告盤點，與原verify FAIL/full100 FAIL分開；沒有npm install/update。新fresh日志evidence/current/npm-audit-network.txt，執行資訊在TEST-MATRIX。
