# 核心 API 契約

## 2026-10-17 C2 現行邊界

GameSession 現在獨占 canonical GameState，唯一 reducer 仍 src/core/game.ts:applyCommand。main 為 composition root，只保留 UI view cache／selection，透過 GameplayPort 提意圖；檔案 controls 另取 LocalPersistencePort。session/ai-driver 只收 actor1 Observation，presentation/events 只讀 actor0 前後 Observation 及合法 own receipt，UI/map 只收凍結的可見資料。load 先 core 完整驗證再 replace，Save/Replay 不交 HUD。正式 runtime API、模組與證據見 [FRONTEND-CORE-CONTRACT](../contracts/FRONTEND-CORE-CONTRACT.md) 和 [C2-IMPLEMENTATION-STATUS](../handoff/C2-IMPLEMENTATION-STATUS.md)。以下為原封存架構與 source 行號，凡提 main 持 state／driver 者皆屬 C2 前歷史。


2026-10-17：本檔維持現有 core API 說明。新的 session/UI 接口權威移至 [FRONTEND-CORE-CONTRACT](../contracts/FRONTEND-CORE-CONTRACT.md)；C1 僅規格，runtime 尚未實作，不可把其方法當本檔已有 export。

本版是 TypeScript 函式 API，沒有 HTTP、WebSocket 或網路服務端點。相依的資料格式在 `src/core/types.ts`，唯一合法規則寫入路徑是 `applyCommand`。表中的行號對應封存src；測試結果由root在交接狀態檔統一記錄。

## 公開函式

| API | 輸入／輸出 | 契約與來源 |
|---|---|---|
| `createGame(seed)` | string → GameState | seed需1–256個UTF-16 code units；否則throw。24×24、人類actor0先手、version0／turn1。確定性生成。`game.ts:40–85` |
| `clone(value)` | T → T | structuredClone，僅支援可結構化複製值。`game.ts:4` |
| `distance(a,b)` | Point,Point → number | 曼哈頓距離，沒有輸入schema驗證。`game.ts:5` |
| `passable(terrain)` | Terrain → boolean | water／mountain=false，其餘true。呼叫端保證Terrain枚舉。`game.ts:9` |
| `visibility(state,actor)` | GameState,0\|1 → boolean[] | 動態菱形視野，長度width×height；單位／己方據點為來源。`game.ts:87–95` |
| `legalActions(state,actor)` | GameState,Actor → Action[] | 非active／terminal／eliminated為[]；pendingRelic只給獎勵選擇；其餘實際合法命令。`game.ts:130–147` |
| `observe(state,actor)` | GameState,Actor → Observation | 所有觀測巢狀資料為副本；動態資訊按視野投影，己方Faction保留。`game.ts:149–164` |
| `validAction(value)` | unknown → boolean/type guard | 欄位完全相等、ID1–256長度、枚舉及整數檢查；不代表目前行動合法。`game.ts:170–183` |
| `validCommand(value)` | unknown → boolean/type guard | actor0/1、requestID、非負safe expectedVersion、合法形狀Action；額外欄位拒絕。`game.ts:185–187` |
| `applyCommand(state,command)` | GameState,Command → ApplyResult | 不驗證state來源；呼叫者只能給createGame／已驗load／前次成功state。失敗原引用。`game.ts:205–274` |
| `stableStringify(value)` | 支援JSON值 → string | object key排序，array順序保留；內部canonical用，不是一般未知JS物件serializer。`game.ts:13–18` |
| `canonicalHash(state)` | GameState → 16字元小寫hex | gameplay truth包含雙方知識、旗標、版本；排除history／requests。FNV64式UTF-16 code-unit checksum，不是安全簽章。`game.ts:20–27` |
| `chooseAction(view)` | Observation → Action\|null | 候選空回null；選自legalActions；回傳Action副本、不修改view、不重建seed。`ai.ts:9–153` |
| `serializeGame(state)` | GameState → JSON string | 直接JSON.stringify，不在輸出時驗state；包含全真相與ledger。`persistence.ts:87` |
| `deserializeGame(text)` | string → GameState或throw | JSON.parse→格式語意→seed+history重建→全量stableStringify比對；回傳重建state。`persistence.ts:89–95` |
| `exportReplay(state)` | GameState → JSON string | replay schema、ruleset、seed、commands、hash。`persistence.ts:97–99` |
| `replayGame(text)` | string → GameState或throw | exact欄位、版本、命令形狀、逐筆版本／request／合法性、最終checksum。`persistence.ts:101–108` |

`observe`／`legalActions`／`visibility` 依賴有效state與Actor型別，沒有另行防禦任意JS輸入。Command與JSON載入是對外邊界，各自有驗證。完整本機state可被持有者修改，沒有網路反作弊承諾。

