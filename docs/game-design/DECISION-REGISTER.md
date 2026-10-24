## 2026-10-24 Demo交付順序（USER_CONFIRMED）
主創明確選擇：先交付既有規則＋探索敘事＋Web/PWA可玩Demo，再以獨立升版切片審查新兵種、科技與地形。新數值仍PROPOSED；不因本次產品化而自動批准。Demo完成與軍事winner分離，不改CCTS淘汰條件。

# 決策登錄簿｜確認、覆寫與實作狀態

## 2026-10-17 Engineering Program 補充

來源為主創本次直接指令，不推翻以下歷史世界／CCTS 裁決。

| ID | 決策 | 狀態與適用範圍 |
|---|---|---|
| E-CURRENT-01 | Codex 擁有 core/session/AI/persistence/契約與 main 最終整合；Gemini 擁有視覺 UI | USER_CONFIRMED；詳 MODULE-OWNERSHIP |
| E-CURRENT-02 | CORE → SESSION → PRESENTATION ADAPTER → UI；單一 GameState/applyCommand，UI 與 AI 不全知 | USER_CONFIRMED 架構方向；C1 方法／事件 signature 經獨立規格審查；C2 runtime 已 IMPLEMENTED，未新增玩法裁決 |
| E-CURRENT-03 | 「已批准的 MIT License」與 README／授權說明一致 | USER_CONFIRMED；LICENSE 本文不變，本輪修正衝突說明 |
| E-CURRENT-04 | 先 C0/C1；D3 未交先按 D2 唯讀盤查，不用舊 main 覆寫前端 | USER_CONFIRMED；本輪沒有整合 source |
| E-CURRENT-05 | 城市與招募先做完整合法閉環，再選最小城市成長；探索／經濟／軍事擴充需完整策略效果 | USER_CONFIRMED 工程順序；新成本、等級、人口、兵種科技數值仍 PROPOSED／未定 |
| E-CURRENT-06 | 不全知 AI、不改測試門檻、不合成 winner、不加流亡倒數；遺跡發現與抵達取得分離 | USER_CONFIRMED 重申；seed010/full100 修復與新 ruleset migration 尚未實作 |

本補充只記實際給定要求；沒有替主創核准 C1 具體型別、事件欄位、新城市／科技數值或正式發布。

盤查日：2026-10-13。本簿不以檔案 mtime 排權威，不把工程預設、審查建議或文件版本號等同主創批准。完整原件見 [DOCUMENT-AUTHORITY](DOCUMENT-AUTHORITY.md)。

## 狀態及來源代號

- `USER_CONFIRMED`：目前直接主創確認，來源 U-LATEST。
- `USER_CONFIRMED（歷史）`：歷史記錄的主創裁決，沒有衝突者延續有效；局部被覆寫者保留原文／ID。
- `PROPOSED`：設計作者、外部審查或代理的未定方案。
- `工程預設`：已授權 MVP 自主決定、可版本化的工程配置。
- `IMPLEMENTED`：交接 source 存在相關行為；不等於驗收。
- `NOT_IMPLEMENTED`／`UNVERIFIED`：沒有該功能／沒有相應驗收。

| 代號 | 原始來源（相對 PROJECT-4X-MVP 根） |
|---|---|
| U-LATEST | `docs/handoff/USER-REQUEST-DECISIONS.md`；2026-10-13 本輪使用者交接要求與重申，不冒稱歷史包原文 |
| H-W04 | `history/Fake-Polytopia/PROJECT4X-V04/docs/38-user-decisions-and-open-questions-v04.md` |
| H-G1 | `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip`；解開內容亦保留在 `第二階段審查-20261011/原始交付/` |
| H-S2 | `history/Fake-Polytopia/第二階段審查-20261011/修訂文件/G1-機制規格-審查修訂.md` |
| H-CCTS | `history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/PROJECT4X-CCTS-DECISION-ADDENDUM.md`＋`DECISIONS-20261011.json` |
| H-G1C | `history/Fake-Polytopia/第四輪CCTS審查-20261011/G1-裁決整合稿.md` |
| H-MEM | `history/Fake-Polytopia/PROJECT-4X.md`；歷史記憶快照 |
| I-CONTRACT | `docs/實作契約.md`；自主 MVP 工程預設與已確認規則 |
| I-SOURCE | `src/core/game.ts`、`src/core/types.ts`、`src/core/ai.ts`；行為現況 |

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

## 世界十項裁決（歷史索引）

