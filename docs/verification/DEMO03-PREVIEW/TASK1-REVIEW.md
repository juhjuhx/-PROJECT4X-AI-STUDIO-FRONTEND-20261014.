# Demo03 Preview Task1 Independent Review

REVIEWER：demo03_ruleset_seams（獨立只讀）；VERDICT：APPROVE。範圍：固定Registry/G1相容基準，不含Task2 deliberate RED與後續玩法。

已核對validator exact keys/數值/引用/DAG/效果白名單、prototype ID拒絕及巢狀freeze；SHA涵蓋除自身以外的所有Definition。validateRuleset僅驗hash格式，固定bundle摘要由Node crypto測試驗證，不是外部任意包載入器。

reviewer親跑 node --import tsx --test tests/rulesets.test.ts tests/legacy-compatibility.test.ts：7 PASS、0 FAIL/skip；npm run check PASS。另使用已發布cd59f348的三個Core檔重算4個合成recipe的Save/Replay SHA與canonical hash全部相符。未寫source或輸出world。

完整240 suite是在diagnostic-only測試訊息TS修正前；修正後focused7/check/build對應當前Task1 bytes，未宣稱兩個來源相同。收據及logSHA均已核對。尚未驗收新玩法runtime、Save2/Replay2、AI、Browser、平衡、真人或真機。
