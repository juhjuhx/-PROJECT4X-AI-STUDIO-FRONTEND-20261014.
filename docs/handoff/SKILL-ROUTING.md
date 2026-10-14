# 本輪技能路由與階段待辦

實際讀取與sha見evidence/skill-routing.json。採每階段7–15相關入口，重用同輪已讀技能；沒有把24或候選全表寫成已執行完整工作流。技能應用只到本輪封存所需步驟；使用者禁止改source，覆蓋技能內fix/refactor/push等步驟。

## 階段1（11入口）

using-superpowers、deep-understanding、code-verification、code-review-excellence、open-code-review、open-code-review-delegate、official-code-review、addyosmani-source-driven-development、addyosmani-planning-and-task-breakdown、dispatching-parallel-agents、addyosmani-documentation-and-adrs。

## 階段2（12入口）

using-superpowers、deep-understanding、code-verification、verification-before-completion、code-review-excellence、addyosmani-code-review-and-quality、addyosmani-browser-testing-with-devtools、addyosmani-api-and-interface-design、receiving-code-review、requesting-code-review、improve-codebase-architecture、pro-token-efficiency。

## 階段3（10入口）

using-superpowers、deep-understanding、verification-before-completion、code-verification、addyosmani-documentation-and-adrs、addyosmani-source-driven-development、addyosmani-api-and-interface-design、pro-session-handoff、pro-context-optimizer、pro-token-efficiency。

階段1驗收：來源/Git/未提交全量copy/hash、主要模組盤點、權威鏈與深讀；已完成並有文件。階段2驗收：可執行既有checks與日志、具名測試映射、可重現缺陷；已完成，產品Gate TESTED_FAIL，100長測試本輪不再重跑。階段3驗收：文件、兩包、SHAmanifest/CRC/restore/還原build、未動原專案；以外層HANDOFF-VERIFICATION最終結果為準。

## Addy Osmani 24路由

不是24個都完整執行。官方來源/API/品質/文件/計畫/browser適用並已讀；context/recovery/shipping等方法由既有context與archive證據承接，不冒稱技能未讀卻已執行。其餘24入口存在於canonical，當新的正式工程修復/效能/安全/部署任务才按需載入；本輪無implementation/TDD/CI/CD/發布/迁移工作，禁止藉技能扩大scope。

## 使用者候選池的篩選

pr-review-toolkit、official-code-review是PR工作流：後者已讀但沒有PR，PR發布不適用。receiving/requesting適用收取／核驗獨立意見，沒有以未確認SHA填模板。code-simplification/deslop/brooks audit/test/review/sweep為候選，實際無修產品/刪除授權；不為加入技能而另跑重複審查。token/context已使用，不改MCP、權限、成本配置。pro-mcp-audit/pro-permission-tuner/pro-pro-workflow/finish-branch無本輪環境改動或branch發布工作。pro-replay-learnings/pro-survey-generator無額外訪談/資料收集需求。

fixing-motion-performance、visual-atelier v2、gpt-tasteskill/taste/stitch/ui-ux/styleseed、agnes-vision及Three.js系列本輪不改視覺、不採Three.js/新模型，也沒有生成圖需求；現有真截圖由browser＋人工檢視，沿已確認方向。fb-marketplace/career-ops-search/understand-domain等泛候選與封存不相干，不安裝、不宣稱使用。open-code-review優先採既有CLI delegate；不用外部LLM避免另建付費端點。

## 缺件／平台差異

superpowers plugin內沒有session-handoff；canonical pro-session-handoff frontmatter同名，已讀替代，缺精確名稱記錄，不假裝原插件已安裝。LSP與DevTools MCP沒有實際工具，用tsc/Playwright替代並標明。root思考强度無可調tool，沒有改Codex全域模型設定；已做深入source与可執行證據。

## 下一步而非本輪修復

先驗封包→重現010/中央搜尋→縮小policy缺口→由下一工程任務最小AI修復→fixed100＋verify；最新遺跡取得裁決另做規則版本化。GoogleAIStudio先讀其邊界，只做前端。完整流程见BLOCKERS-AND-NEXT-ACTIONS，不跳過失敗或擅自提高門檻。
