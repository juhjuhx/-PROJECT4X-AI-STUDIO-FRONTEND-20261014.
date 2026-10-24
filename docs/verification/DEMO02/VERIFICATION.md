> 最終交付更新：Web採r3（6b7d54df848887cd1c487742f7dbcebedfe4b0ee90bf39830a23cf25410af8f3），19檔／91350bytes；僅修正可攜來源身份資料。全部runtime/啟動檔bytes與已真Browser驗證r2相同。下方r2/首版均為保留過程。

# Demo02 Candidate｜驗證與限制

**前次授權修正版為PROJECT4X-DEMO02-WEB-20261024-r2.zip（保留過程）**（19檔/91207bytes）；補Vite module-preload MIT告知，runtime不變。SHA256 fc74aa2f07f1f8e81aa1b8e4a81937cccdfdcc34617d727417233858742be5db。首版18檔ZIP仍保留，以下舊封包段是過程紀錄。macOS原生unzip保留0755，實際執行啟動檔並fresh qa:demo4情境PASS。

2026-10-24（Asia/Taipei）。實測Node26.10.0／npm11.19.1、macOS arm64、Chromium1248；產品package仍0.1.0，Demo02是里程碑名，沒有靜默將ruleset改成0.2。

## 來源與改動

基線2254bb26…已保全R605未提交研究於e4a1692；P3 checkpoint61f27e0；PWA runtime checkpoint6bfbb98b5c0e5136f1fe3807ba0f7cbb01933729。實際測試針對每份STARTED的完整source fingerprint，不以commit日期或文件聲明代替。

正式AI仍972f564ea1bc795b269e4c5db066fe209623ffa42961d84eacc30ee374529b67。17個受保護檔案含core/session/presentation/ui與lock/config對恢復基線逐byte不變。新增main選單/存檔編排、src/demo、CSS、原創發行圖示、PWA靜態build/QA；沒有新reducer、遊戲數值、winner、隱藏記憶或schema改動。

完整身份見[SOURCE-BOUNDARY.json](SOURCE-BOUNDARY.json)，執行清單見[TEST-RESULTS.json](TEST-RESULTS.json)。GitHub main於本輪唯讀ls-remote仍c21b16cd75572d069369f41426f7323c63c05083；未fetch合併、push或deploy。

## Fresh Gates

| Gate | 實際結果／範圍 |
|---|---|
| npm run check | TESTED_PASS；tsc noEmit。環境無LSP工具，沒有假稱lsp_diagnostics已跑 |
| npm test | TESTED_PASS 203/203，0fail/skip；原195保留，新增static HTTP1、journal4、sidecar1、PWA build2 |
| npm run build | TESTED_PASS；11產物；PWA static revision 2ea4d10eb5b2463a400439237daf4b2c826340d422b205b77be1ccf7a0d28aa3 |
| qa:ai:oscillation | TESTED_PASS 1100commands／0loop；不是完整對局率 |
| ai-endgame-search-check | TESTED_PASS 673commands真揭露；D02合成測試，不代表所有終局搜索 |
| qa:browser | TESTED_PASS 11情境；含真正CDP多點touch。原零console/network錯誤斷言保留 |
| qa:gameplay | TESTED_PASS 12情境；連續209/220玩家指令、真Attack後Capture/Recruit/Research/Relic、SaveLoadReplay；cleanup PASS |
| qa:demo | TESTED_PASS 桌面1440×960及手機模擬375×812，共4情境；三個真Action、探索敘事完成winner=null、保存載入與同世代/換局取消競態 |
| qa:pwa | TESTED_PASS 根路徑、巢狀/games/demo/，CDP installabilityErrors空；9個static cache、離線重載與原存檔相同 |
| PWA更新 | TESTED_PASS 隔離A/B產物，A client開著時B waiting，關閉A後B啟用並清A cache；沒有skipWaiting |
| clean restore | TESTED_PASS 原lockfile npm ci --ignore-scripts，再check/203tests/build；11產物SHA全部與原build相同，還原版PWA真Browser通過 |
| npm audit --json | TESTED_PASS；本次registry通報0；未更新依賴，不等於永遠沒有安全缺陷 |
| 歷史保全 | TESTED_PASS 五封條1982檔無變動；R5公開結果SHA保持aba1a667…25cb2 |

原始完整log/STARTED/FINISHED/錯誤收據存在專案外 `evidence/DEMO02-20261024-002013-6a9691d4/`；安全投影見[BROWSER-SAFE-SUMMARY](BROWSER-SAFE-SUMMARY.json)，截圖見[screenshots/SCREENSHOTS](screenshots/SCREENSHOTS.json)。截圖是實際執行，手機只是模擬；fullPage像素高度可能大於viewport。原始私人save和canonical world不進Git或發行zip。

## RED與失敗保留

