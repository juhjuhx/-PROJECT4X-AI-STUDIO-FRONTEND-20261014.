# Frontend-Core 正式契約 v1

> 2026-10-18：C3整合仍使用同一v1 signature與能力邊界；core/session/presentation沒有改動。fresh runtime／browser證據見[最新C3狀態](../handoff/C3-IMPLEMENTATION-STATUS.md)。新增呈現helper不增加或另造API。

日期：2026-10-17（Asia/Taipei）。維護者：Codex。基線 `c21b16cd75572d069369f41426f7323c63c05083`；Gemini ZIP SHA-256 `bf9a2ddee457e598f85345b53456749bf603ee490d18e4c25a8f142210450a5e`。

**C2 runtime 已實作；下述 v1 signature 不變。** 實作入口 `src/session/game-session.ts:createGameSession`，以 `src/session/contracts.ts` type-only re-export 本目錄的 [frontend-core-v1.d.ts](frontend-core-v1.d.ts)，不維護第二份接口。驗證範圍及實際結果見 [C2-IMPLEMENTATION-STATUS](../handoff/C2-IMPLEMENTATION-STATUS.md)、[C2-VERIFICATION.json](../handoff/C2-VERIFICATION.json)。IMPLEMENTED 不等於所有玩法已通過。

| 正式接口 | Runtime 位置 | 實測依據 |
|---|---|---|
| getObservation / getSnapshot / getAvailableActions | game-session.ts 的 port getters；immutable.ts:freezePublic | session A 的 capability、深凍結；B/C 版本與生命周期 |
| submitAction | game-session.ts:submitAction；errors.ts:coreError | session B 的扣款、duplicate/conflict/stale；91 合法指令終局重送 |
| subscribe / dispose | game-session.ts:subscribe/publish/dispose | session C 的重入、例外隔離、退訂、deferred initial、callback dispose |
| resumeAI / AI status | game-session.ts:resumeAI；ai-driver.ts:createAIDriver | session D 真 AI、取消／恢復；ai-driver 13 邊界案例 |
| save / exportReplay / acknowledgeSave | game-session.ts:exportFile/acknowledgeSave | session E 私有匯出／stamp確認；browser 真保存／讀回 |
| load / newGame / verifyReplay | game-session.ts 同名方法；session/persistence.ts:validateImport | session E 失敗匯入保 timer/dirty、UTF-8 bytes、語意/history拒絕、replay等值 |
| 七種 PresentationEvent | presentation/events.ts:projectPresentationEvents；session 成功命令呼叫點 | presentation 23 案、session F 真遺跡／研究且重送零事件 |

以下 C1 的 baseline 行號與替代方案是保留的設計來源；現行 main 不再持有 canonical state、AI timer 或 core persistence。Gemini 只能消費 GameplayPort，受信任檔案 controls 才可取得 LocalPersistencePort。

## 1. 現況與選擇

已確認：`src/core/types.ts:10–37` 定義 Action、Command、GameState、Observation、ApplyResult；`src/core/game.ts:205–274` 是唯一玩法寫入函式。C1 baseline 的 `src/main.ts` 曾同時持有 state、dispatch、AI timer 與 persistence；C2 已移入 session，main 只作 composition/presentation I/O。

可行方案比較：直接把 main 的所有變數公開，改動小但無所有權隔離；重建狀態庫／第二 reducer，會製造兩個權威；**採逐步抽出 GameSession，外接只讀 Presentation Adapter**，可保持既有 core、Command 和存檔完全一致。這是本次工程設計，不是新增遊戲規則。

目標依賴順序：`core → session → actor-scoped presentation → UI`。資料實際由 session 呼叫 core，再投影給 UI；UI 的意圖回到同一 session。GameSession 獨占一份 canonical state；UI 不持有 GameState、history、requests、對手 faction、全域 visibility。AI 仍只取得 `observe(state, aiActor)`，禁止從 seed 重建真相。這是模組邊界，不是本機瀏覽器的反作弊隔離；未來聯網需另立威脅模型。

## 2. 方法與型別

完整 TypeScript signature 在 [frontend-core-v1.d.ts](frontend-core-v1.d.ts)，只依賴現存 core 型別，沒有虛構 `KnownSite` 等來源不存在的型別。v1 的 actor 在 session 建立時固定；目前 UI actor=0、AI actor=1，UI 不能自行指定 actor。

