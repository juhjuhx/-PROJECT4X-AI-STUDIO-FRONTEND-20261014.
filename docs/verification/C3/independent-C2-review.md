# C2 runtime 獨立複核（唯讀）

複核日期：2026-10-18（Asia/Taipei；精確 UTC 見下方 logs）。目標 HEAD：`e5bc16fedde9245e29284a4ec954299212089139`。工作樹：`LOCAL_HOME/Desktop/Fake-Polytopia/工程整合/C3-20261018-074653/project`。本次採用 canonical `code-review-excellence` 與 `codex-engineering-guardrails:code-verification`，已讀專案 AGENTS、當前入口、正式 v1 Markdown 與 d.ts，先審來源再執行公開 API。

## 裁決與發現

**C2 focused runtime gate：PASS（限定下列覆蓋）。未發現可確認的 P0／P1／P2 新缺陷。** 規格與工程品質兩軸在本次已驗範圍均通過；這不是 C3 整合／發布／全玩法 PASS。未提出修補，未修改 source、tests、config、lock，也未建立 commit。

| 優先級 | 本次 C2 新發現 |
|---|---|
| P0 | 無已確認發現 |
| P1 | 無已確認發現 |
| P2 | 無已確認發現 |

既知 full100 62/38、seed010、T3/T6 與遺跡新裁決未實作屬文件既有風險；此審查未重跑或改判。沒有以舊綠或其他 agent 回報代替本次證據。

## Fresh 執行證據

環境：macOS 15.8.1 arm64、Node `v26.10.0`。依賴由 root 接入鎖定安裝，本 reviewer 未安裝或變更依賴。

| 指令／探針 | UTC 時間 | Exit | 結果／證據 |
|---|---|---:|---|
| `node --import tsx --test tests/session.test.ts tests/ai-driver.test.ts tests/presentation.test.ts tests/session-boundaries.test.mjs`，依賴尚未就緒的首跑 | 23:47:31 | 1 | `ERR_MODULE_NOT_FOUND: tsx`；4 個檔案均未真正執行，分類為環境限制。保留 [focused.log](獨立C2日誌/focused.log)。 |
| 同上，依賴就緒後 fresh 執行 | `2026-10-17T23:48:09.600356+00:00` → `2026-10-17T23:48:10.030524+00:00` | `0` | **55/55 PASS**，0 fail/skip/cancel；[完整指令、環境、hash、stdout/stderr](獨立C2日誌/focused-fresh.log)。 |
| `node --import tsx --input-type=module -`，6 個獨立公開 API 探針 | `2026-10-17T23:48:43.991799+00:00` → `2026-10-17T23:48:44.119757+00:00` | `0` | **6/6 PASS**；精確 stdin 與輸出保留於 [independent-stdin-probes.log](獨立C2日誌/independent-stdin-probes.log)。診斷接收器故意拋錯產生一條一般 console 訊息，屬預期 fault injection。 |
| `git diff --exit-code HEAD -- src/core src/session src/presentation tests docs/contracts` | 最終來源核對 | 0 | 複核目標仍與指定 HEAD 相同。 |
| `git diff --exit-code c21b16cd75572d069369f41426f7323c63c05083 HEAD -- src/core package.json package-lock.json` | 最終來源核對 | 0 | core、package、lock 對 baseline 無變動。 |

來源 integrity 的兩條指令及 SHA-256 見 [source-integrity.log](獨立C2日誌/source-integrity.log)。root 同時處理 C3 文件／UI；本審查不以整工作樹乾淨作前提，僅驗證上述鎖定 C2 目標未變。

## 需求→可觀察行為→證據

