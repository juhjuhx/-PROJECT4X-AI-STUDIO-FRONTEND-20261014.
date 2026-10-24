> Demo03隔離預覽：兩兵/科技工程Gate已通過，平衡/真人/實體手機UNVERIFIED；盾衛可能加劇攻城僵持，尚未驗證完整新ruleset對局。當前G1 seed010合法終局且Save/Replay通過，僅單種子；R5 87/13與R6歷史FAIL保留，不宣稱新版Full100或T3/T6通過。預覽Save2不可降版舊Demo02。

> Demo03-V01：站立頭部選到後方地格、QA局部transform探針、未登錄SVG與QA手機觸點被header遮擋等歷次FAIL保留於DEMO03-V01；目前231tests/4真互動PASS，未降低門檻。真人/真機未驗，歷史AI僵局不因此關閉。

# 2026-10-24 Demo更新

- Q-ICON：原缺favicon造成Browser/Gameplay FAIL，已用原創靜態ICO及MIME修正，fresh兩Gate及cleanup TESTED_PASS；不忽略404，歷史FAIL保留。
- Demo初始選單繞過、長seed parser與load競態：4項review P2已修，真RED/GREEN/桌面手機模擬 PASS。
- PWA QA無界等待/尾斜線假FAIL：2項已修，根及巢狀真Browser PASS；首次無痕、worker handle、source mismatch都保留原FAIL。
- 持續P1：Relic取得權新裁決NOT_IMPLEMENTED；AI全局收斂未解，E新版Full100/T3/T6 UNVERIFIED，R5原FAIL保留。
- 持續P2：真人/實體手機/45–90分鐘/完整讀屏與WCAG/正式美術 UNVERIFIED；Android BLOCKED、公開HTTPS NOT_IMPLEMENTED。

詳[DEMO02驗證](../verification/DEMO02/VERIFICATION.md)。以下舊缺陷沿革不能覆寫本段已驗修復，也不能據此刪去歷史FAIL。

---

> 2026-10-23 CURRENT C5-R6-04：E AI972f564e…9b67／產品6007de6a…169f不變。48個有界機制檢查（含1 control／47刪減）縮為16單位交通機制（裁圖324格／22合法動作僅決策檢查）；8組同態pair／16arms／48checkpoints及12566命令原core重播通過。七個縮減態未保留原同向軍事收益向量，仍有不同取捨；無通用RED，不改AI，轉PROPOSED協同架構評估。fresh195tests／check／build／prefix1100零loop／D02 PASS。Browser與Gameplay沿用R603 favicon404 FAIL，手機UNVERIFIED；008 FAIL／010 PASS為歷史同E，未重跑整局，新Full100／T3／T6 UNVERIFIED，Alpha PARTIAL。NEXT-ACTION唯一續作，不push main。

## C5-R6-04 當前診斷

- R604-Traffic：16單位／18×18裁圖保留交通反轉，僅機制CONFIRMED；7個縮減態沒有保留原軍事收益向量，無通用RED。
- R604-Causality：B替代同時改變B自己路線與A可用forward；原B0Attack變3Attack／8傷害／1kill，不能把總收益全歸因於A開路。
- R604-Negative：已知可見火力場景讓路會新增2HP受擊窗口；無空間／A已moved／原移動不傷交通均需排除。
- R604-Architecture：獨立候選評估PROPOSED，沒有隱藏記憶或policy變更。Q-ICON與008整局FAIL保留。

> 2026-10-23 CURRENT C5-R6-03：E產品6007de6a…169f／AI972f564e…9b67未變；六觀測目標未切換，已證實友軍移動能改變traffic／forward，但通用協同根因UNVERIFIED。完成28個有界分支；替代blocker32ET有軍事收益及成本取捨，沒有Capture／情報／終局，尚無最小fixture/RED，不改AI。QA checkpoint58dcaffdb8d740edb4786781c817470f8a199856僅修desktop errors收據與新增standalone負測試；fresh195/check/build PASS，連續Gameplay209/220與cleanup PASS，整體仍favicon404 FAIL，手機UNVERIFIED。Q-ICON缺資產交D3；R6新Full100/T3/T6未跑，Alpha PARTIAL。NEXT-ACTION唯一續作，不push main。

## C5-R6-03 本輪更新

