# 當前續作入口｜C5-R4 checkpoint

CURRENT_BRANCH：integration/project4x-c3
CURRENT_HEAD：執行 git rev-parse HEAD；交付根 FINAL-GIT-STATE.json 記實際checkpoint與tree，避免commit自含循環。
CURRENT_BASELINE：2d7da2a5808ddd58292f160a7a908bc7347e8279（C5-R3）；GitHub main本輪未重新查詢，歷史c21b16c…不是當前遠端證明；沒有push。
LAST_TESTED_COMMIT：2d7da2a…加R4 candidate；提交後核對tree，不宣稱測試在尚未存在的SHA執行。
LAST_TESTED_SOURCE：portable e45f3cda4a0ba008a57262f9549cd857cee83cec9189dfb7a5a68773b2fdc196；raw b33f0d9268c250a937023b908e590492e4841f426fadb58c47202d90a20647ce 另含ignored src/.DS_Store；AI82618e54129d96274c2dd5d4a8c1a430bf17714d4b4aba1d7cbf122b8004005e。
LAST_SUCCESSFUL_GATE：123/123 tests、check/build、prefix1100/0loops、原D02在673commands真揭露且winner0；seed010 winner0／534EndTurn／15418commands／turn535，terminalSaveReplayChecked=true；qa:browser11；獨立review APPROVE＋33/33及oracle。
OPEN_P0：無新增已確認產品P0；舊D3吞錯guard禁止回灌。
OPEN_P1：本輪qa:gameplay兩次download.delete canceled，第二次runner/cleanup receipt因ENOSPC無法寫入；BLOCKED。原220指令完整旅程未驗完，不能沿用R3 PASS。full100/T3/T6當前UNVERIFIED；歷史FAIL不刪。一般動態traffic收斂未證。
OPEN_P2：全已知64兵巡查microbenchmark median1.828→3.121ms（+70.7%）；需持續量測，非全對局基準。APG tabs／小橫式UX、pixel golden、真人／真機／45–90分鐘仍未驗。
NEXT_TASK：先恢復本機QA磁碟容量；不刪未知使用者檔／舊ZIP／證據。以原版qa:gameplay重跑完整旅程，保留220門檻並驗Attack後Capture及Save/Replay。若下載仍取消，記錄Playwright與磁碟診斷，先找根因，不吞錯。
NEXT_COMMAND：git status --porcelain=v2 --untracked-files=all；核對C5-SOURCE-MANIFEST.json與R4-SOURCE-BOUNDARY，檢查df。容量足夠後，於build吻合的本機server執行npm run qa:gameplay，完整原始log另存。交付根既有helper：python3 ../evidence/run_browser.py <新唯一LABEL> project qa:gameplay（從本worktree執行，需本機socket/browser權限）。
BLOCKED_BY：磁碟在Chromium QA期間曾不足，先前剩餘約數百MiB並實收ENOSPC；沒有授權清理其他檔。完整gameplay本輪NOT_PASS，不能宣告C5-R4整輪或Alpha完成。
SOURCE_MANIFEST：C5-SOURCE-MANIFEST.json；詳細結果docs/verification/C5-R4/C5-R4-TEST-RESULTS.json；R3舊入口/manifest/verification已保存R3-*。
VERIFICATION_COMMANDS：npm run check；npm test；npm run build；npm run qa:ai:oscillation；node --import tsx scripts/ai-endgame-search-check.ts；既有qa:browser／qa:gameplay。完整單seed仍env PROJECT4X_QA_START_SEED=10 PROJECT4X_QA_GAMES=1 PROJECT4X_QA_WORKERS=1 PROJECT4X_QA_MAX_TURNS=800 PROJECT4X_QA_MAX_COMMANDS=40000 PROJECT4X_QA_OUTPUT=<專案外私有絕對路徑> npm run qa:headless。

## C5-R4已完成與界線

D-02 TESTED_PASS；未知山圈frontier／已知地形再偵察分流，只有ai.ts產品變更，新10測試；其餘42檔byte-identical。維持Stateless／Deterministic／Observation-only、g1-ccts-1與save/replay格式。實測與候選失敗見R4 ROOT-CAUSE及原始logs，沒有重新整合C2/C3或改UI／規則。

seed010第一次240秒外部timeout與中間候選FAIL均保留；600秒外部預算下同800/40000在143.374秒完成，harness非100局彙總仍PARTIAL。只有SINGLE-SEED PASS，不能推算完成率。

## 下一已授權切片：C5-R5受控驗證（未開始）

前置先補本輪完整browser gameplay。再評估可用磁碟／時間、逐批固定001–100、原800EndTurn/40000commands、對稱Observation-only AI、原勝負；不得改門檻、丟失敗或合成winner。逐局安全摘要需Seed/Status/Winner/EndTurn/Commands/Reason/TerminalSaveReplay，狀態COMPLETE/TURN_LIMIT/COMMAND_LIMIT/ERROR；完整canonical報告只存專案外private。現有harness只每10th seed驗終局Save/Replay，必須先以QA層補足逐局檢查與獨立審查，不能先宣稱有100局終局證據。新full100/T3/T6仍UNVERIFIED。

沒有push/main merge/force、沒有其他worktree覆寫、沒有設定自動續作排程。恢復時先讀真Git與本檔，不重做已通過R2/R3/R4反例；非產品環境阻塞解除後才繼續。
