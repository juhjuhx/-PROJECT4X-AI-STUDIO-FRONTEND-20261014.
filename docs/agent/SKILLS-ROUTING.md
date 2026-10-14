# Agent Skill Router｜分階段選用與現況

本檔是需求路由與證據紀錄，**不是所有列出的技能都已安裝或執行**。每一階段先挑 7–15 個「若存在且適用」的候選；不存在則記缺件，不能替代技能程式或虛構執行結果。未有 Git diff / PR 時不能把 official-code-review 的無發現當作全面通過。

| 階段 | 相關候選技能／工具 | 驗證狀態 |
|---|---|---|
| P0 原始碼／規則核對 | using-superpowers、code-verification、receiving-code-review、requesting-code-review、open-code-review、addyosmani-code-review-and-quality、brooks-brooks-audit、understand-domain | 本輪只實際讀 superpowers 與 codex guardrails；另有 source 靜態核對。Alibaba OCR 有 2026-10-13 Mac 封存證據，**本輪沒有重新執行**。其餘可用性未驗 |
| P1 Git docs／結構 | writing-plans、code-work、verification-before-completion、addyosmani-documentation-and-adrs、addyosmani-code-simplification、improve-codebase-architecture、pro-context-optimizer、pro-token-efficiency | 實際產出以檔案 diff 和 hash 驗證；未安裝的 skills 不宣稱已調用 |
| P2 UI Studio | UI-UX-Pro-Max、visual-atelier v2、gpt-tasteskill、taste-skill、stitch-skill、styleseed、agnes-vision、fixing-motion-performance、pro-deslop | 僅後續 UI 作業候選；本輪不生成視覺，不混成已使用 |
| P3 GitHub／驗證 | code-verification、verification-before-completion、requesting-code-review、code-review-excellence、official-code-review、pr-review-toolkit、finishing-a-development-branch、addyosmani-shipping-and-launch、pro-replay-learnings | 沒有 PR；本輪未執行 full100，CI 待首次上傳 |

**Token／MCP 節流**：`pro-mcp-audit`、`pro-permission-tuner`、`pro-batch-orchestration`、`dispatching-parallel-agents` 等為可選；不修改全域模型、MCP 憑證或權限來湊技能使用率。用短文件入口及有證據的歷史進度避免上下文膨脹。

公開資料參考： [Addy Osmani Agent Skills](https://github.com/addyosmani/agent-skills)（24 個技能總數包括元技能）；[Alibaba open-code-review](https://github.com/alibaba/open-code-review)（Apache-2.0；需依 CLI 與 provider 條件運作）；[Superpowers](https://github.com/obra/superpowers)。這些專案**未被當成遊戲 runtime 依賴**。