- 靜態favicon先重現MIME失敗，再補ICO/PNG/SVG與MIME；沒有忽略404。舊Browser/favicon FAIL仍屬歷史，不刪除。
- 探索紀錄、pack/精確save bytes綁定、長seed界線、選單intro/save繞過、異步load先換局與晚到callback均有RED→GREEN；獨立review四個UI P2已修。
- 最初Demo temp prefix不符安全cleanup規則，primary與cleanup各記FAIL；僅檢查該空目錄後清除，原錯誤不覆寫。其後合規prefix均正常cleanup。
- final-green001是QA刻意建立新局後，未接受未保存confirm；保留FAIL；green002顯式核對並接受confirm。
- PWA first001在無痕context報in-incognito；改一般隔離profile實測成功，未刪此斷言。update001碰到已重啟的worker handle；v2重新取handle且仍核對B cache和新頁內容。
- 一輪Gameplay與PWA執行中同步更新MODULE-OWNERSHIP，runner正確標SOURCE_MISMATCH；凍結文件後stable001兩者重跑PASS，沒有把exit0直接當同source PASS。
- 隔離npm ci --offline第一次ENOTCACHED；原lockfile線上還原成功，不把離線安裝失敗改成通過。

## 架構與資料邊界

Demo shell僅收GameplayPort和已封裝的開始/load/save callback。探索目標根據合法Observation與成功own Action；duplicate或同version不重算，不傳history到HUD。完整save僅在trusted local boundary作SHA256，sidecar另綁packId/version/seed；load先驗sidecar後核stamp/intent，再同步replace與restore，舊局callback不能改新意圖。外部匯出檔仍是原save/replay格式，**不攜帶本機探索手札sidecar**；不能將完整save分享當fog-safe玩家回放。

PWA cache只含白名單程式/圖示/manifest，逐byte SHA驗證後才寫cache；不收JSON存檔、API、未知URL或私人world。Cache prefix隔離scope；默認waiting生命周期保留進行中的舊遊戲，沒有強制更新。不要透過清除瀏覽器網站資料來「修更新」，那會丟本機槽位；先匯出備份。公開HTTPS部署尚未執行。

## 獨立審查與未驗收

UI reviewer demo_ui_review找到四個P2，root修補後靜態/收據/產物SHA複核無blocker；PWA reviewer demo_asset_review找到兩個QA P2，root修補後複核無blocker。World reviewer核對33原件及提案，找到地圖尺寸誤寫18×18，已依source改24×24。詳細命令與範圍見[UI review](DEMO-JOURNEY-REVIEW.md)、[PWA review](PWA-REVIEW.md)、[文件review](WORLD-REVIEW.md)。review不是root runtime測試的替代。

R5 Full100 87COMPLETE/13TURN_LIMIT及T3/T6 FAIL保持凍結；新版E Full100未跑，E008仍是歷史TURN_LIMIT，E010歷史單局自然終局。R605協同排序僅實驗中，沒有GO。這輪產品化不把C5的失敗改成PASS。

Playable Alpha維持PARTIAL：真人完整體驗/45–90分鐘/實體手機/讀屏與完整WCAG/公開HTTPS安裝/Android APK未驗收。Java wrapper沒有JRE，缺完整Android SDK/adb/gradle，APK BLOCKED；未自動安裝大型工具鏈。新增兵種、科技、地形與新版遺跡只在提案，沒有新玩法runtime。

## 可下載Web封包

PROJECT4X-DEMO02-WEB-20261024.zip已產生，18檔、89638bytes，CRC與SHA manifest及解壓逐檔hash TESTED_PASS。ZIP SHA256：231692f117ad5aeb3d4b529370166a68dad47b96ef1e2869a9f70de3415e09ab。實際解壓版Browser結果及完整SOURCE zip最終校驗見交付根DELIVERY-VERIFICATION.json，不以CRC單獨宣稱Gameplay PASS。

ZIP解壓版已追加真qa:pwa（2情境）與qa:demo（桌面/手機模擬4情境）全部TESTED_PASS，errors空、cleanup正常；對應TEST-RESULTS的demo-zip-*。

## 本輪安全清理

所有5個自建server已停止，4173/48523–48527均無listener。清除5個自建可重建還原/安裝/首版解壓目錄，共110223731邏輯bytes（約105MiB）；ZIP、唯一日誌、Git、Downloads及私人歷史evidence保留。最終r2解壓可玩資料夾也保留。精確路徑/owner/容量與清理結果見交付根CLEANUP-PLAN/RESULTS，未做大範圍清除。

## 可攜帶來源清單更正

Source ZIP後驗發現來源map把忽略的src/.DS_Store誤算成產品33檔；不是runtime缺件。已明確排除Finder metadata，修正為32檔，產品SHA 8ad7d798b910e774c929a277787f2f7c7e4c20d9f4583c4e586200e1d37dedb5。舊map/第一次封裝腳本與結果保留，不把metadata錯誤算作整個程式測試失敗，也不將舊來源hash冒稱跨機器可驗。所有程式bytes/17protected/48methods及原測試不變。最終Web已採r3以同步SOURCE-IDENTITY；舊ZIP均保留。
