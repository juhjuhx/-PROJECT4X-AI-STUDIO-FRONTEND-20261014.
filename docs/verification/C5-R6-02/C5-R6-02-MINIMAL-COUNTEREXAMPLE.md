# C5-R6-02 最小反例

權威程式：[tests/ai-tactical-advance.test.ts](../../../tests/ai-tactical-advance.test.ts)。全部為6×6合成局面，不含私人種子或歷史座標。完整source及執行收據見SOURCE-MANIFEST與TEST-RESULTS。

| 反例 | 合法因果與期待 | RED／GREEN |
|---|---|---|
| T01 移後反擊 | 無現成Attack；合法Move後致命射擊移除可見威脅。原路線讓spent友軍被相同對手政策擊殺。 | B第一版5tests為2 FAIL／3 PASS；E保留正例 |
| 非致命敵軍 | 無法一擊清除時不使用捷徑 | E PASS |
| 無友軍受威脅 | 保留原路線 | E PASS |
| 現成Attack | 攻擊優先 | E PASS |
| 攻城預留fallback | 新捷徑不擾動原攻城預留 | C新增第六反例5 PASS／1 FAIL → D6/6 |
| T02 射手暴露 | 原core證實射位會被另一可見敵軍合法Move→Attack擊殺，原路線沒有同樣單回合機會。 | D新增第七反例6 PASS／1 FAIL → E7/7 |
| Fog／immutability／determinism | 同Observation不同hidden truth，deepfreeze、clone、重複及交錯呼叫同結果 | E PASS |

E用可見敵軍的move+range作保守排除，不宣稱敵方行動合法，也不限制原路線承擔必要風險。

真turn248的16個B分支證實8ET多存活1兵、HP多5、補兵成本相同，沒有佔領或情報收益。真turn47追加對照則顯示D的射手損失及補兵多6金，故增加T02並形成E。原始B／C／D與RED均保留。

局部反例TESTED_PASS、E195tests PASS；E seed008仍TURN_LIMIT，整局收斂TESTED_FAIL；新版Full100／T3／T6 UNVERIFIED，Alpha PARTIAL。

