# Workspace Inventory（公開安全索引）

狀態 TESTED_PASS。唯讀盤點範圍僅Desktop中PROJECT-4X/Fake-Polytopia相關項目，沒有掃其他專案。

| 分類 | 管理區 | 處理與證據 |
|---|---|---|
| 入口 | 00-START-HERE | 使用說明、精確回退工具 |
| 活動工作樹 | 01-ACTIVE-WORKSPACE | 現在僅Demo03玩法預覽作活動入口；已完成工作捷徑移至歷史區，Git/worktree仍留原路徑 |
| 正式交付 | 02-RELEASES | 歸檔單一Demo02交付資料夾，保留全部歷史ZIP與原路徑相容捷徑；原件53檔/SHA/mode核對 |
| 世界與規則 | 03-DESIGN-AND-WORLD | 指向正式World Bible/CCTS/決策/規則書，不複製第二權威 |
| 文件 | 04-DOCUMENTATION | README/AGENTS/Ledger/NEXT-ACTION等捷徑 |
| 歷史 | 05-ARCHIVES | 原交接與歷史設計索引，原件保留 |
| 驗證 | 06-VERIFICATION-INDEX | 公開安全摘要入口、本機private manifest/worktree索引 |

歷史R02實際搬移1個獨立交付資料夾、53檔、27,505,657 bytes，逐檔SHA與權限相同；原路徑仍可使用。建立19個捷徑。零Git工作樹搬移、零刪檔、零Downloads修改；同磁碟歸檔，釋放容量為0，不把整理冒稱清出磁碟。

原Fake-Polytopia約2 GiB含活動Git/私人證據，不搬、不刪。既有歷史交接捷徑保持原樣。完整移動來源/目的地/每檔SHA與本機worktree清單位於管理根06-VERIFICATION-INDEX，不公開個人路由或private world。安全摘要與原manifest hash見RELEASE02/WORKSPACE-SUMMARY.json。

回退工具預設只檢查；--apply前確認所有檔案/權限/捷徑仍符合manifest才搬回，未通過就停止。3個隔離fixture測試通過，真實資料只做dry check，沒有為測試再次搬動原件。管理根是本機入口，不是可整包公開的source交付；GitHub是公開source。

## Demo03 隔離預覽追加索引

新增experiment/demo03-gameplay-preview獨立worktree，原所有worktree未移動。統一桌面根追加「Demo03-玩法預覽」捷徑及預覽入口說明；新Web ZIP在02-RELEASES/Demo03-Preview，公開安全身份見DEMO03-PREVIEW/PACKAGE-SUMMARY。R02 53檔歸檔及Archive Manifest SHA保持，rollback --check仍READY_TO_ROLLBACK/changed=false，未執行真回退。本輪沒有刪使用者資料或處理Downloads，僅清理各QA自有browser/server/temporary artifacts。

## D03-WS01｜2026-10-25 再整理

狀態 TESTED_PASS，安全摘要在 [WORKSPACE-REFRESH](../verification/DEMO03-PREVIEW/WORKSPACE-REFRESH.json)。本輪先唯讀盤點，再執行17個可回退捷徑操作：

- 12個文件／世界規則捷徑改指當前Demo03預覽，修正原先仍指向舊Demo02文件的路由。
- 3個已完成工作的捷徑歸入05-ARCHIVES/工作樹捷徑，活動區只留Demo03玩法預覽；沒有搬動任何實體Git工作樹。
- 2個Demo02 ZIP捷徑依版本歸入02-RELEASES/Demo02；原ZIP與53檔交付資料不變。
- 更新5份本機入口，保存舊bytes/SHA。七分區保留，桌面僅兩個實體工程/管理根及兩個相容捷徑。

8個登記worktrees與1個獨立legacy Git共9處，操作前後完整porcelain狀態相同；其中3處原有變更全部保留。早期MVP的HEAD尚未建立、已有staged檔案，不是當前PR4來源，沒有替它commit/reset/clean。工作區紀錄中的非本專案DSH資料也未刪除。

本輪0原件刪除、0實體worktree搬移、0Downloads變更、釋放0 bytes；只移除已分類成功的舊位置捷徑。未知資料與歷史私人world不當作垃圾。Git原有branch/refs/.git與repo的src/docs樹保持；以索引管理，沒有為美化排列進行架構重寫或prune。

本機06-VERIFICATION-INDEX的唯一run保存PLAN→逐項OP→APPLIED、入口舊bytes及回退工具；新舊兩套rollback皆僅執行--check，結果READY_TO_ROLLBACK/changed=false，沒有為測試真實搬回原件。回退前若文件已變更，必須停止覆寫。公開摘要不包含私人絕對路由或world。