| ID | 決策 | 狀態／來源 | IMPLEMENTED 對照 |
|---|---|---|---|
| W01 | 局域物理＋跨域能量 | USER_CONFIRMED（歷史）；H-W04 #1 | 非對稱能源未實作 |
| W02 | 極端不對稱且可有因果翻盤與反制 | USER_CONFIRMED（歷史）；H-W04 #2 | 戰鬥神器、外域介入未實作 |
| W03 | 文明可徹底蛻變 | USER_CONFIRMED（歷史）；H-W04 #3 | 只有身份／譜系 ID，沒有轉型 |
| W04 | 溝通意願與能力不固定，可有議會／掠奪者 | USER_CONFIRMED（歷史）；H-W04 #4 | 無外交 runtime |
| W05 | 起點非對稱但可生存公平 | USER_CONFIRMED（歷史）；H-W04 #5 | 只有共同 G1 地圖／通行配置 |
| W06 | 亡國後流散／流亡／地下／文化續存 | USER_CONFIRMED（歷史）；H-W04 #6 | 簡化軍事流亡已實作，長期文化未實作 |
| W07 | 生態可不可逆改變 | USER_CONFIRMED（歷史）；H-W04 #7 | 未實作 |
| W08 | 唯一可揭露原點；不斷許願的設計者方向 | USER_CONFIRMED（歷史）；H-W04 #8 | 未實作；願式織機／書寫者仍暫名 |
| W09 | 荒誕超現實而因果自洽 | USER_CONFIRMED（歷史）；H-W04 #9 | 完整迷因文明未實作 |
| W10 | 星際與舊世界持續並存 | USER_CONFIRMED（歷史）；H-W04 #10 | 只有單地圖 |

所有世界種子、配方示例與工作原型保留在 [WORLD-BIBLE](WORLD-BIBLE.md) 及 history 原件；不得把十項方向壓成 G1 的三兵種對稱內容，也不得宣稱已全部實作。

## 近期十九項確認與原裁決關係

| ID | USER_CONFIRMED | 舊來源／覆寫 | 現況 |
|---|---|---|---|
| R01 | 發現與取得分離 | U-LATEST；局部覆寫 H-S2／H-G1C 的 RELIC-D1 可見即取得 | NOT_IMPLEMENTED；現 core 仍可見取得 |
| R02 | 先發現有情報優勢 | U-LATEST；不把新優勢捏造成固定數值 | 無獨立發現優勢機制 |
| R03 | 實際抵達者優先處置 | U-LATEST；明確取代先看見者唯一處置的舊 D1 | NOT_IMPLEMENTED；須版本化落地 |
| R04／GM-01 | 多文明持續研究，實物不憑空重生 | H-CCTS GM-01；U-LATEST 重申 | G1 單次領取已實作；多層研究未實作 |
| R05／GM-02 | G1 首次取得立即選 | H-CCTS GM-02 覆蓋 H-G1 延後 inbox | 必答 phase 已實作；觸發點仍舊 D1 |
| R06／GM-03 | 未知<3揭剩餘實數，選前提示，不補金 | RELIC-D2／H-CCTS GM-03 | 已實作；0格禁情報、仍可4金 |
| R07／GM-04 | 安全、危險、特殊遺跡風險可區分 | H-CCTS GM-04 | G1 只安全；危險未實作 |
| R08／GM-05 | 單局45–90分鐘體驗目標 | H-CCTS GM-05 | UNVERIFIED；不能改成倒數判負 |
| R09／GM-06 | AI 戰略可理解、會擴張、防守、用地形，不全知／不要求競技最優 | H-CCTS GM-06；H-G1 §8 | AI 已實作，但100局62終局／38超限 FAIL |
| R10／GM-08 | 極少神器可翻轉整場力量結構，固定因果／線索／反制 | H-CCTS GM-08；H-W04 #2 | NOT_IMPLEMENTED |
| R11／GM-09 | 非對稱先生存經濟差異 | H-CCTS GM-09；docs/25 | G1.5 NOT_IMPLEMENTED |
| R12／GM-10 | G1.5 本人至少一場非對稱驗收，headless＋真人雙軸，在G3前 | H-G1 §9／H-CCTS GM-10；覆寫v0.4僅headless充分 | UNVERIFIED |
| R13／GM-11 | 改革／革命／分裂／融合及徹底轉型可有代價 | H-CCTS GM-11 | NOT_IMPLEMENTED |
| R14／GM-12 | 無領土仍可續玩文化／宗教／地下路線 | H-CCTS GM-12；EXILE-01 | G1 孤軍續玩已實作；長線路線未實作 |
| R15／EXILE-02 | 復都可故土或異地，不強迫恢復舊國 | H-CCTS EXILE-02 | 主動中心已實作 |
| R16／EXILE-02 | 可奪他國政權或非傳統建國 | H-CCTS EXILE-02 | 軍事佔領路徑已有；非軍事／非領土未實作 |
| R17／POLITY-01 | 政治與文化獨立，可交錯 | H-CCTS POLITY-01 | 只有最低ID分界；文化引擎未實作 |
| R18／GM-14 | 前期少量手動、後期軍團／區域戰略 | H-CCTS GM-14 | 單位手動已有，軍團未實作 |
| R19／GM-15 | 正式發行桌機／手機同等重要 | H-CCTS GM-15；覆寫早期單純相容／P0-P1排序 | 模擬touch已有；實體手機UNVERIFIED |

