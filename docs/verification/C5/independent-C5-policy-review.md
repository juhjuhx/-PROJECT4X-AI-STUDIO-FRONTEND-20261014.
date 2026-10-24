# C5 無記憶 AI 最小修補獨立審查

審查日期：2026-10-18。基線 `f7ec05a1f7b4ff73c97ba55b3e4c5994723fdc8b`；對照 src/core/ai.ts diff、診斷 script、原有 AI/追捕/繞路/探索 tests 與新增 prefix wrapper。依 code-review-excellence、systematic-debugging 執行。reviewer 沒有編寫或修改本次 AI；未修改 project，也沒有啟動 seed010 長局／full100。

**結論：這個最小 policy 修補在已審範圍可採納；沒有發現未解 P0/P1/P2。** 固定生成 prefix 的原三個兩格往返反例已不再被同一方法檢出；原斥候探索／靜態友軍阻擋繞路／攻城／隱藏存活者搜尋測試保持通過。這是有限 prefix 與局部 policy 回歸結論，不能宣稱 seed010 終局、full100、T3/T6 或 Alpha 已通過；root 的原門檻 seed010 長局已正式返回 FAIL，不能把局部修補當作全因果修復。

## 審閱版本

- 最後 source snapshot：`647933bf67bc45dcd4820a9dfd06b1fc20b5ad78464158baddc8258b2575da19`。算法與完整 path→SHA256 在 `independent-C5-policy-logs/reviewed-final-source.json`。
- 原 AI SHA256：`a97d731df122b363bfcce498af256d93a34a5aa35160cd90aaab7418ff9b447a`。
- 新 AI SHA256：`06402a6394082b71a12a3aa50fef270f0895cd9839c0b047185920747237ea40`。
- 最新診斷 script SHA256：`331dfe16683fe9e57ce432708cdfd03a836148e8e1bb0635e95c96fd52d8b105`；相對基線只增加輸出 terminalWinner，偵測方法／seed／1100 commands／六次閾值完全未變。
- 新 tests/ai-oscillation.test.ts SHA256：`f359afb1a85b0167e64080eba4d2f7ceab1d1361dcde3e880536377c2883b089`。
- root 原 paired-prefix／103 tests 的 snapshot 是 `6a7055ee5d4f17dd9f9ed3122d8648cce5666ab1b50ea5cf79f7cc975233b650`。後續僅 diagnostic 輸出加 terminalWinner＋新增 wrapper，並為 TS assertion message 加上 undefined fallback；AI 本體仍是上述06402a…。最新647933…已有 root 的 check/build與104 tests通過，不能把這些 snapshot 冒充同一 bytes。

## 軸一：反例與原測試是否真保留

原 `C5-oscillation-confirmed.log` 的實際 JSON：獨立QA-010、1100 commands、AI hash=a97d731…、3 個 loop（0:兵-31、0:兵-0、1:兵-34），exit1。這個 AI hash 與本次固定基線 byte-identical，不引用另一個候選版本當 baseline。

reviewer 獨立執行 `npm run qa:ai:oscillation`：1100 commands、loops=[]、TESTED_PASS、exit0；script 自身報10,691ms。完整命令、UTC、stdout/stderr 見 `independent-C5-policy-logs/current-prefix.log`。該輪是增加 terminalWinner 前的原診斷 script；之後新 wrapper 再跑最新 script 亦 exit0，見下表。