| 目標 API | 行為 | 對應現存機制 |
|---|---|---|
| `getObservation(): DeepReadonly<Observation>` | 目前玩家的分離副本；C2 要深凍結，不能連回 canonical state | `game.ts:149–164` |
| `getSnapshot(): DeepReadonly<SessionSnapshot>` | observation、stamp、AI 狀態、未保存標記；不含 world state | main 的 view/generation/aiRunning/dirty |
| `getAvailableActions(): readonly DeepReadonly<Action>[]` | snapshot.observation.legalActions 的同版副本；不可 UI 重算權威合法性 | `game.ts:130–147` |
| `submitAction(request: ActionRequest): ActionResult` | 同步原子提交；actor 由 session 填入，轉為既有 Command | `types.ts:19`、`game.ts:205–274` |
| `subscribe(listener): Unsubscribe` | 立即一次 initial，此後依序發送提交後 snapshot；取消訂閱冪等 | 現行 render 呼叫；C2 已建立 subscription |
| `save(): ExportResult` | 產生私有完整存檔文字；不寫 storage，不先清 dirty | `persistence.ts:87` |
| `acknowledgeSave(stamp): OperationResult` | 只有同 session/generation/version 的 I/O 成功才能清 dirty | main.saveLocal/download；C2 已改為同 stamp 的 IO 確認 |
| `load(text, expected): OperationResult` | 驗證成功才換局；失敗保留 state/timer/generation/dirty | `persistence.ts:89–95`、main.loadLocal/importFile |
| `newGame(seed, expected): OperationResult` | seed 建局成功後才替換；不是 load 時信任任意 GameState | `game.ts:40–85`、main.newGame/replaceGame |
| `exportReplay(): ExportResult` | 私有完整 replay；不回傳 GameState | `persistence.ts:97–99` |
| `verifyReplay(text, expected): ReplayVerificationResult` | 驗證候選檔案，回最少成功摘要；永不替換現局 | `persistence.ts:101–108`、main.importFile(replay=true) |
| `resumeAI(expected): OperationResult` | 僅 paused 的對手回合可恢復；重設本次安全計數 | main.beginAI／continueAI |
| `dispose(): void` | 取消 timer、使已排程工作失效、清訂閱；重複呼叫無副作用 | C2 dispose 已取消 timer／清訂閱，保留最後只讀快照 |

`save/load/replay` 屬受信任的本機檔案 I/O capability；返回文字不可送入地圖、HUD、動畫、遙測或 AI。composition root 給 HUD／地圖的是 `GameplayPort`，只有檔案 controls 取得 `LocalPersistencePort`；不可把完整 GameSessionPort 注入通用渲染元件。`PrivateExport.privacy='private-full-world'` 是用途標記，不是加密。UI 檔案服務只能下載／本機保存；不可 parse 後補地圖情報。檔案 picker、Blob、localStorage、對話框與確認視窗歸 presentation I/O，deserialize/replay 與換局權歸 session。

## 3. 交易、重送與版本

`SessionStamp = {sessionId,generation,version}`。version 是 GameState.version；sessionId 是執行期 instance namespace，不寫入存檔／canonical hash；generation 是執行期換局與取消 token。換局或 dispose 令舊 token 失效；失敗載入不變更 token。

UI 從同一 snapshot 取出 stamp，選一個完整合法 Action，為**一個使用者意圖**建立唯一 requestId；重試必須帶原 requestId、原 expectedVersion 與原 payload，不能每次重試生成新 ID。`ActionRequest.expectedVersion` 取自 snapshot.stamp.version，原樣對映 `Command.expectedVersion`。requestId 1–256 UTF-16 code units，expectedVersion 非負安全整數。UI 範例：

```ts
// composition root 從 createGameSession(...) 取得 gameplay，以下 session 指 GameplayPort。
const snapshot = session.getSnapshot();
const action = session.getAvailableActions().find(a => a.type === 'EndTurn');
if (action) {
  const { sessionId, generation, version } = snapshot.stamp;
  const request = { sessionId, generation, expectedVersion: version, requestId: crypto.randomUUID(), action };
  const result = session.submitAction(request);
  // 若要重試，只可重送 request；不能改 action/version 或另建 ID。
}
```

