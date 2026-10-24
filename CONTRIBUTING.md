# 貢獻與工程邊界

先按README/AGENTS/文件索引恢復狀態，從MASTER-TODO選一個可驗收Task，開獨立分支。先規格/反例，再最小實作與fresh測試；不要重建引擎或整檔覆蓋main。

玩家呈現只收GameplayPort/Observation；完整save與私有QA world不能進HUD、公開Replay或Git。執行 node scripts/check-publication.mjs 並檢查Git diff。這是窄範圍檢查，不代替人工安全審查。

新玩法必須包含批准來源、ruleset、資料/合法Action/Validator、核心、Observation/Session契約、AI、UI、正負例、Save/Replay相容與真Gameplay Journey。未批准數值可隔離實驗，不可成正式Canon。新內容/素材標示license、來源與fallback。

提交前 npm run check、npm test、npm run build，涉及玩法/呈現/發行時 node scripts/verify-demo02.mjs；Full100是另一Gate，不降低門檻。無真機/真人結果標UNVERIFIED。保留失敗與首次結果，不用skip/弱斷言取綠燈。

PR需清楚說明結果、來源commit、測試版本/指令/結果、未驗項與風險。通過CI與獨立review後才按授權合併；不要force push或移除其他worktree。原創部分MIT，第三方權利另列。