舊的 tests/**、scripts/headless.ts、scripts/verify.mjs、core game/types/persistence 與 lock 原有 bytes 未改；不是調整斷言、提高800回合上限、排除seed或更改winner讓結果變綠。早先不可達友軍候選的失敗嘗試不在本次 AI source06402a…內。

| reviewer 窄驗命令 | exit／結果 | 意義 |
|---|---|---|
| node --import tsx --test --test-name-pattern=AI\|斥候 tests/core.test.ts tests/review.test.ts | 0；15 pass、0 fail、0 skip | 真實合法候選、不改view、靜態友軍繞路、斥候側翼探索、攻城保留占領者、前沿招募、全知地形下搜尋隱藏流亡者與過時遺跡標記等既有回歸均保留。 |
| npm run qa:ai:oscillation | 0；1100 commands，0 loops | 固定生成 prefix 的同一紅例條件未再觸發，不代表全局不會有其他往返。 |
| node --import tsx --test tests/ai-oscillation.test.ts | 0；1 pass，約13.2秒 | 最新 diagnostic＋新增 wrapper 真跑；wrapper 要求完整prefix或真terminalWinner，拒絕無winner的提早停止；沒有放寬六次往返條件。 |
| node --import tsx --input-type=module -（外層 stdin窄fixture） | 0；兩案 | 全局 paired-forward 優先後仍可回到必要 detour；不可達全知島回合法 EndTurn，輸入view不變。 |
| git diff --check | 0 | 沒有未清格式問題。 |

新 wrapper 用 child exit/status、schema、seed、maxCommands=1100、commands範圍、loops=[] 作斷言；若少於1100，必須 terminalWinner為0或1。診斷本身只從 createGame 經合法 applyCommand 前進，沒有手造winner或 setter。它把此回歸納入 npm test，而不再只靠手動執行；root先前103 tests紀錄屬舊集合，reviewer不冒稱曾自行重跑整套；root 後續 C5-final-test-fixed.log／同647933… source 已記錄104 pass／0 fail／0 skip，C5-final-check-fixed與C5-final-build也exit0。

## 軸二：新排序、可達性、秘密與成本

**來源與快取**：`src/core/ai.ts:117–120` 的 terrainDistances 是每次 chooseAction 內的 Map，保留原 goals 的地形 BFS 陣列引用。不是跨觀測記憶或 canonical state cache。roles/candidates 用 spread 複製物件時 sources 陣列引用保留，因此 `:153–155` 的 key 能對回原未加 occupied blockers 的距離；沒有重新做全知地圖或使用 seed/history。

**排序實義**：`:152–162` 只把同時降低目前 traffic graph 距離與原 terrain 距離的合法 Move 優先。原 goal weights、blocked set、候選可達性篩選、scoreMove、occupied objective 的 source播種、legalActions與 tie-break 都保留。若 forward 為空，choices直接回原 movable，沒有把 detour 永久刪掉。

**必要繞路不被全局優先永久餓死**：單位執行 Move 後會從本回合合法 Move 消失；可前進單位逐一用完後，其他單位仍會進 fallback。新增窄 fixture 實際先選兵-4 (9,2)→(9,3)，再在同一回合選兵-0 (4,5)→(4,4)；第二步是 terrain距離增加、traffic距離下降的必要繞路，兩筆都經真 applyCommand 接受，Observation JSON 前後不變。log在 forward-detour-and-unreachable.log。這不是全體多回合活性證明，但能拒絕「只要別處曾可前進就永遠禁掉逆向detour」的直接回歸。

**NaN／不可達**：unitGoals 只接受 start traffic distance有限的 candidate。forward 的兩個嚴格 > 比較不會把 Infinity/Infinity 當前進；有paired-forward時 traffic progress有限且>0，其原score可有限計算。無forward時仍用原 score／Number.isFinite／合法EndTurn fallback。沒有新增 Infinity-Infinity 運算或 NaN 分數來源。完全已知、敵方目標在隔離地形外的窄 fixture 回傳合法EndTurn；不是為了假裝前進而穿越 mountain 或友軍。

**探索／敵方秘密**：新增條件只讀既有 Observation tiles/units/legalActions；沒有 GameState、canonicalHash、save/replay、對手ledger或完整terrain匯入。保留原 unknown terrain 處理和斥候 explore權重，不從未知owner推真相。15項回歸包含斥候探索與相同Observation下不同隱藏世界得到相同行動；沒有看到新的立即停止探索或秘密依賴。新排序仍不保證所有局面終將完成探索。

**成本**：沒有新增 BFS；Map增加O(goals)的引用與一次O(Moves×ownedUnits)篩選（owned.find的型態原scoreMove已有），sorting只處理forward子集或原movable。原有主要的每單位／目標 BFS成本沒變，未見新增漸近爆炸或跨回合累積記憶體。獨立prefix與wrapper約10–13秒是在與root長局併行下執行，不能拿它與root單次5.6秒直接宣稱效能改善或退化；長局實際成本仍應以root同版結果另報。

## 限制與建議

- paired-forward 改變全局出手順序，能消除這個prefix的動態友軍交通往返，但不是一個對所有敵我移動都單調的全局勢能證明；其他長週期、三格以上、1100指令以後的循環仍可能存在。
- diagnostic 取同一單位最近六次 Move，Attack/Capture清該單位track，Move本身無新增已知格且hp相同；其他單位或Research/ResolveRelic之間的資訊變化不在這項局部判定內。它是指定振盪形狀的診斷，不應當全局因果或必勝測試。
- 原 tests/** 沒有被弱化；新增wrapper保留真終局提前完成的合法分支。手工窄fixture只驗policy幾何分支，與真正createGame生成的1100 prefix證據分列。
- 窄fixture第一次誤把先行單位放上唯一通道，導致後續真交通圖被堵，正確回EndTurn；錯誤預期與輸出保留在 forward-detour-attempt1-blocked-fixture.log。後續把先行單位放到獨立通道後，驗證預期detour；產品source與舊測試都未因此調整。
- 狀態、save格式、API、reducer與玩法數值維持不變；舊replay是依已有command重建，這次policy調整不為舊檔案加入migration。新AI未來選擇不同，應保留本次source hash作重現身份。
- root seed010已用原800 EndTurn／40000 commands門檻完成：C5-seed010-paired.json/log exit1，164.178秒，800筆EndTurn、17,937 commands、winner=null，仍FAIL（輸出turn=801是初始turn1再加800次EndTurn）。長局source snapshot 6a7055…與本次最新source的AI bytes都為06402a…；差別是診斷／wrapper，不能歸因於另一版AI。本報告已實際讀取這份summary，不讀出或公開私有canonical資料；full100未重跑，仍不能宣稱過往玩法FAIL已消失。

詳細窄驗／來源紀錄都在外層 `evidence/independent-C5-policy-logs/`；沒有額外依賴、UI更動、長局程序、修改其他專案或對外送信。
