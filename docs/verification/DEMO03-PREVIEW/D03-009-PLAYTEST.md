# D03-009｜真人、實體手機試玩與發布 Gate

本檔是 D03-009 唯一驗收與回饋紀錄。MASTER-TODO 管任務進度，NEXT-ACTION 只導向本檔；既有工程收據保留於同目錄，不複製為第二套結果。**試玩文件已準備，不代表真人或手機已驗收。Playable Alpha 仍為 PARTIAL。**

## 1. 測試對象與已確認基線

| 身份 | 實際值／證據 |
|---|---|
| 分支／PR | experiment/demo03-gameplay-preview；[Draft PR #4](https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./pull/4)；不得合併 main 或自行轉 Ready |
| 本輪開始時 GitHub HEAD | d35a977fa5b126b58275bc70d3813f828f794664；已與本機乾淨工作樹核對；後續 HEAD 以 PR 即時值為準 |
| 已核對 hosted CI | [40127870051](https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./actions/runs/40127870051)：上述 HEAD，completed / success；不是新提交的 CI 結果 |
| 產品 SHA-256 | 0f7099307d28cc8652f34845799a0e95a8846e8a6d2c3b9bc7dd151ec9782fb7；逐檔清單見 [SOURCE-BOUNDARY](SOURCE-BOUNDARY.json) |
| 既有 Web 預覽包 | PROJECT4X-DEMO03-PREVIEW-72120bc7.zip；來源 commit 72120bc7cc97bfae3f6a7549f695ce4b9e05eece，與上述分支產品 bytes 相同，Git/文件/QA 提交身份不同，不能混寫 |
| ZIP SHA-256 | 15a946ae6c0492d89a0280e89241666a767bba23ae7e5b6b0a2d62ee0f6a89a4；CRC／19 個受 manifest 覆蓋檔案／乾淨解壓／Node launcher HTTP 已驗，見 [PACKAGE-SUMMARY](PACKAGE-SUMMARY.json) |
| 規則／資料格式 | 預覽 demo03-preview-1、Save2、Replay2；G1 舊規則與舊存檔不轉換；數值只獲准作隔離試驗 |
| 工程證據 | [TASK5-RESULTS](TASK5-RESULTS.json)、[CI-VERIFICATION](CI-VERIFICATION.json)：257 tests，0 fail / skip；check/build、Browser11、Gameplay12（209/220）、Demo4、PWA2/更新、預覽2＋跨版本4情境通過 |
| AI 證據界線 | G1 seed010 曾自然終局 winner1／247 EndTurn／6705 commands，Terminal Save/Replay 通過；來源另記於 TASK5，不能當作預覽 ruleset 或新版 Full100 |
| 審查來源 | 主創本輪回報 GPT-6 已唯讀審查基線、尚無確認工程阻擋；不冒稱已取得新 diff 的審查結果。原獨立審查及 P2 修復沿革保留；本輪新增 diff 仍交 GPT-6 獨立審查 |

產品與 method fingerprint 是不同身份。測試者每次記錄實際 code commit／ZIP hash／產品 hash；不可只寫「最新版」。若產品 hash 變更，舊試玩僅為歷史，需評估受影響 Gate，不能自動沿用 PASS。

## 2. 發布 Gate 總表（目前人工紀錄為零）

| Gate ID | 項目 | 目前狀態 | 已有證據／未完成原因 | 完成需要什麼 |
|---|---|---|---|---|
| G09-ENG | 自動工程與模擬觸控 | TESTED_PASS（上述基線） | 257 tests、hosted CI、2＋4 真 Browser 旅程；**手機模擬不是實體手機** | 新提交另核 CI 與產品身份 |
| G09-DESKTOP | 真人桌機完整旅程 | UNVERIFIED | 0 份真人紀錄 | 真人依第4節操作，保留版本、結果、問題及確認者 |
| G09-ACCESS | 實體手機受控連線 | BLOCKED（前置尚未提供） | 本交接未取得可驗證的受控 HTTPS 試玩 URL；原啟動器僅監聽127.0.0.1 | 有權限的負責者提供同一建置的手機可達網址，核對資產身份；不表示已確認產品缺陷 |
| G09-IOS | iPhone/iPad 實機 | UNVERIFIED | 未提供機型/OS/瀏覽器或操作紀錄 | 實際觸控、橫直式、Save/Load、背景恢復、PWA/離線逐項記錄 |
| G09-ANDROID | Android 實機 | UNVERIFIED | 未提供機型/OS/瀏覽器或操作紀錄 | 與 iOS 相同；不以 Chrome 模擬或 APK 計畫代替 |
| G09-BALANCE | 新兵／科技策略與平衡 | UNVERIFIED | 獲准數值是測試基準，沒有真人比較紀錄 | 比較守備/探索投資、收益與代價；由主創裁決，不以喜好分數自動批准數值 |
| G09-FULL100 | 新版 AI 完整100局 | UNVERIFIED | 未跑此預覽 ruleset 的固定100局；R5歷史87/13保留 | 獨立凍結來源與驗證方法後執行，不在真人文件工作中偷偷啟動 |
| G09-REVIEW | 新 diff 的 GPT-6 獨立審查 | UNVERIFIED | 基線審查由主創回報；新增提交尚待審 | 依新 GitHub diff 留下 verdict／範圍／來源；通過後才由負責者考慮 Draft→Ready |
| G09-RELEASE | 正式 Demo03／Alpha | UNVERIFIED | 以上人工與對局 Gate 尚未完成 | 彙整缺口與主創發布決策；CI成功不自動改此列 |

未執行用 UNVERIFIED；環境前置不足可在個別步驟用 BLOCKED 並附原因。TESTED_FAIL 必須保留重現紀錄；修正後新增一筆再測，不能覆蓋第一次失敗。上述人工 Gate 目前不填 PASS。

## 3. 開始前：安全且可重現的試玩環境

### 桌機

1. 使用獨立測試瀏覽器設定檔及新的測試保存；先保留自己的正式存檔備份。PWA 測試使用一般模式，若用無痕造成安裝限制，記環境差異，不判為已測安裝。
2. 使用既有 ZIP 時核對上述 SHA，再解壓；使用 source 時在乾淨測試目錄取本分支，先核 HEAD，再依 README 的 npm ci --ignore-scripts、npm run check、npm test、npm run build 建置。不要在有未提交修改的工作樹切換或覆寫來源。
3. 為避免與原 Demo02 的 localhost 保存混用，可在本分支以 `PROJECT4X_PORT=4174 npm start` 啟動，開啟 `http://127.0.0.1:4174/?preview=demo03`。這只設定現有啟動器的埠，不改伺服器程式；若埠已被占用，選另一個測試埠，不停止未知程序。換埠/網址會改變瀏覽器保存的 origin，找不到舊槽不等於檔案被刪除。
4. 記錄瀏覽器版本、視窗尺寸、縮放、輸入方式、seed（建議先用霧境初航-01），確認畫面明示隔離預覽。node/瀏覽器版本以實際裝置填寫，不抄 CI 環境。

### 實體手機

1. 手機的127.0.0.1指手機自己；不能將桌機 loopback 網址或 GitHub 原始碼/ZIP 頁面當作可玩的手機頁面。現有 `scripts/serve.mjs` 固定監聽桌機 loopback，本輪不改 listener、不開 tunnel、不部署或繞過憑證。
2. 由有部署權限者提供**受控、HTTPS、可從手機開啟的同版靜態建置**，填入「手機試玩 URL：待提供」。部署者記錄 code commit、產品 hash、dist/pwa-assets.json revision 與資產 hash；測試者記實際 URL/版本（對外回報隱去 token/私人網域細節）。尚未提供/測通前 G09-ACCESS 保持 BLOCKED，其餘實機步驟 UNVERIFIED。
3. 不把普通區網 HTTP 當作完整 PWA/保存環境驗收。安全環境才可註冊 Service Worker；本機 loopback 的例外不等同遠端 HTTP。[MDN Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts)
4. 在實際瀏覽器依其版本提供的安裝／加入主畫面流程測試；安裝入口與支援依平台不同，沒有入口要記裝置/瀏覽器與原因，不猜已安裝。[MDN Installing web apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing)
5. 不安裝未知憑證或 SDK、不自動暴露本機服務。實機開啟、安裝、離線及背景恢復各自記結果，不能合併成一個「手機PASS」。

## 4. 每位測試者的基本旅程

各步在回饋紀錄填 TESTED_PASS／TESTED_FAIL／UNVERIFIED／BLOCKED，另附觀察。不要為達成旅程改金幣、注入世界或改勝負條件。指令與收入可能受其他合法行動影響，扣款請比較操作前後，不假定每局流程完全相同。

| Step | 實際操作 | 預期／要記錄的事 |
|---|---|---|
| H01 | 主選單開始新預覽局 | 明示 Demo03隔離預覽，能理解目前測試版本與「下一新局」規則；記首次操作是否需人指導 |
| H02 | 選己方部隊、地圖格、己方城市；嘗試合法移動 | 選取/移動回饋清楚，不誤觸；城市可選、駐軍移開後才有招募空間；記錯點、尋找按鈕與拖曳誤觸 |
| H03 | 檢視科技，研究防禦工程 | 起始8金且未另花費時扣7後剩1；顯示解鎖盾衛。軍事機動在尋徑前不可研究；不是只看到按鈕便算成功 |
| H04 | 斥候探索至實際遺跡選擇，再選金幣或情報 | 必須真的觸發選擇。金幣為+4；情報只揭地形、實際剩餘格數；未觸發就記UNVERIFIED。閱讀探索手札，敘事完成不等於軍事勝利 |
| H05 | 移開城內駐軍，資金足夠後招募盾衛 | 實扣6、生命10；該回合不可立即行動。結束回合經AI後，新己回合可使用；招募不可因重複點擊重複扣款 |
| H06 | 盾衛投入真戰鬥；尋找攻擊→移入→佔領窗口 | 記攻擊者/地形/掩護/HP前後、己方成本與守點收益。未發生實戰不可將防禦效果填PASS；Core傷害測試不是本次真人實戰 |
| H07 | 累積資源、研究尋徑，再研究軍事機動 | 尋徑維持舊費4；機動研究費6、需尋徑；沒有額外暗中解鎖的新能力 |
| H08 | 空城招募機動偵察，下己回合使用 | 招募扣7、HP7；找真正合法的三格路線，山水/友軍仍阻擋。比較機動收益及放棄其他招募的代價；不要把必要繞路當錯誤 |
| H09 | 結束回合並等AI交接 | 操作鎖定/狀態清楚，不誤認遊戲卡死；若出現安全暫停，記畫面與續作結果，不能當作自然終局 |
| H10 | 本機保存→重新整理→接續；匯出保存及Replay並驗證 | 部隊/科技/位置/資源可延續；Replay明示預覽格式且驗證不替換現局。匯出開始不代表檔案已落盤，要實際找到下載檔 |
| H11 | 用**新建的測試檔**雙向匯入G1/預覽，再看選單及航行紀錄 | 載入局保留原規則；重開前明示 factory 的下一新局版本。舊G1槽與預覽槽分開；不拿唯一正式存檔做覆寫測試 |
| H12 | 暫停並回到選單/手札，結束一段體驗 | 能理解如何保存、繼續與結束；記總時長、停下原因、最想再做/最困惑的決策。45–90分鐘是長期單局目標，非本檢查表新設的Demo硬性門檻 |

若資金不足，正常結束己方回合等待現行收入；不為試玩提高起始金幣。無法在這次旅程遇到戰鬥/佔領/特定地形，記UNVERIFIED並另約場景，不能把其他自動情境的PASS填到本次手動紀錄。

## 5. 實機額外檢查（每台分開）

| Step | 操作 | 證據與結果欄要求 |
|---|---|---|
| M01 | 直式與橫式，切換地圖/部隊/科技/手札 | 機型、OS、瀏覽器、視窗/縮放；看得到主要按鈕，彈窗不遮住必要操作；真截圖 |
| M02 | 單指拖曳、點選、兩根手指縮放，再選格行動 | 真實兩指手勢；記相機與選取是否誤觸。滑鼠或DevTools模擬不能代填 |
| M03 | 科技/招募/回合按鈕、螢幕鍵盤及長文字 | H03/H05/H07/H08能真正完成；鍵盤收起後可繼續；小目標或捲動造成失敗要記 |
| M04 | 一般瀏覽器保存、下載/分享位置、重新開啟 | 實際找到檔案；不同瀏覽器/PWA容器可能有不同保存環境，分別記載，不假定自動共用 |
| M05 | 安裝/加入主畫面後獨立開啟 | 記平台實際流程、圖示/入口/規則版本；若預設啟動G1，從選單進預覽再確認，不誤認存檔消失 |
| M06 | 首次完整載入後離線、重新開啟及讀取測試保存 | 記斷網方式與操作；第一次沒快取的離線失敗與已快取重開分開；不能只看離線圖示 |
| M07 | App切到背景、鎖屏後回來，再繼續一個合法Action | 時長由測試者記錄；有無重載/狀態丟失/AI重入/相機異常；真機未做即UNVERIFIED |
| M08 | 有同源新版建置可用時測PWA更新等待 | 保留舊局、關閉舊客戶端後再核新版；未提供可比較新版時UNVERIFIED，不為此更換正式Demo02 |

## 6. 平衡回饋：觀察收益與代價，不自動批准新數字

用新測試局比較守備投資與機動投資，保留相同 seed、規則版本與實際可比條件；不同順序/AI反應不假裝是嚴格對照。記錄：研究與招募花費、得到什麼攻城/守備/探索機會、錯過什麼投資、兵力損失、據點控制是否改變、是否出現長期僵持。把「偏好」「可重現現象」「平衡假說」分開；沒有觀察不填零。

盾衛低攻高防可能延長僵持，機動偵察較貴且不自動取得尋徑+1視野；兩者是否有值得付費的選擇仍待真人判斷。回饋可提出數值建議，但不得直接將建議寫成 USER_CONFIRMED、改程式或覆寫已批准測試表。

## 7. 真人／實機回饋紀錄（目前沒有實測列）

目前真人場次：**0**。目前有紀錄的實體裝置：**0**。以下是待複製的空白表，不是已執行紀錄；每次 append 新 session，不覆寫歷史FAIL。

```yaml
session_id: 待填唯一代號
tester_alias: 待填匿名代號
performed_at: null
kind: null # HUMAN_DESKTOP / PHYSICAL_IOS / PHYSICAL_ANDROID
code_commit: null
reviewed_branch_head: null
artifact_commit_or_zip_sha256: null
product_source_hash: null
url_or_origin_redacted: null
device_os_browser: null # 不收UDID、序號、個人帳號或IP
input_orientation_viewport: null
seed: null
duration_minutes: null
steps: [] # 每列含step_id、status、實際操作、期望、實際結果、evidence_ref
status: UNVERIFIED
problems: [] # issue代號/嚴重度/可重現步驟/首次發生與頻率
strategy_benefit: null
strategy_cost: null
confusing_moment: null
would_continue_and_why: null
reviewed_by: null
```

證據可以是合法可見的截圖/錄影及時間點。Save/Replay含完整世界與歷史，僅留測試者私有證據，不貼公開issue、不commit。對外只放安全摘要/檔案SHA與可見操作；遮蔽帳號、個人路徑、token與通知。避免收集無關個資。

## 8. 收尾與狀態更新規則

1. 測試者交回實際紀錄後才新增本檔session，核來源/證據與受測步驟，再更新第2節對應Gate；空白表或CI結果不能簽人工驗收。
2. 缺陷先在本檔連結到KNOWN-DEFECTS的獨立ID，保留原FAIL；程式修復另開最小切片，不在試玩整理時順便改數值。
3. 每次push後查PR4最新完整HEAD與對應CI；保留Draft。新diff交GPT-6獨立審查，不能用舊審查替代。
4. 主創另行決定平衡、正式發布、Draft→Ready及main整合。本輪只交試玩準備與狀態紀錄，不假造任何真人、真機或新版100局結果。
