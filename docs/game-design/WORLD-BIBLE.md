> 2026-10-24 Demo恢復：已補回33份世界／裁決原件精選及SHA，見 [歷史索引](../../history/README.md)。下文舊「完整history」敘述是歷史封存狀態；本repo不是完整舊包，未納入的連結可能仍缺檔。現行規則與裁決權威不變。

# 世界設定聖經｜設計歷史整合

盤查日：2026-10-13（Asia/Taipei）。本文件整理既有設定，沒有新增文明、正史或玩法。歷史原件保留於 `history/Fake-Polytopia/`；完整索引與局部覆寫關係見 [DOCUMENT-AUTHORITY](DOCUMENT-AUTHORITY.md)。

`USER_CONFIRMED` 表示主創已確認方向；`PROPOSED` 表示設計包中的待審內容；`IMPLEMENTED` 只表示在交接 source 可查到行為；`NOT_IMPLEMENTED`／`UNVERIFIED` 分別表示未落地／未驗收。這幾種狀態不能互相替代。最新確認來源見 [使用者要求與裁決](../handoff/USER-REQUEST-DECISIONS.md)。

## 世界的基本承諾

**USER_CONFIRMED**：這是一個非線性共存的世界。玩家起初理解的中古城邦不是全世界共同的科技時代；同一地圖可存在修行、工業、機械、賽博、異星、生態及荒誕文明。文明的共同本能是生存，探索逐步改變玩家對世界的理解。前期以少量單位手動探索與征服，後期轉向軍團、區域與國家戰略；保持斜視 2D／2.5D、跨平台、可替換美術與開源優先。

首局情緒已確認為「未知與發現，想再探索這個世界」。舊訪談的「焦點 A」是選擇優先討論核心體驗／可玩切片，不能據此改成首局只追求征服情緒。來源：[v0.3 決策](../../history/Fake-Polytopia/PROJECT4X-V03/docs/23-v03-design-decisions-and-questions.md)、[現行記憶](../../history/Fake-Polytopia/PROJECT-4X.md)。

## 本次直接重申的十項世界方向

- UW01 USER_CONFIRMED：不同文明可以擁有完全不同的技術與生存需求。
- UW02 USER_CONFIRMED：局域物理規則與外域能量交換可以並存。
- UW03 USER_CONFIRMED：文明之間可以存在極端軍事差距。
- UW04 USER_CONFIRMED：弱小文明仍可以藉由神器、研究、地形、外文明協助及資源交易取得翻盤機會。
- UW05 USER_CONFIRMED：文明可以徹底轉型。
- UW06 USER_CONFIRMED：文明滅國不代表文明消亡。
- UW07 USER_CONFIRMED：世界具有唯一可逐步揭露的起源真相。
- UW08 USER_CONFIRMED：荒誕設定必須遵守內部因果。
- UW09 USER_CONFIRMED：不同文明可以感知到截然不同的世界表象。
- UW10 USER_CONFIRMED：進入星際後，原有世界仍持續運行。

以上是設計方向。完整runtime未實作；僅簡化軍事流亡屬IMPLEMENTED。來源USER-REQUEST-DECISIONS，UW編號與下方歷史W編號不同。

## 十項主創世界裁決（歷史索引）

