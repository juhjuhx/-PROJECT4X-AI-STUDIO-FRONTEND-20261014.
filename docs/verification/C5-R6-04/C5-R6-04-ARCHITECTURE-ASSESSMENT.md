# Strategic Coordination Architecture Assessment｜C5-R6-04

**狀態：PROPOSED。此文件評估候選，沒有批准或實作新策略層。**

現有chooseAction(Observation)保持Stateless／Deterministic／Observation-only；只回當步legalActions中的一個Action。GameState／applyCommand仍為唯一權威。原介面與版本不改。

## 證據所支持的問題

command6004展示移動的友軍交通外部成本：兩個B落點局部score同為94，global forward排除短期離目標較遠的落點；該落點可保留A的forward。但32ET收益同時涉及B改走別條路與後續全軍變化，16態縮減也沒有保留原完整軍事向量。現有資料不足以定義普遍最優讓路權重。
具體來源：src/core/ai.ts:270目標候選／交通距離、:298 scoreMove、:311全軍forward、:325穩定排序；src/core/game.ts:133 legalActions、:149 observe、:206 applyCommand。實際行號應以本輪Source Manifest對應bytes為準。

## 候選比較

| 候選 | 可處理的既有現象 | 尚不能保證 | 效能與接口／保存影響 |
|---|---|---|---|
| 現行單步Utility AI（IMPLEMENTED） | R2調位、R3交通繞路、R4frontier、R6-01清城、R6-02反擊已有測試 | 無多單位移動外部成本；6004及整局不收斂未解 | 現有介面／保存不變；本輪沒有新完整對局效能比較 |
| 無記憶協同單位排序（PROPOSED） | 每次由合法Observation建立「B落點會令A前進可用性下降」依賴；可處理可觀測的當回合交通 | 不保證長期攻城收益；無合法讓位、必要繞路、可見火力風險須排除；已移動B當回合無法補救 | 可保留chooseAction簽名與Save/Replay；比較候選×友軍的路徑代價可能大，先量候選／search expansions與median/p95，不能無量測報毫秒 |
| 分層目標＋部隊任務分配（PROPOSED） | 本回合協同目標、前線／支援分工、減少多人爭同一落點，適合另查siege窗口 | 無記憶重算仍可能跨回合切換；未知敵軍不應被補全 | 純Observation重算可不改接口／保存；若要求跨回合固定任務或隱藏歷史記憶，必須另立契約及Save/Replay設計，不能偷偷加欄位 |
| 有界多單位戰術規劃（PROPOSED） | 比較合法讓位→前進、Attack→進城等當回合協同序列 | 不知道對手未來決策與未知地形；超短窗口仍會漏戰略效益 | 分支成本約隨B^depth增長，需上限及fallback；正式policy不可呼叫帶canonical truth的QA rollout，需明確Observation局部模型／不確定性邊界；保存可不變 |

## 建議的隔離研究切片

優先評估第二種，但只做獨立候選函式與私有反事實，不先改正式policy。原因是它可沿用使用者已選的無記憶方向與目前接口；本輪沒有證據授權整套替換。
流程如下，全部都是PROPOSED：

```text
合法 Observation
  → 現有優先級（Capture / Attack / 招募 / 科技等）
  → 現有可達目標與當步 legal Move
  → 友軍移動依賴：哪些候選保留／破壞另一友軍的合法前進？
  → 成本分列：自身繞路、已知火力、據點阻塞、探索損益
  → 僅在有正負最小反例時選擇協同排序
  → 回傳一個合法 Action
  → core 執行 → 下次重新取 Observation（沒有持久計畫）
```

入場條件：先設計並驗證收益／代價可判定的正面最小fixture，另配必要繞路、撤退、可見火力、沒有讓位空間、A已moved、無實際交通傷害等負面fixture。原E必須真正RED；不能把本輪診斷assert或ENOENT當產品RED。
保持ID穩定排序，保序改名與重排ID敏感度分開。平移要同步地形／mask／實體，區分有邊界裁圖與已知阻擋padding。若沒有可辯護的局部預期選擇，就改查實際軍事前線，不增加神奇分數。
驗證順序：最小RED→候選GREEN→195既有回歸／Fog／確定性／輸入不變→D02／prefix→008與010自然終局（800／40000及終局Save/Replay）→必要021／064／051。只有新的整局證據成立才規劃新Full100，絕不覆寫R5。
需要跨回合承諾才有效時，停止本切片並提出獨立架構裁決；不以本輪PROPOSED當批准。Browser Q-ICON另交Gemini；不與AI資料或規則改動綁在同一修補。