| 需求／風險 | 來源與預期 | Fresh 證據 | 結果／界線 |
|---|---|---|---|
| 全部 13 方法與 capability | d.ts 的 GameSessionPort；`game-session.ts:161–173` 分成 gameplay 6、files 6、dispose 1；`contracts.ts:2` 唯一 type-only re-export | C2-A、disposed 測試與探針 6 | PASS；沒有第二份 runtime type 契約或 state setter。 |
| canonical 單一權威、immutable view | `game-session.ts:17,24–29,87–92,103–114,127–142` 私有 state；core `applyCommand` 唯一玩法轉移。`observe` 分離 clone，`freezePublic` 深凍結公開資料 | C2-A、C2-G、探針 1 遞迴驗所有 snapshot/action 物件 frozen，修改已提交 mutable input 不改 save/history | PASS。只證明模組能力邊界，不宣稱本機惡意 JS 防作弊。 |
| duplicate／conflict／stale 順序 | `game-session.ts:96–117` 先做 session/格式 guard，然後直接呼叫 core；`game.ts:205–214` valid→ledger→version→actor→terminal→legal | C2-B、AI 前進後重送、合法終局旅程後重送、探針 2 | PASS；duplicate 不增版本、ledger、費用、dirty、events 或排程，conflict 優先於 stale，拒絕不占 request ID。 |
| publication lock／例外隔離 | `game-session.ts:30–63,73–81,96–98`；交易方法在 listener 中拒絕 busy，只讀 export/verify 可用 | C2-C、C2-C/E、探針 3 | PASS；回呼與 diagnostic 同時拋錯仍保留 commit、交付後續 listener 並排程 AI。新增斷言都在 callback 外檢查，避免被 listener exception 隔離吞掉 assertion。 |
| deferred initial／退訂／dispose | `game-session.ts:36–71` active flag、flush queue；dispose 立即清訂閱與 driver；不再發 initial | C2-C nested subscribe/unsubscribe/dispose；探針 3、4、6 | PASS；待發 initial 可退訂，真 session 的 AI commit listener dispose 停後續 listener/timer，已提交版本保留。 |
| AI 觀測隔離與取消 | `ai-driver.ts:23–64` 使用獨立 epoch+generation；policy 前後與 submit 後檢查 current；`game-session.ts:84–95` 只供 actor1 Observation，不傳 AI receipt | 13 個 ai-driver 邊界、真 AI 完整一回合、paused/resume、探針 4、5 | PASS；1000 safety-limit 是 driver seam 模擬，未宣稱核心允許連續 1000 同行動。 |
| validate-before-replace／failed import | `session/persistence.ts:9–21` UTF-8 10MiB 與公開版本碼；core persistence 語意驗證+history rebuild+全量比對。`game-session.ts:127–142` 候選成功才 stop/換代 | C2-E、探針 5（原局 clean 且 AI timer pending），另非法候選保留 dirty=true | PASS；失敗 snapshot identity、generation、save ledger、timer 均保留且舊局仍前進；成功 AI-active load 只保留新世代 timer，強制舊 callback 不動局面。 |
| save ack／replay | `game-session.ts:144–159` 匯出不清 dirty；ack 驗 session/generation/version；verify 永不 replace，只回最少摘要 | C2-E save/replay/golden continuation、探針 2、5、6 | PASS；限本機 API。本 reviewer 未重測 browser localStorage 寫失敗或實體下載落盤。 |
| Fog、7 種事件與 receipt | `events.ts:21–29` 相鄰同 actor/seed/ruleset；36–50 已知 HP／己軍消失／雙端可見owner；54–77 只認己方成功 Recruit/ResolveRelic receipt；83–87 固定類序與 ID。AI 呼叫不傳 receipt | 23 presentation tests；C0-03 合法 hidden 科技 history 觀測/事件/公開錯誤相等；C2-F 真研究、遺跡回執與duplicate零事件 | PASS（局部非干擾）；包括招募擴視野新增敵軍仍只投影己方新兵、敵兵消失不死亡、視野來源死亡不洩漏敵兵去向。有限 fixture 不構成所有世界的形式證明。 |

## 六個獨立 stdin 探針

1. 遞迴深凍結所有公開 snapshot/action 巢狀欄位；成功後修改 caller 的原始 request/action 不污染 canonical save/history。
2. ack 後 dirty=false 的 duplicate 保持 clean、snapshot identity；conflict 先於 stale，失敗 ID 可供後續合法意圖使用。
3. listener 內新增再取消的訂閱不收到 deferred initial；listener 與 diagnostic 都拋錯，其他 listener 與 AI 排程仍有效。
4. 真 session AI 完成一筆 command 的 callback 立即 dispose：保留 version=2，停止其他 listener 與下一個 timer；強制過期 callback 也不更新。
5. AI 回合成功 load 形成新 generation 且僅一個新 timer；clean 局失敗 JSON import 保留 timer/dirty，之後可正常完成 AI EndTurn。
6. dispose 之後 submit/resume/save/export/load/newGame/ack/verify 全部優先回 DISPOSED，三個 getter 保留最後參考；subscribe 拋一般關閉錯誤，重複 dispose no-op。

