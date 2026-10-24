# C5-R0：AI診斷與未通過的回歸門檻

> 最新結果：主創已確認無記憶最小修補並已實作paired-potential排序；前1100合法指令三段振盪→0，104項自動測試通過，原繞路斷言保留。**完整seed010修補後仍TESTED_FAIL**（800 EndTurn/17937 commands/winner=null），不是整體AI修復完成。下方原版19696命令與當時未修狀態保留為歷史；不當成新版結果。


2026-10-18。**seed010 TESTED_FAIL；局部機制CONFIRMED；整局根因PARTIAL；策略修補NOT_IMPLEMENTED。** 本階段只有診斷與反例，不增加規則、不改core或AI、不合成winner、不刪失敗seed。

## Fresh固定局

獨立reviewer由原createGame起始、原requestId headless-10-N、chooseAction(observe(state,active))與applyCommand執行忠實headless match loop：98.106秒、exit1、800 EndTurn、19,696 commands、turn801、winner=null、canonical hash 830ceea9eadb39e0。source與方法hash執行前後相同。這是診斷腳本的一次完整局，沒有冒稱另跑了原npm命令或100局。

Move15464／Attack2638／Recruit774／Capture10／Research6／ResolveRelic4／EndTurn800。最後Capture在半回合44，但半回合800仍有攻擊與擊殺；不是全局完全停止。actor0最後新增探索在93、actor1在564。反向移動不能一律當浪費。

原始完整JSONL、每回合進展、合法prefix與完整private save位於專案外 `../evidence/獨立C5診斷/`，0700目錄／0600私有輸出；不能將兩方情報或完整truth交HUD／AI。獨立報告在 `../evidence/independent-C5-diagnosis.md`。Git僅保留本文件的必要摘要與可重現診斷命令，不公開完整world dump。

## 真生成prefix反例

command458開始，兵-0在(4,7)↔(5,7)，兵-31在(3,6)↔(4,6)；半回合35–47各7次Move，沒有這些單位的新增探索／Attack／Capture或HP變化。

- command458：兵-0向東，本次BFS距離20→19，目標村莊-1。
- command459：兵-31佔另一通道。
- command502/503：兩兵退回，本次blocked BFS改成27→26，仍被評為正進展。
- 後續目標也會在site/enemy間重選；不是永遠同一目標，也不能用另一個合成四角巡查反例代替本局證據。

來源 `src/core/ai.ts:95–150`：占位圖每次變動、局部progress只比較當次距離，跨回合無穩定進展尺度。原production決策與只加trace的外層解說副本在每個checkpoint相等。這證明局部路徑振盪；尚未用反事實policy證明只修此處就會終局，也未定位後期攻城消耗所有瓶頸。

## 新環境可重現的RED

```sh
npm ci
npm run qa:ai:oscillation
```

`scripts/ai-oscillation-check.ts`只生成原seed010前1,100合法commands；chooseAction只接Observation；檢查每單位最近六次Move只在兩格連續交替、零新增探索、無中間Attack/Capture、HP不變，並核對source執行中未改。

本輪約3秒、**exit1／TESTED_FAIL**，找到0:兵-31（459–703）、0:兵-0（458–704）、1:兵-34（735–1022）三個片段。assert要求無此往返，因此缺陷尚在就保持RED；不是『反例重現成功＝遊戲PASS』。60秒診斷watchdog與1100 prefix是此局部檢查範圍，不替代原800/40000終局門檻。

完整原命令仍可另重現（約98秒，預期exit1）：

```sh
PROJECT4X_QA_START_SEED=10 PROJECT4X_QA_GAMES=1 PROJECT4X_QA_WORKERS=1 PROJECT4X_QA_OUTPUT=LOCAL_TEMP/qa-artifact npm run qa:headless
```

該輸出可能含私有world資料，限本機QA。full100、T3/T6本輪未重跑，不發表新100局終局率。

## 待主創裁決與下一切片

先列兩個當時PROPOSED選項；本輪後續主創已選1（下方保留決策沿革）：

1. 先在現有無記憶Observation-only policy內修最小反例（建議），不增加Session/Save state；先證反例解除，再原seed010、固定100與新視覺/玩法回歸。
2. 先設計帶觀測記憶的策略層；會涉及AI orchestration、Save/Replay/生命週期，需獨立契約設計及審查，不能直接加第二canonical state。

主創選擇1才開始下一個修補切片；未變動玩法數值。城市發展與非對稱等新玩法依現有PLAYABLE-ALPHA路線，沒有新數值就保持PROPOSED。

2026-10-18主創後續答覆（USER_CONFIRMED）：選擇方案1，先修現有無記憶policy最小反例；手機保留D3分頁。以下開始最小policy修補切片，原RED與完整失敗證據保留，不回寫成通過。

## 已採納的最小修補與失敗候選

- 候選A：把所有友軍從路障移除，prefix無振盪但舊繞路測試FAIL（102/103）。拒絕採納，不改舊test。
- 候選B：僅忽略還能move的友軍，103tests PASS但原prefix仍三段振盪。拒絕採納。
- 採納候選：保留原goals、blocked、crowd與所有權重。先從同一目標的traffic距離與原terrain距離皆正進展的合法Move中，以原分數選擇；全場沒有此類Move才退回原detour。terrain distance cache只存本次Observation推導資料，沒有新增跨回合記憶／save欄位或第二state。

根據實際prefix，動態20→19與反向27→26不具跨回合共同尺度；新的優先次序先讓有兩種進展的部隊前進。它不保證所有未來局面無往返；退回必要繞路仍可能非單調。現有固定友軍繞路必須維持(4,4)，沒有放寬。

CLI先RED（原policy，三段）→最小policy GREEN（0段）。事後把同一CLI加入tests/ai-oscillation.test.ts成為npm test的104th regression；wrapper另驗完整1100 prefix，或必須已由core真實終局才能提早完成。新增terminalWinner只是QA輸出，不增加遊戲勝利規則。第一次wrapper型別診斷message可能undefined的失敗已修，原log保留。

最終check/test/build snapshot647933bf…da19；browser/完整局snapshot6a7055ee…b650。差異僅QA terminalWinner欄位與新unit wrapper；src/**與bundle bytes完全相同，證明見C5-FINAL-BOUNDARY.json。不重寫舊測試版本身份。

## 完整局的修補後結果（仍FAIL）

原npm run qa:headless，固定010、800／40000、1worker：164.178秒exit1，801半回合、17,937命令、winner=null；Attack2626／Recruit768／Capture10。完整world仍只在私有evidence；公開seed010-paired-summary.json已排除world/lastCommands。測試與browser有併行CPU工作，前後時間與不同軌跡不可當效能提升或退步結論。

只證明這個早期反例解除，沒有證明長局終局；本次不追加約一小時full100，因已知包含seed010的全量Gate不能全過，新終局比例仍UNVERIFIED。下一個工程切片應讀實際後期攻城／補兵／佔領失敗點，先建立反例，再保持無記憶/Observation-only邊界修補。不要直接新增城市數值、合成winner或宣稱G1.5/Alpha完成。