U-LATEST 的原始用戶要求由根代理保留在 [USER-REQUEST-DECISIONS](../handoff/USER-REQUEST-DECISIONS.md)，本簿不補造對話時間戳、逐題原始提問或更多細則。

## 其餘延續有效的主創節點

| ID | 決策 | 狀態／來源 | 現況 |
|---|---|---|---|
| TONE-B | 首局「未知與發現，想再探索」 | USER_CONFIRMED（歷史）；H-MEM／H-S2 | 真人重玩與情緒UNVERIFIED |
| GM-07 | 各文明同物件可有根本不同感知表象 | USER_CONFIRMED（歷史）；H-CCTS | fog有邊界；異文明perception未實作 |
| GM-13 | 起源透過跨文明／尺度甚至跨局線索 | USER_CONFIRMED（歷史）；H-CCTS | NOT_IMPLEMENTED |
| CCTS-D1 | U>0 OR S>0可續玩；0金仍可續 | USER_CONFIRMED（歷史）；H-G1C／H-MEM | IMPLEMENTED lifecycle |
| CCTS-D2 | 持續控制跨完整對手回合後免費主動中心 | 同上 | IMPLEMENTED heldSince／completedTurns |
| CCTS-D3 | U=S=0才淘汰，無流亡倒數 | 同上 | IMPLEMENTED；harness上限只診斷 |
| RELIC-D2 | 最多3未知地形；0禁情報；不洩敵軍 | 同上 | IMPLEMENTED |
| RELIC-D1-OLD | 首次己方回合看見取得唯一處置，AI同規則，開局按先手 | USER_CONFIRMED（歷史）；H-S2／H-G1C | IMPLEMENTED，已被R01/R03局部覆寫；保留原件 |
| AUTH-MVP | 直接先建MVP，工程／規則細節自主處理 | USER_CONFIRMED（歷史）；I-CONTRACT／H-MEM | 已建獨立source；舊等來源／逐題批准不是本版本阻塞 |

## 自主工程預設及未核准提案

| ID | 內容 | 地位 | 交接注意 |
|---|---|---|---|
| E01 | TypeScript＋Vite＋原創Canvas2D，無runtime框架 | 工程預設／IMPLEMENTED | 不是原v0.4已驗證引擎裁決 |
| E02 | 24×24、1人1AI、四向、三兵三科技 | 工程預設／IMPLEMENTED；源於歷史TARGET | 不是永遠固定的平衡配置 |
| E03 | 8初金、據點2／Farm+1；招募4/5/6，科技5/6/4 | 同上 | 金幣不是正式多文明能源 |
| E04 | 四安全遺跡、雙方早期可達、人類先手 | 同上 | 原G1 START只1遺跡，不冒稱原TARGET全獲批准 |
| E05 | intel距遺跡曼哈頓→y→x，城市掩護按守方owner | 同上 | 原 comparator／cover 邊界曾待裁決；現已工程凍結 |
| E06 | canonical pending必答，surveyed與explored分開 | 同上 | 顯示地形不等於實際觀測據點／遺跡 |
| E07 | gold:number、公用固定Actor、軍事建中心界線 | 同上 | 不能稱完整資源record／Polity／Culture架構已落地 |
| P01 | shared substrate＋civilization-specific recipes | PROPOSED；v0.4 docs/25／ADR-0007 | 非對稱經濟方向確認，具體算法尚未驗 |
| P02 | 願式織機／書寫者及具體原點敘事 | PROPOSED；docs/32、world/ | 唯一起源確認，具體名字未鎖正史 |
| P03 | 文化影響算法／人口粒度／政變門檻 | PROPOSED；CCTS-D4/D5及長期模塊 | 沒有由MVP限縮自動批准 |
| P04 | 多勝利、聯盟70%×3輪、文化3地標／2科技線、勝後沙盒 | PROPOSED／歷史；Phase1／docs/04 | 當前終局拒絕玩法，沒有沙盒續玩 |
| P05 | 多世界層、跨域source、反制神器及生態schema | PROPOSED；docs/24–34 | USER方向不可刪；runtime不可冒稱 |

