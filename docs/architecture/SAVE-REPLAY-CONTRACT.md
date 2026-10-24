## Demo03 預覽新增配對（舊 G1 不遷移）

目前 core 可重建新局 `demo03-preview-1`，新 Save2 為原世界欄位加 contentHash/generatorVersion；Replay2 為 schema/ruleset/contentHash/generatorVersion/seed/commands/hash。只接受固定 bundle SHA 與 g1-mapgen-1；exact keys、每筆版本/去重/合法性、整局重建和最終 hash 照舊。G1 save1/replay1 禁止額外 metadata 或新兵/新研究，4 個發布版 golden bytes 相同。沒有局中 migration、任意外部包載入或 generator 重新隨機抽樣。

`tests/helpers/preview-journey.ts` 的兩新兵由真 research/recruit/endTurn 命令取得，可 Save/Load/Replay；人工縮減戰鬥 fixture 不冒充合法存檔。格式語意已聚焦驗證，玩家 UI 旅程及平衡仍待 Task5。本節為明確新增版本，以下原格式規格限 G1/歷史。

# 保存、重播、schema與隨機數契約

## 2026-10-17 Session 邊界補充

本輪沒有修改 core serializer、parser、replay、schema 或 ruleset。新 session 的正式 load/save/replay signature、generation/version 防護、私有 I/O capability 與保存確認見 [FRONTEND-CORE-CONTRACT](../contracts/FRONTEND-CORE-CONTRACT.md)。這些新 runtime 已 IMPLEMENTED，測試與範圍見 C2-IMPLEMENTATION-STATUS；現存 validate-before-replace 與 Command 去重持續有效。未驗證成功不得先換局或取消當局 AI；未來遺跡改規則由 C6 另提 migration，不在 UI 整合時靜默套入。

這是本機完整真相保存格式。保存包含雙方世界資訊与request ledger，不能提供公開保密觀戰。回放目前用於重建驗證，沒有逐幀播放器。源碼為 `types.ts:20–26` 與 `persistence.ts:14–108`。

## 版本與兼容

| 項目 | 固定值／規則 | 來源 |
|---|---|---|
| save schema | project4x-save-1 | `types.ts:21`, `persistence.ts:16` |
| replay schema | project4x-replay-1 | `persistence.ts:98,104` |
| ruleset | g1-ccts-1 | `game.ts:44`, `persistence.ts:16,104` |
| 世界尺寸 | width24、height24、576格 | `game.ts:44`, `persistence.ts:17–18` |
| bundle | 規則、生成器、RNG、canonical算法一起凍結；改動必須升版本 | `docs/實作契約.md:30` |
| 舊版處理 | 未識別schema/ruleset直接拒絕；無自動遷移 | `persistence.ts:16,104` |

沒有額外content／generator／RNG版本欄位，bundle識別只由ruleset值及維護流程負責。保留舊執行bundle／明示遷移是未來工作，不可靜默套新規則。變更版本策略見OPEN_QUESTION；目前拒絕舊版的路徑已IMPLEMENTED。

## GameState欄位

根物件必須完全含以下欄位，額外／缺少欄位都拒絕：schema,ruleset,seed,width,height,terrain,units,sites,relics,factions,explored,surveyed,active,turn,version,nextUnitId,pendingRelic,winner,history,requests。`persistence.ts:15`。

| 結構 | 必要不變量 | 驗證來源 |
|---|---|---|
| seed／terrain | seed非空且長度≤256；576個合法Terrain枚舉 | `persistence.ts:17–18` |
| Units | exact欄位；owner0/1；三kind；hp整數1..kind.hp；布林moved/acted且acted⇒moved；id匹配兵-數字且流水號<nextUnitId；座標通行、不重疊 | `persistence.ts:20–29` |
| Sites | 5..7個；capital/village；有效name／owner；heldSince非負safe整數；recruited布林；各site不重疊；中立heldSince0/recruitedfalse | `persistence.ts:31–38` |
| Relics | 有效claimedBy/resolved，resolved⇒claimedBy非null；通行、互不重疊且不與site重疊 | `persistence.ts:39–44` |
| Entity IDs | unit/site/relic跨類別全部唯一且長度1..256 | `persistence.ts:20–22` |
| Factions | 恰好2個；id=陣列位置；identity/lineage有效字串；gold/turns非負safe整數；tech枚舉且不重複；歷史首都指有效capital | `persistence.ts:19,46–52` |
| Life／center | U或S有則center有效為active，無center則exiled/null；U=S=0才eliminated/null且winner=敵方 | `persistence.ts:53–60` |
| Turn | turn≥1，version與nextUnitId安全整數；回合交接與completed/ownTurns必須一致 | `persistence.ts:45,51,59` |
| Site heldSince | 不得大於owner敵方completedTurns | `persistence.ts:61` |
| Knowledge | explored／surveyed各兩個576布林array；surveyed⇒explored；目前seen⇒surveyed | `persistence.ts:62–67` |
| PendingRelic | 若有，exact actor/relicId；actor=active；恰一個claimed未resolved、參照一致、winner=null；無pending不得有未resolved認領 | `persistence.ts:68–72` |
| Ledger | history.length=version；全validCommand；requests own keys數=version且值皆字串 | `persistence.ts:73` |

