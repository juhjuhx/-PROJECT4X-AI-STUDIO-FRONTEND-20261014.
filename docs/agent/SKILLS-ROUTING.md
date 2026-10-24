> Demo02：固定官方Addy 0.6.13／aeac41d4，專案局部文件路由與安全審查見SKILL-REGISTRY.json；CONSTRAINTS.md為當前品質約束，不安裝hooks或全域設定。\n\n# Agent Skill Router｜分階段選用與現況

## 2026-10-17 C2 實際路由

實際讀取並應用 using-superpowers、test-driven-development、executing-plans、subagent-driven-development、verification-before-completion、code-work／code-verification、requesting-code-review、code-review-excellence、open-code-review-delegate、addyosmani-documentation-and-adrs；依 C1 已批准規格執行，不重新要求設計批准。主要切片 RED/GREEN 及額外事後測試分列 C2-IMPLEMENTATION-STATUS。worker限定互斥檔案、root接線，沒有共享檔案整檔覆寫。原 reviewer額度錯誤保留，恢復後獨立報告完成。沒有lsp_diagnostics工具、沒有外部OCR LLM、沒安裝新依賴或變更全域agent設定。OCR v1.13.0清單／規則／coverage在隔離evidence，逐檔 reviewed/skipped明示。未啟用無關視覺技能或重新設計世界觀。

## C0/C1 歷史實際路由

技能取 canonical `~/.agents/skills/`；Guardrails 取實際安裝 plugin 的 code-verification/code-work。只列本輪實際狀態，不把 D2 文件的「內建技能」主張當本機安裝證據。

| 技能 | 本輪狀態 | 實際用途／限制 |
|---|---|---|
| using-superpowers | 已讀／採用 | 來源優先、小階段、文件恢復與工具核對 |
| brainstorming | 已讀／設計階段採用 | 現況→替代方案→C1 interface；使用者已指定架構方向，本輪未實作 runtime |
| writing-plans | 已讀／C2 待採用 | PLAYABLE-ALPHA 記分段順序；未宣稱已完成所有 runtime implementation plan |
| systematic-debugging | 已讀／採用 | 實際來源反例、定位錯誤機制；未改產品程式 |
| test-driven-development | 已讀／待 C2 | 本輪沒有新 runtime，沒有宣稱執行 RED→GREEN |
| requesting-code-review | 已讀／採用 | 已委派獨立 reviewer，實際報告保存；最終對話額度中斷，未把它當 C1 runtime 驗收 |
| verification-before-completion | 已讀／採用 | fresh check/test/build/browser、source hash、完整 log、型別與 final diff 核對 |
| code-verification | 已讀／採用 | 對照來源、獨立規格與證據，區分 command exit0 與有效驗收覆蓋 |
| code-work | 已讀／待 C2 | 保行為增量抽取；本輪產品 source 不改 |
| open-code-review | 已讀 | 沒有呼叫需外部 LLM 的 `ocr review` |
| open-code-review-delegate | 已讀／實際執行 | 本機 v1.13.0 preview/rule JSON + 宿主審查；coverage 15 reviewed/17 skipped，原始清單 45 files/32 reviewable/13 excluded |
| using-git-worktrees | 已讀／採用 | 獨立 C1 branch；另外 D2 審查 worktree 只作 OCR 比較，不合主線 |

完整 raw logs、coverage、反例在隔離目錄 evidence。未發現可呼叫 lsp_diagnostics，本輪不聲稱執行；docs 目標宣告與消費者負例另以 TypeScript strict + skipLibCheck=false 驗證。以下是之前發布基線的歷史路由紀錄。

本檔是需求路由與證據紀錄，**不是所有列出的技能都已安裝或執行**。每一階段先挑 7–15 個「若存在且適用」的候選；不存在則記缺件，不能替代技能程式或虛構執行結果。未有 Git diff / PR 時不能把 official-code-review 的無發現當作全面通過。

| 階段 | 相關候選技能／工具 | 驗證狀態 |
|---|---|---|
| P0 原始碼／規則核對 | using-superpowers、code-verification、receiving-code-review、requesting-code-review、open-code-review、addyosmani-code-review-and-quality、brooks-brooks-audit、understand-domain | 本輪只實際讀 superpowers 與 codex guardrails；另有 source 靜態核對。Alibaba OCR 有 2026-10-13 Mac 封存證據，**本輪沒有重新執行**。其餘可用性未驗 |
| P1 Git docs／結構 | writing-plans、code-work、verification-before-completion、addyosmani-documentation-and-adrs、addyosmani-code-simplification、improve-codebase-architecture、pro-context-optimizer、pro-token-efficiency | 實際產出以檔案 diff 和 hash 驗證；未安裝的 skills 不宣稱已調用 |
| P2 UI Studio | UI-UX-Pro-Max、visual-atelier v2、gpt-tasteskill、taste-skill、stitch-skill、styleseed、agnes-vision、fixing-motion-performance、pro-deslop | 僅後續 UI 作業候選；本輪不生成視覺，不混成已使用 |
| P3 GitHub／驗證 | code-verification、verification-before-completion、requesting-code-review、code-review-excellence、official-code-review、pr-review-toolkit、finishing-a-development-branch、addyosmani-shipping-and-launch、pro-replay-learnings | 沒有 PR；本輪未執行 full100，CI 待首次上傳 |

**Token／MCP 節流**：`pro-mcp-audit`、`pro-permission-tuner`、`pro-batch-orchestration`、`dispatching-parallel-agents` 等為可選；不修改全域模型、MCP 憑證或權限來湊技能使用率。用短文件入口及有證據的歷史進度避免上下文膨脹。

公開資料參考： [Addy Osmani Agent Skills](https://github.com/addyosmani/agent-skills)（24 個技能總數包括元技能）；[Alibaba open-code-review](https://github.com/alibaba/open-code-review)（Apache-2.0；需依 CLI 與 provider 條件運作）；[Superpowers](https://github.com/obra/superpowers)。這些專案**未被當成遊戲 runtime 依賴**。