| 編號 | USER_CONFIRMED 內容 | 歷史來源 | 交接實作狀態 |
|---|---|---|---|
| W01 | 局域可觀測物理與跨域能量可並存；異常要有來源、限制與後果 | v0.4 docs/24、25、38 | NOT_IMPLEMENTED；G1 金幣只是費用抽象 |
| W02 | 允許極端非對稱，弱者可透過既存器物、地形、研究、交易／信仰介入翻盤，仍有成本及反制 | docs/26、38；GM-08 | NOT_IMPLEMENTED；G1 遺跡沒有神器戰鬥效果 |
| W03 | 文明可徹底蛻變，技術、制度與身份可分離；可改革、革命、分裂或融合 | docs/28、38；GM-11 | NOT_IMPLEMENTED；只保留 identityId／lineageId |
| W04 | 溝通意願與能力異構，有拒談、無共同協議、跨國組織與掠奪者 | docs/29、38 | NOT_IMPLEMENTED；G1 沒有外交 runtime |
| W05 | 起點非對稱但有可生存的公平，依文明真正需求評估 | docs/27、38 | G1 有共同通行／早期探索配置；文明代謝公平 NOT_IMPLEMENTED |
| W06 | 亡國後仍可流亡、遊牧、地下組織或文化延續，不強制恢復舊國 | docs/30、38；EXILE-01/02 | 簡化軍事流亡／新中心 IMPLEMENTED；其餘 NOT_IMPLEMENTED |
| W07 | 生態與地形可長期或不可逆改變 | docs/31、38 | NOT_IMPLEMENTED |
| W08 | 世界有唯一最終可揭露原點，構想來自不斷增加願望的設計者 | docs/32、38；GM-13 | NOT_IMPLEMENTED；名字與敘事細節仍為提案 |
| W09 | 可以荒誕、超現實、惡搞，但文明行為與規則有內在因果 | docs/33、38 | 原創幾何 G1 畫面；完整荒誕文明 NOT_IMPLEMENTED |
| W10 | 大陸與星際持續並存運作，進入新尺度不刪舊世界 | docs/34、38 | NOT_IMPLEMENTED；G1 只有單地圖 |

十項表的正式原件：[v0.4 主創決策簿](../../history/Fake-Polytopia/PROJECT4X-V04/docs/38-user-decisions-and-open-questions-v04.md)。表中「IMPLEMENTED」是本輪只讀 source 盤查，不代表真人或手機驗收。

## 真相、感知與知識

世界有穩定真相；不同文明的感官、語言、信仰和技術可能讓同一物件呈現根本不同表象（GM-07，USER_CONFIRMED）。世界真相不隨觀察者任意改寫。歷史提出的揭露層次為：局部環境 → 異常線索 → 正式接觸 → 長期研究／翻譯 → 更深入能力與起源理解；這不是強制排隊的固定章節。

