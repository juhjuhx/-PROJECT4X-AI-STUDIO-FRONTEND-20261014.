> 2026-10-24 CURRENT Demo02 Candidate：主創確認先既有規則＋探索敘事＋Web/PWA，新兵科技地形後審。分支integration/project4x-demo-02，runtime checkpoint6bfbb98；AI972f564e未改，core/session/presentation/ui/config/lock17檔原bytes保留。fresh203tests/check/build、prefix1100零loop/D02673、Browser11、原220 Gameplay12（209指令）＋cleanup、Demo桌面/手機模擬4情境及本機PWA根/巢狀/離線/等待更新通過；乾淨還原亦通過、11產物SHA一致。真人/真機/公開HTTPS未驗證，APK缺工具鏈BLOCKED；C5全局收斂與Alpha仍PARTIAL。R5原87/13與T3/T6 FAIL不改，E新版Full100未跑，R605僅未完成實驗。詳docs/verification/DEMO02，唯一續作NEXT-ACTION；未push/merge/deploy。

> 2026-10-23 CURRENT C5-R6-03：E產品6007de6a…169f／AI972f564e…9b67未變；六觀測目標未切換，已證實友軍移動能改變traffic／forward，但通用協同根因UNVERIFIED。完成28個有界分支；替代blocker32ET有軍事收益及成本取捨，沒有Capture／情報／終局，尚無最小fixture/RED，不改AI。QA checkpoint58dcaffdb8d740edb4786781c817470f8a199856僅修desktop errors收據與新增standalone負測試；fresh195/check/build PASS，連續Gameplay209/220與cleanup PASS，整體仍favicon404 FAIL，手機UNVERIFIED。Q-ICON缺資產交D3；R6新Full100/T3/T6未跑，Alpha PARTIAL。NEXT-ACTION唯一續作，不push main。

> 2026-10-23 CURRENT C5-R6-02：合法移後反擊窗口T01與射位暴露T02以RED→GREEN最小修補；code checkpoint 4b5e50aadd464c00746e4299391f59f18814d4a1。E AI972f564e…9b67／產品6007de6a…169f；195tests/check/build/prefix1100零loop/D02及局部獨立review TESTED_PASS。E008仍TURN_LIMIT800／20682，部分SaveReplay PASS；E010自然終局winner1／247／6705，終局SaveReplay PASS。原220連續玩法209指令與cleanup PASS，但browser及qa:gameplay整體因B相同build也重現的favicon404 TESTED_FAIL，手機本次未執行。C5與Alpha PARTIAL；新版Full100/T3/T6、E021/064/051 UNVERIFIED。R5原87/13及T3/T6 FAIL保留。唯一續作NEXT-ACTION，沒有push main。

> 2026-10-21 CURRENT C5-R5：QA checkpoint74c87dcb6b82be3b1167898e7df9a91b002707e1；產品／AI／GameSession／UI／規則／schema未變。fresh check／180tests／build、D02、prefix、browser11、原220 Gameplay12與cleanup TESTED_PASS。固定Full100已100/100有紀錄：87 COMPLETE／13 TURN_LIMIT／0 COMMAND_LIMIT／0 ERROR；87終局與13部分SaveReplay均通過；Harness TESTED_PASS，T3／T6 TESTED_FAIL，Alpha PARTIAL。下一步只讀C5-R6失敗反例擷取；詳NEXT-ACTION及C5-R5-VERIFICATION。沒有push/merge main。

# 給 Gemini 與下一個 Codex 的單一交接入口

> 2026-10-20 CURRENT C5-R4：Observation-only frontier／已知地形再偵察 IMPLEMENTED；123 tests/check/build、prefix1100/0loop、原D02 673commands真揭露／winner0、seed010 winner0／534EndTurn／15418commands／終局SaveReplay true，TESTED_PASS。qa:browser11與獨立review通過。追加完整qa:gameplay因download.delete canceled及ENOSPC維持BLOCKED；本輪整體PARTIAL。full100/T3/T6 UNVERIFIED，Alpha PARTIAL；唯一續作NEXT-ACTION，詳細docs/verification/C5-R4/C5-R4-TEST-RESULTS.json；沒有push。

