# 遊戲規則書：霧境初航 G1 MVP

本規則書對齊指定20類，盤點 `g1-ccts-1` 已實作內容與主創裁決。工程預設不冒稱使用者逐項確認；規則落地不代表真人體驗驗收完成。精確需求→code→具名test見 [FEATURE-MATRIX](../handoff/FEATURE-MATRIX.md)。

| 標記 | 意義 |
|---|---|
| USER_CONFIRMED | 主創既有明確裁決；來源為PROJECT-4X決策索引／CCTS整合與實作契約已確認段 |
| IMPLEMENTED | 本輪封存src有對應控制流／數值，不自行推論測試PASS |
| PROPOSED | 交接提出的方向或歷史未落地提案，尚未是產品規則 |
| NOT_IMPLEMENTED | 在現行src/types中不存在對應runtime機制 |
| OPEN_QUESTION | 需後續決定或驗證，沒有杜撰答案／數字 |

實作來源：`src/core/types.ts`（數值表）、`game.ts`（規則）、`ai.ts`（政策）、`persistence.ts`（保存）。沒有外部數值JSON config；`package.json`／`tsconfig.json`僅技術配置。主創來源：上層 `PROJECT-4X.md:29–51`、`第四輪CCTS審查-20261011/G1-裁決整合稿.md:11–61`；封存docs中的 `實作契約.md:11–15,27–30`有現行摘要。T編號對應FEATURE-MATRIX完整測試名。

## 1. 基本循環

**USER_CONFIRMED**：首局情緒是「未知與發現、想再探索這個世界」；45–90分鐘是待真人量測的體驗目標，不能用作判負時鐘。**IMPLEMENTED／工程預設**：一人actor0對AI actor1，人類先手；探索→佔點／取得遺跡→招募／科技→戰鬥→流亡或真正淘汰。

初始turn1、version0；人類ownTurns1、AI ownTurns0、雙方completedTurns0。每次EndTurn是一次半回合交接，turn+1；進場方ownTurns+1，首個己方回合無收入，後續才收入。只重設進場方己軍moved／acted及己有site.recruited。命令沒有渲染或wall-clock輸入。`game.ts:36–57,257–265`；T01/T03。

一般行動可連續下命令，直到EndTurn；沒有每文明總AP池。各兵有moved／acted旗標。遺跡pending期間必答，其他行動不得繞過。真人完整局、疲勞、三項策略取捨及重玩意願仍**OPEN_QUESTION**／未驗。

## 2. 地圖生成

**USER_CONFIRMED**：非全知AI、探索與征服方向。24×24為**IMPLEMENTED／工程預設**，不是本次新增主創數值裁決。**IMPLEMENTED／工程預設**：576格，座標x/y各0..23；seed長度1..256 UTF-16 code units，固定seed決定同bundle世界。

初始四兵：actor0步兵(3,3)、斥候(4,3)；actor1步兵(20,20)、斥候(19,20)。兩座歷史首都為曙光城(3,3)／暮星城(20,20)。村莊數 `3+floor(random×3)`，即3..5；依序取(8,4)、(6,13)、(12,11)、(18,10)、(14,20)。四遺跡固定在(8,3)、(15,20)、(12,7)、(9,17)。`game.ts:40–61`。

地形機率閾值：water10%、mountain8%、forest17%、hill13%、plain52%；必要點與兩條早期走廊再強制plain，所以最終地圖比例不是以上抽樣機率。四向BFS確認全部初始單位／據點／遺跡地形連通，最多65次嘗試；第65次降為forest20%、hill20%、plain60%的全通行地形。`game.ts:62–82`；T01/T11。

3..5村莊截取固定序列造成起點配置非鏡像，尚無「公平／翻盤平衡」驗收。動態地形生成、生態演化、多世界／星際尺度**NOT_IMPLEMENTED**；生成配置獨立外置為**PROPOSED**。

## 3. 地形與移動

**IMPLEMENTED／工程預設**：plain／forest／hill可通行；mountain／water不可通行。四向等成本，鄰格順序上、左、右、下；沒有斜移、地形移動點加價、涉水、登山或運輸單位。