- R603-Traffic：六個E觀測同一記憶site，owner UNKNOWN，並非site/enemy切換。6004原友軍移動令另一單位合法forward從score83.2857變負無限，地圖與可見敵人不變；症狀機制CONFIRMED，策略損失／通用修補仍UNVERIFIED。
- R603-CF：12＋13＋3＝28分支／84 checkpoints。晚起點替代無分項收益；早起點延至32ET的alt-blocker多2兵/3HP/1kill且多花2金。focal-first是HP／擊殺／成本混合取捨；三者均沒有Capture、新情報或winner。無通用最小fixture／原E RED，所以ai.ts不變。
- Q-EVIDENCE：desktop錯誤未進頂層errors的缺口以真Browser RED→GREEN修補，IMPLEMENTED／局部TESTED_PASS；零錯誤斷言與所有正式門檻不變。
- Q-ICON：缺漏favicon靜態資產CONFIRMED，Browser整體仍TESTED_FAIL；新HTTP GET/HEAD404、JS/CSS200且E hash相符。D3交付及後續Codex MIME驗收見C5-R6-03-BROWSER-INCIDENT；手機本輪未到達。負測試GREEN不等於Browser PASS。


> 2026-10-23 CURRENT C5-R6-02：合法移後反擊窗口T01與射位暴露T02以RED→GREEN最小修補；code checkpoint 4b5e50aadd464c00746e4299391f59f18814d4a1。E AI972f564e…9b67／產品6007de6a…169f；195tests/check/build/prefix1100零loop/D02及局部獨立review TESTED_PASS。E008仍TURN_LIMIT800／20682，部分SaveReplay PASS；E010自然終局winner1／247／6705，終局SaveReplay PASS。原220連續玩法209指令與cleanup PASS，但browser及qa:gameplay整體因B相同build也重現的favicon404 TESTED_FAIL，手機本次未執行。C5與Alpha PARTIAL；新版Full100/T3/T6、E021/064/051 UNVERIFIED。R5原87/13及T3/T6 FAIL保留。唯一續作NEXT-ACTION，沒有push main。

## R6-02 本輪缺陷

- R6-02-T01：移動政策漏掉無現成Attack時的合法致命反擊窗口；IMPLEMENTED／局部TESTED_PASS。16個公平B分支的局部戰力收益不等於控制或終局收益。
- R6-02-T02：D忽略其他可見敵軍對射位的潛在反擊；新反例D RED6/7→E GREEN7/7。E幾何上界只保守排除新捷徑，非一般最佳戰術保證。
- R6-02-S01：E008仍800 EndTurn無勝者，TESTED_FAIL。新六往返重建turn242–252／indices5896、5959、6013、6044、6114、6150，同actor Observation與E選擇parity6/6。這是症狀，尚無更佳E合法協同序列的收益證據，根因UNVERIFIED；不要再修已通過T01/T02或盲調權重。
- Q-ICON：strict static server未提供favicon.ico，Chrome console404使D/E browser與gameplay整體FAIL；原B3個build artifact SHA與歷史browser完全吻合時也重現。真玩法209/220及cleanup個別PASS；手機在assert後未執行。恢復須以獨立非玩法交付修補／環境決策維持console可觀測及完整scenario，不能忽略錯誤改PASS。本輪沒有改server/HTML/Gemini。


> 2026-10-22 CURRENT C5-R6：局部攻城窗口與招募回歸修補已驗證；code checkpoint894e8f97f966635378c950f38945606575d27847。B AI939d641f…fecc／產品d212303f…2843；188tests／check／build／prefix／D02／browser11／原220 Gameplay12及cleanup PASS。固定五局全部有結果：010自然終局，008／021／064／051仍TURN_LIMIT，故策略收斂TESTED_FAIL、C5與Alpha PARTIAL，新R6 Full100／T3／T6未跑。R5原87/13及其T3/T6 FAIL保留；R6-02轉查242–252往返，尚無更佳合法替代證據，不再盲調權重。NEXT-ACTION是唯一續作入口。不push main。