## 未驗與殘餘界線

- 沒有跑 browser、全 99 tests、check/build 或 full100；這些由 root 獨立處理，本報告不引用為本 reviewer 的 fresh gate。
- 未驗本次 C3 最終 UI/source、真人、實體手機、下載實際落盤、所有合法世界的完全 Fog 非干擾、惡意 Proxy/accessor 或故意破壞 runtime 原生 API 的同程序攻擊。
- 本次只用手動 scheduler 與實際 session/core/persistence API；未驗真實瀏覽器 timer 競速。同步 publication/reentrancy 與取消 token 有直接 fault-injection 證據。
- 無產品程式編輯，故未執行 changed-source LSP diagnostics。僅新增本報告與專用 logs，沒有殘留伺服器、port、temp script、token/cookie。
- 若 root 後續修改已 hash 的 C2 檔案，需針對變更另跑相應 fresh checks；此結論不能自動延伸。

## 鎖定來源 SHA-256

| 路徑（相對 project） | SHA-256 |
|---|---|
| `docs/contracts/FRONTEND-CORE-CONTRACT.md` | `e2452315a6bbb52578a8293c3b62b6a04c3ff480a8e271db5b5c99cfc241cdc9` |
| `docs/contracts/frontend-core-v1.d.ts` | `eafc4bacb60e41d3f90ababb681cd75f2fc1ae4f84003c832b3cbbf68d968f1d` |
| `src/core/ai.ts` | `a97d731df122b363bfcce498af256d93a34a5aa35160cd90aaab7418ff9b447a` |
| `src/core/game.ts` | `d9153ec8a934f53b318dda2d21f4450b1ad8030e4d6d067ad089994fd26affb7` |
| `src/core/persistence.ts` | `5ebd2cf08a052c8783ea491a706a73f66474d4cb363c7fe61e1e1482baa588c8` |
| `src/core/types.ts` | `8db6e1c4dd8e62e7271bf6d1820683fa9edab729fb7655b5e76515ced5a05edd` |
| `src/presentation/events.ts` | `3be960186042af847caa1caed9d62df3bf69964fa3491ac6177c2b54563dc53b` |
| `src/session/ai-driver.ts` | `b19f1a17372e93640ac7ca7f08a3b65e04f5e2eaf122c4ae2bc1af0858b8740d` |
| `src/session/contracts.ts` | `c8751a8a43ca2cc8d2a2cbd1f0a8bfd18ac2eac9794d4e093c53e0bed094ae8b` |
| `src/session/errors.ts` | `ef689209695a54169fbd6f6c87458b146ba46ef76900c3e6a5bf6cd2a14fdbf5` |
| `src/session/game-session.ts` | `a28986cf385b2e7b35a81b9be17e8bfeb83091ed79e6e581666a153c4d6a13d4` |
| `src/session/immutable.ts` | `82f684610efe4422b2b6e33e13eb443c0b17fa08baebe25ef05da44bca559269` |
| `src/session/persistence.ts` | `905f933b124baf1b2e83fac621b6ab3ed2be2246c9e02f44e172e4d239192eaf` |
| `tests/ai-driver.test.ts` | `63cf1d9efe47d9a237b994bdd27e69ea03d5764582f8a747ce19e2039a962b05` |
| `tests/presentation.test.ts` | `9eab4f40d6962667807a6401fa49a39dc231dd20cc5a9ad08e2949fff7f43658` |
| `tests/session-boundaries.test.mjs` | `0614b6ce617cdd3eece0ec553f63e432d48d9ec26f4849f8b8730e8d447ba41f` |
| `tests/session.test.ts` | `de57e7504d2583a3ce21723a3021dfc03b3b52a887513aa9c29f3e5795e0163d` |
