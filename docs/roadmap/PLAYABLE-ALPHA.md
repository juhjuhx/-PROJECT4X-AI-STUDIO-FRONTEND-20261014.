# 2026-10-24 產品化路線（當前入口）

主創已確認先既有規則Demo，再審新玩法。長期世界方向與舊工程結果原樣保留在下方。

```text
既有G1規則/單一core/session [IMPLEMENTED]
   ├─ D3 Canvas地圖/手機分頁 [IMPLEMENTED]
   ├─ 選單→真Move/Relic/Research→探索手札→獨立完成 [TESTED_PASS]
   ├─ Save/Load/Replay原契約＋本機任務sidecar [TESTED_PASS]
   └─ Web/PWA離線＋等待更新 [本機Chromium TESTED_PASS]
          └─ 可下載Demo候選 → 真人體驗/實體手機/公開HTTPS [UNVERIFIED/待發布]
C5 AI研究 [獨立路線，不阻擋探索Demo]
   ├─ R5凍結Full100 87完成/13超限；T3/T6 FAIL [歷史保留]
   └─ R6局部修補/協同研究 [全局收斂未完成，不合成winner]
新玩法 [PROPOSED，先主創裁決]
   ├─ 盾衛/機動偵察候選 → 精確數值/前置 → Core/API/AI/UI/Save/Tests
   ├─ 防禦編制研究分支 → 同一套垂直gate
   ├─ 古代道路互動 → 生成連通/Fog/版本gate
   └─ Relic發現/抵達取得分離 → 新ruleset與舊檔策略
文明/文化/外交/代謝/轉型/唯一世界起源 [批准方向，多數NOT_IMPLEMENTED]
Playable Alpha [PARTIAL，不能由自動測試或單seed升級]
```

候選的完整欄位與測試範圍見[內容擴充提案](../product/CONTENT-EXTENSION-PROPOSAL.md)。下一個已授權行動是先交付並真人試玩Demo，不直接加入新數值。Android缺JRE/SDK，APK BLOCKED；不自動安裝大型工具鏈。

---

# Playable Alpha 工程路線與 Gate

> 2026-10-20 CURRENT C5-R4：Observation-only frontier／已知地形再偵察 IMPLEMENTED；123 tests/check/build、prefix1100/0loop、原D02 673commands真揭露／winner0、seed010 winner0／534EndTurn／15418commands／終局SaveReplay true，TESTED_PASS。qa:browser11與獨立review通過。追加完整qa:gameplay因download.delete canceled及ENOSPC維持BLOCKED；本輪整體PARTIAL。full100/T3/T6 UNVERIFIED，Alpha PARTIAL；唯一續作NEXT-ACTION，詳細docs/verification/C5-R4/C5-R4-TEST-RESULTS.json；沒有push。

> 2026-10-19 歷史C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-18 歷史C5-R1：最小無記憶反例修補已批准並IMPLEMENTED；有限prefix/104tests/真UI回歸TESTED_PASS，完整seed010仍TESTED_FAIL（17937commands）。下一步先定位前線僵持反例；城市/科技擴充與新遺跡ruleset仍未實作，需各自Design→API→UI→Tests/Save證據。全量與真人驗收未完成，整體Alpha PARTIAL。

> 2026-10-18 CURRENT：C2fresh／C3工程整合candidate及C4-R0既有玩法旅程TESTED_PASS，詳C3-VERIFICATION；C5-R0固定seed010仍TESTED_FAIL，診斷已保存、策略未改。下方2026-10-17計畫/未知D3敘述保留為歷史，不覆蓋本段。新城市/科技/兵種與遺跡新版均待獨立規則切片，不是已完成功能。

```text
已批准規則 → 唯一core → GameSession v1 → D3 UI → 既有真Action旅程
                         C2/C3 工程通過             C4-R0 有限情境通過
  └─ C5-R1/R2局部修補 → C5-R3兩項因果修補 → seed010合法終局 TESTED_PASS
                                      ├─ D-02 frontier搜尋 [TESTED_FAIL，下一獨立切片]
                                      ├─ 固定001–100/T3/T6 [UNVERIFIED，需受控預算]
                                      └─ 真人/真機/45–90分鐘 [UNVERIFIED]
後續：城市/科技/兵種 [PROPOSED數值；先裁決] → Core/API/AI/UI/Save/Tests
      C6遺跡新權利 [批准方向；新版NOT_IMPLEMENTED] → migration proposal
整體 Playable Alpha [PARTIAL；不能將單seed與UI旅程當全量驗收]
```

後續每個玩法需Design→Action/Validator/State→Observation/API→AI→UI→Tests→Save/Replay版本證據。既有UI合併Gate不豁免完整full100、真人非對稱、真機與45–90分鐘的驗收。


更新 2026-10-17。這是已授權工程 program 的分段計畫；新增 gameplay 成本與數值均尚未決定，不能標 USER_CONFIRMED。現況：[INTEGRATION-STATUS](../handoff/INTEGRATION-STATUS.md)。