> 2026-10-21 CURRENT C5-R5：QA checkpoint74c87dcb6b82be3b1167898e7df9a91b002707e1；產品／AI／GameSession／UI／規則／schema未變。fresh check／180tests／build、D02、prefix、browser11、原220 Gameplay12與cleanup TESTED_PASS。固定Full100已100/100有紀錄：87 COMPLETE／13 TURN_LIMIT／0 COMMAND_LIMIT／0 ERROR；87終局與13部分SaveReplay均通過；Harness TESTED_PASS，T3／T6 TESTED_FAIL，Alpha PARTIAL。下一步只讀C5-R6失敗反例擷取；詳NEXT-ACTION及C5-R5-VERIFICATION。沒有push/merge main。

# 已知缺陷與驗收風險

> 2026-10-20 CURRENT C5-R4：Observation-only frontier／已知地形再偵察 IMPLEMENTED；123 tests/check/build、prefix1100/0loop、原D02 673commands真揭露／winner0、seed010 winner0／534EndTurn／15418commands／終局SaveReplay true，TESTED_PASS。qa:browser11與獨立review通過。追加完整qa:gameplay因download.delete canceled及ENOSPC維持BLOCKED；本輪整體PARTIAL。full100/T3/T6 UNVERIFIED，Alpha PARTIAL；唯一續作NEXT-ACTION，詳細docs/verification/C5-R4/C5-R4-TEST-RESULTS.json；沒有push。

> 2026-10-19 歷史C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-19 歷史C5-R2快照：三項無記憶AI局部修補 IMPLEMENTED，110 tests/check/build、1100-command prefix0loop、11 browser與12真玩法情境 TESTED_PASS。最新seed010仍 TESTED_FAIL：800 EndTurn／19813 commands／winner=null；中央搜尋合成反例1000commands仍FAIL。新版full100未跑，Alpha仍PARTIAL。權威續作見NEXT-ACTION與C5-R2-TEST-RESULTS；不push main。

> 2026-10-18 歷史R1快照：C2/C3/C4工程candidate已通過。C5最小無記憶policy修補IMPLEMENTED；生成prefix三段振盪→0、104 tests/check/build/11 browser/12玩法情境TESTED_PASS。完整seed010仍TESTED_FAIL：800 EndTurn/17937 commands/winner=null；新版full100/T3/T6未完整重跑，不能沿用舊62/38當新終局率。主創確認保留D3分頁。詳C5-AI-DIAGNOSIS與NEXT-ACTION。



> 2026-10-18 C3 CHECKPOINT（4cddfb3）：2026-10-18 C3：C0-01拒絕採用原guard，browser六種invalid selector均正常throw且first-party error/rejection可觀察；C0-05/06已由Observation合法修正並Canvas差分TESTED_PASS；新P2手機選格切頁RED→GREEN。D3根manifest實際40/40，LICENSE未改；舊39/40是稽核路徑碰撞錯報，見C3-IMPLEMENTATION-STATUS。未解：AI整局歷史FAIL、遺跡新權利NOT_IMPLEMENTED、APG tabs keyboard/關聯與小橫式UX PARTIAL、真機/真人UNVERIFIED。


## 2026-10-17 C2 現況

- C0-01：C2 不採 D2 全域 guard；main／UI 沒有 selector prototype patch 或全域 error/rejection 吞錯，boundary regression TESTED_PASS；D2 原包不回寫。
- C0-02/04：C2 browser 真 CDP 雙 touch pointers、pan/pinch、必觸發遺跡及新兵下一回合移動有執行證據；D2 舊 Stage2 不因此升為可信。
- C0-03：projector hidden-world fixtures 與兩段真合法 session history 的觀測／事件／公開錯誤非干擾已測；這是有限 fixture，不是所有世界／聯網保密保證。
- C0-05/06：D2 視覺修復仍交 Gemini；C2 沒有採 D2 圖面，map 僅 readonly 型別接線。
- C0-07：C2 另建 C2-SOURCE-MANIFEST.json，舊 manifest 不當現行 source 證明。
- C2-R1：玩家最後命令勝利後 AIStatus 曾維持 idle；D-terminal-red/green 已重現及修正 finished，不改 winner 規則。
- C2 QA 首輪橫式 pan FAIL：測試 canvas 中心被固定 footer 覆蓋，修成全軌跡 hit-test 後通過。**812×375 可視畫布區域仍小、footer 會覆蓋完整 canvas bounds 的一部分**；保留既有樣式，交 C3 做 UX 檢視，不能把手勢可操作當全畫面無遮擋。
- D-01/D-02/R-03、真人／實體手機、45–90 分鐘與整局可靠性缺口持續有效。新 C2 commit 的 GitHub CI 尚 UNVERIFIED；沒有 push。