Move目的格必須有長度≤kind.move的最短合法四向路徑，不穿友軍或敵軍，不落入任何單位格。步兵／弓兵move1、斥候move2。未moved且未acted才可Move；Move只設moved=true，仍能Attack或Capture。Attack／Capture會同時設moved和acted，之後不能Move或再行動。擊殺不自動進目標格。`game.ts:9–11,114–138,222–240`；T07/T12/T21。

視野不因water／mountain／forest遮擋。地形改造、道路、移動能量與後期低微操指令為**NOT_IMPLEMENTED**。兵種差異配置出處見第4類。

## 4. 單位屬性

**IMPLEMENTED／工程預設**，數值唯一來源 `types.ts:38–42`；不是新增主創裁決。

| 兵種 | 一次招募金幣 | 最大HP | Attack | Defense | Range | Move | Sight |
|---|---:|---:|---:|---:|---:|---:|---:|
| 步兵 infantry | 4 | 10 | 4 | 1 | 1 | 1 | 2 |
| 斥候 scout | 5 | 7 | 3 | 0 | 1 | 2 | 3 |
| 弓兵 archer | 6 | 7 | 3 | 0 | 2 | 1 | 2 |

每兵id、owner、kind、x/y、hp、moved、acted。己兵全部進Observation，即使不是active；敵兵只在現在視野中。尋徑科技使斥候Sight+1即為4，Move仍2。初始無弓兵，招募弓兵需archery。`types.ts:6`, `game.ts:45–49,90,141`；T01/T14/T17。

升級／經驗／治療／士氣／人口成本／文化屬性／特種文明兵**NOT_IMPLEMENTED**；沒有未說明的HP恢復率或維持費。

## 5. 戰鬥公式

**IMPLEMENTED／工程預設**：攻擊需己兵未acted，目標為現在可見敵軍且曼哈頓距離≤Range。已經Move的單位仍可攻擊；只Attack一次。弓兵射程2，無獨立line-of-sight／穿透路徑判定。

`damage = max(1, attacker.attack - defender.defense - cover)`；target.hp-=damage；HP≤0立即移除target。攻擊者moved=true／acted=true，留在原座標。沒有隨機命中、暴擊、反擊、範圍傷害、HP衰減戰力或擊殺前進。`game.ts:136–137,227–234`；T07/T13。

AI估算傷害復用同數值表且同cover條件，`ai.ts:34–38`。戰鬥平衡仍**OPEN_QUESTION**；公式獨立手算邊界與兵種全矩陣測試是**PROPOSED**。

## 6. 傷害與防禦

**IMPLEMENTED／工程預設**：防守者所在terrain為forest或hill，或該格site.owner===defender.owner時cover=1，其餘0。這些條件是OR，城市與terrain不疊加，最大cover1。敵人控制的site不給防守者據點掩護。`game.ts:229–231`；T13。

例：步兵攻步兵plain無己城：4−1=3傷；forest／hill／己城：4−1−1=2傷。弓兵攻己城步兵：3−1−1=1傷；最低傷害1。water／mountain不可站兵，不能當防禦位置。沒有額外護甲／地形高差命中／防守反傷／駐防加成，**NOT_IMPLEMENTED**。

## 7. 經濟與生產

**IMPLEMENTED／工程預設**：雙方初始8金，非負整數；第一己方回合無收入。進入第二及後續己方回合時：`income = ownedSiteCount × (2 + (hasFarm ? 1 : 0))`。首都和村莊同額，流亡據點沿用收入。Capture或EstablishCapital不立即發收入。`game.ts:36–37,257–264`；T03/T14/T27。

Farm花5，於下次收入起每site從2變3金。現版無生產佇列、城市等級、建築、糧食、工業、能源或人口生產；gold為暫時抽象，不是已實作完整代謝。以上**NOT_IMPLEMENTED**；代謝差異後續切片有既有方向，參見第19類。

## 8. 招募與維持

**IMPLEMENTED／工程預設**：任一己有site均可招募，須格上無任何兵、本回合未招募、gold足；弓兵需archery。扣第4類費用一次，新增滿HP單位；id由nextUnitId遞增，初始nextUnitId4。新兵moved=true／acted=true，本己回合不能行動。

site每回合一次；進入下一己回合重設recruited=false。Capture設recruited=false但佔領兵仍站格且不能再移動，因此不憑佔領重設立即憑空招兵。建立新中心不重設recruited。`game.ts:140–141,236–245,264`；T14/T15/T28。

