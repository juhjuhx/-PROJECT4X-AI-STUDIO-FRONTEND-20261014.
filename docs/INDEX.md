# 文件權威與恢復索引

## 新Agent順序
README → AGENTS → handoff/PROJECT-STATUS（指向既有docs/PROJECT-STATUS）→ handoff/MASTER-TODO → handoff/NEXT-ACTION → 實際source/verification。

- Task唯一Ledger：[MASTER-TODO](handoff/MASTER-TODO.md)
- 發布URLs/merge/附件/CI：[RELEASE-STATUS](handoff/RELEASE-STATUS.md)
- README圖像：[來源／SHA／宣傳排版說明](media/readme/ASSET-MANIFEST.json)
- 路線：[ROADMAP](roadmap/ROADMAP.md)
- 本機整理：[WORKSPACE-INVENTORY](handoff/WORKSPACE-INVENTORY.md)
- 功能及證據：[FEATURE-MATRIX](handoff/FEATURE-MATRIX.md)、[KNOWN-DEFECTS](handoff/KNOWN-DEFECTS.md)
- 合作：[CONTRIBUTING](../CONTRIBUTING.md)、[MODULE-OWNERSHIP](contracts/MODULE-OWNERSHIP.md)

## 遊戲與世界
[GAME-RULEBOOK](game-design/GAME-RULEBOOK.md)／[WORLD-BIBLE](game-design/WORLD-BIBLE.md)／[CIVILIZATION-SYSTEMS](game-design/CIVILIZATION-SYSTEMS.md)／[CCTS-SPEC](game-design/CCTS-SPEC.md)／[DECISION-REGISTER](game-design/DECISION-REGISTER.md)／[DOCUMENT-AUTHORITY](game-design/DOCUMENT-AUTHORITY.md)。

[歷史來源精選](../history/README.md)保留33原件，並非全部歷史已讀。Canon/USER_CONFIRMED、PROPOSED、NOT_IMPLEMENTED、TESTED_PASS不可混用；新裁決局部覆寫舊決策，保留沿革。

## 工程接口
[FRONTEND-CORE-CONTRACT](contracts/FRONTEND-CORE-CONTRACT.md)、frontend-core-v1.d.ts；[API-CONTRACTS](architecture/API-CONTRACTS.md)、[SAVE-REPLAY](architecture/SAVE-REPLAY-CONTRACT.md)。src/session/contracts.ts只做唯一型別re-export；不是第二套接口。

## 驗證與公開投影

[Demo03 真人／實體手機試玩與發布Gate唯一紀錄](verification/DEMO03-PREVIEW/D03-009-PLAYTEST.md)；實測未執行維持UNVERIFIED，不以工程CI代答。
DEMO02為已交付本機候選證據，RELEASE02將記本輪fresh/CI/review；歷史C0–C5/R6不是當前全部PASS。scripts/verify-demo02.mjs專測Demo，原scripts/verify.mjs保留Full100。

歷史150份QA文件的公開副本已去識別，詳[PUBLICATION-PROVENANCE](verification/PUBLICATION-PROVENANCE.json)。它們的原logSha/sourceFingerprint仍指本機保留原件，不表示公開投影bytes相同；不公開private world或hidden trace。舊CURRENT、舊no-push及絕對路徑敘述不取代本輪授權/權威入口。

[依賴清單](research/DEPENDENCY-INVENTORY.md)、[License Matrix](research/LICENSE-MATRIX.md)、[第三方告知](../THIRD-PARTY-NOTICES.md)、[Asset Registry](art/ASSET-REGISTRY.json)。研究候選不是已整合；Addy技能為局部文件工具，未啟用安裝hooks。
