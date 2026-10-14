# UI/UX 改造契約

USER_CONFIRMED：保留原2.5D／等角策略地圖；強調世界探索與未知文明；簡潔且層級清楚；降低單位操作負擔；電腦手機皆有合理流程。保留規則、Observation、Action及事件契約，不让前端改Canonical GameState；不依賴AI模型API；不改戰鬥/經濟/科技；mock明標，不當完成遊戲。

## 現況與可驗收改善

- 地圖：Canvas菱形76×42、原創地形/建築/兵種符號、迷霧、合法Move金線及可Attack框。可調材質、鏡頭、圖示與排版，仍只能讀已投影資料。
- 資訊：頂端金幣/下回合收入/半回合，側欄文明life、據點部隊、selection HP與常數、部隊清單、3科技、最新3筆手札。不要混淆隱藏敵方數量與己方資訊。
- 流程：選己兵→合法格移動→攻擊/占領；空己方site招募；Research按钮。必答遺跡只能ResolveRelic，Escape不可關，intel0禁用，顯示1/2/3實數。
- 回合：footer持續可見；AI期間玩家command禁用。1000 action上限只暫停AI driver，可繼續，不是世界時計/平手。
- 桌面：map＋側欄，sidebar可捲；keyboard N/方向/Enter/E/Home/Escape。手機：map在上、sidebar下，觸控目標44px以上，viewport最小320px。實體drag/pinch/keyboard reader驗收待辦。
- 保存：record dialog本機save/load、JSON輸出/匯入、replay驗證、新seed。壞檔先驗完整才replace；不要把save放公用雲端或公開view。

NOT_IMPLEMENTED：戰鬥傷害/反擊數值preview、策略批次命令、設定獨立畫面、逐幀replay player、非對稱文明UI、外交/文化/神器面板。可提出PROPOSED畫面；沒有核心供資料時不得假裝可操作。

驗收：4尺寸无橫溢出/操作不被footer遮；touch最低44px；zero console errors/warnings；鍵盤可cancel/select/act；保留modal鍵盤與focus；reduce-motion生效；save兩次reload續局无request collision；資訊相同時不洩漏未知世界。功能/視覺/效能/a11y各別記結果，7情境不涵蓋全a11y或FPS。