維持費、人口／供應限制、解散／補員／預備隊**NOT_IMPLEMENTED**。AI的max(6,site×8)是招募政策上限，不是玩家軍力規則，不可混寫為遊戲兵數上限。

## 9. 科技

**IMPLEMENTED／工程預設**，`types.ts:43–47`。

| 科技 | 費用 | 解鎖／效果 | 結算 |
|---|---:|---|---|
| farm 耕作 | 5金 | 每己有site收入+1 | 下次收入起 |
| archery 弓術 | 6金 | 可招弓兵 | 研究後立即 |
| pathfinding 尋徑 | 4金 | 斥候Sight+1 | 研究後立即更新knowledge |

未研究且gold足才候選；科技不可重復；無前置科技樹／研究時間／退款。Research不消費某兵行動。`game.ts:90,144,248,269`；T14/T17。

多文明不同科技樹、知識傳播、依實物後續研究、文化研究**NOT_IMPLEMENTED**。科技TARGET歷史數字不能覆蓋本表；後續調整需升bundle或明確兼容處理。

## 10. 資源轉換

**IMPLEMENTED**：金幣唯一進入和支出路徑為初始8、回合據點收入、遺跡gold+4、招募與研究扣費。沒有把地形、資源點、遺跡情報或文化轉換成gold的其他公式。`game.ts:37,244,248,251,262`。

資源採集、交易、兌換率、物質↔能量轉化、跨域能量代謝、戰略材料與市場**NOT_IMPLEMENTED**，因此不存在可引用的資源conversion config或數量。主創確認「局域物理＋跨域能量」是長期世界方向，不代表G1已有算法。**OPEN_QUESTION**：後續代謝類型、計量單位、轉化損耗、經濟界面；不能替主創杜撰倍率。

## 11. 遺跡

**IMPLEMENTED（歷史 RELIC-D1，已被新主創裁決局部覆寫）**：現行 g1-ccts-1 仍以首次己方回合可見者取得唯一處置權，AI同樣適用；開局雙方同時可見時依先手。這是現況，不是最新應實作規則。**USER_CONFIRMED／NOT_IMPLEMENTED**：發現與取得分離、先發現有情報優勢、實際抵達者優先處置；詳 DECISION-REGISTER R01–R03 與 CCTS-SPEC。領權後立即 canonical pendingRelic、only ResolveRelic合法且不能EndTurn繞過的要求繼續有效。`game.ts:97–107,132,249–254`；T06/T26/T31。2026-10-17 C1 只釐清此衝突，沒有改規則。

目前4個安全遺跡固定坐標為第2類工程預設；無危險遺跡。一個pending一次，多處同時可見按relics順序逐個解答。resolved後永久領過，無再生、敵方二次領取或可延後inbox。

獎勵二選一：gold+4；intel至多3個actor仍未知terrain格。intel0時候選停用仍可gold；intel1/2只揭1/2，不補金。排序distance(對遺跡)→y→x，揭地形而非敵軍／據點。`game.ts:109–111,132,251–253`；T06/T10/T26。多文明長期研究／危險風險 **NOT_IMPLEMENTED**；其餘GM世界方向不得當runtime。

## 12. 迷霧與情報

**USER_CONFIRMED＋IMPLEMENTED**：敵軍情報不能隨遺跡terrain獎勵洩漏；迷霧須隨動態視野撤回。**IMPLEMENTED／工程預設**：視野菱形曼哈頓radius；步兵2／斥候3／弓兵2，pathfinding斥候4；每己有site本格＋四向鄰格radius1。各視野源取OR，沒有遮擋。

unknown：terrain/site/relic均null；explored：terrain留存；visible：當前視野。surveyed與explored獨立，正常見過的site／relic靜態身份可留記憶；遺跡情報只寫explored，所以未正常看過的據點／遺跡仍null。敵軍不會作為記憶保留。`game.ts:87–111,149–164`；T04/T10/T25/T26/T32。

永久敵軍雷達、動態事件日誌、最後見到敵兵ghost、文化影響熱圖**NOT_IMPLEMENTED**。第20類記錄精確隱藏字段。

## 13. AI與合法性

**USER_CONFIRMED＋IMPLEMENTED**：非全知AI；只接同actor Observation及核心合法候選，不收GameState或seed重建。`ai.ts:9–12`。每步return候選副本；無候選則null，非active與真正terminal停止。T17/T19/T29/T42。

