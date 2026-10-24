# C2–C3 Integration Candidate 執行計畫

> For agentic workers：採 executing-plans；root單一整合writer，獨立worker只讀review／研究，不同代理不寫同一整合工作樹。

Goal：保留C2權威session，增量採納D3呈現並修P0/Fog/UI阻擋，形成可測分支後繼續C4-R0與C5-R0。
Architecture：唯一GameState/applyCommand不變；GameplayPort供HUD/Map，LocalPersistencePort只供可信檔案controls；Canvas2D/NativeDOM不改框架。
Spec：主創2026-10-18 Engineering Continuation Master Harness；既有docs/contracts與規則權威。

## Global Constraints

- 基線C2 e5bc16fedde9245e29284a4ec954299212089139；遠端main本次c21b16cd75572d069369f41426f7323c63c05083。
- D3 ZIP SHA9959a72a39c163a93c611651d8b761eff9d72193c21214d4fdbd898ecd3cb451；原包/quarantine不回寫。MIT正確根LICENSE不改。
- D Hybrid方向已批准，沿用D3原art，不自行重畫。無新依賴／玩法數值；不push/main merge。
- 文件重建明記RECONSTRUCTED_BY_CODEX，保留歷史。全局吞錯、原生selector patch禁止。

## 任務與驗收

- [x] R0：filesystem/Git/ZIP/契約恢復，修改程式前向使用者提交A–F狀態。
- [x] R1：文件同步＋fresh C2 check/test/build/browser、strict contract；獨立runtime審查。命令與結果保存在外層evidence。若真失敗先RED→最小修正。
- [x] R2：D3 quarantine核對＋原guard vm反例；保留失敗證據，C2組合root不採guard。重建3份客觀D3docs與來源／LICENSE精確路徑紀錄。
- [x] R3：先寫map owner own/enemy/neutral/unknown與異地center、draw-call Fog差分的失敗測試，再採D3 map並最小修正；只讀Observation，map readonly型別保留。
- [x] R4：函式級移植D3 DOM/render、CSS/HTML；保護C2 dispatch/files/AI接口，真port；先寫拒絕舊guard與HUD真action接線回歸。
- [x] R5：check/test/build/browser、Stage2斷言稽核（弱腳本不得充PASS）、Save/Replay/AI/Fog、安全／視覺／touch。新source manifest與真截圖，獨立review，修必要缺陷後checkpoint commit。
- [x] C4-R0：真E2E 據點→駐軍移出→招募→EndTurn→新兵Move→Research→Attack→Capture，透過真UI與合法save/replay；不加城市數值。完成後列城市候選PROPOSED待裁決。
- [x] C5-R0：固定seed010重現/決策trace/進展metrics/loop；定位首個可證失效點。保留舊門檻與AI Observation，未修則TESTED_FAIL；不把局部反例當full100新終局率。
- [x] Handoff：更新NEXT-ACTION/權威入口/規則roadmap與下一個Agent指令；所有結果綁定source/HEAD，無排程不宣稱自動恢復。

## Review Focus

1. 下載不ack dirty、storage失敗保局、非同步File stamp不得回歸。
2. 相同Observation/不同truth不改canvas drawcalls/events；未知owner不可變敵色。
3. 真touch雙pointer與相機比例；不可只mouse或字串。
4. UI只讀可見資料，DOM renderer不保有canonical state。
5. guard移除後first-party error可觀察，禁止以消失的console error當修復。

2026-10-18結果：C3工程candidate TESTED_PASS；C4-R0現有玩法旅程TESTED_PASS（非新城市系統）；C5-R0診斷完成但seed010 TESTED_FAIL、因果PARTIAL、策略未修。此勾選表示已交付該階段限定證據，不表示遊戲整體通過。

C5後續：主創選定無記憶最小修補；paired-potential保持原繞路test、prefix0loop與104tests通過。完整010仍FAIL，新full100未跑；下一C5-R2定位攻城/補兵/佔領僵持，不擅自擴規則。
