# C5-R5 驗證交付｜2026-10-21

本輪已完成驗證工作，**AI整局驗收仍FAIL**。沒有修改任何src、AI policy、GameSession、前端、規則、Save／Replay schema或package/lockfile。

## Gate 判定

| Gate | 實際結果 |
|---|---|
| C5-R4-GAMEPLAY | TESTED_PASS；209/220玩家指令、12情境；primary與cleanup分列，cleanup PASS |
| C5-R5-HARNESS | TESTED_PASS；TDD、獨立審查、100逐局收據與來源完整性成立 |
| C5-R5-FULL100 | 驗證完成100/100；TESTED_FAIL：87 COMPLETE、13 TURN_LIMIT、0 COMMAND_LIMIT、0 ERROR |
| T3 AI整局可靠性 | TESTED_FAIL；要求固定100全部自然終局且通過終局SaveReplay，未降低門檻 |
| T6 整體工程驗收 | TESTED_FAIL；npm run verify正確在Full100 gate exit1並停止 |
| Playable Alpha | PARTIAL；真人／真機／45–90分鐘／產品驗收未成立 |

## 來源與環境

- 分支integration/project4x-c3；恢復HEAD60738920a66b0c49a44115cfb66cc16ac695a737；測試程式checkpoint74c87dcb6b82be3b1167898e7df9a91b002707e1。最終HEAD以git rev-parse HEAD／專案外FINAL-GIT-STATE.json為準；後續commit只同步文件。
- 產品21檔fingerprint：d5200357d155228fc43cb994c6897e3b6b8499fee507f76d7abad2ba0650bdc9。
- AI：82618e54129d96274c2dd5d4a8c1a430bf17714d4b4aba1d7cbf122b8004005e。
- QA method（含shadow）：7c44ac13dd89b96b0e3f8e35286a882aaa9517b5fb5d1bfbad76e1d023730583；shadow 9dc8e5be1a0227c0176725fd3c146b1df49353cdbb7c2c2089b45f43e48185e7。所有001–100同一來源，唯讀snapshot，未中途換策略。
- g1-ccts-1／project4x-save-1／project4x-replay-1；Node v26.10.0／npm11.19.1／Playwright1.64.0。既有node_modules連用，無安裝／升級依賴。
- 遠端main以git ls-remote兩次核對仍c21b16cd75572d069369f41426f7323c63c05083；沒有push／merge／force／reset／clean，也沒有修改其他worktree。

## Gameplay 下載／清理恢復

詳C5-R4-GAMEPLAY-RECOVERY.md。legacy finally遮蔽首個錯誤已真正RED→GREEN；新wrapper保留PRIMARY_TEST_FAILURE與CLEANUP_FAILURE，清理失敗不吞掉，也不阻止後續context／browser／receipt嘗試。實際cancel及context-close最小重現與無節奏Blob下載邊界分開記錄，不能假定兩次歷史canceled均由ENOSPC造成。

最後一次完整Gameplay為20:23:47–20:25:04、76.991秒、exit0；真DOM Attack→Capture、Recruit、Research、ResolveRelic、EndTurn／AI交接、Save／Load／Replay、CDP真雙touch均成立，209/220未提高門檻。4個context關閉、browser disconnected、下載目錄無殘留、server port關閉。截圖為實際執行畫面，私有canonical未寫入HUD。

## verify.mjs 瀏覽器合約

移除scenarios.length===7；使用qa-browser-contract.mjs明確11個ID（Gameplay另加完整旅程第12個），檢查必要集合／唯一ID／每項PASS／error空／清理收據身分／同HTML及完整JS、CSS SHA256。新增18個正反例，包含缺ID但總數相同、重複、錯build、缺CSS、空cleanup、context重複及玩法模式矛盾。實際browser11與Gameplay12 JSON已用此validator驗證。總verify在真實Full100 FAIL後停止，沒有假稱走到其browser步驟；獨立browser／audit執行結果另列。

## Harness TDD 與不可覆寫結果

- qa-match：每個自然終局serialize／deserialize及exportReplay／replayGame完整deepEqual，包含history與requests；非終局只標partial，不冒稱terminal。
- qa-ledger：fsync＋exclusive hardlink發布，重複seed拒絕、source／method／schema／Node／limits隔離；部分中斷只補缺結果，保留失敗與attempt。
- 根據獨立審查修正兩項P1：先durable提交row再ack private診斷；診斷失敗留獨立收據且整輪FAIL。coordinator acquire/release共用原子mkdir guard；guard殘留fail closed，不猜測刪除。
- 嚴格row驗證回合／action計數／decision樣本與timing／terminal旗標。CLI實證EACCES、續接、舊輸出拒絕與混合來源；shadow action不符、輸入修改、非法counter都拒絕。
- 新增57測試：download7＋lifecycle5＋browser contract18＋ledger14＋match11＋CLI2；原123全保留，T6中fresh180/180、0fail/skip。

