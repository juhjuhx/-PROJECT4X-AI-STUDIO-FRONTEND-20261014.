# 畫面與實拍索引

CONFIRMED：真實Chromium執行的現有產品畫面；沒有概念圖／生成圖。版本0.1.0，seed霧境初航-01；來源快照見evidence/source-snapshot.json。手機均為Chromium模擬viewport/觸控，不是實體手機。

| 截圖相對路徑 | viewport | PNG尺寸 | 操作狀態 | 執行 |
|---|---|---|---|---|
| evidence/current/browser/桌面初局.png | 1440×960 | 1440×960 | 新局／已選斥候 | 真實執行／desktop |
| evidence/current/browser/遺跡選擇.png | 1440×960 | 1440×960 | 首次visible遺跡／intel3必答modal | 真實執行／desktop |
| evidence/current/browser/手機直式.png | 375×812 | 375×1886 | 新局／中心選取後tap己方首都 | 真實執行／模擬touch |
| evidence/current/browser/手機橫式.png | 812×375 | 812×677 | 新局／中心選取後tap己方首都 | 真實執行／模擬touch |
| evidence/current/browser/窄手機.png | 320×640 | 320×1874 | 新局／中心選取後tap己方首都 | 真實執行／模擬touch |
| evidence/current/browser-extra/桌面-保存與開局.png | 1440×960 | 1440×960 | 保存與開局 | 真實執行／desktop |
| evidence/current/browser-extra/桌面-玩法與鍵盤.png | 1440×960 | 1440×960 | 玩法與鍵盤 | 真實執行／desktop |
| evidence/current/browser-extra/手機-保存與開局.png | 375×812 | 375×812 | 保存與開局 | 真實執行／模擬touch |
| evidence/current/browser-extra/手機-玩法與鍵盤.png | 375×812 | 375×812 | 玩法與鍵盤 | 真實執行／模擬touch |

每張timestamp/browser/hash與fullPage flag在`evidence/current/screenshots.json`。fullPagePNG高度不是裝置viewport；不要把窄手機長圖標成320×640像素。桌面初局／窄手機原圖已人工目視，其餘由runtime capture與geometry斷言驗證。

實際screens：主遊戲、必答遺跡、航行紀錄（save/load/export/import/replay/newseed）、玩法。沒有獨立settings/menu title screen。科技在主畫面sidebar；目前可攻擊目標/HP與移動亮格，不存在計算傷害preview。勝利banner與AI暫停按鈕有source實作，本輪未實拍終局/1000action暫停，標UNVERIFIED截圖覆蓋。
