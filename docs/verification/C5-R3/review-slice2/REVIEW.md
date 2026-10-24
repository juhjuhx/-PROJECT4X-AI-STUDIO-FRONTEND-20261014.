# REVIEWER

Codex `/root/r3_independent_review`，第二片獨立唯讀審查。沿用已載入的 `using-superpowers`、`code-review-excellence`、`requesting-code-review`、`codex-engineering-guardrails:code-verification`。未改 project、未安裝依賴、未跑長局。

# SCOPE

基線 HEAD `8acc52698b9553e74961d38c54e11dfa301268e5`；第二片相對第一片的 delta：將原 bound 搜尋包成 local `routesThrough`，只有 full-traffic 完全沒有可達目標時改用 enemy-only potential。實際動作仍取自原 legalActions。

- 第二片 frozen `src/core/ai.ts` SHA256：`c16c640e5453b85c0939b405d43067c5d00bccab180dd4bac1c3bb96c73caddd`
- 第二片 frozen `tests/ai-stalemate.test.ts` SHA256：`e014f1c07f8c101d66aa03cf6c40cd8d041343dc54f85ae42dc05a205e47a7fe`
- 第一片 AI SHA256：`763d1086b11fd23898fa98a670cfd941fcfc5ea7146a158e17bfcc57e9304aa5`
- 42-file source manifest SHA256：`1c14fafbe477bbc1e551055ab384c7136655843b08f8ff9702c57ab3bf84e7c6`（key 排序、緊密 separators、ensure_ascii=False 的 UTF-8 JSON）。

來源與測試都存為本目錄 frozen 副本；與第一片 evidence 分開。精確差異見 `slice2-ai.ts.diff`、`slice2-ai-stalemate.test.ts.diff`，凍結時間見 `manifest.json`。

# FINDINGS

未發現 blocker 或其他實質程式缺陷。

1. **備援觸發正確。** 第一次 `routesThrough(blocked)` 遍歷所有可能改善最佳實際值的目標。只有完全沒有可達目標時才執行 enemy-only 第二次；仍有任一完整可達路線時保留原 traffic 目標選擇。第二次仍沿用原地形 graph、權重、嚴格 `<` 上界剪枝及座標同分規則；沒有修改 move scoring。
2. **不穿兵、不修改規則。** 備援距離只作評價。`movable` 仍是 legalActions 中的 Move，回傳為 copy。真 reducer 產生的斥候 move2 只能到友軍前一格，無跨越友軍的 Move；對實際 Move 呼叫 `applyCommand` 成功。抵達阻塞前後，將該兵重設 fresh 但保留友軍阻塞及合法後退格，policy 仍 EndTurn，沒有倒退或越兵。
3. **真繞路與地形阻絕保留。** 有完整交通繞路時選用第一片相同的反向第一步；沒有退化為友軍直線。全明地圖的 mountain 真隔絕仍 EndTurn；沒有把地形當友軍移除。
4. **迷霧界線保留。** 未新增 canonical state、seed 重建、歷史 transcript、診斷匯入、隱藏地形或全域記憶。既有 `validTerrain(null)=true` 是探索用的 optimistic potential，兩片皆如此，不能解讀為已證明未知通道可走。本次同 Observation 反例在未知通道 x=6 分別放 plain／mountain，policy 都只選相同合法空格接近；沒有讀取私有路況，也沒有對未知路線作成功保證。
5. **性能有界。** 若第一輪全不可達，必定已遍歷該單位的所有 promising goals；備援最多再遍歷同一集合一次。漸進複雜度不變，目標 BFS 次數最多增加一輪。實測見下表，未見本片性能 blocker；這不是完整長局效能保證。

非阻擋的測試品質觀察：project 新增測試在第一次 Move 後立刻斷言 EndTurn，此時 reinforcement 已 moved=true，單獨這一步不足以驗證下一回合不倒退。外部 `第二片獨立審查.test.ts` 另將該兵重設 fresh 並保留合法退路，已補驗真正等待行為。可把這個較強案例留作持久回歸。

# EVIDENCE

Node v26.10.0；既有 TypeScript 7.0.2／tsx 4.23.15。以下均 fresh 使用 frozen 副本。

| 風險 | 執行證據 | 結果 |
|---|---|---|
| 第一片回歸與邊界 | 7 個第一片外部案例，加第二片 project 的 9 個 stalemate tests | PASS |
| 新局部缺陷能區分前後 | 四／六格友軍阻塞合成例；第一片 EndTurn，第二片合法接近 Move 並經 reducer 接受 | PASS |
| 不能穿友軍 | scout move2，唯一合法 Move 是前一空格；抵達後 fresh 重試仍等待而不走合法退路 | PASS |
| 完整路徑優先及必要繞路 | 已知友軍阻斷直線但可繞路，第一／二片皆走 `(4,5)→(4,4)` | PASS |
| terrain／fog | mountain 隔絕 EndTurn；未知通道實際 plain／mountain 產生完全相同 Observation 與合法部分接近 | PASS |
| 純函式、無記憶 | 凍結輸入、clone 重跑、穿插另一決策、修改回傳 action、不改輸入 | PASS |
| 剪枝 | 256 合成地圖（128 有 unknown）與移除 pruning 的完整評估一致；equal-bound `<=` mutant 仍被反例區分 | PASS |
| 型別及保護範圍 | frozen strict TypeScript noEmit exit 0；42 tracked files 比對 baseline 僅 AI／test 兩檔變動 | PASS |

**20 tests／20 pass／0 fail，exit 0，stderr 空。** 指令與耗時：`focused-command.json`；原始 log：`focused-review.stdout.log`、`focused-review.stderr.log`。型別完整指令與原始輸出見 `typecheck-command.json`、`frozen-typecheck.*.log`。可呼叫工具沒有 lsp_diagnostics，使用實際 TypeScript checker。

有界性能（有儀表計數的 frozen copy；64 units＝40 fresh＋24 wall、10 goals、30 calls，4次 warmup）：

| 版本 | median | p95 | BFS / call | fallback units / call |
|---|---:|---:|---:|---:|
| 第一片 | 6.47ms | 7.09ms | 410 | 0 |
| 第二片 | 7.91ms | 9.30ms | 450 | 40 |

第二片在該案例的 BFS 增幅約9.8%，median 約22%。兩版測量未並行，均斷言輸入不變；第二片 action 為 legal Move，第一片為 EndTurn。儀表只存在外部 `measured-*.ts`，未改 production。完整腳本 `有界性能.ts`，指令與 stdout／stderr 見 `performance-command.json`、`performance-review.*.log`。數字代表此機與此案例，未設新門檻。

來源保護核對：`source-surface.json`、`source-manifest.json`。規則 `game.ts`、schema `types.ts`、session、scripts／門檻、依賴與設定皆與 HEAD byte-identical；新 helper 只位於原 `chooseAction` 的 local scope。

# VERDICT

**第二片規格／工程品質：PASS，限 frozen AI SHA256 `c16c640e5453b85c0939b405d43067c5d00bccab180dd4bac1c3bb96c73caddd`。** 沒有採納阻擋。

此審查證明局部增援接近修補及其行為邊界，不證明所有友軍最終會讓路，也不證明所有未知路線可達。未執行 full seed010／full100，不覆寫第一片 seed010 FAIL，不宣稱整體 Playable Alpha 或全局終局通過。parent 必須另外保存最終整合版的 gates 與長局結果。