session 邊界首先驗證格式、instance、generation 與 disposed/reentrancy。對有效同世代提交，必須保留 core 的實際判斷順序：合法 Command 形狀 → requestId 去重 → expectedVersion → active actor → terminal → legalActions。不得用 UI busy／stale 檢查提前拒絕一筆已成功的同 payload 重送。來源 `game.ts:205–214`。

同 requestId／同 actor+expectedVersion+action：`ok:true, disposition:'duplicate'`，返回**目前** snapshot、events=[]；不扣費、不加 history/version、不改 dirty、不重啟 AI、不播放動畫。異 payload：REQUEST_CONFLICT。新過期請求：STALE_VERSION。被拒絕的請求不占 ledger。快照觀測副本可被 UI 保存，但不能拿舊快照呼叫繞過版本檢查。

同步方法在 commit 前不 yield。訂閱通知時保持 publication lock；listener 內的交易方法 `submitAction/load/newGame/acknowledgeSave/resumeAI` 回 SESSION_BUSY，不能重入 reducer。listener 的 exception 必須隔離，不能回滾已成功命令或中斷 AI 排程；除明確 dispose 外，不可跳過其餘 listener。需要 UI 連續意圖時另排 microtask，再讀新 stamp。只讀 getter、save/exportReplay/verifyReplay 不觸發提交或 publication，沒有 reducer 重入。

訂閱生命週期另訂明確例外：unsubscribe 立即生效，當批尚未輪到的該 listener 不再呼叫；listener 內 subscribe 的 initial 延後到當批通知完成，以最新 snapshot、events=[] 發一次，不遞迴進目前 callback，若先 unsubscribe 或 dispose 則不發。listener 內 `dispose():void` **立即**令 instance 失效、取消 AI、清除訂閱；目前 callback 可正常返回，但停止當批其餘 listener 與待發 initial。dispose 不回 SESSION_BUSY、不丟例外、不回滾已成功提交，也不額外發布快照。重複 dispose 是 no-op。

## 4. AI 與換局

主線 `main.ts:353–415`、D2 `main.ts:484–546`：AI 每步 `observe(state,1) → chooseAction(aiView) → applyCommand`；每步對同版 aiView.version；request namespace 保留 session/generation/遞增序號。每批最多 1000 actions 是 driver 安全暫停，不能當勝負規則。C2 首次抽取不改 AI policy、不改這個上限、不重新平衡。

每個 timer callback 捕捉 generation，執行前及任何非同步完成後再比；stop/cancel 清 timer 並令舊工作失效。載入／新局只有候選完全驗證成功時才 cancel、換 state、遞增 generation、重算 observation；隨後若輪到 AI，啟動新世代 driver。匯入失敗不得先停 AI 或抹去當局。runtime generation 不寫入 Command；核心 Command 仍只有既有四欄。

`AIStatus` 只呈現 idle/running/paused/finished 與一般暫停原因；不暴露對手候選、目標、金幣、搜索路徑、隱藏 action 或 action 計數。暫停是工程故障，不合成 EndTurn 或 winner。resumeAI 先驗 stamp；人類回合回 NOT_YOUR_TURN，終局回 GAME_OVER，非 paused 回 AI_NOT_PAUSED。dispose 後三個 getter 保留最後只讀快照／候選；subscribe 拒絕並拋出一般 disposed 錯誤；所有回傳 Result 的操作（包含私有匯出／驗 replay）優先回 DISPOSED。dispose 本身維持 void/no-op，不再發布事件。

## 5. Save / Replay

現有 schema/ruleset 原封不動：`project4x-save-1`、`project4x-replay-1`、`g1-ccts-1`。C1 不改 parser、RNG、生成器、歷史或 checksum。格式／語意驗證 → seed+history rebuild → 全量比對成功，才可 replace。`persistence.ts:14–94`；replay 另驗 schema 與最終 hash，`101–108`。

文字匯入上限沿用 main 的 10×1024×1024 bytes；C2 的直接 string API 必須以 UTF-8 byte 數驗證，不能用 text.length 代替。storage 及 File 讀取在 UI 完成，等待前捕捉 stamp，等待後呼叫 load/verifyReplay。若期間已有成功命令或換局，回 STALE_VERSION／STALE_GENERATION，請 UI 重新確認；這是明示強化非同步覆蓋保護，不是玩法改變。

