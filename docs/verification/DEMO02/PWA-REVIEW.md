# PWA獨立審查

Reviewer `/root/demo_asset_review` 唯讀；沒有重跑Browser。產品範圍build-pwa/manifest/index/registration，QA範圍pwa-check及兩個單元測試。

初審找到兩項P2：ready Promise無逾時、base尾斜線產生雙斜線假FAIL。已改15秒active/controller有界等待及URL單尾斜線。複核無剩餘blocker。

Reviewer實際命令：node --test（2/2）；Node VM執行真dist worker，驗根/巢狀scope、同scope清理而保留其他cache、未知navigation/POST bypass、query映射；SHA竄改/redirect/network失敗均在cache.open前拒絕；重算9資產SHA；Python重算收據/run log/source/runner雜湊。這些VM結果不冒充Browser。

Root真Chromium：pwa-stable-001根路徑、pwa-subpath-001巢狀路徑，installabilityErrors空、靜態cache 9項、離線重載及本機保存一致。pwa-update-002以兩份隔離建置驗證A client存活時B waiting，關A後才activate/清A，新頁讀B。兩個QA問題修補已複核。

首次incognito不可安裝、首次update舊worker handle失效皆保留FAIL。update v2只重新取得handle且仍斷言B cache與新頁內容，沒有跳過更新驗證。runner v1 f0270a…、v2 ecfe18…獨立保留；v2把docs/contracts納入來源封條。

VERDICT：本機Chromium PWA候選工程Gate TESTED_PASS；不代表真機安裝/公開HTTPS/真人體驗。
