# C5-R4 Gameplay QA 恢復｜2026-10-21

C5-R4-GAMEPLAY：**TESTED_PASS**。產品來源 d5200357d155228fc43cb994c6897e3b6b8499fee507f76d7abad2ba0650bdc9、AI 82618e54129d96274c2dd5d4a8c1a430bf17714d4b4aba1d7cbf122b8004005e。基線 HEAD60738920a66b0c49a44115cfb66cc16ac695a737；本輪只改 QA／測試／文件，沒有產品程式變更。

## 磁碟與清理

原始磁碟／inode／lsof 診斷見下方歷史事件。使用者批准兩輪清理後，本輪起始可用24,184,107,008bytes（22.5GiB），project、private、TMPDIR各4KiB fsync／讀回成功。保守啟動預算2GiB。清理報告在桌面「清理紀錄-20261021-063235.json」及「深入清理紀錄-20261021-065425/README.md」。回收可重建快取／過期日誌，未刪 ZIP、歷史C0–C5證據、私有trace、其他worktree或.git。兩輪allocated約14.20GiB；容量受其他執行中應用影響，不能把容量變化全歸因於本任務。

## 根因與證據邊界

CONFIRMED：原 finally 中 download.delete 拋錯會覆蓋 path/read 的首個例外，並跳過 dialog.close；外層 browser.close 失敗亦可能跳過報告。已以真正 legacy wrapper 的 RED、故障注入與 GREEN 修正。新 withQaCleanup 同時保留 PRIMARY_TEST_FAILURE 與 CLEANUP_FAILURE，逐項嘗試後續清理；證據寫入 ENOSPC 時仍嘗試 stdout，不把清理錯誤吞掉。

Playwright 真實最小重現：顯式 download.cancel 後 path 與 delete 都回報 canceled；context 提前關閉產生 target-closed；這證明 delete 錯誤可為既有失敗的再拋出。無節奏連發合成Blob下載在10筆後第11筆未收到event；80筆間隔200ms合成序列通過。這只是瀏覽器合成邊界，**未證明歷史兩次取消的底層共同原因**；歷史第二次ENOSPC獨立成立。正式Gameplay沒有新增間隔、沒有關閉瀏覽器保護或增加220門檻。

## 實際驗收

- gameplay-final：70.61秒、exit0；12具名情境、209/220玩家命令，真DOM Move／Attack／Capture／Recruit／Research／ResolveRelic／EndTurn、Attack→Capture、AI交接、Save／Load／Replay與真CDP雙touch成立。
- GAMEPLAY ASSERTION RESULT：PASS。
- BROWSER ARTIFACT CLEANUP RESULT：PASS。4個context（desktop／手機直式／手機橫式／窄手機）各自關閉，browser disconnected，私有下載目錄刪除／無殘留；自己的本機server與port已釋放。
- browser-final：6.122秒、exit0；11具名情境。新契約驗證ID唯一／必要集合／個別PASS／完整清理收據／同HTML與JS、CSS SHA256，已對以上實際輸出再次驗證。
- 本機故障測試保留原錯誤與全部cleanup錯誤，涵蓋同步trigger、晚到waiter、已取得handle後trigger失敗、delete假成功、證據覆寫／競爭與落盤失敗。

完整原始log與逐指令trace只在專案外 private evidence：`../evidence/C5-R5-20261021-120235/`。公開摘要不包含canonical world或玩家私有存檔。舊FAIL與原磁碟事件不刪除，保存於Git及本次private的GAMEPLAY-RECOVERY-before.md。真人／手機真機／45–90分鐘產品驗收仍UNVERIFIED，Alpha PARTIAL。

## Full100後追加確認

2026-10-21 20:23:47–20:25:04，final-gameplay-after100 exit0／76.991秒，仍209/220命令／12情境、GAMEPLAY ASSERTION PASS及BROWSER ARTIFACT CLEANUP PASS。4 contexts／browser／downloads／server port皆釋放，同build SHA256契約重新核對PASS。詳細收據在專案外gameplay-after100/browser.json及server-cleanup.json。
