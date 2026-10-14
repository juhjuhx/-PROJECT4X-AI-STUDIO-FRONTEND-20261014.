# CCTS 規格｜文明延續、政權轉化與文化影響獨立

盤查日：2026-10-13。CCTS 是 v0.4 決策補充，原件不是 v0.5 全量替換，也不是全部功能已實作。來源：[原始補充](../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/PROJECT4X-CCTS-DECISION-ADDENDUM.md)、[原始 JSON](../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/DECISIONS-20261011.json)、[後續 G1 裁決整合稿](../../history/Fake-Polytopia/第四輪CCTS審查-20261011/G1-裁決整合稿.md)、[最新使用者確認](../handoff/USER-REQUEST-DECISIONS.md)。

## 確認方向及落地範圍

| 裁決 | USER_CONFIRMED | IMPLEMENTED／缺口 |
|---|---|---|
| EXILE-01 | G1 首都淪陷後，有符合存續條件的殘軍／據點可繼續操作簡化流亡 | 已有 life=exiled，仍有一般合法命令 |
| EXILE-02 | 可收復故土、異地建國，也可不復國、奪政權或建立非傳統體系 | 已有軍事收復與異地中心；非軍事奪權／非領土政治體系未實作 |
| POLITY-01 | 政治控制與文化影響獨立，可以同時或先後變動 | 據點 owner 及 identity／lineage 有分界；文化引擎未實作 |
| CCTS-D1 | U>0 或 S>0 可延續；0金不淘汰 | lifecycle 依單位 OR 據點 |
| CCTS-D2 | 流亡中持續控制據點跨完整對手回合後，免費主動建中心；不自動復辟 | heldSince／completedTurns、EstablishCapital |
| CCTS-D3 | 只有 U=0 且 S=0 才淘汰；沒有流亡倒數 | lifecycle，沒有倒數欄位 |
| GM-12 | 無領土仍可長期宗教／地下／文化經營並尋其他勝利 | G1 單位存活可續玩；完整相關玩法未實作 |
| GM-11 | 改革、革命、分裂、融合與徹底蛻變有代價 | 未實作 |

U 是權威規則承認的己方存活單位數；S 是己方控制據點數。不能以「看起來翻不回來」「沒有錢」「丟了歷史首都」替代 U/S 判定。45–90 分鐘不是流亡倒數或測試超限判負規則。

## G1 已落地生命週期

```text
有有效當前中心：active
中心失守，仍 U>0 或 S>0：exiled
exiled + 已跨完整對手回合持有的己方據點 + 主動 EstablishCapital：active
U=0 且 S=0：eliminated → 對手 winner
```

source 沒有持久 `restored` life 值；重建成功回 active。這是工程表示方式，不是少了一項主創世界方向。來源：[types.ts](../../src/core/types.ts)、[game.ts](../../src/core/game.ts) 的 `lifecycle`、`legalActions`、`EstablishCapital`。

`originalCapitalId` 保存歷史故土，`centerId` 表示當前政治中心。失去 C0 → 在 V 建 C1 → 再收回 C0 → 再失 C0，若 C1 仍有效，不應再判失都；收回 C0 不強迫搬都、復舊制度或改寫 lineage。center 至多一個且必須為己方有效據點。

新佔據點同己方回合不能立即建立中心；控制中斷後重算持有資格，既有已滿足資格的據點不用額外等待。建中心免費，不能重領收入、重設 moved/acted、重置招募或免費生成軍隊。合法性使用權威回合紀錄，不使用時鐘／UI 停留時間。

目前一般流亡行為有移動、攻擊、佔領、研究；己方據點沿既有收入及招募。主動建中心不是勝利；AI 也須按真正淘汰終局停止，不能丟都就停。

## 遺跡處置權的正式衝突

此衝突必須保留新舊裁決，不能用概括的「最新 CCTS」抹平。

| 層次 | 正式來源與原意 | 狀態 |
|---|---|---|
| 歷史 RELIC-D1 | 第三輪 `G1-機制規格-審查修訂.md` §4：首次己方回合看見者取得唯一處置權；明文「不是先抵達者取得」 | USER_CONFIRMED 歷史裁決；被近期明確補充局部覆寫 |
| 第四輪整合 | `G1-裁決整合稿.md` §4 明說 GM-02「抵達／取得」沒有明載覆寫 RELIC-D1，沿用先看見 | 正式歷史解釋，不能倒改為一直先抵達 |
| 現行 source／MVP 契約 | `updateKnowledge` 發現可見未領遺跡即 claimedBy=active，pendingRelic 立即必答 | IMPLEMENTED，符合歷史 D1；與最新抵達取得方向不同 |
| 近期主創補充 | 發現／取得分離；發現有情報優勢；實際抵達者優先處置 | USER_CONFIRMED；NOT_IMPLEMENTED |