> 2026-10-19 歷史C5-R3：兩項Observation-only無記憶策略修正 IMPLEMENTED；113 tests/check/build、1100-command prefix0loop、11 browser／12真玩法 TESTED_PASS。seed010 SINGLE-SEED TESTED_PASS：winner0、534EndTurn／15418commands，終局Save/Replay true。中央D-02 fresh TESTED_FAIL（1000commands／seen=false）；新版full100/T3/T6 UNVERIFIED，整體Alpha PARTIAL。唯一續作NEXT-ACTION；詳細C5-R3-TEST-RESULTS；不push main。

> 下方有日期的舊狀態保留決策沿革；當前狀態由本段及NEXT-ACTION局部覆寫，不將歷史FAIL刪除。

> 2026-10-19 歷史C5-R2快照：三項無記憶AI局部修補 IMPLEMENTED，110 tests/check/build、1100-command prefix0loop、11 browser與12真玩法情境 TESTED_PASS。最新seed010仍 TESTED_FAIL：800 EndTurn／19813 commands／winner=null；中央搜尋合成反例1000commands仍FAIL。新版full100未跑，Alpha仍PARTIAL。權威續作見NEXT-ACTION與C5-R2-TEST-RESULTS；不push main。

> 2026-10-18 歷史R1快照：C2/C3/C4工程candidate已通過。C5最小無記憶policy修補IMPLEMENTED；生成prefix三段振盪→0、104 tests/check/build/11 browser/12玩法情境TESTED_PASS。完整seed010仍TESTED_FAIL：800 EndTurn/17937 commands/winner=null；新版full100/T3/T6未完整重跑，不能沿用舊62/38當新終局率。主創確認保留D3分頁。詳C5-AI-DIAGNOSIS與NEXT-ACTION。



> 2026-10-18 C3 CHECKPOINT（4cddfb3）：2026-10-18 C3：目前採納D3 map/CSS/HTML/art及main DOM/render；main交易/檔案接線仍C2。src/ui/recruitment.ts僅由合法Observation解釋徵召限制，不新增規則。三份D3缺件由Codex重建，明記RECONSTRUCTED_BY_CODEX。Gemini下一輪以此整合candidate source為基線提交diff，不回交舊main整檔。Frontend需求見根FRONTEND-NEEDS.md；核心/API/Save/Replay/AI owner不變。



2026-10-17 C2。先讀 [C2-IMPLEMENTATION-STATUS](C2-IMPLEMENTATION-STATUS.md) → [正式契約](../contracts/FRONTEND-CORE-CONTRACT.md) → [MODULE-OWNERSHIP](../contracts/MODULE-OWNERSHIP.md)。C1 正式 signature 保留，runtime 現在存在，不需前端猜測接口。

Codex 在隔離 integration/project4x-c2 已抽出 canonical state、唯一 command dispatch、AI driver、Save/Replay orchestration；原 src/core 四檔與 AI policy byte-identical。main 仍是原生 DOM/Canvas composition root，沒有改 React 或混入 D2 guard。C2 的測試／Git／manifest 見 C2-VERIFICATION.json；未推送遠端，Gemini 不得假設 GitHub main 已含此分支。

```ts
import { createGameSession } from './session/game-session'; // 以 src/main.ts composition root 為例
const { gameplay, files, dispose } = createGameSession({ seed: '霧境初航-01' });
// HUD／map 只傳 gameplay；files 僅給可信本機檔案 controls；dispose 留 composition root。
const unsubscribe = gameplay.subscribe(({ snapshot, events }) => {
  // snapshot.observation、合法 actions、ai／dirty；events 為唯一動畫播放通道。
});
// 離開整個 session 時 dispose；卸載單一 view 時 unsubscribe。
```