| 階段 | 寫入範圍 | 先建立的證據 | 完成條件 |
|---|---|---|---|
| C0 | 隔離 evidence／來源報告 | 最新 main、ZIP CRC/SHA、完整 diff、manifest、舊 local git | 已完成盤查；採納缺陷逐項列出 |
| C1 | docs/contracts、相關狀態／授權說明 | 真實 core signature、protected functions 比對、型別檢查 | 目標契約與所有權可交付；不冒稱 runtime |
| C2 | `src/session/**`、`src/presentation/**`、main 編排、契約測試 | duplicate/stale/generation/無效載入/AI取消/observer反例先 RED | 唯一 state holder；UI 只收能力分離的 port；同 Command/save/replay 結果保持 |
| C3 | 經核對的 D3 UI diff、main 最終接線 | 來源、視覺差異、全部 C0 findings、新 screenshot/bundle | 語意合併而非整檔覆寫；真 E2E、觸控、fog 與獨立 review |
| C4 | 城市招募旅程、UI contract、必要 core tests | 選城→選駐軍→合法移開→招募→EndTurn→新兵下一己回合 Move 的端到端反例 | 真的使用新兵；成本／新兵行動旗標／占位仍由 core 權威判定 |
| C5 | AI policy 與測試／診斷 | seed010 第一個可觀察策略失效點、最小反例、固定 seed 定義 | 不全知、不合成 winner、不刪 seed；同版固定 001–100 真實率與 log |
| C6 | 遺跡 ruleset migration proposal，批准後才程式 | 發現／抵達／取得／pending／fog／save/replay 對照 fixtures | 舊版 bundle 可重播或明確拒絕；無靜默遷移；新細節明示審批身份 |
| C7 | 整合測試、CI、handoff | 整合後 fresh check/test/build/browser、獨立 review、真機／真人缺口 | 工程與玩法雙軸分列；任何剩餘 FAIL 不宣稱整體 Alpha 完成 |

## C2 最小抽取順序

1. 先在 `tests/session.test.ts` 寫現存 Command 的同 payload 重送、異 payload、過期版本、舊世代、換局後舊 timer 的契約案例，確認失敗原因是 session 尚不存在；不把缺依賴當 RED。
2. 建 `src/session/game-session.ts`，只從 main 搬 state/dispatch/替換責任；`applyCommand` 保持原實作，首個切片先不改 UI 外觀、不改 AI policy。目標型別由 docs/contracts 移成正式 source type 後維護單一來源。
3. 建 `src/session/ai-driver.ts`，搬 beginAI/stopAI，注入 scheduler 以可控時間測取消／resume／1000 action 暫停；AI 只接 observe(aiActor)，未見真 winner 不提前終局。
4. 建 `src/session/persistence-controller.ts` 或同一 session 的最小內部函式，測 UTF-8 10MiB、候選校驗、失敗保局、load 成功才取消、延遲 save ack 不清新 dirty。保留核心 serializer/rebuilder。
5. `src/presentation/events.ts` 只接同 viewer 的 Observation pair 與受信任 own receipt；先做無事件 replacement/duplicate 與敵兵消失反例，再逐事件補觀測證據。缺證據的演出維持關閉。
6. main 僅逐函式接線；執行 `npm run check`、`npm test`、`npm run build`、`npm run qa:browser`。每次只整合一個依賴順序上的切片，檢查 diff、再獨立 review。新增 tests 自動被現有 `tests/*.test.ts` 指令納入。

C2 實作前使用 writing-plans 將當前已核對 spec 展開為可執行切片；TDD 只對新 runtime／bugfix 聲稱實際 RED→GREEN，不能把本輪文件型別檢查寫成 TDD 完成。

## 城市、科技與兵種

先交付現有招募閉環，避免只加按鈕。城市等級、繁榮／人口、經濟投資、防禦、生產力均 PROPOSED，尚未選定最小子集，也沒有新數值。探索／經濟／軍事路徑擴充同樣先列成本、前置、Action、state/observation、AI、UI契約、測試與版本影響，再實作一個真正策略分歧。

不能照搬 Polytopia 專有數值或內容。對新 major rules 的批准來源記入 DECISION-REGISTER；目前既有 UNIT_STATS/TECH_STATS 仍唯一有效 runtime 數值。長期文化、文明轉型、星際、世界真相、非對稱生存經濟與 G1.5 真人非對稱 gate 全保留，不在一次切片全塞入。

## 持續失敗與不可越過的門檻

full100=62/38、seed010 未終局、T3/T6 仍是相同 core/policy 的歷史 FAIL，本輪沒有跑新全量 headless 或修 AI。C5 只有真的重跑固定 seed 才可更新終局率。U>0 OR S>0 續玩、U=S=0 淘汰、無流亡倒數及不可全知 AI 持續有效。

未知 D3、manifest 不一致、pinch/fog 斷言不足、真人／實體手機未驗都需逐項保留；npm tests 或 CI 綠燈不能合併成整體可玩驗收 PASS。

## 2026-10-20 R4之後的實際路線

```text
C5-R3合法終局 → R4 primary frontier／sight fallback／uniform recon
                ├─ D02＋123 tests＋prefix＋seed010＋獨立review [TESTED_PASS]
                ├─ qa:browser11 [TESTED_PASS]
                └─ 完整qa:gameplay [BLOCKED：下載清理／ENOSPC]
恢復QA容量 → 原220門檻真旅程 → C5-R5受控001–100逐局終局／SaveReplay
                                      [UNVERIFIED；先補每局QA覆蓋與資源預算]
真人／實體手機／45–90分鐘／非對稱驗收 [UNVERIFIED]
城市／科技／兵種數值仍PROPOSED，另循主創裁決；Alpha仍PARTIAL
```