候選失敗：state、history、requests、generation、AI timer、dirty、localStorage 全部保留。成功 load：saved=true、generation+1；成功 newGame：saved=false、generation+1。保存先拿 PrivateExport；localStorage.setItem 成功後以 file.stamp acknowledge。下載 API 沒有可靠的「使用者已寫入磁碟」回執，下載只顯示「已發起匯出」，不可自動清 dirty。此改進已在 C2 實作並測試；main.download 不 acknowledge，localStorage.setItem 成功後才確認。

驗證 replay 的成功摘要不帶 canonical state、對手 command 或歷史詳情，也不改目前 dirty。private replay 是重建驗證格式，沒有逐幀播放器。未知規則版本拒絕，不自動遷移；遺跡新取得機制在 C6 用獨立 proposal 處理。

## 6. 錯誤

目標 `SessionErrorCode` 見型別檔；錯誤 message 只提供本次操作的一般原因，不能包含隱藏 payload、地形、敵方經濟、stack 或完整 parser input。INVALID_REQUEST、SESSION_MISMATCH、STALE_GENERATION、SESSION_BUSY、DISPOSED 是 session 層；REQUEST_CONFLICT、STALE_VERSION、NOT_YOUR_TURN、GAME_OVER、RELIC_REQUIRED、ILLEGAL_ACTION 對應 core 已有拒絕條件。INVALID_SAVE／INVALID_REPLAY／UNSUPPORTED_VERSION／IMPORT_TOO_LARGE 屬檔案邊界。

core 仍只有中文字串 error，`types.ts:37`；C2 的 `src/session/errors.ts:coreError` 已對映公開錯誤碼，未知字串回 INTERNAL_ERROR 並保留局面；不得由 Gemini 用任意 regex 推理隱藏世界原因。schema/ruleset 失敗須明確歸入 UNSUPPORTED_VERSION；JSON 語法或其他候選語意錯誤歸 INVALID_SAVE/INVALID_REPLAY。

## 7. PresentationEvent

當前 `ApplyResult.events` 是 `string[]`，新命令通常只有「行動已完成。」；duplicate 為 []，`game.ts:209,273`。不能視其為結構化動畫事實，也不能回傳完整 history。Gemini D2 的 `GameEvent {payload:Record<string,unknown>}` 草圖不是正式契約。

v1 先使用**相鄰、同 actor、同 generation 的前後 Observation**，由 session 內部投影。只接受 toVersion=fromVersion+1 的成功命令；換局、初始訂閱、重送、AI 狀態更新沒有 gameplay events。沒有跨 generation 補播。投影函式不可接 GameState 或歷史；需要的 own-action receipt 只能是本玩家剛被核心接受的 Action，不得傳入對手原始命令。

| 目標事件 | 合法發送的最少證據 | 不得宣稱 |
|---|---|---|
| UnitHealthChanged | 同一 unitId 前後均可觀察、HP 真正改變；給前後 HP 與當前可知位置 | 不猜不可知攻擊者；不從公式預報已發生傷害 |
| OwnUnitDestroyed | 僅 `g1-ccts-1`，己軍由存在變成不存在，對照現版只在 combat 移除的規則；lastKnownAt 已知 | 敵兵從觀測消失不等於死亡；未來有轉籍／傳送時須重新版本化 |
| SiteOwnerChanged | 同一據點兩端都 visible 且兩端 owner 皆明確、確有變化 | owner undefined 是未知，不能當敵方或中立；不能由重新看見補演早前佔領 |
| UnitRecruited | 本玩家成功 Recruit receipt；兩端己軍差集恰有該 site/kind 的新兵 | 不能把新看到的敵軍當招募成功 |
| TechResearched | 己方 faction.techs 的實際新增 | 不發布對手科技完成 |
| RelicResolved | 己方 pending id + 成功 ResolveRelic receipt；該 pending 已轉移或清除；情報只列前後真的由 unknown 變已知的格 | 不稱為新版「實際抵達取得」；不預填三格或暴露敵軍；gold 選項 revealedTiles=[] |
| PoliticalCenterChanged | 己方 faction.centerId 真正改變；from/to id 均來自己方觀測 | 不播敵方全國流亡、隱藏中心或文化轉化 |

這七種事件的 runtime 已 IMPLEMENTED，證據條件由 projector 與 session contract tests 分別驗證；演出動畫尚未接入。敵軍死亡的明確擊殺動畫暫不提供；一般 HP 變化可演出，離開視野只更新可見性。若未來需要敵軍死亡，另做具有合法可見 witness 的核心事件投影，不能把「after 沒找到」當證據。

