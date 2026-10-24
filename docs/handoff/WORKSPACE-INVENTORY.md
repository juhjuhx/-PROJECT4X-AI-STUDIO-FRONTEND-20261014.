# Workspace Inventory（公開安全索引）

狀態 TESTED_PASS。唯讀盤點範圍僅Desktop中PROJECT-4X/Fake-Polytopia相關項目，沒有掃其他專案。

| 分類 | 管理區 | 處理與證據 |
|---|---|---|
| 入口 | 00-START-HERE | 使用說明、精確回退工具 |
| 活動工作樹 | 01-ACTIVE-WORKSPACE | 正式發布/文件與原整合工作樹捷徑；所有Git/worktree仍留原路徑 |
| 正式交付 | 02-RELEASES | 歸檔單一Demo02交付資料夾，保留全部歷史ZIP與原路徑相容捷徑；原件53檔/SHA/mode核對 |
| 世界與規則 | 03-DESIGN-AND-WORLD | 指向正式World Bible/CCTS/決策/規則書，不複製第二權威 |
| 文件 | 04-DOCUMENTATION | README/AGENTS/Ledger/NEXT-ACTION等捷徑 |
| 歷史 | 05-ARCHIVES | 原交接與歷史設計索引，原件保留 |
| 驗證 | 06-VERIFICATION-INDEX | 公開安全摘要入口、本機private manifest/worktree索引 |

本輪實際搬移1個獨立交付資料夾、53檔、27,505,657 bytes，逐檔SHA與權限相同；原路徑仍可使用。建立19個捷徑。零Git工作樹搬移、零刪檔、零Downloads修改；同磁碟歸檔，釋放容量為0，不把整理冒稱清出磁碟。

原Fake-Polytopia約2 GiB含活動Git/私人證據，不搬、不刪。既有歷史交接捷徑保持原樣。完整移動來源/目的地/每檔SHA與本機worktree清單位於管理根06-VERIFICATION-INDEX，不公開個人路由或private world。安全摘要與原manifest hash見RELEASE02/WORKSPACE-SUMMARY.json。

回退工具預設只檢查；--apply前確認所有檔案/權限/捷徑仍符合manifest才搬回，未通過就停止。3個隔離fixture測試通過，真實資料只做dry check，沒有為測試再次搬動原件。管理根是本機入口，不是可整包公開的source交付；GitHub是公開source。
