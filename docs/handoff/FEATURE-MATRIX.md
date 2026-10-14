# 實作與證據矩陣

本表將指定20類規則、核心風險、實際code與所有44個既有具名test串連。**IMPLEMENTED表示源碼存在；不等於本輪TESTED_PASS。** 本輪統一執行證據由root填入 [IMPLEMENTATION-STATUS](IMPLEMENTATION-STATUS.md)；本審查沒有重跑整套／100長局。測試名稱照錄source原字串，不改測試。

## 需求到核心

| ID | 需求／類別 | 狀態 | 裁決或契約 | 核心code | 測試 | 覆蓋缺口 |
|---|---|---|---|---|---|---|
| G01 | 基本循環／初始化／回合 | IMPLEMENTED | docs/實作契約.md:6,15 | game.ts:36–57,257–265 | T01,T03 | 真人45–90分鐘與情緒未驗 |
| G02 | 地圖生成／出生／連通 | IMPLEMENTED | docs/實作契約.md:6,28 | game.ts:40–85 | T01,T11 | 沒有獨立generator golden |
| G03 | 地形／四向移動／不穿人 | IMPLEMENTED | docs/實作契約.md:15 | game.ts:9–11,114–128,222–225 | T07,T12,T21 | movement全部邊界兵種矩陣未全列 |
| G04 | 三兵種／旗標／觀測副本 | IMPLEMENTED | docs/實作契約.md:6,15 | types.ts:6,38–42; game.ts:90,141,163 | T01,T04,T14,T17 | 未有三兵種全屬性固定向量 |
| G05 | 攻擊公式／擊殺不進格 | IMPLEMENTED | docs/實作契約.md:15（其餘公式工程預設） | game.ts:136–137,227–234 | T07,T13 | 所有攻守兵種／最低傷害獨立矩陣待補 |
| G06 | 防守據點掩護／地形不疊加 | IMPLEMENTED | docs/實作契約.md:15 | game.ts:229–231 | T13 | forest僅源碼分支；現有oracle涵蓋plain/hill |
| G07 | 金幣／首回合無收入／Farm | IMPLEMENTED | docs/實作契約.md:15 | game.ts:37,248,257–264 | T03,T14,T27,T31 | 長局數值上界與載入性能待量測 |
| G08 | 招募空格／每回合一次／新兵不能行動 | IMPLEMENTED | docs/實作契約.md:15 | game.ts:140–141,242–245,264 | T14,T15,T28,T38 | 維持費／供應／人口 NOT_IMPLEMENTED |
| G09 | 三科技費用與效果 | IMPLEMENTED | docs/實作契約.md:15 | types.ts:43–47; game.ts:90,144,248 | T14,T17 | 缺尋徑研究前後+1視野／弓術解鎖專門反例 |
| G10 | 資源轉換 | NOT_IMPLEMENTED | docs/實作契約.md:6（後續界線） | game.ts:37,244,248,251,262僅金幣進出 | 無；經濟子行為T03,T14 | 沒有代謝／兌換率；不得推定完成 |
| G11 | 遺跡授權／即刻必答／0..3情報 | PARTIAL（取得權衝突） | docs/實作契約.md:12,28 | game.ts:97–111,132,249–254 | T06,T10,T26,T31,T42 | 新USER_CONFIRMED抵達取得尚未實作；多處同時可見亦缺專門fixture |
| G12 | 動態迷霧／情報只terrain | USER_CONFIRMED＋IMPLEMENTED | docs/實作契約.md:12,28 | game.ts:87–111,149–164 | T04,T10,T25,T26,T32,T41,T42 | 無事件前後知識化log |
| G13 | AI只Observation且只送合法候選 | IMPLEMENTED；完整局歷史FAIL | docs/實作契約.md:9,28 | ai.ts:9–153; game.ts:130–164 | T17,T19,T21–T23,T35,T37–T42 | 62/100真終局、38超限；四角巡查反例 |
| G14 | 首都／據點占領、故土與中心分離 | USER_CONFIRMED＋IMPLEMENTED | docs/實作契約.md:12 | types.ts:7,9; game.ts:138,157,236–240 | T07,T08,T15,T35,T43 | 新中心有效時再失歷史首都尚無具名全旅程 |
| G15 | 流亡延續／免費主動建中心／旗標保留 | USER_CONFIRMED＋IMPLEMENTED | docs/實作契約.md:12 | game.ts:142,189–196,238,256 | T08,T15,T27,T28,T43 | 再次失新中心與中斷持有旅程待補 |
| G16 | U=S=0才淘汰／terminal拒絕 | USER_CONFIRMED＋IMPLEMENTED | docs/實作契約.md:12 | game.ts:130–131,189–196,209–214 | T08,T19,T27,T29,T35,T43 | 不能把800半回合診斷上限當勝敗 |
| G17 | RNG／canonical／replay一致 | IMPLEMENTED | docs/實作契約.md:30 | game.ts:13–34; persistence.ts:76–108 | T01,T09,T11,T16,T31,T33,T34,T43 | 缺獨立RNG golden及跨版bundle registry |
| G18 | schema／save全量歷史重建／去重／原狀拒絕 | IMPLEMENTED | docs/實作契約.md:15,30 | game.ts:166–219,270–273; persistence.ts:14–94 | T02,T05,T09,T12,T20,T24,T30,T31,T34,T43 | 同步長局讀檔延遲／size limits由外層整合 |
| G19 | 未來非對稱／文化／能源／生態 | USER_CONFIRMED長期方向；NOT_IMPLEMENTED | 上層PROJECT-4X.md:29–45；docs/實作契約.md:6 | types.ts:9仅identity/lineage标签 | 無runtime測試 | 具體代謝／文化／翻盤公式 OPEN_QUESTION |
| G20 | 觀察／隱藏字段／敵方資訊隔離 | IMPLEMENTED | docs/實作契約.md:9,28,30 | types.ts:27–35; game.ts:149–164 | T04,T10,T17,T25,T32,T41,T42 | 完整save不是保密觀戰；联网边界未實作 |