## Command 與 Action

```ts
interface Command {
  actor: 0 | 1;
  requestId: string;
  expectedVersion: number;
  action: Action;
}
interface ApplyResult {
  ok: boolean;
  state: GameState;
  error?: string;
  events: string[];
}
```

每個Action必須只含下列欄位；原始格式：`types.ts:10–19`、`game.ts:170–187`。

| Action | Payload | 目前合法性／效果 | 來源 |
|---|---|---|---|
| Move | unitId,to{x,y} | 己軍未moved且未acted；四向最短通行路徑≤move，不穿任何單位；僅標moved | `game.ts:114–128,135,222–225` |
| Attack | unitId,targetId | 己軍未acted，敵军目前可見、曼哈頓距離≤range；扣target HP，攻击者moved/acted；击杀不进格 | `game.ts:136–137,227–234` |
| Capture | unitId | 未acted己軍站在非己有site；轉owner、heldSince=敵方completedTurns、recruited=false；單位moved/acted | `game.ts:136–138,236–240` |
| Recruit | siteId,kind | 己有空site，本回合未招募、金幣足；archer另需archery；新兵moved/acted | `game.ts:140–141,242–246` |
| Research | tech | 未研究且金幣足；扣費、加入techs；尋徑視野立即生效 | `game.ts:144,248,90` |
| ResolveRelic | choice:'gold'\|'intel' | pending必答期；gold+4；intel最多3未知terrain，零格不給候選 | `game.ts:109–111,132,249–254` |
| EstablishCapital | siteId | exiled、己有site、敵方completedTurns>heldSince；免費設定中心、不改旗標 | `game.ts:142,256` |
| EndTurn | 無 | 一般階段可用；更新完成回合／active／turn、進入方收入與旗標；pending／terminal不可用 | `game.ts:130–145,257–265` |

## 驗證順序與冪等

1. validCommand：錯誤「指令格式不正確」。
2. requestId已存在：`actor+expectedVersion+action` 的stable payload完全相同回ok=true/currentstate/events=[]；不同回「此請求編號已使用其他指令」。requestId不在payload內。重送判斷先於stale／active／terminal，所以先前成功命令即使換回合／終局仍可安全重送。
3. expectedVersion≠state.version：「狀態版本已過期」。
4. actor≠active：「尚未輪到此文明」。
5. winner非null：「戰局已結束」。
6. Action不等於任何合法候選：pending時「必須先選擇遺跡獎勵」，其餘「此行動目前不合法」。
7. 接受：新state、version+1、一次ledger append；events僅「行動已完成。」。

來源：`game.ts:205–219,270–273`。錯誤文字是目前實作，不是具名error code。前端若需localization或分層處理，穩定錯誤碼是PROPOSED，尚未實作。

## 錯誤與副作用

拒絕沒有exception或部分狀態；成功的去重重送也不產生新event。import／replay驗證用throw，訊息通常以「資料無效：」開頭；JSON.parse語法錯誤是原生錯誤。外層必須先取得驗證成功的新state再replace，不能先清localStorage或覆蓋現局。主程式讀檔邊界在 `main.ts:609–654`，完整操作與瀏覽器證據由root整合。

## Renderer與UI實際Interface

WorldMap是目前唯一renderer Adapter；沒有核心setState、HTTP或模型API。main的dispatch/replaceGame是私有協調函數，不是可外部隨意傳真相的公開入口。

| API | 輸入/輸出與限制 | 原始碼 |
|---|---|---|
| new WorldMap(canvas,onSelect) | HTMLCanvasElement＋(Point)=>void；建立Canvas2D與pointer/ResizeObserver | src/ui/map.ts:24–43 |
| update(view,selection) | Observation＋{tile:Point或null,unitId:string或null}；不接受GameState，只排程draw | src/ui/map.ts:45–51 |
| focus(point) | Point，移鏡頭，不改世界 | src/ui/map.ts:53–58 |
| home()／overview() | 只用目前Observation中心/己軍及尺寸決定鏡頭 | src/ui/map.ts:60–72 |
| zoomBy(factor,anchor?) | zoom clamp0.24–2.2，anchor維持縮放座標；只presentation | src/ui/map.ts:74–83 |
| main.dispatch(action) | 私有Action→applyCommand並更新成功state；requestId/expectedVersion必帶 | src/main.ts:329–352 |
| main.importFile(input,replay) | 私有File input、10MiB上限；先deserialize/replay成功，保存匯入才confirm/replace | src/main.ts:629–653 |

onSelect提供座標意圖，main從view.legalActions決定Move/Attack；DOM選單透過makeActionButton/dispatch提交。PROPOSED新的getObservation/submit/subscribe只讀UI Interface未實作，勿在GoogleAIStudio生成畫面時假裝已可呼叫。
