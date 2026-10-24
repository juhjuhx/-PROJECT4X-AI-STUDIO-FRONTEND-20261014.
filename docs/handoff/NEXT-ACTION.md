# NEXT-ACTION

Demo02已正式發布，Tag/Web/歸檔不變。Demo03視覺PR3已merge578a3d0e，精確head620669e的PR/main CI均SUCCESS；未發Demo03正式Release。

目前branch experiment/demo03-gameplay-preview，base620669e。D03-PREVIEW-001批准的盾衛/機動偵察及兩科技已完成隔離閉環：唯一reducer/Session、固定兩包/內容SHA、Save2/Replay2、AI只讀Observation、安全事件、真UI及分開存檔槽。runtime checkpoint分片見git log 62e210b→6d91550→9841994→cf0e72e→Task5。權威計畫在product/DEMO03-PREVIEW-IMPLEMENTATION-PLAN。

最新凍結runtime Gate：257 tests/check/build、Browser11/Gameplay12（原220門檻）/Demo4/PWA2/更新PASS；桌面1440×960與手機375×812真觸控模擬各20玩家指令，真研究/招募/三格移動/保存/讀取/Replay及舊槽不變PASS。Core獨立審查APPROVE；Task5全分支審查提出1項P2新局規則提示，已真RED→四個雙向桌機/觸控GREEN及完整Gate重跑關閉，原REQUEST_CHANGES及修復證據保留。來源/收據/圖在verification/DEMO03-PREVIEW，原private/world在專案外。

G1 seed010補驗：winner1、247 EndTurn、6705commands，自然終局且Terminal Save/Replay PASS。這是1局，不是新Full100；R5原87/13與R6失敗不變，新ruleset Full100/T3/T6未驗。Alpha PARTIAL、真人/真機/平衡未驗。

NEXT：Draft PR4已建立；Web預覽包72120bc7已CRC/19檔SHA/乾淨解壓/真Node launcher HTTP PASS，PACKAGE-SUMMARY可查。CI補強把原Gate與新2＋4情境納入同runner，新增3合約test後257全過、獨立CI review APPROVE。hosted CI請查PR4 checks對當前HEAD，不拿本機PASS代替。接下來由主創真人/真機試玩（D03-009）；不將測試數值升格正式平衡，不自動合併新規則main。再交主創真人試玩；城市/道路/新遺跡須另裁決，不自行補數值。尋徑額外視野仍僅舊scout。

CURRENT_BRANCH：experiment/demo03-gameplay-preview。已驗runtime為72120bc7（product SHA見SOURCE-BOUNDARY）；後續只補CI/文件。PR4為DRAFT，沒有merge main/發Demo03 Release。最新HEAD以git讀取；public authority是本分支的MASTER-TODO/NEXT與PR4，舊私人工程worktree只轉接不push。

NEXT_COMMAND：git status --porcelain=v2 --untracked-files=all → 核對PR4最新checks → 取PACKAGE-SUMMARY指定預覽ZIP或npm ci --ignore-scripts / npm run build / npm start，開 /?preview=demo03。自動完整Gate：PROJECT4X_PREVIEW_QA=1 node scripts/verify-demo02.mjs；Chromium僅依環境指定既有executable，不自動新SDK。先真人驗證兩兵策略取捨，城市/地形/遺跡待獨立數值裁決，不直接實作。