## 44個具名test全集

以下均標為 **測試已實作／已逐行讀取；本輪執行結果由root統一**。T43是生成世界、只走合法命令的流亡雙分支旅程；多數战术单元fixture直接調整truth，不能代替来源可信的save旅程。T36測試harness故障，不測試游戏平手規則；T44測試产物雜湊，不证明GUI行为。

| Test ID | 精確名稱 | 實際位置 | 對應需求 | 實作位置 |
|---|---|---|---|---|
| T01 | 相同 seed 初始地圖、合法四出生點與 hash 完全確定 | `tests/core.test.ts:14` | G01,G02,G04,G17 | `game.ts:29–85,20–27` |
| T02 | 非法與過期命令保持同一引用及所有資料 | `tests/core.test.ts:25` | G18 | `game.ts:205–214` |
| T03 | 首己方回合無收入、下一己方回合各據點2金且重設一次 | `tests/core.test.ts:34` | G01,G07 | `game.ts:257–265` |
| T04 | observation 是副本、未知格與不可見敵兵不外洩 | `tests/core.test.ts:43` | G04,G12,G20 | `game.ts:149–164` |
| T05 | 成功request同payload重送無副作用，不同payload与stale拒絕 | `tests/core.test.ts:54` | G18 | `game.ts:208–214` |
| T06 | 斥候移動發現遺跡立即必答；情報依distance/y/x探索最多3地形格 | `tests/core.test.ts:67` | G11 | `game.ts:97–111,132,249–254` |
| T07 | Move一次但可接Attack；不可穿人、擊殺不自動進格，攻擊結束兵行動 | `tests/core.test.ts:79` | G03,G05,G14 | `game.ts:114–138,222–234` |
| T08 | 中心失守仍流亡；持續據點跨完整敵方EndTurn才可免費建都，不重設兵旗標 | `tests/core.test.ts:93` | G14,G15,G16 | `game.ts:142,189–196,238,256` |
| T09 | 正常保存與重播完整資料相同，保存拒絕格式、佔位、ledger與未經歷史的竄改 | `tests/core.test.ts:119` | G17,G18 | `persistence.ts:14–108` |
| T10 | 遺跡情報不暴露未曾正常看見的據點與遺跡，已探索格不帶敵方owner | `tests/core.test.ts:136` | G11,G12,G20 | `game.ts:97–111,149–164,252` |
| T11 | 100種seed：四spawn、全部據點與早期遺跡同連通；雙方初始視野無必答 | `tests/core.test.ts:150` | G02,G17 | `game.ts:40–85` |
| T12 | 尋路不穿越友軍或不可通行地形；完整非法拒絕不留request | `tests/core.test.ts:164` | G03,G18 | `game.ts:114–128,205–214` |
| T13 | 守方己有據點cover1與terraincover1不疊加；敵方據點不給掩護 | `tests/core.test.ts:173` | G05,G06 | `game.ts:229–231` |
| T14 | 據點招募需空格、每回合一次；新兵不能行動；科技費用精確且Farm下次收入 | `tests/core.test.ts:184` | G07,G08,G09 | `types.ts:38–47; game.ts:140–144,242–264` |
| T15 | 收回歷史首都仍流亡、不可自動復辟；新中心須主動且不resetrecruited | `tests/core.test.ts:204` | G08,G14,G15 | `game.ts:142,189–196,256` |
| T16 | hash包含未來規則旗標與兩方知識，明確排除protocolledger | `tests/core.test.ts:215` | G17 | `game.ts:13–27` |
| T17 | AI僅接Observation，全部決策出自合法候選且不修改view | `tests/core.test.ts:227` | G04,G09,G13,G20 | `ai.ts:9–153; game.ts:149–164` |
| T18 | AI能靠觀測移向敵都、攻擊守軍、占領並在流亡後主動建中心 | `tests/core.test.ts:239` | G13,G14,G15 | `ai.ts:19–30,32–63; game.ts:236–240,256` |
| T19 | 非active與terminalObservation的AI停止返回null | `tests/core.test.ts:259` | G13,G16 | `ai.ts:11–12; game.ts:130–131` |
| T20 | 接受的history entry/action/to深凍結，舊snapshot與原usercommand不能污染新snapshot | `tests/core.test.ts:266` | G18 | `game.ts:198–219,270–272; persistence.ts:89–94` |
| T21 | AI尋目標時不把友軍占位當可穿越，選擇可達繞路而不反覆折返 | `tests/core.test.ts:286` | G03,G13 | `ai.ts:95–150` |
| T22 | AI用遠射完成攻城，保留fresh城旁兵同turn入空城，避免殺守軍→招募永久循環 | `tests/core.test.ts:297` | G13 | `ai.ts:23–62; game.ts:227–240` |
| T23 | 斥候不被補兵戰線吸住，未發現敵都時主動擴大未知觀測 | `tests/core.test.ts:317` | G13 | `ai.ts:58–59,125,139–146` |
| T24 | 獨立協定：格式／權限／版本／越界拒絕，含完整ledger而非只比hash | `tests/review.test.ts:37` | G18 | `game.ts:166–219,272` |
| T25 | 獨立fog：遠方敵軍移位／科技／金幣改變不影響玩家payload；observations無可寫共享引用 | `tests/review.test.ts:57` | G12,G20 | `game.ts:149–164` |
| T26 | 獨立情報：0格只能選金幣；1/2/3格情報不增加surveyed或附敵軍／據點 | `tests/review.test.ts:71` | G11,G12 | `game.ts:109–111,132,249–254` |
| T27 | 獨立流亡：零單位但仍有據點不淘汰、零金仍續玩且可招募 | `tests/review.test.ts:105` | G07,G15,G16 | `game.ts:189–196,257–264,141` |
| T28 | 獨立重建：跨完整敵方回合才能免費主動建中心，不復辟／重置旗標或招募 | `tests/review.test.ts:128` | G08,G15 | `game.ts:142,256` |
| T29 | 獨立淘汰：單位和據點都零才terminal；全玩法命令拒絕 | `tests/review.test.ts:155` | G13,G16 | `game.ts:130–131,189–196,209–214; ai.ts:11–12` |
| T30 | 獨立保存：拒絕語意錯誤、版本錯誤、snapshot/log錯配，保留原輸入局 | `tests/review.test.ts:169` | G18 | `persistence.ts:14–94` |
| T31 | 獨立續局：移動／必答遺跡保存後相同後綴，request重送與replay一致 | `tests/review.test.ts:200` | G11,G17,G18 | `game.ts:208–209; persistence.ts:76–108` |
| T32 | 獨立動態fog：最後視野來源死亡後只留靜態記憶，不跟蹤敵軍 | `tests/review.test.ts:219` | G12,G20 | `game.ts:87–107,149–164` |
| T33 | 獨立hash：合法移動旗標／玩家知識／政治中心差異必須改變遊戲hash | `tests/review.test.ts:238` | G17 | `game.ts:20–27` |
| T34 | 獨立replay：拒絕錯actor、重複request、snapshot/log不一致，proto請求正常roundtrip | `tests/review.test.ts:248` | G17,G18 | `persistence.ts:76–108; game.ts:272` |
| T35 | 獨立AI整合：射手清空守軍後，保留鄰城新鮮步兵同回合進格佔領 | `tests/review.test.ts:262` | G13,G14,G16 | `ai.ts:23–63; game.ts:227–240` |
| T36 | 獨立harness：一個worker錯誤仍收齊其他worker，最後報告保持FAIL | `tests/review.test.ts:285` | G16與驗證可信度 | `scripts/headless.ts worker故障收斂（root另審）` |
| T37 | 獨立AI補給：富有的四據點方不因16兵舊上限停止補充遠距戰線 | `tests/review.test.ts:312` | G13 | `ai.ts:70–87` |
| T38 | 獨立AI補給：前沿空據點優先於陣列中第一座後方首都 | `tests/review.test.ts:330` | G08,G13 | `ai.ts:78–87; game.ts:242–245` |
| T39 | 獨立AI戰線：近距離敵方補給據點不能被遠方歷史首都蓋過 | `tests/review.test.ts:349` | G13 | `ai.ts:128–132` |
| T40 | 獨立AI攻城：合擊剛好擊殺時先磨低守軍，保留下一回合的占領者 | `tests/review.test.ts:366` | G13 | `ai.ts:40–62` |
| T41 | 獨立AI追捕：地形全知仍巡查視野外存活者，不提前宣告終局 | `tests/review.test.ts:393` | G13,G20 | `ai.ts:108–125; game.ts:189–196` |
| T42 | 獨立AI遺跡：視野外未確認的舊標記不覆蓋存活者搜尋 | `tests/review.test.ts:420` | G11,G13,G20 | `ai.ts:103,108–115; game.ts:158–159` |
| T43 | G1實際命令旅程：流亡可選異地建國或故土復國，兩條分支均可保存重播 | `tests/流亡重建.test.ts:55` | G14,G15,G17,G18 | `game.ts:142,189–196,238,256; persistence.ts:76–108` |
| T44 | 產物證據：入口HTML不變但bundle改寫或新增，完整雜湊必須拒絕沿用 | `tests/artifact-proof.test.mjs:8` | 產物證據可信度（root整合） | `scripts/artifact-proof.mjs（root另審）` |

