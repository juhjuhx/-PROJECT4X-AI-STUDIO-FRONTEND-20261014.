# 內容擴充切片與Relic升版提案

2026-10-24。**PROPOSED／NOT_IMPLEMENTED**，主創已確認本輪先交既有規則Demo，新兵種、科技、地形後審。本文件不是新裁決或新數值表。權威：[DECISION-REGISTER](../game-design/DECISION-REGISTER.md)、[GAME-RULEBOOK](../game-design/GAME-RULEBOOK.md)、[CCTS-SPEC](../game-design/CCTS-SPEC.md)、[CIVILIZATION-SYSTEMS](../game-design/CIVILIZATION-SYSTEMS.md)。

## 最窄擴充接點

目前 `src/core/types.ts` 用封閉union `UnitKind/Tech/Terrain` 和 `UNIT_STATS/TECH_STATS`；`game.ts` 同時負責合法動作、效果、生成；`persistence.ts` 做嚴格舊schema重建。不是任意外掛內容引擎。現在新增的 `src/demo/content.ts` 只是內建敘事包，版本化ID、語系、ruleset、素材與效果白名單可驗證，效果僅文字／觀測目標；不能載入任意程式或修改金幣。它是已實作的垂直切片，不冒稱九種Gameplay Definition全部完成。

```text
現在：G1固定內容 → applyCommand → GameSession → GameplayPort → Demo敘事目標
                                          └─ 本機sidecar：綁定save bytes與pack版本
下一步候選：批准設計 → 固定Definition registry → validator/effect白名單
                      → Observation/API → AI合法候選 → UI → Save/Replay版本gate
```

| Definition候選 | 現況 | 最小設計／兼容要求 |
|---|---|---|
| UnitDefinition | UNIT_STATS已存在；可插拔NOT_IMPLEMENTED | namespace穩定ID、cost/HP/攻防/射程/移視、前置、素材及AI角色；舊union按新ruleset顯式擴充 |
| TechnologyDefinition | 三個固定TECH_STATS | prerequisite DAG與解鎖效果白名單；不允許任意回呼，測循環及未知引用 |
| TerrainDefinition | 五種union／game移動判定 | 移動、視野、掩護、生成限制；先一種互動，不全面改生成器 |
| SiteDefinition | capital/village固定 | 政治中心身份與歷史首都分離；城市成長另審，不用UI等級冒充效果 |
| RuinDefinition | gold/intel固定必答 | 發現與取得分離需新ruleset，不改舊reward語意 |
| EncounterDefinition | Demo敘事包 IMPLEMENTED，通用事件引擎NOT_IMPLEMENTED | trigger只收Observation及可信own receipt，先文字及既有效果，未知情報不得出現 |
| CivilizationDefinition | identityId/lineageId標籤 | 生存代謝／文化／轉型為批准方向但runtime未完成；先非對稱生存經濟真人切片 |
| ResourceDefinition | 只有gold | 不把金幣重新命名就宣稱代謝；新增資源需State/AI/存檔正式升版 |
| ContentPackManifest | 內建narrative v1 IMPLEMENTED；通用Gameplay pack NOT_IMPLEMENTED | namespace:id/version、locale、assets/license、dependencies、ruleset兼容範圍、manifest hash；拒絕重複ID/未知效果/路徑穿越/缺素材 |

Gameplay pack導入前：批准完整效果 → 穩定registry → 凍結舊ruleset bundle及content hash → 重播舊save；不相容時明確拒絕。若需migration，必須另給版本、確定性映射、回復與舊檔測試。不能就地改 `g1-ccts-1` 數值。Demo sidecar不是權威save schema，只保存可見任務進度；檔案匯入仍恢復戰局，sidecar不跟隨外部匯出。

## 六個候選兵種

全數PROPOSED；移動／攻防／射程／費用**沒有已批准新數字**。以下描述是待測相對角色，不是runtime統計。

| Identity／文明傾向 | 戰場角色／移動 | 攻防／射程 | 招募前置 | Counterplay | 輪廓／動畫 | AI互動／必要測試 |
|---|---|---|---|---|---|---|
| 盾衛／城邦守備傳統 | 穩定前線、低機動候選 | 近距、偏防守；具體值待審 | 防禦研究或城市設施待選 | 繞行與遠程消耗，不能無代價卡死全圖 | 大盾寬輪廓；防守、受擊、轉向 | 守點與讓路；掩護是否疊加、入城窗口、同回合旗標 |
| 長槍兵／步兵編制文明 | 反快速突入、保持陣線 | 近距反衝鋒條件待審 | 編制研究候選 | 遠程與側向機動；現G1無衝鋒，不先假設有克制 | 長柄細高輪廓；架槍、刺擊 | 不創造不存在的騎兵判定；條件觸發與負例 |
| 工程兵／工坊及軍團 | 攻城支援、慢部署候選 | 工事／據點效果待審；不先加傷害 | 工程科技候選 | 護衛需求、暴露成本 | 工具架、背包；部署、維修 | 只送合法支援Action；攻城協同、重播及佔位 |
| 騎乘偵察／遊牧與商路文明 | 高機動迂迴與情報 | 輕裝近距；不能無限制穿山水 | 物流或馴養分支待選 | 防線與地形、資源成本 | 騎手長輪廓；步態、迴轉 | Frontier與回撤；合法路線、Fog、無穿友軍 |
| 靈能修行者／宗門候選 | 少數高價值異常能力 | 射程與能力完全待審 | 能量／修行代謝先行 | 啟動媒介、補給與反制，尚未規則化 | 直立法器；蓄力、施放 | 不讓AI讀未知世界；效果／可見事件／文明代謝測試 |
| 初階機械構裝體／工坊或機械文明 | 穩定推進、維護需求候選 | 防守或工程定位待選 | 零件／能源體系先行 | 維修、補給、地形限制 | 重心低、剛性分件；步行、停機 | 生存經濟與控制節點；失能源行為、Save/Replay |

