# Demo03 第一批玩法：已批准隔離預覽基準

狀態：隔離預覽數值/新局專用方向已USER_CONFIRMED，兩兵/兩科技隔離runtime已IMPLEMENTED並有TESTED_PASS；正式平衡與後續機制未定。下表已批准作隔離預覽基準；正式平衡/Canon未定，不更動Demo02/g1-ccts-1。主創要求「未批准的平衡數值可作隔離實驗，不直接混入正式規則」，已獲主創批准的測試基準見D03-PREVIEW-001；只允許獨立預覽，不更動G1正式規則。

## 兩兵種與科技的具體候選

| 項目 | 費用 | HP | 攻 | 防 | 射程 | 移動 | 基礎視野 | 前置／取捨 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| 既有infantry | 4 | 10 | 4 | 1 | 1 | 1 | 2 | 現行UNIT_STATS，不改 |
| 既有scout | 5 | 7 | 3 | 0 | 1 | 2 | 3 | 現行UNIT_STATS，尋徑另有+1視野，不改 |
| 既有archer | 6 | 7 | 3 | 0 | 2 | 1 | 2 | 現行弓術解鎖，不改 |
| 盾衛候選 | 6 | 10 | 3 | 2 | 1 | 1 | 2 | 新防禦工程解鎖；較低攻擊換守點，沒有嘲諷/護衛光環/阻擋新規則 |
| 機動偵察候選 | 7 | 7 | 3 | 0 | 1 | 3 | 3 | 新軍事機動解鎖；較高費用換機動，仍受既有地形/友軍阻擋 |

新防禦工程候選研究費7，解鎖盾衛，先不加前置。新軍事機動候選費6，前置既有pathfinding，解鎖機動偵察。既有farm/archery/pathfinding費用與效果完全保留。新種是否承接尋徑的+1視野仍需連同角色定義裁決，不能因名稱含偵察就自行套用。

這些未經真人或策略平衡驗證。盾衛可能加劇低傷害/攻城僵局，必須測據點控制及消耗，不能只比較存活回合。機動偵察的額外研究/招募成本需與早期多招一兵比較，不能只看移動3優於2。新文明傾向只是守備/探索工作角色，沒有新增Canon文明。

## 版本工程決策 D03-VERSION-001（IMPLEMENTED，隔離預覽）

推薦第一個預覽採新局專用新ruleset，舊G1存檔仍以legacy模式續玩；不原地轉換舊局。採demo03-preview-1 / project4x-save-2 / project4x-replay-2，綁固定內容SHA-256與g1-mapgen-1。契約及兩包已通過獨立Core審查。另一方案是立即做跨ruleset局中遷移，但需處理歷史指令在哪版重播、初始世界、canonical hash及復原，成本更高，不建議第一片同時做。

版本設計前的歷史source事實：Observation.ruleset已存在（src/core/types.ts:32）；UNIT_STATS/TECH_STATS是封閉G1資料（:38/:43）；persistence.ts:16/:104嚴格只接受save1/replay1＋g1。Save1沒有content hash/generator version欄位。現行版本已實作新DTO及固定兩包分流，不能用這段歷史基線判定runtime仍只接受G1；也不能宣稱已有任意外掛包相容性。

目標是唯一applyCommand依版本化Definition選規則，不複製第二個reducer。Definition須有穩定namespace/ID/version、前置DAG、合法引用、白名單效果、素材fallback及hash。AI仍只讀Observation，依其ruleset解析公開Definition，不讀全知state。GameSession保留requestId/version/generation/AI取消/先驗後替換。新DTO才可增加content hash/generator version，舊schema exact keys及canonical/replay語意不靜默變更。

## 批准後的真實垂直切片驗收

1. Definition驗證：未知引用、重複ID、循環前置、缺素材/非法效果拒絕；既有G1數值逐項相同。
2. 先盾衛Research→Recruit→新兵次己回合行動→真正防禦差異，再機動偵察的合法機動/地形路線；都需付費、實際command及正負例。
3. UI只列真legalActions；新兵視覺/科技資料有fallback，無第二套玩法；兩新單位不可只做兩個按鈕。
4. Observation-only AI能研究/招募/使用新種，Fog非干擾、確定性、輸入不變性及R2/R3/R4/R6反例保留；不偽造winner，不把新版本對局混進R5 87/13。
5. 舊save/replay golden fixtures仍通過；新局完成Save/Load/Replay、generation失效/重送/失敗import等契約回歸。
6. 真Gameplay旅程與真人試玩；完整Demo03至少一個新策略循環。城市/道路/遺跡發現取得分離另立後續數值與遷移裁決。

目前D03-V01已merge PR3。隔離預覽已實作固定Gameplay registry、兩新種、兩新科技、同reducer版本分流、Save2/Replay2、Session/AI/事件及真UI閉環；257tests/check/build、既有Browser11/Gameplay12/Demo/PWA及桌機/觸控預覽旅程PASS，source/evidence見verification/DEMO03-PREVIEW。尚未等同正式平衡、Canon或Demo03 Release。城市/地形/遺跡新版仍NOT_IMPLEMENTED；未決新偵察額外視野不啟用。

### D03-VERSION-001 的取捨與恢復

採固定兩包而非任意外掛；優點是舊局與內容摘要可確定重建，沒有新依賴/外部執行碼；代價是未來第三包/新效果必須另審及擴充白名單。validateRuleset只做結構/引用/DAG，固定摘要由建置測試驗證，不冒稱runtime任意包密碼驗證器。保持frontend-1方法/capability結構，Replay結果新增明確literal；同bundle consumer已更新，未更新的外部consumer不宣稱相容預覽。回退用既有Demo02 Tag/下載包或G1入口，舊存檔不轉換；預覽存檔只在理解Save2的預覽版本續玩，不降版偷偷開啟。
