# 已知缺陷與驗收風險

## 高優先 D-01：AI整局無可靠終局（TESTED_FAIL，高信心）

來源src/core/ai.ts:28–153；真實headlessseed010本輪801半回合/19696command/winnernull，exit1；完整固定100相同source歷史62complete/38TURN_LIMIT。用 `PROJECT4X_QA_START_SEED=10 PROJECT4X_QA_GAMES=1 PROJECT4X_QA_WORKERS=1 PROJECT4X_QA_OUTPUT=/tmp/project4x-010.json npm run qa:headless`。不降低門檻、不给match設倒數、不合成winner。root本輪102.922秒，預算300秒。logs見TEST-MATRIX。

根因範圍：固定權重局部貪婪、佔位與巡查；已確認四角漏中央機制（D-02），不能宣稱已解釋010所有卡點。下一工程任務找010首個策略失效，保留合法觀測/commands最小反例，再小改AI，fixed100與verify驗收。

## 中優先 D-02：四角巡查不保證搜尋中央（TESTED_FAIL，高信心）

ai.ts:108–125；隔離docs/handoff/核心巡查反例.mjs，`node --import tsx docs/handoff/核心巡查反例.mjs`。1000全合法commands，431己方回合、139次Move，actor0仍從未看到中央(12,12)靜止敵兵、winnernull。**合成policyfixture**移除全部site/relic並設定已知地形，不能當正式可讀存檔或已證生成seed可達。exit0=反例成立。evidence/current/core-counterexample.txt為rootfresh重跑。修正方向：有覆蓋記憶的搜尋／戰略目標，而不是給未知敵座標作弊。

## 高優先 R-03：遺跡權利與最新主創裁決衝突（CONFIRMED規格落差）

現行game.ts授權首次己方回合visible，必答即選；歷史G1 D1正式明定如此，但本次使用者要求「發現權與取得權分離、實際抵達優先处置」。兩者都保存，最新設計是USER_CONFIRMED，程式仍舊實作。封存不修改規則。後續需規則版本化與fixtures/save相容方案，不能让AI Studio以文案暗改取得機制。DECISION-REGISTER有权威鏈。

## 中優先 R-04：過時進度／沒有Git提交（CONFIRMED）

原CONTEXT/README/memory仍RUNNING/19finished，最終100報告已FAIL。完整包保留原文，新MASTER入口覆蓋現場，不沿用session id查執行。Git196untracked/noHEAD/remote空；空diff不表示source已保存Git。兩ZIP＋逐檔hash保全這次版本。

## 其他PARTIAL/UNVERIFIED

- 真人完整局、實體手機、45–90分鐘目標、成熟戰略可理解性未驗。
- 完整非對稱生存經濟、政權篡奪、文化影響、改革革命分裂融合、資源交易、神器危險、星際與唯一起源真相沒有runtime。
- 存檔/回放完整含世界真相，非fog-safe公開artifact；沒有舊schema migration/逐幀player。FNV64checksum非安全簽章。
- main.ts有presentation/driver/persistence耦合與收入/遺跡值重複；最小adapter是PROPOSED，不在封存重構。
- 7e2e並非所有drag/pinch/a11y/FPS/戰鬥終局驗收；沒有lint設定。
- source沒有專案LICENSE；user本輪交接授權不等於對外開源或任意素材利用。候選GPL/混合CC須逐項審，不把reference當集成。

沒有修正任何產品缺陷；整體release readiness不可PASS。封包完整性驗證與產品可發布性分開。