## C0 歷史新增審查（D2 原包狀態未回寫）

D2 新增阻擋：全域吞錯／DOM prototype patch；Stage 2 假陽性 touch/pinch、fog regex、未觸發遺跡仍 PASS；unknown owner 畫敵方、異地中心硬編原首都名稱；Stage 2 manifest 四筆不符。精確路徑、行號、反例、嚴重度見 [C0-SOURCE-AUDIT](C0-SOURCE-AUDIT.md) C0-01–07 與獨立 review evidence。D2 整包合併 NOT_PASS，未直接修改其 source。

原 D-01/02、R-03 持續有效。下方 R-04 的無 HEAD/remote 指舊本機 mvp 工作樹；GitHub main 已有 commit 與 CI success，不可套用舊本機結論。舊「無專案 LICENSE」是封存時歷史狀態，現依作者已批准根 MIT LICENSE，README/LICENSE-STATUS 已對齊。C1 文件沒有修復玩法或形成 session runtime。

## 高優先 D-01：AI整局無可靠終局（TESTED_FAIL，高信心）

來源src/core/ai.ts:28–153；真實headlessseed010本輪801半回合/19696command/winnernull，exit1；完整固定100相同source歷史62complete/38TURN_LIMIT。用 `PROJECT4X_QA_START_SEED=10 PROJECT4X_QA_GAMES=1 PROJECT4X_QA_WORKERS=1 PROJECT4X_QA_OUTPUT=LOCAL_TEMP/qa-artifact npm run qa:headless`。不降低門檻、不给match設倒數、不合成winner。root本輪102.922秒，預算300秒。logs見TEST-MATRIX。

根因範圍：固定權重局部貪婪、佔位與巡查；已確認四角漏中央機制（D-02），不能宣稱已解釋010所有卡點。下一工程任務找010首個策略失效，保留合法觀測/commands最小反例，再小改AI，fixed100與verify驗收。

## 中優先 D-02：四角巡查不保證搜尋中央（最新TESTED_FAIL，見下方R2覆寫）

> 以下路徑/exit0敘述是歷史紀錄，該腳本在當前交付MISSING；不可照此宣稱可重現。最新入口 scripts/ai-endgame-search-check.ts，預期exit1，見2026-10-19段。

ai.ts:108–125；隔離docs/handoff/核心巡查反例.mjs，`node --import tsx docs/handoff/核心巡查反例.mjs`。1000全合法commands，431己方回合、139次Move，actor0仍從未看到中央(12,12)靜止敵兵、winnernull。**合成policyfixture**移除全部site/relic並設定已知地形，不能當正式可讀存檔或已證生成seed可達。exit0=反例成立。evidence/current/core-counterexample.txt為rootfresh重跑。修正方向：有覆蓋記憶的搜尋／戰略目標，而不是給未知敵座標作弊。

## 高優先 R-03：遺跡權利與最新主創裁決衝突（CONFIRMED規格落差）

現行game.ts授權首次己方回合visible，必答即選；歷史G1 D1正式明定如此，但本次使用者要求「發現權與取得權分離、實際抵達優先处置」。兩者都保存，最新設計是USER_CONFIRMED，程式仍舊實作。封存不修改規則。後續需規則版本化與fixtures/save相容方案，不能让AI Studio以文案暗改取得機制。DECISION-REGISTER有权威鏈。

## 中優先 R-04：過時進度／沒有Git提交（CONFIRMED）

原CONTEXT/README/memory仍RUNNING/19finished，最終100報告已FAIL。完整包保留原文，新MASTER入口覆蓋現場，不沿用session id查執行。Git196untracked/noHEAD/remote空；空diff不表示source已保存Git。兩ZIP＋逐檔hash保全這次版本。

## 其他PARTIAL/UNVERIFIED

