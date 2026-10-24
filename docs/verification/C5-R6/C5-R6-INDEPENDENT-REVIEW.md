# C5-R6 獨立審查

## Candidate A｜REQUEST_CHANGES

REVIEWER：`/root/r6_candidate_review`，clean context、唯讀；基線HEAD `5bd059b91a818f3f84c892df94cd57d8a3a66bdf`；實算AI SHA `15bc1ef14371f57a7d1ec3c3675f2c57f9274b4c4e006f363beefc4f0a7a19fe`。SCOPE：ai.ts增量、7個新測試、R6因果文件及game.ts相關合法性／傷害規則。

FINDING P2（Important）：direct clearance的early return繞過R2既有己方招募格調位分支。合成角色：己方據點上的支援弓兵、唯一fresh鄰接步兵入城者、hp1守軍、gold4，另留敵遠城避免終局。舊policy可由core接受Move→Attack→Move→Capture→Recruit；A僅Attack→Move→Capture，支援acted留在home，不能再招募。這是真正的補兵退化，不以局部占領成功掩蓋。

Reviewer親自實跑：focused7/7；私人原始window四步Capture；648個小型角色／兵種／地形／actor變形中460個實選清城案例皆六步內真Capture、倒序合法Actions／units首選一致；基線／A招募對照重現上述退化。探索測試harness首輪使用不存在的TypeScript runtime API失敗，改用Node stripTypeScriptTypes後完成；不是產品FAIL。這些是reviewer回報的實測，root未冒稱親自執行矩陣。

Root另外新增完整「清城後真招募」測試，`review-recruit-RED` exit1、7pass/1fail，明確得到Attack而非所需Move；完整log與receipt保留R6 private。修法沿用原gold／army cap／離開ownSite／移位後射程條件，不改權重或規則。

未發現其他已證實blocker。傷害不依射手位置、沒有LOS新規則；支援Move後仍可合法Attack。只回傳legalActions成員，不讀truth、不加入記憶或seed特例。

DECLINED_TO_JUDGE／UNVERIFIED：reviewer未重跑完整seed、Full100、browser、build、效能或R5 preservation seal；未判定全局最佳排程與跨回合收斂。矩陣並非所有世界的完備性證明。A的審查結論不可套用到後續修正版；待修正版複審。

## Candidate B｜局部APPROVE

同reviewer唯讀聚焦複審，實算AI SHA `939d641f000035489def1df7e3cdde040c35b31c58f5fcfd05b75e455a36fecc`。原P2修復、無新增finding：`firingMoveFor` 完整保留既有金幣、兵力上限、致命傷害、射手位於ownSite、目的地離開全部ownSite及移位後射程條件，兩種攻擊分支共用，回傳仍copyAction且只從legalActions取值。

Reviewer親自 `node --import tsx --test tests/ai-siege.test.ts tests/ai-stalemate.test.ts` exit0、17/17；stdin七組guard邊界exit0，低金幣、兵力封頂、目的地己據點／阻塞、射手不在己據點、非致命攻擊保持原條件。七組亦核對異hidden truth同Observation、freeze／clone／重複穿插、輸入不變、合法Action與core接受；私人原window四步Capture再次成立。

VERDICT：APPROVE僅限本次局部修正。DECLINED_TO_JUDGE／UNVERIFIED：未重跑長局、Full100、browser、check/build或性能，不判定整局收斂；A舊snapshot對局不得移作B證據。root另有B 188tests／check／build／prefix／D02收據，與reviewer實跑分列。

## 交付資料唯讀複核

同reviewer實算產品21／method15／tests20與A、B frozen bytes吻合，唯一產品變更ai.ts；當時公開20個gate逐值對receipt、log SHA吻合。B五局ledger／report與公開摘要一致：010終局SaveReplay true，008／021／064／051為TURN_LIMIT800且partial SaveReplay true，source／method unchanged，無worker／fixture failure；A021／064沒有完成row，不混入正式結果。R5 591檔size／SHA及公開Full100 JSON相符。

不只信任重建收據：reviewer從已核對checkpoint有界重播1381條既存指令（沒有新局，QA記憶體清除已驗ledger容器以減少重播成本，不作正式SaveReplay驗證），六筆observe逐值相符、B決策parity。首次／重建log亦逐bytes相同；覆寫事故已揭露，不冒充原始raw bytes保全。公開JSON未見canonical world、原Observation或大型世界陣列，合成座標與角色說明沒有真world洩漏。

VERDICT：APPROVE WITH NONBLOCKING DOC NIT，整體PARTIAL；P3為七項／187的早期A描述需明標，root已補B八項／188沿革。未核對最新串行microbenchmark、後續終稿或新bounded-CF分支每一步；未重跑完整測試、SaveReplay或長局。root對CF與性能有另行直接執行收據，不把reviewer意見當測試證據；R6-02根因仍UNVERIFIED。