**IMPLEMENTED／政策預設**：遺跡gold<4選gold，否則優先intel；優先建中心→Capture→入空敵城→攻擊→科技→補兵→移動→EndTurn。Farm條件己site≥2、己兵≥3；Archery在見敵、兵≥4、gold≥10，或兵≥4、gold≥15；Pathfinding兵≥4、gold≥12。`ai.ts:17–87`。

補兵只在owned<max(6,ownSite×8)；unknown>120且owned≥8期望2斥候，否則1；弓兵人數×3<全兵數時優先弓兵，其餘步兵。以距已知戰線最近site補兵。這是政策，不限制玩家合法行動。移動目標權重：capital/center3000、敵據點1800、中立400、敵軍650、遺跡160、探索120（斥候1600）、巡查80；以weight/(distance+4)比較。`ai.ts:73–150`；T21–T23/T35–T41/T43。

**OPEN_QUESTION／已確認缺口**：舊100局62終局／38超限；四角每32己回合輪替不覆蓋中央靜止敵軍，隔離反例見CORE-REVIEW。策略不保證所有局終局／翻盤／好玩；補救不能新增流亡倒數。網路AI、學習策略與完備巡查 **NOT_IMPLEMENTED**。

## 14. 首都、城市與佔領

**USER_CONFIRMED＋IMPLEMENTED**：歷史首都與當前政治中心分開。site.kind只標原capital或village；村莊建立中心後仍是village，centerOf由Faction.centerId投影。

Capture需未acted己軍站非己有site，owner轉actor，heldSince=敵方completedTurns，recruited=false，單位moved/acted。不能遠程佔領或kill後自動佔領。原capital的kind／名稱／originalCapitalId不會隨政權易手而變。`types.ts:7,9`, `game.ts:138,157,236–240`；T07/T08/T15/T44。

site無獨立HP／城牆／文化轉換／升級人口。非軍事政變、外交割地、改名或遷移既有active中心 **NOT_IMPLEMENTED**。軍事實控不等於文化影響或人口身份；後者G1沒有數值模型。

## 15. 流亡與延續

**USER_CONFIRMED＋IMPLEMENTED CCTS-D1/D2**：失去有效中心且U>0或S>0進入exiled；零gold不淘汰。可繼續移動、攻擊、佔領、科技，己site沿用收入與招募；沒有流亡回合倒數或次數上限。`game.ts:189–195`；T08/T27。

流亡actor可在己有site連續控制跨完整對手回合後免費、主動EstablishCapital：敵方completedTurns>site.heldSince。既有合格site不加額外等待，新捕獲不得即刻建；重奪被打斷site重新記heldSince。建中心不發錢、不重設unit／招募，不改identity/lineage/originalCapital。`game.ts:142,238,256`；T08/T15/T28/T44。

可異地建國或故土復國，也可不復國。收回故土仍exiled，必須選擇EstablishCapital；active已有中心時沒有隨意搬都Action。完整文化亡國組織／人口／獨立PolityRegistry **NOT_IMPLEMENTED**。

## 16. 勝敗

**USER_CONFIRMED＋IMPLEMENTED CCTS-D3**：U=0且S=0才eliminated，winner=另一方；U或S任一存活繼續。佔歷史首都／當前中心不是自動獲勝，重建不是勝利。`game.ts:189–196`；T27–T29/T36/T44。

winner非null時legalActions=[]，新玩法命令拒絕，AI回null；過去成功Command同payload重送仍可ok且無副作用。`game.ts:130–131,209–212`。沒有積分勝利、文化勝利、回合上限、倒數、平手規則或超時判負。

harness的800半回合／40000命令是診斷上限，不寫winner；舊失敗報告到turn801仍winner=null。**OPEN_QUESTION**：達到45–90分鐘目標的策略／節奏，不可把harness FAIL改解釋成遊戲平手。

## 17. 隨機與 replay

**IMPLEMENTED／工程預設**：生成seed→FNV32式折疊→xorshift32；生成後命令無RNG。明確順序與常數見 [SAVE-REPLAY-CONTRACT](../architecture/SAVE-REPLAY-CONTRACT.md)。地形生成／村莊計數共享同一序列，array順序屬於bundle。`game.ts:13–34,60–81`；T01/T11/T16/T33。

