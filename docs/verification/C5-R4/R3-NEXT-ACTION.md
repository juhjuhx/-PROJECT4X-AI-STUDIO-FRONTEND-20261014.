# 當前續作入口｜C5-R3 checkpoint

CURRENT_BRANCH：integration/project4x-c3
CURRENT_HEAD：執行git rev-parse HEAD；交付根FINAL-GIT-STATE.json記實際checkpoint，避免commit自含循環。
CURRENT_BASELINE：8acc52698b9553e74961d38c54e11dfa301268e5（C5-R2）；GitHub main唯讀fresh仍c21b16cd75572d069369f41426f7323c63c05083。本機沒有push。
LAST_TESTED_COMMIT：8acc526…加本輪candidate；提交後tree的AI／測試／src/config與已測bytes比對，對應交付根FINAL-GIT-STATE.json。不能聲稱測試在尚未存在的SHA執行。
LAST_TESTED_SOURCE：41634a1e510aa070707df358019a53c8ddb5050f2091322c8c2553b43beb3f05；AI c16c640e5453b85c0939b405d43067c5d00bccab180dd4bac1c3bb96c73caddd。seed010 snapshot8c0e355…只差test補強fresh等待斷言；所有產品bytes與browser bundle相同，見C5-R3-SOURCE-BOUNDARY.json。
LAST_SUCCESSFUL_GATE：113/113 tests、check/build；1100commands prefix0loop；11browser／12真玩法（209humanCommands，原上限220；真Attack後Capture、Save/Replay、CDP雙指）；獨立14/14與20/20。seed010 COMPLETE winner0、534EndTurn／15418commands、turn535、terminalSaveReplayChecked=true。
OPEN_P0：本輪無新增已確認P0；原D3吞錯guard／DOM prototype patch禁止回灌。
OPEN_P1：D-02中央搜尋fresh TESTED_FAIL：1000commands／seen=false／winner=null。新版full100/T3/T6 UNVERIFIED；舊62/38屬歷史policy不能當現版率。廣義友軍traffic往返未證全面解決。遺跡權利新版NOT_IMPLEMENTED。
OPEN_P2：APG tabs／小橫式UX、pixel golden、真人／實體手機／45–90分鐘驗收UNVERIFIED。局部potential不保證友軍必讓路或未知通道可達。
NEXT_TASK：D-02獨立最小搜尋切片：讀scripts/ai-endgame-search-check.ts，從同actor合法Observation與frontier建立最小期望斷言，先RED。不把未知世界中心或敵兵truth硬編目標，不與已通關seed010根因混用。
NEXT_COMMAND：node --import tsx scripts/ai-endgame-search-check.ts （預期exit1，保留反例；不是整套測試FAIL）。然後檢查chooseAction已知地形／frontier與四角patrol政策。
BLOCKED_BY：R3兩項修正無阻擋；整體Alpha仍PARTIAL。持久策略記憶、session/save/schema改動需獨立設計裁決，不在無記憶小修權限內。full100可在獨立資源預算下固定001–100驗證，不能以一seed推算率。
SOURCE_MANIFEST：C5-SOURCE-MANIFEST.json；舊R2三份當前入口保存在docs/verification/C5-R3/R2-*，歷史證據未覆寫。
VERIFICATION_COMMANDS：npm run check；npm test；npm run build；npm run qa:ai:oscillation；啟本機server後npm run qa:browser／qa:gameplay。完整單seed仍env PROJECT4X_QA_START_SEED=10 PROJECT4X_QA_GAMES=1 PROJECT4X_QA_WORKERS=1 PROJECT4X_QA_MAX_TURNS=800 PROJECT4X_QA_MAX_COMMANDS=40000 PROJECT4X_QA_OUTPUT=<專案外私有絕對路徑> npm run qa:headless。

## 保全與已完成範圍

R3只改產品src/core/ai.ts，tests/ai-stalemate.test.ts新增3項；R2三項反例未刪。game/types/persistence/session/UI/main/lock/headless/verify/數值/勝負/schema/ruleset全byte-identical。根因與RED/GREEN見docs/verification/C5-R3/C5-R3-ROOT-CAUSE.md；原始執行紀錄見C5-R3-TEST-RESULTS.json。

第一候選只修目標剪枝，整局800EndTurn／19898commands仍FAIL；第二候選再修友軍瓶頸前合法接近才形成真終局。兩者並列保存。SINGLE-SEED TESTED_PASS不等於FULL100 PASS、PLAYABILITY PASS或C5全部完成。

Gemini維持既定D3分頁、美術與正式GameSession Port，沒有UI／接口改版。完整world/Observation/私有failure payload只在../evidence/C5-R3-private與前輪private，0700/0600，不交HUD／公開Git／玩家Replay。舊ZIP／C2／C3／其他worktree保留。

沒有push main／force／merge／publish，遠端新CI UNVERIFIED。沒有設定外部自動續作排程。若環境中斷，先git status與本檔／FINAL-GIT-STATE恢復，保留所有未提交修改。