## 實作範圍外與前端整合

| 項目 | 狀態 | 本審查結論 |
|---|---|---|
| 原創Canvas2D、mouse/touch、keyboard、相機與選取 | IMPLEMENTED候選；root整合 | 核心只核對Observation与呼叫點；不得把core test當GUI證據 |
| localStorage匯入／覆蓋時點、取消AI、file size、storage quota | root整合 | core deserialize純回傳新state；外層操作仍需main/browser審查 |
| desktop／模擬touch | 舊證據分列；本輪由root填 | 模擬觸控不是實體手機 |
| 完整固定100局 | 歷史FAIL | 62 COMPLETE／38 TURN_LIMIT；不能拼接新舊策略 |
| 真人完整一局／45–90分鐘／疲勞／重玩 | UNVERIFIED | 不能由AI或瀏覽器腳本代答 |
| 實體手機 | UNVERIFIED | 需實際裝置、方向與操作證據 |
| 登入／線上多人／雲同步／資料庫 | NOT_IMPLEMENTED | 現行授權切片沒有此需求 |
| 文化／代謝／外交／人口／非軍事政變 | NOT_IMPLEMENTED | 只有長期主創方向與identity/lineage分界 |
| 公開秘密安全回放／逐幀播放器 | NOT_IMPLEMENTED | 本機完整save与rebuild驗證不等於上述功能 |

