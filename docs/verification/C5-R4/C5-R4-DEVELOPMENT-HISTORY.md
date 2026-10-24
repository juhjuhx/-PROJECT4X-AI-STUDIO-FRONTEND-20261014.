# C5-R4：Observation-only探索／D-02修復 ledger

BASELINE：2d7da2a5808ddd58292f160a7a908bc7347e8279；integration/project4x-c3；恢復clean、72/72 manifest吻合；portable8f18bd6e…a2a7e5，AIc16c640e…caddd。R3結果只作歷史，不當本輪PASS。

TASK：只改src/core/ai.ts，新增必要tests／非產品診斷／文件。禁止GameState／ruleset／save/replay/session/UI/main／數值／勝負／上限改動；root唯一產品writer。工具映射：filesystem/git/test→exec_command；patch→apply_patch；參考→web.run；獨立唯讀分工→collaboration agents。已讀using-superpowers/systematic-debugging/TDD/writing-plans/executing-plans/review/verification與code-work/code-verification，按當前階段實際執行。

## 計畫與現況

- [x] 恢復Git／manifest／規則／R3來源。src/core/observation.ts MISSING；實際observe在game.ts:149。
- [x] 原D02先fresh RED：C5-R4-D02-RED，exit1／1000commands／seen=false／winnernull。
- [x] 根因分流：原fixture全圖explored/surveyed=true，unknown=0，只走四角patrol；起始合法Move12個但原目標就是自身(2,2)，EndTurn。不是未知frontier分支。
- [ ] 最小RED：已知七格廊道偵巡；未知區域已被已知山圈包圍時，合法視野vantage仍應可選；Fog／不可達／友軍／戰術／確定性。
- [ ] 最小GREEN：已知可走vantage＋真sight與未知幾何；無目標全已知區域沿用ownTurns做均勻coverage偵巡，無持久記憶／truth。
- [ ] check/test/build/prefix/D02與新測試；保留舊反例。
- [ ] 與R3同fixture／環境性能對照：candidates、BFS expansions、median／p95；獨立審查。
- [ ] 小gate成立才固定seed010原800/40000，真終局Save/Replay；若回歸保留FAIL再診斷。
- [ ] 文件／manifest／checkpoint；full100預算獨立C5-R5，Alpha不升PASS。

## 設計邊界（待測，不冒稱實作）

未知探索：KnownTile.terrain非null且可走的觀測位置，在UNIT_STATS真sight（含斥候pathfinding）內有unknown幾何格；路線只用known可走terrain，實際Move只取legalActions。不得知道unknown內容。既有site/enemy/relic及攻擊／佔領／科技／招募優先保留。

已知區域偵巡：D02無unknown，仍有explored但目前不可見區域；需要修正既有四角coverage。沿用可重播faction.ownTurns與合法已知地形，均勻掃描，不硬編世界中心／敵兵位，不新增記憶。只在沒有其他戰略目標／未知frontier時採用；component全可見則不為偵巡空走。

參考：https://www.redblobgames.com/pathfinding/a-star/introduction.html 與 implementation.html；本專案四向等成本，評估沿用BFS，不引入框架或複製外部程式。演算法依實際Observation重寫，非套未知schema。

目前產品仍R3，後續ROOT CAUSE／RED-GREEN／測量／結果逐步補入。

## 13:20 UTC checkpoint（尚未完整驗收）

CURRENT_AI：0197e65b05cac667478d70b807f8b19c5931b59d37e21006fb4498ce84512759；source snapshot4bb7291301c46962acf78659ffa2bdbe372a07ff9988620fd9a4195c774ae890。當前HEAD仍2d7da2a，ai.ts＋新ai-frontier.test.ts＋R4文件尚未提交；沒有覆寫原test。

第一版63d643…：D02在原1000上限內673commands／seen=true／winner0，但完整suite121/122，舊斥候側翼斷言FAIL；獨立review也找到友軍佔據vantage被當成可抵達source，造成合法繞路被忽略。舊失敗log保持。

新增occupied-vantage RED（9pass/1fail），最小反例scout(5,2)／低視野spent友軍(6,2)／unknown(9,2)，真合法Move(6,1)→下一己回合(7,1)可揭露。修正只對explore source：已佔據source受traffic排除；每個vantage初始cost為合法未知幾何最小距離(1..真sight)，用known-only整數bucket Dijkstra傳播，避免所有vantage=0造成Move1/Move2平台、既有側翼探索被adjacentEnemy分數蓋過。不是提高任意權重。

explore distance是『已知可走route＋幾何視距gap』potential，不假稱unknown可移動；actual Action只取legalActions。filter source與刪交通邊令potential不小於同sources無佔位的optimistic bound，R3嚴格剪枝保持。普通site/enemy source允許occupied目標的既有語意不變。

第一版性能：R3交通7.389→8.629ms、未知邊界1.668→1.026ms、全已知巡邏2.091→5.469ms（median，後者2.6倍）；已知巡邏40兵重算component造成BFS64→143。只在單次呼叫內memo component與同waypoint terrain field；不保存跨回合資料。新版本已fresh42/42 focused（含全部新10、R2/R3、core側翼）及check PASS，正在同環境重測性能。新hash完整suite／D02／prefix／seed010還UNVERIFIED；不要沿用第一版PASS。

NEXT：等待性能slot完成→新hash完整check/test/build/prefix/D02→seed010(800/40000)→最終獨立review→文件/manifest/checkpoint。full100暫不跑，另C5-R5驗證計畫。

## 2026-10-20 新鮮續作：primary frontier等價收斂

0197完整suite122/123、prefix1loop FAIL，D02仍PASS。私有100turn trace2373筆（正式policy parity逐筆成立）在cmd550/602/655/709/760/814定位兩site目標切換；同六筆Observation的R3 baseline也選相同行動，所以沒有在本輪改軍事target政策。

Ruling：保留R3一般探索的距離／優先語意，以known adjacent-unknown frontier＋seed cost1表示舊unknown boundary seed0。證明：從known端點到unknown最短路第一次入unknown就已抵達舊boundary，故之前全是known可走路；反向known route+1也對應舊路。blocked known source必排除，普通權重／舊boundary代表tile/tie保留。只有該unit沒有terrain可達primary時才用真sight幾何vantage fallback；不因另一component有frontier而封住本component。巡查coverage／單次cache保留。這是縮小policy drift，非任意調權重／門檻。

當前AI82618e54129d96274c2dd5d4a8c1a430bf17714d4b4aba1d7cbf122b8004005e；snapshotb33f0d9268c250a937023b908e590492e4841f426fadb58c47202d90a20647ce。fresh123/123、check/build、prefix1100/0loops與D02673/seen=true/winner0 PASS。seed010／最終review與perf尚待完成；不將其他候選PASS沿用到當前。