因此本交接的**設計權威以近期明確補充為準，產品行為仍照封存 ruleset `g1-ccts-1`**。本次沒有修改 core、存檔版號、測試或遊戲說明來假裝已完成切換。

未凍結的細部包括：實際抵達的精確合法距離／佔位及命令時點、同回合多方競合、發現者的具體情報收益、物件取得後持續研究如何記錄。方向已確認，這些細節不得由本文件自造數值。未來落地必須明確版本化，保留舊規則存檔，並重驗 fog、AI、必答選擇與 replay。

## 已相容的遺跡裁決

| 裁決 | USER_CONFIRMED | 現行狀態 |
|---|---|---|
| GM-01 | 多文明可持續研究，實物取走不重生 | G1 單次 claimedBy／resolved；多層研究未實作 |
| GM-02 | G1 首次取得立即選，不積累可延後 inbox | canonical pending phase，只接受 ResolveRelic；已實作但取得觸發點仍舊 D1 |
| GM-03／RELIC-D2 | 最多3個仍未知地形格；不足3揭剩餘實數，選前提示，不補金／敵軍 | intelTiles／Observation.pendingRelic.intelCount；0格無情報合法候選 |
| GM-04 | 安全／危險／特殊遺跡區分，風險來源可辨識 | 現 G1 四個安全遺跡；危險類型未實作 |
| GM-07 | 同物件可有根本不同文明表象 | 基本觀測隔離；異文明感知未實作 |
| GM-08 | 極少神器可翻轉整場力量結構，但因果固定、線索與反制 | 戰鬥神器未實作 |

4 金幣、三格上限之外的地形排序、四個遺跡／雙方早期安全配置、人類先手是自主 MVP 工程預設，不能冒稱所有數值由主創永遠鎖定。現行 intel 排序為距遺跡曼哈頓距離→y→x；情報只把 explored 地形標為已知，不更新 surveyed 據點／遺跡觀測。

## 政權、文化與人口的長期契約

**USER_CONFIRMED**：政治奪權與文化採用不是同一件事，征服未同化、同化未奪權、反向同化、多文明多國並存都合法。政府控制與居民認同不應被一個 owner 百分比取代。

**PROPOSED／NOT_IMPLEMENTED**：PolityRegistry、CivilizationLineage、PopulationAffiliation、CulturalInfluenceEngine、PoliticalTransitionEngine、PerceptionProjector、VictoryEvaluator 是歷史模塊候選；PoliticalControlChanged、CulturalAdoptionChanged、DiasporaMoved、InstitutionAdopted、PolityReconstituted 是事件草圖。它們未因寫進文檔成為 runtime。G1 的軍事限縮由自主 MVP 契約採為工程範圍；早期 D4 非軍事實作邊界、D5 文化粒度並沒有因此全部變成新主創裁決。

## 保存、觀測與驗收界線

同版／seed／commands 可重播；無效命令原狀返回；成功 requestId 重送不能雙花。必答 phase／處置權、中心、持有歷史、收入與行動旗標須在 save/replay 保留；舊首都即勝／延後 inbox 規則不能靜默改為新版。

現版在載入發佈前驗證版本、語意與完整歷史重建，失敗不替換現局。完整本機存檔含世界真相，不是公開迷霧安全回放；回放是重建驗證，沒有逐幀播放 UI。

歷史驗收 EX-A 孤軍流亡、EX-B 有村無軍0金、EX-C 真淘汰、EX-D 中心角色、EX-E 重複失都、EX-F 收支旗標、EX-G 版本化續局、REL-I 必答選擇、AI-X 完整新版局、UX-M 真人／觸控仍保留於 [G1 整合原件](../../history/Fake-Polytopia/第四輪CCTS審查-20261011/G1-裁決整合稿.md)。本次只讀盤查，沒有新執行測試。

原 CCTS 所述 `PROJECT4X-G1-PROTOTYPE-20261011` source 和 11/11 QA 未取得，不能移用為本 MVP 證據。現版工程最新結果由根代理交接證據統合：100固定 seed 已跑完，62真正終局／38超限 FAIL；44項測試、型別、build及模擬觸控不是本人完整一局、實體手機或45–90分鐘驗收。PLAYABILITY、G1.5 真人／代謝仍 UNVERIFIED／NOT_IMPLEMENTED。