replay包只含schema/ruleset/seed/commands/hash；命令必須expectedVersion連續、requestId唯一、actor與當局合法；最終gameplay checksum一致。不是逐幀播放器。`persistence.ts:76–108`；T09/T31/T34/T44。

**PROPOSED**：獨立RNG／生成器golden向量與固定checksum凍結測試；現有同seed兩次比較不能捕捉無聲算法更新。**NOT_IMPLEMENTED**：偽隨機運行狀態儲存（命令無隨機所以現版無需求）、跨版本回放registry。

## 18. 存檔版本

**IMPLEMENTED**：save=`project4x-save-1`，ruleset=`g1-ccts-1`；root exact字段、數值／引用／生命週期／知識／ledger語意驗證，再從seed+history重建，全量比較snapshot。失敗throw，不返回修補state。`persistence.ts:14–94`；T09/T30/T31/T34/T44。

成功Command的requestId+actor+expectedVersion+action去重；同payload重送不扣費、不追加歷史，不同payload拒絕；拒絕保持原引用與所有資料。ID1..256 code units、expectedVersion非負safe整數。`game.ts:166–219,270–273`；T02/T05/T12/T20/T24。

未知schema/ruleset拒絕，沒有舊即時征服或inbox存檔自動遷移。bundle將生成器／RNG／canonical一起凍結（工程契約），schema沒有分開版本標籤。**OPEN_QUESTION**：跨版遷移與舊bundle保存；**NOT_IMPLEMENTED**：雲同步、加密／簽名、分塊checkpoint、存檔槽管理。完整save含世界真相，不能當公開秘密安全觀戰資料。

## 19. 未來非對稱

**USER_CONFIRMED／長期方向**：局域物理＋跨域能量、極端非對稱但有反制翻盤、文明可徹底蛻變、溝通意願與能力異構、非對稱起點仍可生存、亡國文化延續、生態不可逆改變、唯一可揭露原點、超現實因果自洽、星際展開後舊世界仍運作。另有後期低微操、跨平台與開源優先。`PROJECT-4X.md:29–45`。

**NOT_IMPLEMENTED**：代謝差異、跨域能量、文化擴散、人口身份、外交／溝通能力、文明蛻變、因果系統、不可逆生態、原點揭露、星際分層。當前Faction只有identityId／lineageId穩定標籤，兩方初始兵／金幣／科技對稱，隨機地圖與村莊序列不構成完整文明非對稱系統。沒有上述機制的數值config或反制公式。

**PROPOSED**：以G1.5代謝差異及真人非對稱驗證擴展，在G3前驗證既有方向；**OPEN_QUESTION**：具體文明列表、資源維度、反制／翻盤條件、無微操指揮契約。不得在本MVP狀態矩陣中標完成。

## 20. 觀察與隱藏資訊

**IMPLEMENTED** Observation保留：ruleset、seed、尺寸、actor／active、turn／version、winner、自己Faction、己軍、可見敵軍、投影tile、legalActions、己方pendingRelic(id,intelCount)。`types.ts:32–35`, `game.ts:149–164`。

| 信息 | unknown | explored但當前不可見 | visible |
|---|---|---|---|
| terrain | null | 已知terrain | 當前terrain |
| site／relic身份 | null | 只有曾正常surveyed才有id／kind／name或relic id | 有 |
| site.owner／centerOf | 無 | 無 | 有owner；若當前中心有centerOf |
| relic.resolved | 無 | 無 | 有 |
| 敵兵位置／HP／旗標 | 無 | 無 | 有 |
| 對手gold／techs／identity等Faction | 無 | 無 | Observation不提供對手Faction |

Observation為structuredClone副本；改view不能改truth。遠方敵軍位置／對手gold／tech不影響玩家payload已有獨立測試。seed可供本機診斷，但AI不得重建世界；保存完整真相仍是私有本機格式。`game.ts:163`；T04/T10/T17/T25/T32/T42/T43。

**NOT_IMPLEMENTED**：事件前／後知識化日誌、公開保密回放、服務器觀戰、信息可信度與歷史敵軍ghost。**OPEN_QUESTION**：未來聯網時是否剝離seed與完整歷史，以及怎樣定義觀戰／廣播邊界；目前無聯網需求，不預建服務。