- 真人完整局、實體手機、45–90分鐘目標、成熟戰略可理解性未驗。
- 完整非對稱生存經濟、政權篡奪、文化影響、改革革命分裂融合、資源交易、神器危險、星際與唯一起源真相沒有runtime。
- 存檔/回放完整含世界真相，非fog-safe公開artifact；沒有舊schema migration/逐幀player。FNV64checksum非安全簽章。
- main.ts有presentation/driver/persistence耦合與收入/遺跡值重複；最小adapter是PROPOSED，不在封存重構。
- 7e2e並非所有drag/pinch/a11y/FPS/戰鬥終局驗收；沒有lint設定。
- source沒有專案LICENSE；user本輪交接授權不等於對外開源或任意素材利用。候選GPL/混合CC須逐項審，不把reference當集成。

沒有修正任何產品缺陷；整體release readiness不可PASS。封包完整性驗證與產品可發布性分開。

## 2026-10-19 C5-R2 覆寫範圍

- R2-01 TESTED_PASS：已移動／無探索路線斥候錯誤保留Attack；R2-02 TESTED_PASS：同分路徑座標tie往返；R2-03 TESTED_PASS：先原地擊殺封住補兵格。只是指定反例與回歸通過，詳C5-R2-STALMATE-ROOT-CAUSE。
- D-01仍TESTED_FAIL：兩修候選800/19514、三修候選800/19813，均winner=null；沒有勝率進步證據。三修最後一次Capture在turn56，之後直到800EndTurn沒有更多Capture；戰鬥/招募仍持續，非AI停機。
- D-02最新TESTED_FAIL：舊文指向的核心巡查反例.mjs在目前project、C0/C2/evidence搜尋均MISSING；保留歷史敘述，不把不存在檔案當本輪證據。新scripts/ai-endgame-search-check.ts標RECONSTRUCTED_BY_CODEX，1000合法commands、turn871、seen=false、winner=null、exit1。這是合成世界，不是seed010可達性或攻城原因證明。
- 補兵限制：recruited不在Observation；調位只釋放格／保留機會，不保證後續一定Recruit；新的視野/必答遺跡也可能重新排序後續行動。
- 下一個攻城根因尚UNVERIFIED：動態友軍路徑、增援集結、目標選擇須從2331筆既有trace再縮減，不以調權重代替反例。完整世界/trace不可commit或交HUD。

## 2026-10-19 C5-R3 局部覆寫

- R3-01 TARGET PRIORITY：前四terrain排序截斷會漏更佳traffic目標；嚴格上界剪枝修正IMPLEMENTED，RED6/1→GREEN7/0。
- R3-02 REINFORCEMENT：全部完整traffic路線被友軍暫阻時，合法部分接近也被丟棄；僅此時enemy-only potential修正IMPLEMENTED，RED8/1→GREEN9/0。不改legalActions、不穿友軍、不保證友軍最終讓路。
- D-01：**seed010現版局部關閉**，真正winner0／534EndTurn／15418commands；第一R3候選800／19898 FAIL與R2 FAIL全保留。新版其他99seeds／full100／T3/T6 UNVERIFIED，不能整項宣稱可靠終局已完成。
- D-02：fresh1000commands／seen=false／turn871／winnernull仍TESTED_FAIL；獨立合成搜尋反例，不冒稱seed010原因。
- 同目標友軍traffic方向翻轉（歷史cmd1116→1171）為未全面消除的機制風險；不能一律禁terrain退步破壞必要繞路。
- review較弱「Move後EndTurn」斷言已強化：重設fresh且有合法退路後仍等待；最終113/113。
- 玩法12情境／209commands原上限220通過，真人完整局、實體手機、45–90分鐘、像素golden仍UNVERIFIED；Alpha PARTIAL。

證據：docs/verification/C5-R3/C5-R3-ROOT-CAUSE.md、C5-R3-TEST-RESULTS.json、C5-R3-SOURCE-BOUNDARY.json。

## 2026-10-20 R4缺陷沿革／局部覆寫

- D-02：舊1000commands漏搜TESTED_FAIL保留；R4原腳本673commands真揭露／自然winner0，TESTED_PASS。未知山圈與已知再偵察分開處理，非通用搜尋完備性證明。
- R4-E01：BLOCKED，完整browser gameplay兩次在privateSave下載清理取消；第二次證據寫入亦ENOSPC。精確下載取消原因UNVERIFIED；220門檻未改，旅程未完成。先恢復本機QA容量，再查重現；不刪其他檔或吞掉錯誤。
- R4-P01：PARTIAL，全已知巡查64兵microbenchmark median+70.7%／+1.293ms；未加入或降低數值性能門檻，非完整對局量測。
- R4-C01：中間候選0197的兩site切換prefix1loop TESTED_FAIL；同Observation在R3亦同選擇。最終保留primary等價語意後1100prefix0loop與seed010終局通過，但一般軍事target切換仍UNVERIFIED。

