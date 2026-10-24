# PROJECT-4X v0.4｜非線性文明生存策略遊戲｜Design Review Pack

**2026-10-11 • DESIGN ONLY • USER CREATIVE DECISIONS CONFIRMED / IMPLEMENTATION NOT STARTED**

從小城邦探索起步，逐漸遇見中古奇幻、修行、工業、機械、異星乃至荒誕迷因文明。世界有單一可追溯起源，所有文明都以生存為動機，科技可非線性演化，弱勢文明能藉有限且有線索的反制機制翻盤，政權消失後文化仍能延續。**MVP 仍先是簡潔征服戰棋，而不是全部系統同步完成。**

## 必讀順序
1. [Agent 不變量](AGENTS.md)（v0.3 十項 invariant 原文保留）
2. [Superpowers 架構 Spec v0.4](docs/superpowers/specs/2026-10-11-project4x-world-v04-design.md)
3. [主創十項裁決簿](docs/38-user-decisions-and-open-questions-v04.md)
4. [實作界線 G1／G1.5](docs/35-g1-g15-experiment-and-gameplay.md) + [路線圖](docs/13-roadmap.md)
5. [資源與物理](docs/24-energy-metaphysics.md) + [文明代謝](docs/25-civilization-metabolism-resource-contract.md) + [神器翻盤](docs/26-asymmetry-comeback-and-artifacts.md) + [地圖公平](docs/27-asymmetric-mapgen-and-fairness.md)
6. [文明轉型](docs/28-civilization-transformation.md)、[外交](docs/29-contact-diplomacy-unions.md)、[亡國文化](docs/30-diaspora-culture-and-insurgency.md)、[生態](docs/31-ecology-scarcity-and-path-dependence.md)
7. [原點](docs/32-origin-truth-and-discovery-arc.md)、[荒誕語氣](docs/33-surreal-tone-meme-civilizations.md)、[世界層](docs/34-worldlayers-and-endgame.md)
8. [技術合約](docs/36-architecture-api-data-contracts.md)、[QA 矩陣](docs/37-review-risk-test-matrix.md)、[開源引用](docs/39-open-source-sourcing-v04.md)
9. [外部 Agent READ_ONLY 任務](agents/V04-INDEPENDENT-REVIEW-INSTRUCTIONS.md)、[實作前 Gate](agents/V04-CODEX-IMPLEMENTATION-GATE.md)
10. `docs/00..23` 為完整繼承的 v0.1/v0.3 設計背景，且附 v0.4 優先說明；`docs/adr/ADR-0001..0010` 為決策歷史與提案。

## 版本優先順序
使用者直接確認的創意決策 > `AGENTS.md` invariant 1–10 > v0.4 Superpowers Spec / `docs/38` / `docs/24..37` > v0.3 (`docs/15..23`) > v0.1 (`docs/00..14` 內的歷史條款)。工程 invariant 不可被敘事規格推翻。未確認的方案均維持 PROPOSED。

## 當前與未來
**G1 first playable**：24×24、1 人 vs 1 AI、3 單位與 3 科技、金幣抽象費用、Fog、村莊、征服勝利、未知金屬遺跡兩選一、簡潔 2.5D 地圖、可存檔與重播、**使用者真人完整玩一局**。
**G1.5**：無 UI 的三文明資源代謝、有限神器反制、智慧地圖出生與文化身份 schema 驗證。
**G2+**：低微操軍團、外交與異文明接觸、生態，後期文化勝利、流亡、星際層和原點揭露。

## 狀態及使用
此包不是 source repo/程式／已編譯遊戲／已審核商用素材。GitHub 未發布。文件 package hash 校驗不代表功能成功。其它 Agent 應先**只讀批判**，不可直接修改 v0.4 或擅自寫 code。
