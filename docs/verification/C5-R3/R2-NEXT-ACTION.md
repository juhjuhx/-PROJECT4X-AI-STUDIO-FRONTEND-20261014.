# 當前續作入口

CURRENT_BRANCH：integration/project4x-c3
CURRENT_HEAD：讀git rev-parse HEAD；交付根FINAL-GIT-STATE.json記錄真正checkpoint，避免自含commit循環。
CURRENT_BASELINE：C5-R2基線5b0483ec9431958d1852866368f2775557ab98f8；C3 checkpoint4cddfb3；遠端main已fresh查仍c21b16cd75572d069369f41426f7323c63c05083。
LAST_TESTED_COMMIT：見交付根FINAL-GIT-STATE.json；本輪實跑於5b0483e上的未提交candidate，以source manifest綁定提交後bytes。
LAST_TESTED_SOURCE：f8ba9a7ceda513c149319044106858da1c95e2666d6127bf99fcef4bc1a24ae0。AI SHA e7721d53ae68ccd163ff1096bd266c3c0dd8a012a89c7af61a66ded4e41f3595。Browser/整局的8c4679…source與此只差新增中央診斷，所有src/**與bundle相同；精確proof見C5-R2-SOURCE-BOUNDARY.json。
LAST_SUCCESSFUL_GATE：110 tests(含6個新反例)/check/build；1100commands prefix0loop；11 browser/12真玩法(208human commands，Attack後Capture、Save/Replay、真模擬雙指)；獨立review6/6、15/15、13邊界群組。
OPEN_P0：無本輪新確認P0；原D3 guard/prototype patch仍禁止回灌。
OPEN_P1：完整seed010仍TESTED_FAIL：800EndTurn/19813commands/winner=null；中央搜尋合成反例1000commands FAIL。新full100/T3/T6未完整重跑，舊62/38不能當現版率。遺跡新取得ruleset NOT_IMPLEMENTED。
OPEN_P2：APG tabs keyboard/ARIA、手機橫式UX、pixel golden、真人/真機完整局未驗。補兵調位只保留機會，不能偷讀recruited或保證固定後續。
NEXT_TASK：沿用C5-R2-private/reinforcement-prefix/decisions.jsonl的2331筆合法Observation，在turn56後尋找下一個TARGET PRIORITY/PATHFINDING/RECRUITMENT最小反例。先比較traffic與terrain距離、友軍位置、選定目標與可用攻擊/招募；先RED再改。中央漏搜是分立次序，不當seed010根因。
NEXT_COMMAND：python3 -c "import json; from pathlib import Path; print(json.loads(Path('../evidence/C5-R2-private/reinforcement-prefix/summary.json').read_text()))"
REPRODUCE_REMAINING_FAIL：node --import tsx scripts/ai-endgame-search-check.ts（預期exit1，合成反例）。整局精確env與800/40000限制見C5-R2-TEST-RESULTS.json的C5-R2-seed010-reinforce；沒有新反例先別重跑整局/full100。
BLOCKED_BY：無環境／裁決阻塞；整體Alpha被玩法FAIL阻擋。下一個攻城原因仍UNVERIFIED，不能用任意權重替代證據。
SOURCE_MANIFEST：C5-SOURCE-MANIFEST.json為目前bytes；R1舊manifest/驗證完整保存在docs/verification/C5-R2/R1-*，C3僅適用歷史版本。
VERIFICATION_COMMANDS：npm run check；npm test；npm run build；npm run qa:ai:oscillation；npm start+PROJECT4X_URL後npm run qa:browser / qa:gameplay。新工具node --import tsx scripts/ai-decision-trace.mjs <專案外不存在絕對路徑>，既存parent，100turn/4000cmd/60sec、0700/0600，非玩家Replay。

## 保全與交接

只改產品src/core/ai.ts；game/types/persistence/session/UI/lock/ruleset/schema原bytes保持。R2三項局部修補詳C5-R2-STALMATE-ROOT-CAUSE.md，測試/兩次整局FAIL/獨立review見docs/verification/C5-R2/C5-R2-TEST-RESULTS.json。
Gemini保留D3分頁/既定美術方向與目前UI，不改AI、核心、session或main交易。完整world/trace只留../evidence/C5-R2-private，不交HUD、不公開到GitHub、不寫玩家Replay。原D2/D3/C2資料與其他dirty worktrees保留。
沒有push main/force/merge/publish；遠端CI未驗。沒有外部自動續作排程。此checkpoint不宣稱R2整局、C5或Playable Alpha完成。
