# 真實玩法旅程 QA 獨立審查

2026-10-18。範圍是新增 `scripts/browser-check.mjs:26–125` verifyGameplayJourney 與 package.json 的 qa:gameplay；C3 產品 main/map/session/core 保持先前審查版本。reviewer 只寫外層 evidence，未修改 project，未重新啟動長測或瀏覽器。已沿用 canonical code-review-excellence、systematic-debugging，對照真 core 規則與 C3 契約。

**結論：加強且要求 Attack→Capture 順序的目前版本可接受；沒有剩餘阻擋本項 QA 的 P0/P1/P2。** 原版兩個可假 PASS／門檻計數問題已修復且反例複驗；本報告採用 ordered 版真實結果，不把原本先 Capture 再 Attack 的較弱旅程當最終 Gate。

## 版本與真實執行

- 審閱 source snapshot：`9099ffbdd2f346d2ce2f94fb44097e90dc6148e340989f373e3a129f86bedce6`，與 C3-gameplay-ordered.json 完全相同。算法及逐檔 SHA256 在 `independent-gameplay-logs/ordered-reviewed-source.json`。
- scripts/browser-check.mjs SHA256：`426d731d039ed28bb64532785fb30a9a4ad2b3db664eaaabf97019b06b0fae27`。
- package.json SHA256：`a0dc8c3bedd39412025f33ecc2a576710882ebdb79b6e741517641711ad94a88`；只新增 `qa:gameplay = node --import tsx scripts/browser-check.mjs --gameplay`，沒有依賴變更。
- root 真實命令 `npm run qa:gameplay`，exit 0、71.286 秒；Chromium 156.0.8078.4；12 scenarios PASS、errors=[]。208 policy steps／209 筆玩家方 actor=0 commands／回合 37，captureAfterAttack=true。209 包含一次額外強制 ResolveRelic，不再用 trace.length 冒稱 command 數。
- 首次 Capture 在 step6／turn9；首個 Attack 在 step152／turn31，其後多次 Attack，**Attack 後的 Capture 在 step207／turn37／第209筆玩家方 command**，不以早期中立據點占領替代順序要求。
- root runtime 證據：C3-gameplay-ordered.json/log、C3-gameplay-ordered-artifacts/browser.json。reviewer 已讀 trace、metadata 與 source，並核對 served/dist/artifact hashes **3/3 相同**。server cleanup 紀錄顯示測試程序已終止；reviewer 沒有另開需要清理的程序。

## 原 finding 與修復複驗

| Finding | 原問題／具體反例 | 最終處理 |
|---|---|---|
| G-R1，P2，FIXED | 舊斷言只檢第一筆完整 action；額外遺跡只看 type，EndTurn 不限定玩家方追加數。真 core 合法 history 中，選 intel 卻送 gold，或 EndTurn→AI EndTurn→額外 actor0 Research(farm)，原片段都 PASS。 | `:81–90` 過濾所有 actor0 追加命令，整段 action payload 必須精確等於 `[action]` 或 `[action, {ResolveRelic, choice:實際選項}]`。EndTurn 同樣檢查，不會把正常 actor1 回合命令誤當額外玩家操作。 |
| G-R2，P2，FIXED | 舊 loop 220 次只算 policy steps，強制 ResolveRelic 不算入 humanCommands=trace.length；220 steps 可有221以上玩家方 command，仍宣稱符合上限。 | `:38–40,85–91,123–125` 真正累加 actor0 history 增量，含強制遺跡；PASS 必須 humanCommands<=220，policySteps 與 humanCommands 分開回報。 |
| 順序門檻，已收緊 | `seen.has(Attack)&&seen.has(Capture)` 可接受早期 Capture→後期 Attack，無法支持明示的戰鬥→占領順序。 | `:39–40,100–111` 只有在 seen 已有 Attack 的後續 Capture 才設 captureAfterAttack；loop 與最終 assert 均用此旗標。 |

獨立反例不是手寫猜測：使用真 createGame/applyCommand 產生合法 history，執行保存下來的原斷言片段。證據在 `weak-assertion-counterexamples.json/log`（exit0 表示反例成立，不是產品通過）。

加強後片段複驗 6/6 符合預期：錯誤 relic choice、EndTurn 後額外人類命令、forced relic 使總數221 均拒絕；正確 intel、正常 EndTurn＋actor1 回合、恰好220 均接受。`strengthened-assertion-verification.json/log` exit0。ordered 版與此版本的 exact/count 斷言區塊逐字相同。

另對實碼順序更新與最終 gate 驗 5 案：Capture→Attack 拒絕；Attack→Capture 接受；Capture→Attack→Capture 接受；只有 Capture／只有 Attack 均拒絕。`ordered-and-private-cleanup-verification.json/log` exit0。

