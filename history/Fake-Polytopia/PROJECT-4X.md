# PROJECT-4X｜霧境初航 MVP 與專案記憶

更新：2026-10-12。每輪先讀MVP的[短續接入口](PROJECT-4X-MVP/CONTEXT.md)與[交接摘要](PROJECT-4X-MVP/memory/session-handoff-LATEST.md)，再按需讀契約与相關source，避免把歷史提案當現行規則。工作語言繁體中文。

## 現在的工作與授權

使用者最新直接要求「先產MVP」，實作規則細節、技術、審查與迭代交給代理自主處理。工程預設定為版本化MVP決策，不逐項停止請示；主創既有世界與CCTS裁決保留。

2026-10-12續接要求以少額度、短上下文、進度與高內聚低耦合核對為主。每階段18技能候選按觸發使用，不重灌上百份長文。`npm run context:init`只讀專案短記憶与核對來源，不重置Codex runtime或保證零幻覺。

可玩產品在[PROJECT-4X-MVP](PROJECT-4X-MVP/README.md)，名稱「霧境初航」，版本0.1.0／ruleset g1-ccts-1。本機[遊戲入口](http://127.0.0.1:4173/)；後續可雙擊[啟動遊戲.command](PROJECT-4X-MVP/啟動遊戲.command)。尚在最終整合QA，不把未完成的100局列PASS。

續接已發現並更正：候選ZIP與交付說明尚未產生，先前預告不能當交付完成。原source／dist與所有舊證據保留；先修Blocking Gate，再保存候選包與真人試玩報告。

## 真實來源

- CCTS ZIP sha256 `9f7aaac0a4714ac611080e21313bcb9d157196eb8a33ae05598d16c2d44e50d9`：六檔／5 manifest／CRC正常。
- G1 START ZIP sha256 `bb656511b464fd06b7ccf4be4bd3ef7b3659232df7f3f5ac16ae724d1dc5ea3e`：六檔／5 manifest校驗。v0.4已69實體檔／68manifest校驗。原ZIP及原始交付保留。
- 這些包是文檔。CCTS所稱原型source與11/11 QA未取得，不沿用其PASS。本MVP是全新獨立source，不冒充舊原型或覆寫它。
- 新source、依賴lock、dist、測試与证據均在MVP目錄；本輪無外部repo／push／部署／付費API。阿里OCR delegate只做檔案選取與規則，root及獨立代理審實際程式。

## 優先閱讀

1. [MVP契約](PROJECT-4X-MVP/docs/實作契約.md)：最新自主工程預設與CCTS裁決落地。
2. [驗證與審查](PROJECT-4X-MVP/docs/驗證與審查.md)、[開發待辦與技能路由](PROJECT-4X-MVP/docs/技能路由與開發待辦.md)。
3. [實際TUI架構／roadmap](PROJECT-4X-MVP/docs/TUI架構與路線圖.md)、[開源與資產盤查](PROJECT-4X-MVP/docs/開源與資產盤查.md)。
4. 歷史：[第四輪CCTS](第四輪CCTS審查-20261011/G1-裁決整合稿.md)、[第三輪契約](第二階段審查-20261011/修訂文件/契約驗收與反例.md)、[技能矩陣含Addy24](第二階段審查-20261011/技能矩陣與研究待辦.md)。舊「奪都即勝／延後inbox」已被覆蓋；舊「等來源／逐項批准才施工」已被最新自主MVP授權覆蓋。

## 主創確認，後續不能遺忘

局域物理＋跨域能量；極端非對稱但有反制翻盤；文明可徹底蛻變；溝通意願與能力異構；非對稱起點仍可生存；亡國文化組織延續；生態可不可逆改變；唯一可揭露原點；超現實因果自洽；星際展開後舊世界仍運作。保留斜視2D/2.5D、後期低微操、跨平台與開源優先，政治控制／文化影響／人口／文明身份／席位不可混為一體。G1不因此直接實作所有世界系統。

| 已確認節點 | 現行內容 |
|---|---|
| 訪談焦點A | 核心體驗／首個可玩切片，不是首局情緒A |
| 首局情緒B | 未知與發現、想再探索這個世界 |
| 文檔圖示A | 黑白工程樹／依賴／資料流／gate；不代表遊戲美術 |
| RELIC-D1 | 首次在己方回合看見者取得唯一處置權；AI適用、開局按先手 |
| RELIC-D2＋GM02/03 | 即刻必答；最多3仍未知地形格，0格禁情報仍可4金，不補金或敵軍情報 |
| CCTS-D1 | 己方活單位U>0或己方據點S>0即可流亡續玩，零金不淘汰 |
| CCTS-D3 | 僅U=0且S=0淘汰，沒有流亡倒數 |
| CCTS-D2 | 持續控制據點跨完整對手回合後，免費主動建立新中心；不自動復辟 |
| EXILE／POLITY | 可故土／異地重建、允許不復國；政治控制與文化影響獨立 |
| 單局時間 | 45–90分鐘體驗目標，尚未真人量測，不是判負時鐘或開發工期 |
| 發行與G1.5 | desktop／mobile同等重要；G1先觸控探針，G1.5代謝差異與真人非對稱驗證在G3前通過 |

## 自主MVP工程預設

TypeScript7.0.2＋Vite8.3.4＋Canvas2D，自有規則／AI／保存，無安裝的第三方遊戲runtime套件。人類先手；24×24四向／三兵種／三科技／3–5村莊／4遺跡，金幣為暫時費用抽象。情報按距遺跡曼哈頓距離→y→x，守方控制據點的掩護不疊地形。canonical必答phase與surveyed／explored分開。軍事佔領及建中心為G1初版界線，完整文化與非軍事政變留後續；這是自主實作決定，不冒稱舊D4已直接獲答。

唯一權威applyCommand，AI／地圖渲染只讀Observation；main持完整state協調回合与保存，畫面資料取Observation。save先版本／語意驗證再完整重播校對，失敗不改現局；版本與seed凍結bundle。requestId session UUID只屬外殼，core去重；同bundle/seed/commands可重播。完整本機保存含世界真相，非公開秘密安全回放；目前回放是重建驗證，沒有逐幀播放器。

## 完成與待驗

已建source、原創2.5D畫面、mouse/touch／keyboard、招募科技戰鬥、遺跡、流亡重建、保存與回放重建驗證。已修正中心招募誤動、reload requestId碰撞、資訊地形／據點分離、AI城門補兵循環及CPU歷史複製。2026-10-12：36核心／獨立反例與build實跑exit0，001／原FAIL004單局真實終局。前輪production瀏覽器7情境含320／375／812模擬touchPASS、audit0漏洞；本輪不冒稱最新AI完整GUI已重驗。

完整100局未通過，現在沒有本輪QA worker仍在跑。舊策略26/100中13終局／13超限／74未跑，已保全FAIL／ABORTED證據；最新AI僅小範圍重驗，抽查PARTIAL不冒充PASS。下一步其餘反例→固定100→更新OCR覆蓋→最新browser／verify。後續每次核心改動對照source hashes，原始zip QA不能替代。完整進度以[待辦](PROJECT-4X-MVP/docs/技能路由與開發待辦.md)為準。

待本人完整玩一局、三個策略選擇／疲勞／重玩意願、實體手機與45–90分鐘節奏，不由AI代填。後續以MVP試玩結果調架構／前後端，無網路多人或跨裝置需求前保留獨立core，不預建登入、資料庫與雲服務。
