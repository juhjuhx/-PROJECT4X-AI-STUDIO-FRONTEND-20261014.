# PROJECT-4X Demo 工程約束
來源：主創現行指令、既有契約與本次Demo規格。新增品質工具不自動安裝，不改全域設定。

| 約束 | 原因／門檻 | 檢查／階段 |
|---|---|---|
| 單一核心 | GameState/applyCommand唯一權威；UI只用GameplayPort、AI只用Observation | code review、既有契約／Fog tests |
| 歷史保全 | R5 87/13及R6全部證據不得覆寫，R605僅隔離研究 | source hash／既存seal核對，handoff |
| 真實驗收 | 不刪／skip舊測試、不降低assert、console/pageerror零錯誤 | npm test、qa:browser、獨立diff review |
| 原玩法門檻 | Gameplay maxHumanCommands=220；正式對局800 EndTurn／40000commands不變 | qa:gameplay；本輪不跑Full100 |
| 保存／回放 | g1-ccts-1、save-1、replay-1不靜默改語意 | Save/Replay tests；新ruleset另立migration |
| Demo完成 | exploration completion不可寫winner或冒充軍事勝利 | 純Observation敘事tests＋真DOM旅程 |
| 發布資產 | favicon／manifest／圖示必須真實存在、授權清楚、GET/HEAD正確MIME | strict production HTTP／Chromium外部行為 |
| 手機 | 真touch模擬與桌機必要操作都執行；真機沒有則UNVERIFIED | qa:browser／qa:demo，不能拿mouse當pinch |
| Scope | 僅按本輪明確授權經PR/CI/review後merge及Release；不force、不執行遠端安裝器/hooks或自動SDK安裝 | command/manifest/review |
| Source一致 | 每個Gate綁source/build hash與完整日誌；不沿舊PASS | evidence receipts、build proof |

## 量測而非假造門檻
覆蓋率、axe、LCP、CLS、本輪完整對局效能尚未建立新基線，不宣稱已裝工具或通過；不為好看硬加未量測數字。公開可達HTTPS、實機PWA安裝、APK與真人體驗需要各自實測，不能用localhost頁面代替。
