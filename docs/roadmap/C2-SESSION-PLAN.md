# C2 GameSession 執行計畫

範圍已由主創批准；唯一 signature 為 docs/contracts/frontend-core-v1.d.ts，不重設計 API。

- [x] C2-A：tests/session.test.ts 先斷言 factory 與 capability 邊界缺失；再建立 src/session/contracts.ts、game-session.ts，Observation 分離且深凍結。命令：node --import tsx --test tests/session.test.ts。
- [x] C2-B：先寫成功 Research 的扣費、重送、異 payload、stale/version/generation、非法 Action、actor override 拒絕測試；再只以既有 applyCommand 提交。保留完整 save ledger 的對照。
- [x] C2-C：先寫 immediate initial、reentrancy、listener throws、unsubscribe、nested subscribe、dispose 測試，再實作通知與生命周期。不吞全域錯誤，隔離的 listener 錯誤留一般診斷。
- [x] C2-D：先用可控 scheduler 重現取消後殘留 callback、正常 AI 回合、決策 throw/no-action/safety pause；再抽 src/session/ai-driver.ts。chooseAction 只收 Observation；保留 1000 actions 上限與原策略。
- [x] C2-E：先寫 invalid import 保 timer/dirty、UTF-8 10MiB、未知版本、load/newGame 世代、save ack、replay 同後綴測試，再抽 persistence orchestration。parser/reducer/schema 不改。
- [x] C2-F：先寫七類事件與同觀測不同 hidden truth 的反例，再實作 src/presentation/events.ts；不接 GameState，不猜敵軍死亡。獨立 worker 只擁有 events 與其測試，主代理最後接線。
- [x] C2-G：先新增 main 不持 GameState／不呼叫 core 編排的邊界測試，再按函式搬 UI 接線；browser 強制遺跡、save/load/replay、新兵再行動與真正多點 touch。最後 check/test/build/qa:browser、獨立規格與品質審查、manifest/diff/commit。

每步保存 RED/GREEN 原始日誌到外層 evidence，runtime code 只在相應反例出現後加入。core 四檔、鎖檔、玩法數值與 AI policy 應 byte-identical。D2/D3 工作區不改；C0-01 guard 不採入且加 regression；C0-05/06 的 UI 修正留 Gemini，Codex只測合法未知 owner／政治中心資料。C2 完成後停止，不 push/main merge。

主要切片 RED/GREEN 與額外事後邊界驗證分列在 C2-IMPLEMENTATION-STATUS；G 完成仍以最後測試證據為準。1000次hook不是1000次核心玩法測試。
