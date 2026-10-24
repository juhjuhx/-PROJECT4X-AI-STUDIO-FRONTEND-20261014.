# Demo02 發布 QA 收據修復

狀態 TESTED_PASS。產品32檔與已驗Demo02相同；只新增公開發布工具、CI及QA收據，未修改AI、core、session、schema或Gemini呈現。

整合入口第一次發現service-worker.js由worker載入，不會出現在page response清單。舊Browser腳本11情境雖PASS，整合驗證器仍按完整JS/CSS要求拒絕判PASS。保留首次FAIL，沒有將worker排除或降低斷言。

新增真loopback HTTP測試：回應200、JavaScript MIME、實際body SHA都需成立；404、HTML fallback、不同bytes都拒絕。Browser另記http-probe來源，不假稱是page request。validator要求worker收據及完整servedAssets與build一致。PWA安裝/離線/等待更新仍由獨立真Chromium Gate驗證。

5項新增斷言先在原策略缺口下RED，再最小修正GREEN；首次sandbox EPERM另列環境結果，未混作RED。原203測試保留，另4 publication、4 release proof及5 worker tests，當時總216無skip；獨立審查再加7項隱私/資源生命週期反例，目前223/223 fresh PASS。受控不存在Chromium的整合反例exit1、primary保留、server cleanup PASS；不吞錯。

RESULTS.json包含完整安全摘要、command、exit、raw log hash、來源/產物fingerprint；私有raw logs留來源樹外，不上傳world、trace或機器個人路由。README記載可重跑的一鍵入口。獨立whole-branch review及遠端CI仍須完成，工程PASS不等於已發布。

獨立審查指出的兩個hygiene缺口均先RED後GREEN：真CLI掃log/jsonl、同源canonical JSONL；公開失敗僅固定stage/code且去除Node本機路徑。私有原始exception/cleanup detail保留於來源外收據。另補PWA update context失敗仍關server與fixture、保護仍連線profile，以及兩頁runtime/console監聽。全部本機整合Gate再次PASS，沒有刪減玩法/錯誤檢查。初審代理額度中斷，正式最終review仍待另位獨立審查，不冒稱完成。
