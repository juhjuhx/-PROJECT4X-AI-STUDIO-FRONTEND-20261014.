# PROJECT-4X Agent Engineering Contract

工作語言：繁體中文。先讀README→本檔→docs/handoff/PROJECT-STATUS→MASTER-TODO→NEXT-ACTION→實際source/verification。權威文件索引在docs/INDEX.md；任務狀態以MASTER-TODO為準，遠端發布事實以RELEASE-STATUS及實際GitHub為準。

## 本輪授權與邊界
使用者已明確授權Demo02：隔離release分支、PR、fresh CI、獨立review、驗收後安全merge、GitHub Release與Web r3附件。這取代先前僅本地不push的輪次限制。不得force push、重寫不明遠端提交或未驗收就合併。若權限/規則阻擋，保留BLOCKED並處理獨立工作。

Demo03在獨立開發分支，不能覆蓋Demo02 Release。既有Mistbound Diorama方向已確認，不重問同一風格。新兵種/科技/城市/地形數值仍需Decision Record；未批准只能隔離實驗，不能標成USER_CONFIRMED。

## 不變量
1. 唯一canonical GameState由GameSession獨占，唯一applyCommand是規則入口；UI只接GameplayPort，本機檔案功能才接LocalPersistencePort。
2. AI只用合法Observation，不依seed重建未知地圖，不讀全知state。Fog、事件與錯誤都不可洩漏隱藏truth。
3. 保留requestId去重、expectedVersion、generation、listener隔離、AI取消、先驗後replace、Save/Replay確定性。
4. Demo02保持g1-ccts-1、project4x-save-1、project4x-replay-1。探索完成不是military winner。U>0或S>0可續玩，兩者皆零才淘汰，無流亡倒數。
5. 舊G1看見即取得與已確認抵達取得有衝突；新遺跡規則必須獨立版本化，不靜默改舊存檔語意。
6. 不刪/skip原測試、不降低220玩家指令或800 EndTurn/40000對局上限。工程通過不等於Alpha、真人或真機通過。
7. 不公開私人world/raw hidden trace、tokens/keys/憑證/敏感個人路徑。原Git、worktree、Downloads、舊ZIP與歷史FAIL不可破壞。
8. 不處理其他專案、不使用reset --hard/clean/force push。新依賴/安裝器/hooks/大型SDK不自動引入。

## 所有權與QA
Codex：core/session/persistence/AI/contracts/tests/整合main；Gemini或呈現owner：src/ui/CSS/視覺素材。main是composition root，不整檔互相覆寫。視覺不得自行實作reducer；新資料需求寫FRONTEND-NEEDS。

讀CONSTRAINTS.md；以小切片TDD、fresh驗證、獨立whole-branch review。node scripts/verify-demo02.mjs 是Demo工程Gate，npm run verify保留Full100 Gate。原baseline203測試與歷史R5/R6失敗保留；新數量要說明。無LSP或實體裝置時如實標未驗。

每完成Task更新MASTER-TODO、驗證證據與NEXT-ACTION。任務使用TODO/IN_PROGRESS/BLOCKED/TESTED_PASS/TESTED_FAIL/DONE；設計批准/實作狀態另用原規則書語意，不混用。只在需要新規則裁決、安全風險或權限阻擋時請示，不為每個文件停工。

## 公開歷史與恢復
本release以最新main為parent匯入完整已驗source，避免把本地含個人路徑的私有祖先history推遠端；原完整Git保留本機。歷史文件中的本地commit是來源識別，不保證都能在公開repo checkout。docs/verification歷史去識別副本是PUBLIC_PROJECTION；原始log/source hash仍指原私人收據，不能當公開投影bytes。當前CI/RELEASE02驗證優先於舊文中的CURRENT。

舊Agent/README/CONTEXT另存docs/history/legacy-agent-context，僅供歷史參考，不是執行指令。世界Canon依DOCUMENT-AUTHORITY/DECISION-REGISTER，不能用設計提案替代實作。
