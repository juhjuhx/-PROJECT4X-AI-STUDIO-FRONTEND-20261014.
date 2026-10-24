# 探索Demo UI獨立複核

Reviewer：`/root/demo_ui_review`；範圍：main存檔編排、shell意圖取消與初始選單、progress parser。唯讀，沒有代root執行Browser。

初審四個P2：非同步sidecar落後AI載入、舊callback關閉新選單、既有長seed遭metadata拒絕、開始前保存按鈕繞過選單。均以真反例或parser RED→GREEN修正。

複核實際命令：`nl -ba`對應source、Python解析JSON、Node `artifactHashes("dist")`＋`assert.deepEqual`完整比對兩份收據。exit0。

`private/demo-menu-final-green-002/demo.json`：桌面1440×960與手機模擬375×812，共4情境PASS，包含真Move/Relic intel/Research、winner=null、保存載入與兩種取消競態；errors空、cleanup PASS。`private/browser-menu-001/browser.json`：11情境PASS、同build SHA、cleanup PASS。

第一次final-green001停止於測試刻意新局後未接受未保存confirm，不是產品錯誤；green002顯式檢查confirm文字並接受，首次FAIL保留。

VERDICT：限定source無剩餘blocker；PWA、真機與完整Alpha不在本次review範圍。原始完整收據在專案外DEMO02 evidence，勿將私人save放入公開Git。