## 2026-10-20 C5-R5 preflight

- R5-QA01 CONFIRMED：browser-check privateSave的finally delete錯誤可遮蔽path/read原例外；關對話框亦可能跳過。實裝Playwright delete只重拋既有failure，不能據此推定delete主動cancel或ENOSPC是兩次取消同根因。尚未修復；先容量恢復、實際Playwright反例與TDD。
- R5-ENV01 BLOCKED：fresh df/inode/tmp/du/lsof與fsync probe已記錄；未找到可安全回收之大QA暫存。目標2GiB可用是保守PROPOSED資源預算，非已測最低值。
- R5-HARNESS01 NOT_IMPLEMENTED：每局COMPLETE終局SaveReplay、限額/ERROR四分類與append-only續跑須QA層補強；原harness仍每10th seed檢查。未提前跑full100。
- R5-VERIFY01 CONFIRMED靜態不相符：verify.mjs仍硬定browser.scenarios.length===7，現版正常browser11；需獨立反例驗證後修QA，不能因整體腳本exit0推定齊全。

## 2026-10-21 C5-R5 局部覆寫／剩餘缺陷

- QA下載錯誤遮蔽：IMPLEMENTED／TESTED_PASS，primary及cleanup可同時記錄，包含證據落盤失敗；歷史canceled底層共同原因仍UNVERIFIED，第二次ENOSPC獨立成立。
- D-01仍TESTED_FAIL：本輪固定100有87自然終局、13TURN_LIMIT（008／021／023／044／047／051／058／060／064／070／084／096／099）。0ERROR不代表AI策略可靠性PASS。seed010 winner0／534EndTurn／15418commands再次通過。
- D-02 TESTED_PASS：673commands、seen=true、winner0；不由單一反例推論全域終局。
- C5-R6候選：008及多局持續交戰／招募卻長期無新Capture；051在接近上限時仍有Capture，需分開；021／064有局部友軍交通症狀。全部因果根因UNVERIFIED，不在R5調權重或改AI。
- 合成已知巡查1.764→3.000ms median，約+70.1%；真對局760050決策median1.708／p95 5.757／max313.933ms。微基準與4worker／shadow整局不是同一效能指標，不直接重寫AI。
- P3：新增7處EOF空白，baseline..74c87dc diff --check exit2；保留真實結果，不更動本輪凍結method或降低門檻。
- 其餘：新遺跡取得規則NOT_IMPLEMENTED；城市成長與新單位／科技數值未批准。真人、真機、45–90分鐘、像素golden及公平性鏡像未驗；Alpha PARTIAL。76局actor0勝、11局actor1勝、13未終局不能直接推斷先手因果。

## 2026-10-22 C5-R6 局部因果與剩餘風險

- R6-01（Siege／Action order）：真seed008 command11555／turn456的合法觀測，支援可Move後單擊清城、另一fresh鄰兵可入城；原策略先消耗唯一入城者。已縮減／RED→GREEN，真原始觀測四步Capture。這是有界predicate最早失效，不是全域最佳性證明；完整B seed008仍800／20706／winnernull，不宣稱D-01整項修復。
- R6-REVIEW-01：candidateA直接清城early return繞過R2招募格調位，獨立review具體重現，root新測試RED；B共用原firingMove guard，GREEN、局部複審APPROVE。A舊結果不能升格為B。
- R6-FAIRNESS-01：100張生成世界的地形BFS顯示最近中立村距離actor0較近68／同距32／actor1較近0；與76：11勝者分布的因果關係UNVERIFIED，不修改地圖或平衡，獨立研究見R6公平性文件。
- R5的十三未終局與其他缺陷不因本輪fixture通過而刪除；新R6 Full100／T3／T6仍UNVERIFIED。
- B五局99582決策中只有010 COMPLETE，008／021／064／051仍TURN_LIMIT；部分SaveReplay不能當終局驗證。R6-02實際turn242–252六次往返／目標切換已有合法觀測，六EndTurn對照沒有改善據點控制，根因與更佳行動仍UNVERIFIED，不任意調權重。