正式 factory import 為 `src/session/game-session.ts`；上例的相對路徑需依消費者位置，不可把 .d.ts 當 runtime。action 從同一版 getAvailableActions 取得，提交完整 sessionId/generation/expectedVersion/requestId；重試同意圖重用原請求。成功 duplicate events=[] 且不再播放。顯示錯誤用 SessionError.message，不解析 hidden truth。

七種事件已實作安全資料投影；C2 未新增動畫播放器。敵兵消失不等於死亡；未知 owner 不等於中立／敵方；事件無合法證據就不發。AIStatus 不公開對手行動詳情。Save/Replay 為私有完整世界，不可 parse 後餵 HUD、動畫或 AI；verifyReplay 只回 schema/ruleset 摘要。下載僅稱「已發起匯出」，localStorage 真成功後才用同 stamp acknowledgeSave。

D2 原 ZIP 完整保留，SHA-256 `bf9a2ddee457e598f85345b53456749bf603ee490d18e4c25a8f142210450a5e`；尚未取得可辨識 D3。Gemini 下一包須提供：

1. FRONTEND-NEEDS.md、D3-CHANGELOG.md、D3-MODIFIED-FILES.json；真 base SHA、逐檔 hash、用途及來源。
2. 完整可建置 source 與真新截圖；保留 2.5D／等角策略地圖，禁止以 mock 當遊戲。
3. 移除 D2 全域吞錯／DOM prototype patch，修 unknown owner 敵色與政治中心硬編名稱；使用 Observation 真資料。
4. 真多點 touch、必觸發遺跡、合法 Action、save/replay、fog 測試；不能用舊 ALL_PASS 或 regex 代替。812×375 可視畫布／footer 交疊需獨立 UX 檢視，真機仍未驗。
5. 不修改 core/session/persistence/contract/tests/lock。main 交函式級語意 diff，由 Codex 審查 dispatch、request、file read stamp 與最終合併。

C3：先再查遠端 main SHA、驗 D3 CRC/SHA/manifest/protected paths，從本次 C2 branch 接前端，不用舊 main 整檔覆寫。重跑 check/test/build/qa:browser、契約／保存／fog，再獨立審查。這次停止 C2，沒有自動整合 D3。

八個 Action、三兵三科技維持。新城市成長／科技兵種、AI 平衡、遺跡取得新版、完整 CCTS 都不在 C2。full100 62/38、seed010、T3/T6 歷史 FAIL 保留，不能宣稱 Playable Alpha 完成。

## C5-R3 給前端的差異

本輪沒有新UI需求或Contract signature。AI兩項policy修補不改Action／Observation／PresentationEvent／Save／Replay。Gemini仍以已整合C3工作樹為基線，不能從GitHub舊main整檔覆蓋；HUD只用GameplayPort。中央搜尋、full100及真人驗收尚未完成，不標示整體Alpha完成。當前source／結果／下一任務只依NEXT-ACTION與C5-R3-TEST-RESULTS。

## 2026-10-20 R4交接

本輪只有AI policy產品修改；GameSession Port、HUD、D3分頁與地圖全byte-identical。Gemini不需重新整合D3，也不得回灌舊main／guard。D02與seed010通過不代表Alpha完成；完整qa:gameplay受本機磁碟／下載環境阻塞，解阻後由Codex按原Gate驗證。

## C5-R5 給Gemini的當前邊界

本輪沒有改src、GameSession Port、D3 HTML/CSS/Canvas、素材或契約signature；不需要前端以mock winner／新倒數或修改經濟戰鬥來補救13個AI未終局。D3分頁保留主創既有選擇。後續Gemini繼續presentation-only工作，core/AI修復由Codex新C5-R6切片提出；整合仍用獨立worktree，不覆寫main或另一Agent成果。當前產品fingerprint與API邊界見C5-R5-SOURCE-BOUNDARY.json。
