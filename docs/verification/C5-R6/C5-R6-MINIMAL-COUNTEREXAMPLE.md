# R6-01 最小反例

實際入口tests/ai-siege.test.ts；Candidate A最初七項tests含兩actor、支援Move→Attack／直接單擊角色、無fresh入城者、火力不足、不可通過地形及同Observation不同hidden truth／freeze／clone／穿插確定性。現行Candidate B另含第八項獨立審查發現的「直接清城仍釋放招募格，實際Capture→Recruit」回歸。

合成fixture：目標(2,2)為已知敵據點，守軍步兵hp2；fresh己弓兵(2,3)是唯一可入城者；fresh己步兵(3,1)有合法Move到可攻擊目標的格。原策略弓兵先射1傷而消耗資格；正確序列為步兵移位→傷害2擊殺→弓兵Move入城→Capture。所有動作逐步核對core observe().legalActions並applyCommand。這是最小規則fixture，不是generated-match SaveReplay或全局勝率證據。

真實來源為seed008 command11555／turn456／actor1；完整原Observation與trace只存專案外private first-move-support-window.json，SHA在後續證據索引。原替代據點控制變化已驗；尚未宣稱全局最早或整局收斂。

最初RED：舊policy4FAIL／3PASS；Candidate A GREEN：7PASS，當時整套187（原180＋7）。審查追加一項後A RED為7PASS／1FAIL；B GREEN為8PASS，現行整套188（原180＋8），沒有刪除任何既有測試。