## 固定100執行與證據

固定獨立QA-001–100；800 EndTurn／40000commands、4workers、相同Observation-only AI、真合法勝敗。001–004先試跑，再005–020／021–036／037–052／053–068／069–084／085–100；2026-10-21 12:42:48至14:07:03，共約84.25分鐘；各批runner合計83.91分鐘。760050個原AI決策，沒有winner合成、刪seed或改上限。

87局terminal SaveReplay均true；13局partial SaveReplay均true、terminal flags均false。100start＋100end，一seed一次；13 private diagnostic PASS，沒有worker/fixture/落盤錯誤。逐局安全資料、當前SHA256、分布見C5-R5-FULL100-RESULTS.json；完整world／history／raw latency只在專案外private。

失敗seed：008, 021, 023, 044, 047, 051, 058, 060, 064, 070, 084, 096, 099。每個都是800 EndTurn、winner=null，必須保留；分類只作候選，根因仍須最小Observation反例證明。008已核對最初hash；其餘首次batch compact語意與後續一致，但**沒有逐檔發布當下的獨立hash基準**，不能用目前封存hash冒稱全100歷史bytes已獨立證實。不可覆寫API與故障路徑另有測試證據。

## 效能與資源

- 全已知巡查synthetic：歷史1.828→3.121ms；本輪相同30calls／4warmups／R4 percentile定義重測1.764→3.000ms（+70.1%）。unknown frontier微基準約-44.2%，不冒充整局或FPS改善。
- 真對局原chooseAction median1.708ms／p95 5.757ms／max313.933ms，總計約1585.684秒；每局時間含Observation、reducer、shadow與SaveReplay。路徑計數來自私有插樁副本，760050步action／immutability parity，正式action始終來自原AI。
- 每局時間median48.371秒／p95 538.689秒／max685.423秒；EndTurn median190／p95 800；commands median4352／p95 23660。四workers共享機器、GC／排程影響，非隔離純AI性能保證。
- 最高程序RSS1,037,264,832bytes（約989MiB）；初始可用約22.5GiB，末次仍約21GiB以上。容量變化包含其他應用，不能全部歸因本任務。QA私有證據約98MiB，保留所需原始資料。

## T3／T6與工程回歸

正式定義依docs/handoff/TEST-RESULTS.md及docs/技能路由與開發待辦.md；不是規則T03/T06單元測試。

- check／180tests／build：T6中fresh exit0；同source／dist不變。
- prefix：1100commands／0loop、exit0；有限prefix不是全域終局證據。
- D02：673commands／seen=true／winner0、exit0；合成獨立反例。
- browser11、Gameplay12（209/220）：fresh exit0，清理PASS。
- npm audit：20:23官方endpoint回覆0個已知漏洞、exit0，未更新依賴。
- round-integrity：100個唯一種子／來源／flags／shadow parity／目前hash全核對，exit0；不是100自然終局PASS。
- T3-final：逐列嚴格驗證，exit1，第一個拒絕008 TURN_LIMIT。
- npm run verify：check／tests／build exit0，重用已完成ledger（未重跑seed）在完整對局exit1，總驗證FAIL。audit/browser在此流程未執行；以上獨立執行可追溯，但不將T6改PASS。
- baseline..74c87dc diff --check：exit2，7個EOF空白P3；未變更凍結method以美化結果。

## 清理、安全與審查

兩輪使用者批准清理約14.20GiB allocated快取／舊日誌；歷史ZIP、canonical、C0–C5證據、其他worktree與.git皆保留。細節桌面清理紀錄及C5-R4-GAMEPLAY-RECOVERY；末次FINAL-CLEANUP-AUDIT確認沒有active runner receipt／coordinator／guard，browser contexts／downloads／port已釋放。本階段沒有額外刪除使用者資料。

獨立reviewer r5_download_review、r5_harness_audit、clean-context r5_final_review；見C5-R5-INDEPENDENT-REVIEW。沒有可確認runtime blocker；P3與驗證界線如實保留。OpenCodeReview憑證不可用未執行；Security inventory helper未能形成完整插件掃描，不宣稱security scan PASS；LSP工具不可用，實做TypeScript及runtime驗證。

## 下一個正式切片

C5-R6：先由008及其餘失敗局的合法Observation找出第一個因果斷點，區分長期零Capture、近期仍Capture、交通與搜尋症狀；RED→最小策略修補→回歸→新的同源100輪。不得混入本輪結果。城市／科技／兵種／新遺跡規則不在R5改動範圍，需正式設計裁決。真人、真機、45–90分鐘與產品體驗仍UNVERIFIED。

完整log命令、時間、exit及SHA256在EVIDENCE-INDEX.json；private根：LOCAL_HOME/Desktop/Fake-Polytopia/工程整合/C3-20261018-074653/evidence/C5-R5-20261021-120235。未設外部續跑supervisor，沒有聲稱額度恢復會自動工作。