shape+語意檢查不能證明完整來源，例如Relics驗證沒有單獨強制恰4個；後續seed/history全量比較才把生成固定內容、immutable identity、每筆request payload与全部snapshot鎖回權威軌跡。不要把第一階段validator當完整反竄改判斷。

## 載入與續局

`serializeGame`直接JSON.stringify，沒有寫入時校驗。`deserializeGame`不修改任何傳入現局：先parse與validate，再createGame(seed)，依history順序重建。第i筆command要求expectedVersion=i、requestId未見過、格式合格；applyCommand必須ok且state.version=i+1。最後stableStringify(rebuilt)與stableStringify(parsed)完全相同，包括requests与history。回傳的是rebuilt，所以歷史深凍結約束也恢復。`persistence.ts:76–94`。

當任一階段拒絕，就throw，外層現局／原保存不應被清除。正常command同payload重送在載入後仍命中重建ledger；載入前後相同Command後綴產生完全相同state。現有具名測試：`tests/review.test.ts:169,200,248`、`tests/流亡重建.test.ts:55`。

保存資料沒有局部repair、clamp或coercion，也沒有依新規則自動補遺跡獎勵。缺失、異版、snapshot/history不一致均拒絕。

## 重播包

```json
{
  "schema": "project4x-replay-1",
  "ruleset": "g1-ccts-1",
  "seed": "原世界種子",
  "commands": [],
  "hash": "16字元小寫hex"
}
```

這是形狀示例，示例hash並非可執行初始世界checksum。exact根欄位與版本通過後，重播沿相同rebuild，再比對canonicalHash。命令順序不能重排；重複request、錯actor、stale或非法行動都拒絕，錯hash拒絕。`persistence.ts:97–107`。

## RNG與canonical的精確行為

seed先以FNV32式折疊：n初始2166136261，每個UTF-16 code unit取 `Math.imul(n ^ charCode, 16777619)`，零狀態改1。xorshift32次序為 `n ^= n << 13; n ^= n >>> 17; n ^= n << 5`，輸出 `(n >>> 0)/4294967296`。同bundle+同seed生成相同地圖；現版命令沒有隨機戰鬥。`game.ts:29–34`。

canonicalHash去掉history／requests，对剩餘truth以object key lexicographic排序、array保序的stableStringify編碼。每個UTF-16 code unit（包括Unicode代理對兩個unit）以64bit FNV式常数計算，初始14695981039346656037、乘1099511628211，每步無符號64bit截斷；输出16位小寫hex。這不是以UTF-8位元組定義的標準FNV輸入，也不是密码學MAC／簽章。`game.ts:13–27`。

排除ledger的hash不能證明去重與歷史完整。save以全量重建比較補足；replay以command檢查補足但不聲稱鑑別包的可信作者。現有測試證明旗標／knowledge／center敏感、ledger不影响hash、😀／😁区分：`tests/core.test.ts:215`、`tests/review.test.ts:238`。

## 邊界、成本與缺口

核心parse没有文本大小／歷史長度上限；外層檔案限制由root前端審查整合。requestId目前只有字串長度範圍，`__proto__`以Object.hasOwn與defineProperty安全儲存，正常往返已有test。沒有密碼、token或個資欄位。

每次成功命令複製history array／requests record，所以完整重播成本隨H增長，ledger部分理論約O(H²)；没有checkpoint或增量驗證。這是靜態成本分析，尚無本輪讀檔延遲benchmark。長局JSON／同步UI載入須另測，不能以build/test通過代替。

固定seed地圖checksum golden與原始RNG向量的獨立freeze測試未實作；現有「相同seed」測試比較同一實作兩次，不能偵測生成器無聲變更。升级bundle与遷移registry是PROPOSED；主創是否希望提供跨版轉換仍OPEN_QUESTION。