**下一切片建議**：盾衛＋騎乘偵察，分別驗證守線與機動探索；這是推薦，不是主創已選定首發。先用現有三兵建立基準，再提出成本／前置／精確屬性及反制矩陣供裁決。長槍需有真實機動對象；工程兵需攻城Action規格；靈能與構裝需代謝系統，不能只增加六個按鈕。

## 三條科技路線

| 路線 | 現有基點 | 新節點候選／效果 | 成本／先決／取捨 | 重複／互斥／文明 |
|---|---|---|---|---|
| Settlement/Agriculture/Logistics | farm每據點下次收入+1，pathfinding斥候視野+1 | 物流部署：改善增援調度或解鎖騎乘偵察，兩方案需選 | 費用待審；farm或pathfinding先決待選；與軍事投資搶金幣 | 原三科技一次性；新增先不重複／不互斥，文明條件待審 |
| Combat/Engineering/Fortification | archery解鎖archer | 防禦編制→盾衛；工程支援另切片 | 費用及先決待審；犧牲機動或投資時間 | 不預設升級整軍；避免載入後追溯改舊單位 |
| Relic/Knowledge/Anomalous Energy | 現G1只有relic intel選擇，沒有此科技線 | 地形筆記／線索研究→異常能量研究 | 必須先定義知識與可見線索；不把手札文字當已解鎖新科技 | 文明感知差異與稀有神器後置，方向確認而公式未批准 |

下一個玩家可見新分支建議先做「防禦編制→盾衛」單一合法Research/Recruit垂直切片；需主創批准費用、前置與數值後才改core。**本Demo尚未實作新研究分支**，遵循先交既有規則的最新決定。現行三科技成本唯一來源 `TECH_STATS`，非本提案。

## 地圖互動候選

現有plain/forest/hill/mountain/water；移動與視野由core判定，renderer不補地形真相。候選：河流/渡口、沼澤、峽谷、古代道路、能源異常帶、遺跡周圍特殊地形。全部PROPOSED。

最小建議「古代道路」：先選作地形互動或既有plain的附屬feature，不能兩者都做。移動成本、防禦、視野、資源關聯皆待裁決；不要自行給零費移動。視覺方向為舊文明交通痕跡，生成限制需保證出生、據點與早期遺跡仍連通。驗收：新合法路線/不可達負例、三兵移動對照、100地圖連通、Observation未知格不洩漏、AI能使用、Save/Replay升版相容。其他候選另排，這輪無新地形runtime。

## Relic Ruleset Migration Proposal

最新USER_CONFIRMED：先發現是情報優勢，實際抵達者優先處置，可持續研究不同面向、實物不憑空再生。現G1看見就claimed/pending有明確衝突；Demo照實告知，沒有用敘事遮掉。

| 階段 | g1-ccts-1現況 | 新版候選／未決 |
|---|---|---|
| Discovery | updateKnowledge可見即claim | 記actor知識，不賦實物權；知識狀態與canonical物件分開 |
| Acquisition | pendingRelic立即必答 | 抵達合法取得Action；同時到達／行動順序、危險與守衛需裁決 |
| Research | gold或最多3未知terrain | 文明不同研究面向需知識contract；不能暴露敵兵或隱藏reward |
| Persistence | save1/replay1/ruleset g1 | 新ruleset內容hash固定；舊save/replay繼續用舊引擎，或明確拒絕而非靜默轉換 |

先建立雙版本fixtures：已發現未取得、他文明先抵達、無未知格、少於3格、多遺跡pending、持有者淘汰、load中斷與Replay重建。不把已領G1遺跡重新抽獎，也不對舊檔補發獎勵。新版規則號及schema是否變動需實際資料設計後裁決，這裡不預先宣稱完成migration。

## 每一個正式玩法切片的交付契約

Design批准來源 → GameState影響 → Action／Validator／applyCommand → Observation及PresentationEvent → Observation-only AI → UI與資產 → Save/Replay版本相容 → 正負例與真DOM旅程。先通過一條垂直切片才擴充；無完整證據保持PROPOSED或UNVERIFIED。
