# C5 無記憶最小候選推導

**建議 root 驗證 paired-potential 候選。** 它保留原 occupied graph、原 goal 選擇、原權重與 crowd 分數，只改合法 Move 的執行優先級：全局若有同時讓動態占位距離與原地形距離下降的選項，先選這些；否則退回原 detour。外層 fresh 窄測：舊繞路 fixture firstMove=`(4,4)`、原 seed010 前1,100合法commands **0段六步振盪**。

本 reviewer 沒有改共享 project，AI/state/save/API/test/threshold 均未寫入。候選副本由 checkpoint `f7ec05a1f7b4ff73c97ba55b3e4c5994723fdc8b` 的原 ai.ts 生成，僅改 import 路徑以在 evidence 執行；原 policy SHA-256=`a97d731df122b363bfcce498af256d93a34a5aa35160cd90aaab7418ff9b447a`。共享樹執行時仍是 root 的 B；其 hash 記於結果 JSON，不將 B 當候選來源。

## 為何兩個原反例不矛盾

舊 `tests/core.test.ts:286–294`：前方 `(6,5)` 的固定友軍擋住直線，`(5,5)` 是友軍前方的死巷。原 occupied graph 正確將北移 `(4,4)` 判為 detour 進展；terrain-only graph 卻把東移視為較近。完全忽略友軍會破壞此必要繞路。

真生成局 command458／503：占位圖的距離尺度隨友軍位置／動作改變，東進20→19之後，西退也可變成27→26。不能只把當前 dynamic progress>0 當跨回合前進。原 goal 建立時已有不含單位占位的 `distances`，可保留它作第二個可觀測 potential，不需新記憶或額外世界資訊。

因此分兩層：先安排兩種圖都認為向前的單位；當這些可執行的前進完成、沒有 paired-positive Move 時，再允許原占位圖必要的繞路。不是移除繞路，也不是把 static 必須下降硬加成所有 Move 的絕對合法性條件。

## 最小程式方向

只在原 movement 區段加入：

```ts
const terrainDistances = new Map(goals.map(g => [g.sources, g.distances]));
// 原 unitGoals / blocked graph / scoreMove 保持。
const scores = new Map(movable.map(a => [a, scoreMove(a)]));
const forward = movable.filter(a => {
  const unit = owned.find(u => u.id === a.unitId)!, goal = unitGoals.get(unit.id);
  const terrain = goal && terrainDistances.get(goal.sources);
  if (!goal || !terrain) return false;
  const start = unit.y * view.width + unit.x, end = a.to.y * view.width + a.to.x;
  return goal.distances[start] > goal.distances[end] && terrain[start] > terrain[end];
});
const choices = forward.length ? forward : movable;
// choices 用原 scores / compareIds / y / x 排序，然後原 finite gate。
```

`sources` 的陣列引用在原 roles/candidates 的 object spread 間保留，因此 Map 取回的是**同一個被選 goal**的原 terrain 距離，不會拿另一個敵人／據點的距離比較。完整可執行副本：[paired-potential-forward.ts](獨立C5候選推導/paired-potential-forward.ts)。root 可採更清楚的等價欄位寫法，但要核對同 goal 的關係。

原舊 fixture 沒有任何 paired-positive Move：北移 dynamic>0/static<0，東移 dynamic<0/static>0，故 forward=[]，精確回到原 `(4,4)`。prefix 則可先讓真正前進的單位騰出交通，再執行 detour；不用把另一個單位「剛走過」就視為永久地形或取消占位檢查。

## Fresh 候選結果

每個候選都從 `createGame('獨立QA-010')` 重新生成前1,100筆，policy只接 `observe(state, actor)`，每筆經合法 `applyCommand`，request IDs 與原 headless 一致。沒有修改 old fixture 的期望、六步判準或 prefix 長度。

| 外層候選 | 舊繞路 firstMove | 額外 moved=true/acted=false 窄路 | 原seed前1100六步loops | 執行時間 | 判斷 |
|---|---|---|---:|---:|---|
| 保原blocked/crowd；先為每兵挑穩定路線、再用crowd排單位 | `(4,4)` | `(4,4)` | 1，`1:兵-13`，半回合34–44 | 2889ms | 不足；只換掉振盪單位。 |
| 移除crowd的mechanism control | `(4,4)` | `(4,4)` | 0 | 2864ms | 不採為修補建議；這是權重3→0的控制實驗，不取代已授權的推導。 |
| **paired-potential優先，無才原detour** | **`(4,4)`** | **`(4,4)`** | **0** | **3394ms** | **通過本次兩個窄gate，建議root進完整驗證。** |

實際命令與完整 stdout：[candidate-run.log](獨立C5候選推導/candidate-run.log)、[potential-run.log](獨立C5候選推導/potential-run.log)；結果：[candidate-results.json](獨立C5候選推導/candidate-results.json)、[potential-results.json](獨立C5候選推導/potential-results.json)。兩個 harness exit0只表示候選測量完成，表內保留未通過候選的loops，沒有把它們當feature PASS。

root 先前的 A/B 結果為 parent 提供、非本 reviewer 本次重跑：A 全排除 friendly，prefix0但原繞路test失敗；B僅排除可move friendly，原103測試通過但prefix仍3loop。上述新候選沒有借用A/B的綠作自己的驗證。

## 原理與殘餘風險

- 沒有改策略權重、勝負、規則、記憶架構、seed或AI資訊邊界。新增的是移動排程優先層，原 research/recruit/attack/capture 優先順序仍在前。
- 每次成功 Move 會消耗該單位本回合移動，因此 paired-positive 選項會有限次耗盡；fallback 仍可在同一己回合執行必要 detour。這不是讓 detour 永遠不可選。
- terrain potential 只在相同 goal、相同已知地形下較穩定；探索、目標變動與跨回合敵軍都可能改變選擇。fallback 本身仍可能在其他 seed／較晚 prefix 振盪，沒有全域無循環證明。
- 本 reviewer **沒有重跑103 tests、check/build、browser、seed010整局或full100**。目前足以建議下一個小實作與 fresh gates，不足以宣稱AI終局可靠性修復。原800／40000、fixed100與全局因果限制繼續有效。
- 請在 root 真實採納後重新跑既有103＋`qa:ai:oscillation`；若此兩者過，再檢查原seed010整局，不能把本外層候選的0loop當已整合結果。

所有外層候選、harness、結果與原始hash見 [candidate-manifest.json](獨立C5候選推導/candidate-manifest.json)。本輪未寫入project；已通知root可恢復AI修改，不再重跑prefix以免與共享source修改混淆。