**USER_CONFIRMED（近期補充）**：發現與取得分離；先發現帶來情報優勢，實際抵達者優先處置；多文明可持續研究，已取走的實物不憑空重生。**IMPLEMENTED（現行 G1）**：`updateKnowledge` 首次己方回合可見即設定 `claimedBy` 與必答 `pendingRelic`，尚未將抵達取得拆成獨立階段。這是新確認與歷史規則之間的真實差異，詳見 [CCTS-SPEC](CCTS-SPEC.md#遺跡處置權的正式衝突)。

情報揭露只提供最多三個仍未知地形格，不給即時敵軍、敵方科技或全世界設定。0 格時停用情報，仍可選金幣；1／2 格時揭實數、選前提示，不補金。這部分已有 G1 source，但「先發現的長期情報優勢」尚無獨立世界知識／感知系統。

## 完整保留的文明原型與工作名稱

下列全是**PROPOSED 歷史內容池**，不是主創逐一鎖定正史，更不是已可玩文明。來源：[v0.4 docs/15](../../history/Fake-Polytopia/PROJECT4X-V04/docs/15-world-bible-nonlinear.md)、[docs/04](../../history/Fake-Polytopia/PROJECT4X-V04/docs/04-content-and-victory.md)、[docs/25](../../history/Fake-Polytopia/PROJECT4X-V04/docs/25-civilization-metabolism-resource-contract.md)、[docs/33](../../history/Fake-Polytopia/PROJECT4X-V04/docs/33-surreal-tone-meme-civilizations.md)。

| 工作原型 | 歷史生存／能力構想 | 限制與代價 |
|---|---|---|
| 河谷城邦／Riverborn | 糧食、人力、農地、道路；人口及遠徵 | 補給與封鎖糧食壓力 |
| 修行宗門／Ascetics | 靈脈、修行時間、儀式；少量精銳 | 流量、時間、數量與轉換成本 |
| 矮人工坊 | 山地熔爐、礦石、巨械與火器 | 山地交通、礦產與能源 |
| 玻璃都市 | 能源、資料、資訊網路、遠距控制 | 耗能與脆弱基礎設施 |
| 機械集群／Machina | 能源、零件、加工與規模化生產 | 原料、維修、控制節點 |
| 異星蟲巢 | 生物質、巢區、生態擴張 | 領域容量、環境與特定火力 |
| 迷因奇觀國度 | 地區特色資源、特殊互動 | 清楚成本、邊界、對策 |
| 高原匠邦 | 石造城市、銅藝、防線與生產 | 遠距探索慢 |
| 河口商盟 | 帆布、木橋、河網、道路與外交 | 前期戰鬥弱 |
| 林境公社 | 樹冠庭院、偵查與文化 | 攻城不利 |
| 赤土遊牧 | 帳篷、沙丘、機動及快速擴張 | 城市防衛壓力 |
| 倒影公證庭 | 水面交易、鏡面交換記錄 | 旱季與人工鏡面成本 |
| 敬畏按鈕的國 | 禁忌按鈕、高風險世界層切換 | 偵查、隔離、冷卻 |
| 奉鐘為獸的遊牧族 | 鐘聲遷徙、聲波地下機械網 | 斷訊、消音與聲源仿造 |

「河谷城邦 → 金屬信徒 → 星械同盟」是文明轉型示例：零件不是完整電腦能力，傳統、設備、祭司工程制度與身份可逐步重組；它不是必走科技線。月亮稅／水循環是荒誕因果示例，孢子化學協議與機械運算時隙是交流示例，也都保持候選身分。

## 唯一原點及兩個世界種子

**USER_CONFIRMED**：有唯一可揭露起源，並以過度許願的設計者造成複合世界為創意方向。v0.3「也許永遠不選最終答案」已由 v0.4 明確覆寫。

**PROPOSED**：「願式織機／The Wish Loom」「書寫者／The Draftmaker」為暫名。歷史敘事是每次願望沒有刪去舊規則，而是形成地域、族群與世界層；不同文明持有共同原點的片段。這是固定 fiction，不授權即時 LLM 臨場加規則。起源揭露不自動結束沙盒，跨文明、跨尺度甚至跨局線索是 GM-13 已確認方向；跨局知識如何保存、揭露門檻及具體劇情尚未落地。

歷史揭露弧線依次列出 First Fracture、Contradictory Archives、Pattern Recognition、Boundary Evidence、Origin Event，但允許考古、貿易、對話、戰爭殘骸、研究等不同順序。三種來源、避免唯一 missable 事件是 docs/32 的候選驗收要求，未稱已實作。

保留原件：

- [origin-wish-loom.md](../../history/Fake-Polytopia/PROJECT4X-V04/world/origin-wish-loom.md)：唯一原點種子與敘事壓力。
- [field-crystal.md](../../history/Fake-Polytopia/PROJECT4X-V04/world/field-crystal.md)：供奉之石／場結晶；玩家的知識可從護符走到共振研究，物件真相從生成時固定。有次數、啟動媒介與反制，改成長矛會帶來宗教信任代價。G1 只有金幣／地形情報，戰鬥共振未實作。

## 生態與多尺度

歷史生態提案分 Fast（暫時戰火／污染）、Slow（肥力／河道／靈脈衰退）、Threshold（礦脈採盡、接口失衡、自持新生態）。不可逆不等於毫無替代路徑；新穩態仍有成本。機械採礦污染河流、河谷改種或遷居、蟲巢處理污染、宗門儀式消耗靈脈的例子全部保留於 [docs/31](../../history/Fake-Polytopia/PROJECT4X-V04/docs/31-ecology-scarcity-and-path-dependence.md)。

世界層提案為 SurfaceWorld → Ocean/Air → OrbitalLayer → PlanetarySystem → InterstellarLayer。每層要有新選擇、交通與觀測規則，舊地表持續運作；尚不承諾全部層級上市。軍事、聯盟、文化傳承、生存、科學揭露及勝利後沙盒是歷史候選，現行 G1 真正淘汰後拒絕玩法命令，沒有繼續治理功能。

## 禁止交接時升格的內容

本文不把工作名字、文明種子、紙藝色彩提案、配方 schema、科技 DAG、文化勝利算法、星際層或任何數字當成已核准成品。原始世界材料全量保留，工程可依新版裁決另寫規則版本；不得以 G1 的窄切片刪掉長期世界方向，也不得以方向已確認宣稱 runtime 完成。
