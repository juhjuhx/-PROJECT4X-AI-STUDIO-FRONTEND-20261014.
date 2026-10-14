# 設計歷史盤查與重大差異

日期：2026-10-13。設計盤查者只讀原 `Fake-Polytopia/` 及現行 G1 core／契約；未跑測試、未修改 source、未重做世界觀。來源由根代理複製，完整歷史索引見 [DOCUMENT-AUTHORITY](../game-design/DOCUMENT-AUTHORITY.md)，具體裁決見 [DECISION-REGISTER](../game-design/DECISION-REGISTER.md)。

## 重大差異與處理

| ID | 問題及正式證據 | 交接處理 |
|---|---|---|
| D-P1-01 | 本輪使用者確認「發現／取得分離、實際抵達優先處置」，第三輪G1修訂§4明文「不是先抵達」，第四輪整合§4又明說GM02沒有覆寫RELIC-D1；現 `src/core/game.ts:105–106` 仍可見即claimedBy／pending | 最新USER_CONFIRMED設計與IMPLEMENTED舊行為分列；保留全部舊裁決，不替用戶或core裁成歷史一直先抵達；未來明確規則版更新 |
| D-P1-02 | v0.4 docs/30、38與G1 START仍說首都失守即敗；CCTS／後續D1/D2/D3已允許流亡，U OR S續玩、皆零淘汰、無倒數 | 正式局部supersession已登記；當前source已實行簡化流亡，舊條文僅歷史 |
| D-P1-03 | v0.4 G1.5只headless；G1 START§9與GM10已有本人非對稱對局雙軸，在G3前 | 不以headless或100AI局代本人驗收；現G1.5無runtime也無真人記錄 |
| D-P1-04 | 十項主創世界方向／GM／EXILE／POLITY已確認，但source只有身份ID、對稱金幣、軍事流亡和建中心 | 文明／政治／文化／人口／組織分界、代謝／改革革命／多尺度都保留NOT_IMPLEMENTED；完整CCTS未完成 |
| D-P1-05 | CCTS原補充稱G1 prototype存在且舊QA11/11，包卻不含source與QA；parent明確未取得 | 不援引舊PASS，不冒充MVP沿用同source，缺失原件記錄在權威索引 |
| D-P1-06 | parent先前預告2026-10-12候選，但後續記憶明確尚未產ZIP／交付說明；本次指定目錄及Desktop/Downloads頂層沒有具名候選 | 候選僅作為歷史未完成事項，不補造包／完成狀態 |
| D-P2-01 | G1 START建議resources record而MVP的Faction仍gold:number；共同Actor為0/1 | 記自主工程預設及長期擴充負擔，不把Gold當通用能源／完整多資源契約 |
| D-P2-02 | 初期平台文檔有桌面／Android P0、iOS P1排序；GM15桌機手機同等正式發行為已確認方向 | 歷史矩陣保留，發行為同等優先；模擬touch不等於實體手機 |
| D-P2-03 | docs/04有長期多勝利／勝後沙盒；現G1 winner後拒絕玩法 | 長期意圖／提案保留，當前行為明確，不稱已支持繼續治理 |

這些是文件／方向／實現差異，不把僅設計缺口冒稱已重現的P0程序bug。最新遺跡方向未實現不授權本次盤查改遊戲。

## 歷史保留及排除

完整複製五目錄：PROJECT4X-PHASE1、PROJECT4X-V03、PROJECT4X-V04、第二階段審查-20261011、第四輪CCTS審查-20261011；保留5個ZIP、parent PROJECT-4X.md及V0.4獨立報告。實體目錄的附加審查不屬於原ZIP manifest，不能只保留壓縮包。索引列出所有檔案和ZIP成員，按明確supersession保留早期提案，不刪除來源。

DSH-V3-AUDIT-2026-10-12.md是個人工具／配置審計，與遊戲設計無關，含本機憑證路徑／hash，排除遊戲設計歷史；來源未刪除。.DS_Store排除。設計原件中的本機設備／路徑仍保留供本機交接，對外發佈需另審副本。

## 驗證範圍

本工作者僅檢查文件、ZIP成員、契約與source；沒有運行產品測試、build、瀏覽器、LSP或真人試玩，也不把索引／文檔檢查稱工程PASS。根代理核對的最新全100結果為62真正終局／38超限FAIL；44項規則／反例、型別、build與模擬觸控不證明PLAYABILITY。完整一局、實體手機、45–90分鐘、G1.5非對稱均待驗。

五份設計文件全部保留USER_CONFIRMED／PROPOSED／工程預設／IMPLEMENTED狀態；每條重大差異可回到歷史原件及當前source。沒有安裝技能、配置、部署或對外傳送。