獨立 harness 的跨 realm deepEqual 與 mock 把 export click 計成 close 的兩次假失敗另存 attempt1 logs；它們不是產品／QA gate 失敗。最後使用同 realm 原片段與依按鈕名稱計數的 mock 完成複驗。

## 決策、操作與 oracle 邊界

- `:29–43` 私有匯出先在 Node deserializeGame，**策略只收到 observe(before,0) 的 Observation**，沒有把 canonical state、隱藏單位、敵方經濟或 save payload 傳給 chooseAction。action 還必須存在於該 view.legalActions。私有 state 只作 history／HP／owner／未改局 oracle。
- `:44–79` 實際行為走 Playwright DOM click、canvas.focus 與 Home/方向鍵；沒有 applyCommand、state setter、UI debug setter 或 page.evaluate 注入命令。Recruit/EstablishCapital 由觀測中可知中心作鍵盤起點；起點不存在明確 fail，不靜默跳過。
- 單位 selector 已改為 `.unit-copy > span` 的 `^座標 /` 開頭精確 regex，避免 4 · 4 誤命中14 · 4。原 C3-gameplay-first 的 strict mode fail 有保留，沒有降成 warning 或 first() 掩蓋；選錯單位產生的 action 仍會被完整 history 對比拒絕。
- `:81–91` 在每一步讀回真匯出，驗人類完整 action 序列；非 EndTurn 還要求所有追加命令數相等。這能拒絕無反應、錯按鈕、額外人類命令、錯遺跡選項，不能只因 DOM 有文字就 PASS。
- `:92–98` 傷害 oracle 以**行動前可見** unit/target/tile 算 `max(1, attack-defense-cover)`；cover 為 forest/hill 或目標所屬據點，與 core/game.ts:227–234 相符。行動後 target HP 必須完全相符，死亡則須沒有存活 HP；僅有 Attack history 或狀態訊息不夠。
- `:100–104` Capture 需行動前格上有非己方 site，行動後該 site.owner 必須是0；不是只看旗幟、通知或後續繼續行動。
- loop 耗盡、終局提前、AI 暫停不能算通過；EndTurn 必須等待真 UI 回到玩家回合。強制遺跡需要真按鈕處理後才能開啟文件 controls。
- `:114–123` 匯出真 replay、以 file input 交給產品 verifier，等「驗證通過」後比較前後完整 privateSave 字串，證明此路徑不替換現局。此固定流程在最近一次 reload 後尚未有 replay 成功訊息，沒有把前一次殘留成功當本次結果。

## 私有資料與清理

私有 save/replay **不留存公開證據**；並非永不落暫存磁碟。真 UI 匯出會由瀏覽器建立下載暫存，Node 讀入作 oracle。privateSave `:12–23` 在 finally 直接 await download.delete()；讀取成功或讀取失敗都走刪除與關閉對話框。replay 下載也在 `:119–121` finally await replay.delete()。context/browser 最終關閉，外層 server 有 cleanup 紀錄。

reviewer 對 privateSave 原實碼以成功／readFile 失敗兩分支驗證：download.delete 與關閉各呼叫一次；這是清理控制流程測試，不冒稱 mock 是另一輪真瀏覽器。runtime trace 只保存玩家方已選 action、公開 turn/version 與計數，沒有把完整 canonical save/replay JSON 寫進 evidence。`privateExportPersisted:false` 應按「沒有持續留存私有匯出」理解。

## 門檻與覆蓋限制

- 220 是這段擴充旅程的 actor0 command **PASS 上限**，不是遊戲回合規則、勝負上限或整個前置 browser suite 的總指令數；在上限邊緣若額外 forced relic 造成超限，斷言會 fail。
- allHuman 的七種 action 覆蓋檢查涵蓋同一局的既有前置旅程與本段延伸：Move、Attack、Capture、Recruit、Research、ResolveRelic、EndTurn。reload/load 是前置實際本機存讀路徑，不是本段注入手工世界。
- ordered gate 證明同一局至少一次有效 Attack 後又有有效 Capture；沒有額外要求兩者必須針對同一敵方據點，也不代表整局勝利、敵都攻陷、全部戰鬥地形／兵種或政治中心重建已覆蓋。此跑次不把 EstablishCapital 列入必達七項。
- 這是固定種子的真 UI 自動操作回歸，沒有實際玩家人工遊玩；不是 full100、seed010 修復或 Alpha 驗收。
- reviewer 額外執行 `node --check scripts/browser-check.mjs` 與 `git diff --check`，均 exit0，紀錄在 `ordered-final-verification.json`。沒有新依賴、產品規則或可變 state debug 入口。
