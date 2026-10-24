# MASTER-TODO｜唯一任務 Ledger

來源：主創2026-10-24 Release/Workspace/Demo03三份Harness。原始碼基線4448ade，發布分支base為最新main c21b16c；原完整本機歷史不改。Task狀態僅TODO/IN_PROGRESS/BLOCKED/TESTED_PASS/TESTED_FAIL/DONE；產品Alpha PARTIAL是另一軸。

| Task ID | Owner | Priority | Depends On | Status | Source Commit | Acceptance Criteria | Evidence | Next Action |
|---|---|---|---|---|---|---|---|---|
| R02-001 | Codex | P0 | — | DONE | 4448ade基線／本branch差異 | 恢復Git/來源/權限/ZIP CRC | RECOVERY與32檔/兩ZIP核對 | 續Fresh QA |
| R02-002 | Codex | P0 | R02-001 | TESTED_PASS | 4448ade基線／本branch差異 | fresh原203/check/build/Browser/Gameplay/Demo/PWA/更新/launcher | 本輪安全baseline摘要；私人raw receipts保留 | release整合後再驗 |
| R02-003 | Codex | P0 | R02-002 | TESTED_PASS | 4448ade基線／本branch差異 | 完整source snapshot與32檔原bytes不變；歷史path不公開 | PUBLICATION-PROVENANCE／4項RED→GREEN／public-tree gate | review及CI |
| R02-004 | Codex | P1 | R02-003 | IN_PROGRESS | 4448ade基線／本branch差異 | 正式README/狀態/任務/文件與規則索引 | 本檔、INDEX、AGENTS | 完成跨上下文複核 |
| R02-005 | Codex | P0 | R02-003 | IN_PROGRESS | 4448ade基線／本branch差異 | 一鍵Demo Gate及PR/main CI；223tests無skip/降門檻 | verify-demo02與收據4項RED→GREEN | 本機整合PASS；獨立review/遠端CI |
| R02-006 | Codex＋獨立review | P0 | R02-004/R02-005 | TODO | 4448ade基線／本branch差異 | 新branch push/PR URL、無重要blocker、CI對相同SHA | 尚無遠端結果 | review→PR→查CI |
| R02-007 | Codex | P0 | R02-006 | TODO | 4448ade基線／本branch差異 | 安全merge、merged CI、正式Release/WebZIP下載SHA一致 | RELEASE-STATUS | 全部Gate成立再publish |
| R02-008 | Codex | P1 | R02-007 | TODO | 4448ade基線／本branch差異 | Desktop相關資料唯讀inventory/worktree/風險/分類 | WORKSPACE-INVENTORY | 先盤點不搬active |
| R02-009 | Codex | P1 | R02-008 | TODO | 4448ade基線／本branch差異 | 七分區索引/安全可回退歸檔；來源目的SHA | Archive Manifest待產生 | 僅move已證無路徑風險者 |
| R02-010 | Codex | P0 | R02-007/R02-009 | TODO | 4448ade基線／本branch差異 | URLs/final Git/恢復入口/精確下一步一致 | NEXT-ACTION/RELEASE-STATUS | 交接後續已授權切片 |
| D03-V01 | Codex呈現/Gemini可接手 | P1 | R02-007 | TODO | 4448ade基線／本branch差異 | 獨立branch實際menu/兵模/地形/遺跡/手機diff與比較 | 待新visual diff與實跑screens | 先registry/tokens，保留已定風格 |
| D03-001 | Codex | P1 | R02-007 | TODO | 4448ade基線／本branch差異 | 版本registry/合法引用/依賴/fallback且可玩閉環 | 待source/tests | 先已批准內容接點 |
| D03-002 | Codex | P1 | 001＋數值裁決 | TODO | 4448ade基線／本branch差異 | 盾衛真招募/防禦/AI/存檔旅程 | 候選已詢問；未批准 | 只隔離實驗 |
| D03-003 | Codex | P1 | 001＋數值裁決 | TODO | 4448ade基線／本branch差異 | 機動偵察真招募/機動/AI/存檔旅程 | 候選已詢問；未批准 | 只隔離實驗 |
| D03-004 | Codex | P1 | 002/003＋科技裁決 | TODO | 4448ade基線／本branch差異 | 新科技分支，舊三科技行為保留 | CONTENT-EXTENSION-PROPOSAL | 資料模型→合法Action |
| D03-005 | Codex | P1 | 城市裁決 | TODO | 4448ade基線／本branch差異 | 一完整簡化投資/成長循環 | 目前僅候選 | 提出精確最小規則 |
| D03-006 | Codex | P1 | 地形/遺跡裁決 | TODO | 4448ade基線／本branch差異 | 新互動及獨立ruleset migration，不改G1 | Relic proposal | 先舊版兼容/正負例 |
| D03-007 | Codex | P0 | 已實作片段 | TODO | 4448ade基線／本branch差異 | AI/Fog/確定性/不變性/SaveReplay/真Gameplay | 待新反例與實跑 | 逐slice RED→GREEN |
| D03-008 | Codex/Gemini | P1 | V01/Gameplay契約 | TODO | 4448ade基線／本branch差異 | UI真Action/安全events，無第二reducer | 待frontend handoff | 整合測試後PR |
| D03-009 | 主創 | P0 | R02-008 | TODO | 4448ade基線／本branch差異 | 真人/真機實際操作與體驗紀錄 | 無，不能以Browser代答 | 提供可玩候選後測 |
| D03-010 | Codex | P1 | 007/008 | TODO | 4448ade基線／本branch差異 | 獨立PR/RC及限制列示，不覆蓋Demo02 | 待 | Gate成立才發布 |

## 執行紀律
- 有明確授權則持續下一個安全Task；新規則裁決/資料安全/權限阻擋才停該項。
- 每個切片更新本表與NEXT-ACTION，fresh證據先於PASS；原FAIL不刪不覆寫。
- root單一source writer，獨立review只讀。全branch final review後重要缺陷以TDD修；沒有獨立結果不冒稱已審。
- 公開文件不包含個人絕對路徑、private world或原hidden trace。實際本機路由在私有inventory，不是第二份公開狀態。
