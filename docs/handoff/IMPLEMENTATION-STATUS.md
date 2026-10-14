# 實作現況與可玩性

版本0.1.0、ruleset g1-ccts-1；源snapshot f132db11dd8842a59100ad994c7abc7c6ed64053ce63adf25de7bba114249e4c，分支mvp無HEAD。本輪src/tests/scripts/config零修改。檔案與具名測試引用見SOURCE-INVENTORY／FEATURE-MATRIX／API-CONTRACTS，數值與所有20類規則見GAME-RULEBOOK。

| 分類 | 已實作 | 本輪驗證 | 缺口／能否玩 |
|---|---|---|---|
| 核心A | 回合/reducer/命令驗證、24×24連通生成、Move/Attack/Capture/Recruit/Research、金幣、fog、U或S存活 | TESTED_PASS：44案例中相應正負/整合 | 可操作並保存；對最新遺跡取得方向PARTIAL；未通完整AI可靠性 |
| AI B | 合法Observation政策、擴張/招募/研究/戰術攻城、driver1000暫停、固定排序 | PARTIAL：政策反例tests pass與001終局；TESTED_FAIL：010及full100，中央搜尋反例成立 | 有可玩的AI對手，不能稱成熟戰略/可靠終局；沒有独立防守戰略規劃/持續AI記憶 |
| 可靠性C | Save全量語意＋history重建、replay、seed/xorshift32、FNV64canonical、schema/ruleset拒錯 | TESTED_PASS：相應unit/integration與browser壞匯入/續局 | 沒獨立contentHash/generatorVersion欄、schema migration、逐幀player、網路保密觀戰；ruleset凍結流程只是工程契約 |
| 視覺D | Canvas2D2.5D、map interaction、HUD/三tech/單位列表、legalMove/Attack提示、DOMdialog、desktop/mobile/keyboard/pointer | TESTED_PASS：build＋7真瀏覽器，9真截圖 | 真機與pinch/drag全程UNVERIFIED；無傷害preview、批量戰略orders、獨立settings |
| 特殊E | 單次visible-trigger遺跡、gold/intel0..3；簡化流亡/異地建中心/故土復國 | 部分TESTED_PASS：生成地圖全合法流亡雙分支＋save/replay | 發現/取得分離、多文明研究、危險/神器、文化影響、非軍事政權篡奪/完整CCTS NOT_IMPLEMENTED |

「能正常遊玩」：CONFIRMED可啟動、現有操作/保存/replay流程可執行；PARTIAL候選MVP，無使用者本人完整局、45–90分鐘節奏或實體手機驗收。AI卡局直接否定完整工程Gate，不能寫正式成品PASS。完整一局真人感受只有玩家能驗，100局AI亦不能替代。

世界觀十項與近期裁決保留是USER_CONFIRMED設計；不是已存在runtime。RNG只在生成世界使用，戰鬥確定性且沒有反擊；未實作功能不由文案/visual mock補造。原DESIGN與新docs都不授權GoogleAIStudio改core。
