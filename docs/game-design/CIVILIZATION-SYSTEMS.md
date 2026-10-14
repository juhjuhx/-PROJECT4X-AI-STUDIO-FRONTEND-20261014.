# 文明系統｜長期設計與 G1 實作分界

盤查日：2026-10-13。本文件只重整既有設計。權威及檔案索引見 [DOCUMENT-AUTHORITY](DOCUMENT-AUTHORITY.md)，歷史世界內容見 [WORLD-BIBLE](WORLD-BIBLE.md)，主創逐項裁決見 [DECISION-REGISTER](DECISION-REGISTER.md)。

## 不可合併的語意

**USER_CONFIRMED**：文明、政權與玩家席位不同；政治控制與文化影響獨立，可交錯並存。征服者可能被被征服者同化；居民採用某文明制度不自動移交行政權；領土歸零不自動抹除身份。

| 語意 | 歷史設計範圍 | IMPLEMENTED 範圍 |
|---|---|---|
| WorldTruth | 穩定物件、資源、因果與起源 | GameState／權威 reducer、seed、規則版本 |
| CivilizationIdentity | 語言、歷史、價值觀、分裂融合譜系 | Faction.identityId、lineageId；沒有文化模擬 |
| Polity | 國家、治理及非領土政治秩序 | Faction.life、centerId、originalCapitalId 與據點 owner；沒有獨立 PolityRegistry |
| PopulationCohort | 人口／機器／蟲群的居住、政治與文化歸屬 | NOT_IMPLEMENTED |
| Organization | 軍隊、宗教、商業、地下與情報網絡 | 單位；其他組織 NOT_IMPLEMENTED |
| FactionController | 誰有合法命令權、可更換控制模式 | Actor 0／1、己方命令；固定雙方 |
| PoliticalControl | 行政、軍隊、徵稅、任命等權限 | 據點軍事佔領與新中心；非軍事政變 NOT_IMPLEMENTED |
| CulturalReach | 多源認同、制度、宗教採用 | NOT_IMPLEMENTED |

來源：[CCTS 補充 §2](../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/PROJECT4X-CCTS-DECISION-ADDENDUM.md)、[types.ts](../../src/core/types.ts)。最低語意保留不等於完整長期系統完成。

## 非對稱生存經濟

**USER_CONFIRMED**：非對稱文明必須有不同生存經濟，G1.5 優先驗證此差異，且必須有本人至少一場非對稱對局，工程／真人雙軸，在 G3 差異化文明前通過。

**PROPOSED**：v0.4 選用 shared substrate + civilization-specific recipes。這個 IV 方案是設計文件裁決，未自動升格為主創逐項核准算法。物質、能源載體、產能、知識與貨幣不同：木材、礦石、食物、生物質、零件可存量／運輸；燃料、電力、靈力需設備與界面；工時／修行時間是容量；知識是能力；幣／信用是受制度承認的交易媒介。金幣不能無賣方、無輸送、無設備地買到任何資源。

歷史配方提案保留 `inputs / outputs / byproducts / requires / locationPredicate / throughputPerTurn / sourceDomain / environmentalDelta`，代謝保留 `upkeep / eligibleRecipes / shortagePolicies / adaptationCapabilities`。每回合產線排序、原子預留、防雙花、有效設備、輸出副產物、不足提示、耗盡與可重播結算是 [docs/25](../../history/Fake-Polytopia/PROJECT4X-V04/docs/25-civilization-metabolism-resource-contract.md) 的待驗契約。不得有負成本、同原料雙花、無限免費循環或把知識當耗材。

三文明候選探針：Riverborn 依糧食與人力；Ascetics 依靈力流量與修行時間；Machina 依能源與零件。每文明至少兩個求生策略、瓶頸至少兩種成本不同且可觀測對策，是歷史設計目標。UI 只先呈現 1–3 個主要瓶頸，展開才看明細。

**IMPLEMENTED**：目前只有 `gold: number`、據點收入、招募與三科技費用，沒有 resource record／配方／維護／市場／物流。這是 MVP 自主工程預設，也偏離 G1 START 原本建議的 `resources: Record<ResourceId, integer>`；交接應列為擴充負擔，不能宣稱正式多資源契約已落地。G1 金幣不是通用物理能源。

## 能力、轉型與身份連續

**USER_CONFIRMED**：文明可徹底蛻變，改革／革命／分裂／融合可能有制度、資源、時間及內部衝突代價（GM-11）。

歷史候選流程為 CONTACT → OBSERVE → RESEARCH_FRAGMENT → ADOPT_PRACTICE → INSTITUTIONALIZE → TRANSFORM；相遇或拾到設備不瞬間掌握完整科技。裝備級、能力級、制度級、身份級四種變化不同；能力互斥、維護、適應與材料限制防止免費集齊所有優勢。政治、技術與生物種類不能由單一「時代等級」排序。