封套含 schema、viewer、generation、fromVersion、toVersion、sequence、id。相同規則／同觀測對／同 own receipt／同 generation 必須得相同事件；禁止 Date.now、Math.random、canonicalHash(GameState) 或敵方 ledger 作排序／ID。固定順序：HealthChanged → OwnUnitDestroyed → SiteOwnerChanged → UnitRecruited → TechResearched → RelicResolved → PoliticalCenterChanged；各類以已暴露的穩定 ID 排序，再以 0 起序號組 `id = generation:fromVersion:toVersion:viewer:sequence`。sessionId 不進事件 ID，因此相同輸入可確定重播；UI 去重鍵加自己的 sessionId。事件只發給該 viewer 的訂閱者，不跨 actor 共用 cache。動畫以 subscribe 作唯一播放通道；ActionResult.events 可作回應核對，但不能再另播同一次演出。

**Fog 非干擾測試**：建立兩個同 actor 觀測對完全相等、隱藏世界不同的合法 fixture；要求事件、錯誤公開碼、snapshot 的 observation 逐欄相等。額外測試敵兵撤出視野不能發死亡、己方視野來源死亡不能洩漏敵兵去向、重新看見據點不補演佔領。僅搜尋 DOM 文句不能證明此性質。

## 8. C2 必須新增的驗證

| 測試 | 明確預期 |
|---|---|
| successful command / duplicate / conflicting payload | version 只加一次；重送零扣費、零 events、零額外 history；衝突無副作用 |
| stale version / stale generation / different session | 依分層錯誤拒絕，snapshot/world/ledger 不變 |
| retry after AI advanced / after terminal | 同成功 payload 仍 duplicate，不能先被 stale 或 turn gate 擋掉 |
| invalid import while AI timer pending | 校驗失敗保留原 timer、generation、state、dirty；舊局照常前進 |
| successful replacement + stale callback | 新局不被舊 timer／file read 修改；generation 僅成功替換時遞增 |
| local save failure / delayed save acknowledgement | storage 錯誤或 stamp 已變，不清 dirty |
| save/replay golden continuation | 同 seed + 同 Command 後綴 state、requests、hash 完全相同；schema 仍舊版 |
| listener throws / reentrant submit / unsubscribe | 已成功提交不回滾、其餘 listener 接收、重入拒絕、退訂後不再接收 |
| listener 內 subscribe / dispose | 新訂閱不遞迴、當批結束後 initial；dispose 立即取消 AI 並停止剩餘通知、已提交命令不回滾、重複 dispose no-op |
| immutable view | 改快照／Action 巢狀座標無法污染 session；UI 不取得 truth |
| AI port isolation | chooseAction 僅拿 Observation；沒有 hidden faction、history、全知路徑 |
| event determinism / actor isolation / fog differences | 對等可見輸入 → 相同事件；敵兵消失不假報死亡；無補播隱藏結果 |

上述是驗收規格；實測範圍以 C2-IMPLEMENTATION-STATUS 與 C2-VERIFICATION 為準，不能把有限 fixture 當全輸入證明。A–G 主要實作保存 RED/GREEN，額外 driver 邊界驗證明記為事後補強。C3 才接 D3，城市與招募切片 C4、AI C5、規則遷移 C6 不能混在本次文件提交。

## 9. C2 呼叫與整合注意

`createGameSession({seed, reducedMotion?})` 回傳 `{gameplay, files, dispose}`；onDiagnostic、scheduler、aiPolicy 僅供受信任 composition／測試注入，不放進 GameplayPort。無 state setter。人類成功命令導致 winner 時，當次 snapshot.ai.phase 已是 finished；不會生成第二個勝負規則。AI 的原始 action 不作玩家 ownReceipt；只用玩家前後觀測投影。檔案驗證與候選 canonical state 始終留在 session。

main 的 subscribe 是未來事件動畫唯一入口；C2 只更新現有 UI，沒有宣稱傷害動畫／敵軍死亡動畫／逐幀 replay player 已完成。局部非干擾使用兩段同 seed、相鄰合法 history，敵方分別研究 farm/archery，公開觀測／事件／拒絕錯誤相等；完整聯網秘密邊界、所有可能世界與實體手機未驗。
