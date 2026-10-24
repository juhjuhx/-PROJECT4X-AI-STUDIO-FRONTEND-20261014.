# C5-R6-04 Independent Review

**VERDICT：診斷與架構提案可交付，沒有 blocking finding；AI 修補未成立。** 本評語不替代實測，不把審查者讀結果當重新執行遊戲。

## Reviewer A：/root/r604_independent_method

獨立只讀方法審查，先核對R603原28 arms／84 checkpoints，再讀R604工具與48案例。實際cat／sed／rg讀AGENTS、code-review-excellence、原CAUSAL／COUNTERFACTUAL／SOURCE-BOUNDARY、trial／models／earlier-cf／coordinated-cf、core AI／game、reduce／run-phase；Python校對宣告／REQUEST／input／raw SHA／ledger尾段。沒有寫檔、跑新遊戲或重播core。
CONFIRMED：原28分支宣告、輸入SHA、forced prefix、預定horizon、cap、final history尾段一致；所有E只接Observation。R604接受態正好8個，全數測pair，沒有依軍事結果選贏家。

## Reviewer B：/root/r604_final_review（clean context）

實讀AGENTS、本輪COUNTEREXAMPLE／COUNTERFACTUAL／TEST-RESULTS／ARCHITECTURE-ASSESSMENT，以及reduce／reduce-lib／trial／boundaries／integrity／role-chain／run-phase-v2／source.json。git status／rev-parse／diff確認當時HEAD479d327與產品未改。Python獨立驗21個live/frozen產品、原input、source/integrity SHA、公開15份收據log／exit、16 raw SHA／48 checkpoint、成本／己損公式，及45control對R603全部actions／checkpoints／去ledger後完整final truth。
重新計算predicate僅45態true；七個縮減態未保留原向量。沒有發現canonical truth進正式policy，或修改ruleset／schema／測試門檻。Reviewer沒有另跑新遊戲、瀏覽器或12566步replay；該replay由root實跑並留完整收據，reviewer校對程式與摘要。審查後新增preservation收據由root另核對，不能冒稱已包含在這15份審查範圍。

## Findings 與處理

| 項目 | 嚴重性／證據 | 處理與限制 |
|---|---|---|
| v1 method快照沒含source.json；pair未檢查input宣告SHA | 方法稽核缺口，CONFIRMED | v2納入source.json；integrity逐arm確認input宣告SHA／REQUEST／result／來源並重播12566步；舊receipt保留，誠實註記事後補強 |
| 機制predicate不含全部Observation不變量 | 因果措辭風險，CONFIRMED | 補ISOLATION-AUDIT；七個縮減態tiles可見度不同；限制為機制特徵保留，不聲稱純交通完全隔離 |
| 原32ET收益與A交通開通混雜 | 因果未明，UNVERIFIED_ROOT_CAUSE | 另原core重播三個R603分支統計B／A攻擊；保留B自身路線改變，無通用AI修改 |
| 未做完單刪窮盡 | 限定預算，CONFIRMED | 16態僅本輪最小接受態；不稱全域最小／1-minimal |
| ID／地圖轉換不是普遍對稱 | 結果外推風險 | 分開保序改名、重排ID敏感度、padding、裁圖；只宣稱本案例決策機制，不宣稱32ET收益 |

## 不在本審查的PASS範圍

通用正面軍事RED、一般撤退／防守最佳性、完整008／010 fresh對局、R6 Full100／T3／T6、Browser／手機均未由reviewer實跑。Browser Q-ICON仍未修復；Alpha PARTIAL。沒有刪除歷史FAIL，沒有第二套reducer或保存格式變更。
最早兩個委派在額度限制下完全未執行，不算review。以上A/B為後續實際完成的唯讀審查。