技術領域 DAG、效果白名單、namespace ID、內容包版本／依賴／授權／checksum／相容規則及存檔 pack 清單，保留於 [docs/18](../../history/Fake-Polytopia/PROJECT4X-V04/docs/18-faction-evolution-and-content-packs.md) 與 [docs/28](../../history/Fake-Polytopia/PROJECT4X-V04/docs/28-civilization-transformation.md)。它們屬 PROPOSED。現 G1 只有三個一次性科技，沒有跨文明研究、多 parent／互斥科技、轉型或 ContentPack runtime。

## 接觸、外交、信仰與政治

**USER_CONFIRMED**：尚未遭遇、未知語言、無共同感知協議、拒絕外交不是同一狀態；文明利益、需求與行為可推導，也可形成文明議會或掠奪者。政治控制與文化採用必須分別結算。

**PROPOSED**：docs/29 先提 CONTACT、PEACE、TRADE_OFFER、TRUCE，再擴展 ALLIANCE、DEFENSE_PACT、COUNCIL、EMBARGO、VASSALAGE。文明議會有參加資格、投票、承諾、違約與有限執行力，沒有天然全球警察。生存壓力、資源互補、威脅、距離、信任與溝通成本是候選決策因素，AI 仍只讀合法 observation。

Phase1／docs/03 的歷史簡化方案也保留：PEACE／WAR／ALLIANCE 三態、信任三級提示、影響力費用、補給條約；單政策槽（三回合冷卻或一影響力尚待選）、擴張／軍備／共存三政策、守護祖靈／航行神祇／和平誓言教義。這些數值與命名未核准為現行規則。完整原件：[docs/03](../../history/Fake-Polytopia/PROJECT4X-V04/docs/03-diplomacy-faith-politics.md)、[docs/29](../../history/Fake-Polytopia/PROJECT4X-V04/docs/29-contact-diplomacy-unions.md)。

**NOT_IMPLEMENTED**：外交、文化傳播、信仰人口、政策、議會、政變與群體忠誠。G1 的佔領只是軍事路徑，不可以稱行政奪權完整實作。

## 無領土續玩、文明影響與勝利

**USER_CONFIRMED**：故土復興、異地建國、奪他國政權、文化滲透／融合、非領土化存續與文明影響勝利都是可選長期路線，並非互斥職業；玩家可不復國。G1 已確認簡化流亡，細則依 CCTS-D1/D2/D3。完整規格見 [CCTS-SPEC](CCTS-SPEC.md)。

歷史延續途徑保留：難民流散、流亡政府、遊牧政權、地下社團、文化傳承。文化型勝利需可確認的採用、維持與支持、公開反制及明確回合窗口，不能毫無成本靠百分比自動佔國；算法仍是 PROPOSED。完整人口／組織／無土地文化命令尚未實作。

Phase1 大型 MVP 曾提 48×48、四勢力、六兵種、三勝利及政治信仰外交；v0.3／v0.4 改為 G1 24×24 雙方窄切片。原聯盟 70% 控制維持三輪、文化三地標／兩科技線、VictorySnapshot、勝後繼續治理均保留歷史提案，不能套入當前 G1。CCTS 又覆蓋首都立即征服終局；現版以 U=0 且 S=0 淘汰，沒有勝後沙盒。

## 起點公平、反制與生態

**USER_CONFIRMED**：非鏡像起點要真正可生存，不是只比土地或初始金幣；極少神器可翻轉力量結構，但不保證弱者勝利。地形、交易／介入、研究與器物為不同反制路線；線索、次數、成本、可達性與對手應對不能省略。

docs/27 的生成管線、文明最低配方網路、可達中立據點、威脅安全窗、有限重試／安全模板、100／10,000 seed 目標，以及 docs/26 共振護盾反轉測試，都是 PROPOSED／UNVERIFIED。目前通用 G1 地圖不能作三文明生存公平證據。

生態 Fast／Slow／Threshold 與稀疏事件增量，跨層交通、地表持續結算與 region aggregate 全部保留候選；目前單地圖 source 未落地。

## 操作與平台

**USER_CONFIRMED**：前期少量手動，後期軍團／區域戰略；正式發行桌機與手機同等重要。歷史軍團指令 MOVE_TO／CAPTURE／DEFEND 要投影成同一 validator 的合法單位命令，可取消、阻塞提示及暫時接管；不另建第二個權威引擎。

**IMPLEMENTED**：G1 單位移動、攻擊、佔領、招募、科技、鏡頭、mouse/touch／keyboard。**NOT_IMPLEMENTED**：編組軍團、國家計劃、跨尺度控制、原生手機／桌機封裝。歷史平台 P0/P1 排序不能覆蓋 GM-15 桌機手機同等重要；模擬觸控不等於實體手機驗收。45–90 分鐘是體驗目標，真人節奏仍 UNVERIFIED。

## 後續 Gate 的歷史定位

G1：規則與保存／霧／AI 工程，加本人完整一局、三項取捨、疲勞與重玩意願。G1.5：異文明生存經濟優先，工程探針與至少一場真人非對稱雙軸；不阻塞 G1，也不阻塞所有 G2 軍團工作，但阻塞 G3 差異化文明。G2：低微操軍團與限定反制候選。G3+：真實相互作用的異文明經濟、接觸與交易，再逐步政治文化。這是歷史範圍順序，不是本次新開發授權或交付日期承諾。