## 驗證品質與優先新增證據

1. 確認AI中央巡查反例，然後要求同一Observation政策在不增流亡倒數下覆盖已知可通行區域；反例腳本是獨立診斷，不計入原44測試PASS數。
2. 再失歷史首都但新中心仍有效、再次失新中心、中斷持有site重新等待：源碼可對應，缺具名完整合法命令旅程。
3. 固定seed／生成checksum與RNG原始向量，預期值由已凍結bundle獨立記錄；避免同實作比較自己。
4. 三兵種攻防／cover最低傷害矩陣，尋徑立即視野與弓術鎖前／解鎖後反例。
5. 多遺跡同時可見與非active看見後首次己回合認領。
6. 長歷史load/replay延遲与錯誤保存不覆蓋本機槽位，由完整main/瀏覽器邊界量測。

## 根代理本輪整合（2026-10-14）

T01–T44本輪隔離source npm test實際44pass／0fail／0skip；乾淨離線npm ci還原後亦44pass。不存在以文件替測試。G13仍TESTED_FAIL（fresh010、same-source historical full100）；G11的必答/情報有TESTED_PASS，但最新取得權機制NOT_IMPLEMENTED。前端、桌面/模擬touch與storage flows由root真Chromium7情境確認；完整drag/pinch/真人/真機仍UNVERIFIED。個別claim只涵蓋所映射test，整體gate失敗。