## 正式 supersession 紀錄

| ID | 被覆寫的條文 | 新來源／範圍 | 不被覆寫的內容 |
|---|---|---|---|
| S01 | Phase1 四方48×48／三勝利為第一個MVP | v0.3 docs/17、v0.4 docs/35：G1窄切片 | 長期大圖／多勝利需求保留 |
| S02 | v0.3 原點可永遠不選答案 | v0.4 docs/32、38／ADR-0010：唯一可揭露原點 | 文明可有互相矛盾局部解釋 |
| S03 | v0.4／G1 START首都失守即失敗、奪都即勝 | EXILE-01、CCTS-D1/D2/D3 | 真正終局後停止、保存版本化仍有效 |
| S04 | G1 START遺跡可延後inbox | GM-02立即選、MVP canonical phase | 單次實物、防重領、fog仍有效 |
| S05 | G1 START必須剛好3未知格 | RELIC-D2／GM-03揭min(3,remaining) | 只地形、無敵軍情報 |
| S06 | v0.4 G1.5僅headless已足夠 | G1 START§9、GM-09/10：優先生存差異＋本人非對稱局 | G1.5不阻塞G1，G3前blocking |
| S07 | 早期跨平台排序僅相容後補手機 | GM-15正式發行桌機手機同等 | 仍需真實裝置／包裝驗證 |
| S08 | 等未取得原型／每項細節重新批准才施工 | 最新直接先MVP授權，I-CONTRACT | 不自動授權外部repo、部署、付費或長期文化全部開發 |
| S09 | RELIC-D1先看見者唯一處置權 | U-LATEST R01/R03：發現／取得分離、實際抵達優先 | 立即必答、單次實物與持續研究方向保留；core尚未更新 |

這是按條款局部覆寫，不是刪除／全量替換舊文件。當前行為、當前設計與驗收三個維度都保留；舊源碼或歷史11/11 QA不能自動成為新版證據。

## 2026-10-18 工程續作與待答問題

| ID | 來源／內容 | 狀態 | 範圍 |
|---|---|---|---|
| ENG-C3-1018 | 主創Engineering Continuation Master Harness：C2驗證→D3修復/整合→既有玩法E2E→AI診斷，隔離分支、不push main | USER_CONFIRMED | 本輪執行授權，局部取代前輪停止C2/等待D3；不變更世界觀或玩法數值 |
| ENG-AI-QUESTION | 主創要求新架構/品質/排版取捨先grill-me；本輪詢問『現有無記憶policy最小修正』或『帶觀測記憶策略層設計』 | USER_CONFIRMED（本輪主創答覆） | 先修現有無記憶策略最小反例；不新增策略記憶層/Save schema |
| ENG-UI-QUESTION | 詢問保留D3手機分頁先玩法驗收、或交Gemini另提新排版 | USER_CONFIRMED（本輪主創答覆） | 保留D3分頁，先完成真玩法驗收；原D Hybrid方向持續有效 |

## D03-PREVIEW-001｜2026-10-24 隔離預覽測試基準

USER_CONFIRMED（僅隔離預覽測試，非正式平衡/Canon）：主創批准DEMO03-GAMEPLAY-DECISIONS提案。盾衛費6/HP10/攻3/防2/射1/移1/視2；機動偵察費7/HP7/攻3/防0/射1/移3/基礎視3；防禦工程研究7解鎖盾衛，軍事機動研究6、前置pathfinding解鎖機動偵察。採新局專用new ruleset預覽，舊G1存檔依舊規則續玩，Demo02不改。

新內容尚NOT_IMPLEMENTED；預覽驗證成功也不代表平衡/真人驗收完成。尋徑原效果維持對原scout的+1，不因新兵名稱自行擴大效果；新種額外視野加成尚未另行裁決。城市/地形/遺跡migration仍另審。來源為本輪主創明確選擇「批准為隔離預覽測試基準」。
