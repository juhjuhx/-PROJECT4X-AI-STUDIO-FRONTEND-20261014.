# Demo02 靜態資產切片
TESTED_PASS：真favicon資產、ICO/webmanifest MIME、明確HTML圖示連結。PWA仍NOT_IMPLEMENTED，不把MIME測試當PWA完成。

原Q-ICON在R603的缺資產404歷史保留。本輪原創幾何圖示沿用D3松綠／羊皮紙／青銅／等角方向，MIT、無第三方素材，生成器和SHA在docs/art/ASSET-REGISTRY.json。
STATIC-MIME-RED.log：原server把ICO作octet-stream，真HTTP斷言FAIL；GREEN後明確image/vnd.microsoft.icon與manifest+json，HEAD／missing404不變。HTTP測試用的短ICO bytes僅為MIME fixture，產品圖示由真Chromium與Pillow獨立檢查。

fresh npm run check／npm test 196／npm run build PASS；新增1項HTTP契約，原195未刪。qa:browser11與qa:gameplay12 PASS，真旅程209/220人類指令，Save／Load／Replay、Attack→Capture、招募／科技／遺跡與真touch模擬皆沿原斷言。
Browser及Gameplay各自artifactCleanupResult PASS，錯誤陣列皆空；owned server已停，48521關閉，沒有新背景續作。
Evidence：../evidence/DEMO02-20261024-002013-6a9691d4/runs 與private/browser-assets-001、gameplay-assets-001；每次收據含Git/source、開始結束、command、exit與log SHA。原始world不公開。
