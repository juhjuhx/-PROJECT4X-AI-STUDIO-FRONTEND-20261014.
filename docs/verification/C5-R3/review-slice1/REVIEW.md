# REVIEWER

Codex `/root/r3_independent_review`，獨立唯讀審查。載入 canonical `using-superpowers`、`code-review-excellence`、`requesting-code-review` 與 `codex-engineering-guardrails:code-verification`；未呼叫外部審查服務、未更改 project。

# SCOPE

基線 `8acc52698b9553e74961d38c54e11dfa301268e5`，僅審查 C5-R3 第一片目標剪枝修補及新增回歸測試。

- `src/core/ai.ts` SHA256 `763d1086b11fd23898fa98a670cfd941fcfc5ea7146a158e17bfcc57e9304aa5`
- `tests/ai-stalemate.test.ts` SHA256 `297f8a93753baa080cf6bd0c46e44891d7e8aac13c2852f0596592e64cc088ef`
- 42 個 tracked 程式／測試／設定檔的凍結 manifest SHA256 `49e3f40d4c2d6c267334e43f8bb1d1ae1bc1c2c712827bfcc5517a07a70a77c3`（計算方式：UTF-8 JSON，key 排序、separators=(',',':')、ensure_ascii=False）。

已將 AI、規則、型別及受測 test 凍結於本 evidence 目錄，執行使用凍結檔，不依賴 parent 稍後修改。審查時間與個別檔案雜湊見 `manifest.json`。

# FINDINGS

未發現 blocker 或其他實質缺陷。

**剪枝正確性：** 每個目標的 terrain BFS 與 occupied BFS 使用相同 sources、鄰接與地形通行條件；occupied graph 額外禁止非本單位佔位格。sources 在兩者均同樣初始化。故可達 occupied 距離不小於 terrain 距離。所有現行目標權重皆正數，因此 `weight/(terrainDistance+4)` 是實際價值上界。候選依該上界遞減排序；下一上界嚴格小於已得最佳實際值時可安全停止。條件使用 `<`，仍評估相等上界，以保留 y/x 同分順序。前方目標不可達不更新 bestValue，仍繼續搜尋；全不可達維持既有 fallback。

**資料界線與來源：** AI runtime 仍僅 import `UNIT_STATS` 及型別，決策資料只取 Observation；新增程式無 seed 重建、canonical state、歷史 transcript、外部診斷匯入、全域記憶或隱藏資料入口。新增測試是合成地圖；沒有把真實 seed 的座標或預期 action 寫進 policy。

**保護範圍：** 初始 tracked 差異僅上述兩檔（35 additions／2 deletions）；`game.ts`、`types.ts`、session、scripts、package/lock、tsconfig、vite config 均與基線 byte-identical。winner／規則／schema／權重／同分排序／move scoring／診斷上限未變。另有 parent 所建 untracked `docs/verification/C5-R3/C5-R3-ROOT-CAUSE.md`，未參與 runtime 匯入。完整比對見 `source-surface.json`、`source-manifest.json`、`protected-surface.json`。

# EVIDENCE

環境 Node v26.10.0，已安裝 TypeScript 7.0.2、tsx 4.23.15；未安裝或變更依賴。

| 要求／風險 | 新鮮證據 | 結果 |
|---|---|---|
| 新回歸能抓舊缺陷 | 凍結現有 7 個 stalemate tests；外部第五目標案例：baseline north `(3,4)`、candidate south `(3,6)`；candidate action 由真 `applyCommand` 接受 | PASS |
| 等上界仍遵守座標同分規則 | 東側目標 terrain 3／occupied 5；西北目標 terrain 5／occupied 5。candidate north `(4,5)`，故意將 `<` 改 `<=` 的 mutant east `(5,6)`，mutant 被反例區分 | PASS |
| 不可達候選不可過早停止 | 整張地圖友軍牆：前四不可達、第五可達仍往 south；全部目標不可達且仍有合法 Move 時回傳 EndTurn | PASS |
| fog 不可讀私有資料 | 兩份 canonical state 的隱藏地形、敵軍、據點不同，Observation 完全相同，action 相同 | PASS |
| stateless／deterministic／唯讀 | clone 重跑、穿插另一 Observation、遞迴 Object.freeze、修改回傳 action 後重跑皆一致；輸入不變 | PASS |
| 剪枝等價完整目標評估 | 256 個合成障礙／友軍佔位地圖，其中 128 含 unknown fog，256 均進入 Move 並回傳合法 Move；與移除剪枝的完整評估結果一致 | PASS |
| 型別與保護範圍 | frozen subset TypeScript strict noEmit；tracked source 與 baseline byte 比對；git diff --check | PASS |

聚合實測 **14 tests／14 pass／0 fail**，exit 0；stderr 空。`focused-command.json` 記錄完整指令／cwd／exit／耗時；原始輸出 `focused-review.stdout.log`、`focused-review.stderr.log`。獨立合成案例見 `獨立審查.test.ts`；完整評估／等號 mutant／舊版 AI 僅存於外部 evidence，未改 production。

frozen subset typecheck exit 0，stdout／stderr 皆空；完整參數與結果見 `typecheck-command.json`、`frozen-typecheck.*.log`。本 session 沒有可呼叫的 lsp_diagnostics，使用實際 TypeScript checker。

# VERDICT

**第一片規格與工程品質：PASS（限定上述 frozen source hash）。** 無需阻擋此片採納。

此 verdict 證明目標篩選局部修補、合法動作、剪枝邊界、fog 與純函式性；沒有執行 full seed010／full100，沒有推論終局率或整體 Playable Alpha 通過。沒有審查 parent 稍後另行加入的政策片段；parent 仍需對最終整合來源執行其必要 gates。
