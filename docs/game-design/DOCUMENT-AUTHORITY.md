> 2026-10-24 Demo恢復：已補回33份世界／裁決原件精選及SHA，見 [歷史索引](../../history/README.md)。下文舊「完整history」敘述是歷史封存狀態；本repo不是完整舊包，未納入的連結可能仍缺檔。現行規則與裁決權威不變。

# 文件權威、版本對照與完整歷史索引

盤查日：2026-10-13（Asia/Taipei）。範圍為原 `<LOCAL_PROJECT_ROOT>/` 的設計版本、設計ZIP、第二／三／四輪審查、parent `PROJECT-4X.md` 與現行 MVP 契約／source。全程只讀來源、只寫本交接設計文件，沒有測試或產品修改。**不使用 mtime 判斷批准先後或權威。**

## 三種權威不可混用

1. **設計意圖**：本輪明確使用者確認 [USER-REQUEST-DECISIONS](../handoff/USER-REQUEST-DECISIONS.md) → 較早的主創直接裁決（十項、GM、EXILE、POLITY、CCTS-D1/D2/D3）→ 有明確適用範圍的設計整合稿 → 未核准提案／審查建議。
2. **已實作行為**：交接 `src/core/game.ts` 的 `applyCommand` 與相關 core 為現況事實；`docs/實作契約.md` 是自主MVP契約，描述不一致時以source查行為並記差異。這不賦予程式推翻主創意圖的權力。
3. **驗收結果**：綁定源碼／規則版本的命令和證據，獨立於設計身份。文件寫CONFIRMED、測試綠燈、能開畫面，不自動等於本人完成一局／手機／45–90分鐘驗收。

本次輸出的 WORLD-BIBLE、CIVILIZATION-SYSTEMS、CCTS-SPEC、DECISION-REGISTER 是**引用式整理**，沒有把新的解釋偷偷提高到原始主創裁決。發現／取得衝突明確列出；舊規則source保全，新規則意圖單列待落地。

## 版本比較及正式局部覆寫

| 版本／資料 | 原件性質 | 有效設計貢獻 | 後續覆寫／限制 |
|---|---|---|---|
| PROJECT4X-PHASE1（v0.1） | design-only；無程式／測試 | 原創輕量4X、大地圖、外交政治信仰、多勝利、跨平台、可換美術、單權威與確定性 | v0.3縮G1到24×24雙方；舊48×48四方六兵／三勝利不是G1 gate，長期意圖保留 |
| PROJECT4X-V03 | 非線性共存／生存／可玩優先設計包 | docs/15–23、首次真人局、ContentPack／軍團／AI觀測分界 | v0.4覆寫唯一原點方向、代謝／神器／身份；其他歷史保留 |
| PROJECT4X-V04 | PROPOSED_USER_REVIEW_WITH_CONFIRMED_CREATIVE_DECISIONS；NOT_STARTED | docs/38十項主創、24–34長期系統、world兩種子、35探針、ADR-0007–0010 | 不可把整包69文件都叫USER_CONFIRMED；首都即敗後被CCTS覆寫；G1.5僅headless後改雙軸 |
| G1 START 20261011 | append-only readiness／mechanical TARGET／plan；no product code | 軍事數值、三fixture、觀測保存分界、G1.5-P本人非對稱驗收、G3 blocking | 延後inbox／剛好3格／首都即勝後被RELIC-D2、GM、CCTS覆寫；其餘數值仍TARGET |
| 第二階段／第三輪審查 | 原始交付＋修訂文件＋合同反例；沒有runtime | RELIC-D1/D2正式記錄、事件投影、動態fog、合法載入、分支續局、driver／100局診斷 | 第四輪覆寫首都終局和延後inbox；源文件已加覆寫橫幅；不能把NOT_RUN例當PASS |
| G1 prototype 20261011 | CCTS補充引用的舊原型／11/11 QA | 僅能確認補充文件曾描述它 | **source及QA原件未取得**；不是本MVP，不轉載其PASS，不補造缺失源碼 |
| CCTS 20261011 原始補充 | v0.4 Decision Addendum／direct-user-confirmed方向；NOT_IMPLEMENTED | GM-01–15、EXILE-01/02、POLITY-01、國／文明／席位分離 | pending D1/D2/D3細則後來由直接回答關閉；D4/D5細則未自動全批准 |
| 第四輪 G1 裁決整合稿 | DESIGN INTEGRATION DRAFT；沒有產品改動 | U OR S、皆零淘汰、免費主動中心、無流亡倒數、保留歷史RELIC-D1可見取得 | 與本輪「實際抵達優先處置」發生明確局部衝突；必須版本化落地 |
| 2026-10-12 候選 | parent記憶曾提擬產候選包 | 已有MVP source／dist及工程證據 | **沒有找到具名候選ZIP／交付說明**；parent明說尚未產生，不能給不存在包提升權威 |
| 現行 MVP 0.1.0／g1-ccts-1 | 全新獨立source、版本化自主工程預設 | 24×24、軍事實作／fog／立即遺跡／流亡中心／保存；1人1AI | 非完整世界/CCTS；visible取得與新裁決不同；最新100局62終局38超限FAIL |
| 本輪明確使用者確認 | U-LATEST原始請求摘錄 | 重申十項世界、十九項系統／平台與發現取得分離 | 只覆寫相衝突條款；不自動等同所有長期開發授權或runtime完成 |

## 正式 supersession 登錄

見 [DECISION-REGISTER 的 S01–S09](DECISION-REGISTER.md#正式-supersession-紀錄)。具體歷史源鏈：

- Phase1 → v0.3／v0.4 只縮首次可玩範圍，不刪除長期設定。
- v0.3「未知原因可以永不選擇」→ v0.4 docs/32／38與ADR-0010 唯一可揭露原點。
- v0.4／G1 START 的「失都即敗」「可延後inbox」→ CCTS EXILE-01／GM-02，再由第四輪CCTS-D1/D2/D3及MVP契約具體化。
- G1 START「exactly 3」→ 第三輪RELIC-D2＋CCTS GM-03最多3／0停用情報。
- v0.4 G1.5僅headless → G1 START §9／CCTS GM-09/10 本人非對稱雙軸、G3前blocking。
- 第三／四輪RELIC-D1「不是先抵達」「GM02沒有覆寫D1」→ U-LATEST明確發現取得分離／抵達優先。**新意圖明確優先，source仍舊版；不重寫舊史。**
- 早期逐項審批／等舊原型才施工 → 當前明確直接先MVP授權；仍無外部repo／push／部署／付費／無關配置授權。

`CHANGELOG`、`DESIGN-BASELINE`、`AGENTS`、正文覆蓋橫幅、決策JSON與主創回答一起判斷範圍；發佈日期或mtime都不能單獨充當批准。

## 交接歸檔位置與原件完整性

全部歷史設計副本在 PROJECT-4X-MVP 根相對 `history/Fake-Polytopia/`。這份目錄由根代理複製；本設計工作者只生成索引與解釋。保留實體目錄與ZIP兩者：實體V03／V04含manifest外OpenCode審查，第二階段ZIP與後來修訂實體資料可能不同。原ZIP是不可改的交付快照，後續實體修訂不是「hash壞了」的同義詞；必須各自追溯。

必保留完整目錄：`PROJECT4X-PHASE1/`、`PROJECT4X-V03/`、`PROJECT4X-V04/`、`第二階段審查-20261011/`、`第四輪CCTS審查-20261011/`。頂層保留5個設計ZIP、parent PROJECT-4X.md 與V0.4獨立設計審查。MVP本身的原證據／修改前現場ZIP留在產品 `證據/`，不是新設計批准。

**有意排除**：`.DS_Store` 不是設計資料；parent `DSH-V3-AUDIT-2026-10-12.md` 是個人DSH／技能runtime審計，含本機配置／憑證文件路徑與hash，主題與遊戲設計無關，不帶入設計歷史。未刪除來源檔。設計原件仍可能含用戶設備型號／本機路徑；這只是本機工程交接，沒有完成對外發佈個人資料審查。公開分享前應另產經核對的副本，不改封存原件。

## 核對來源的最低入口

| 要判斷的事 | 最低閱讀路徑 |
|---|---|
| 世界正史／工作名字 | WORLD-BIBLE；V04 docs/38、32及world/兩文件 |
| 文明經濟／轉型／外交／文化 | CIVILIZATION-SYSTEMS；V04 docs/24–34、CCTS原補充 |
| G1是否流亡、何時淘汰與建中心 | CCTS-SPEC；第四輪整合稿§2–3；game.ts lifecycle／legalActions |
| 遺跡先看見還是先抵達 | 最新使用者R01/R03；第三輪§4；第四輪§4；game.ts updateKnowledge |
| 是否已經完成／可發佈 | 根交接的工程證據與真人記錄；不能只看歷史MANIFEST／README |
| 舊原型11/11是否可援引 | 不可；原件未取得、功能與ruleset不同 |

## 完整逐檔歷史索引

以下每條都以 PROJECT-4X-MVP 根相對路徑列出；ZIP內成員另用 `ZIP名::成員路徑`，避免假裝已經解壓成可執行產品。範圍為上述全部目錄及頂層設計原件，排除`.DS_Store`。索引不以文件存在證明內容已批准；狀態與supersession以上表和決策簿為準。

### PROJECT4X-PHASE1（25 檔）

- [`history/Fake-Polytopia/PROJECT4X-PHASE1/AGENTS.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/AGENTS.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/CHANGELOG.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/CHANGELOG.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/DESIGN-BASELINE.json`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/DESIGN-BASELINE.json>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/HANDOFF-START-HERE.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/HANDOFF-START-HERE.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/MANIFEST.json`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/MANIFEST.json>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/R0-RESEARCH-engine-license-2026-10-11.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/R0-RESEARCH-engine-license-2026-10-11.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/README.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/README.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/00-vision-and-decisions.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/00-vision-and-decisions.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/01-game-design.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/01-game-design.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/02-rules-and-economy.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/02-rules-and-economy.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/03-diplomacy-faith-politics.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/03-diplomacy-faith-politics.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/04-content-and-victory.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/04-content-and-victory.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/05-system-architecture.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/05-system-architecture.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/06-performance-engineering.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/06-performance-engineering.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/07-ai-opponents.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/07-ai-opponents.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/08-art-pipeline.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/08-art-pipeline.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/09-platforms-and-ux.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/09-platforms-and-ux.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/10-agent-workflow.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/10-agent-workflow.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/11-review-and-acceptance.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/11-review-and-acceptance.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/12-dependency-evidence.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/12-dependency-evidence.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/13-roadmap.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/13-roadmap.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/14-risks-and-open-questions.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/14-risks-and-open-questions.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/adr/ADR-0001-technology.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/adr/ADR-0001-technology.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/docs/adr/ADR-0002-determinism.md`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/docs/adr/ADR-0002-determinism.md>)
- [`history/Fake-Polytopia/PROJECT4X-PHASE1/evidence/open-source-audit.json`](<../../history/Fake-Polytopia/PROJECT4X-PHASE1/evidence/open-source-audit.json>)

### PROJECT4X-V03（41 檔）

- [`history/Fake-Polytopia/PROJECT4X-V03/AGENTS.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/AGENTS.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/CHANGELOG.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/CHANGELOG.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/DESIGN-BASELINE.json`](<../../history/Fake-Polytopia/PROJECT4X-V03/DESIGN-BASELINE.json>)
- [`history/Fake-Polytopia/PROJECT4X-V03/HANDOFF-START-HERE.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/HANDOFF-START-HERE.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/MANIFEST.json`](<../../history/Fake-Polytopia/PROJECT4X-V03/MANIFEST.json>)
- [`history/Fake-Polytopia/PROJECT4X-V03/README.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/README.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/V03-AUDIT-opencode-2026-10-11.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/V03-AUDIT-opencode-2026-10-11.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/00-vision-and-decisions.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/00-vision-and-decisions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/01-game-design.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/01-game-design.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/02-rules-and-economy.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/02-rules-and-economy.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/03-diplomacy-faith-politics.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/03-diplomacy-faith-politics.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/04-content-and-victory.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/04-content-and-victory.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/05-system-architecture.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/05-system-architecture.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/06-performance-engineering.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/06-performance-engineering.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/07-ai-opponents.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/07-ai-opponents.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/08-art-pipeline.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/08-art-pipeline.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/09-platforms-and-ux.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/09-platforms-and-ux.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/10-agent-workflow.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/10-agent-workflow.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/11-review-and-acceptance.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/11-review-and-acceptance.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/12-dependency-evidence.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/12-dependency-evidence.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/13-roadmap.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/13-roadmap.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/14-risks-and-open-questions.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/14-risks-and-open-questions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/15-world-bible-nonlinear.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/15-world-bible-nonlinear.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/16-survival-and-discovery.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/16-survival-and-discovery.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/17-first-playable-spec.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/17-first-playable-spec.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/18-faction-evolution-and-content-packs.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/18-faction-evolution-and-content-packs.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/19-army-command-and-low-micro.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/19-army-command-and-low-micro.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/20-open-source-integration.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/20-open-source-integration.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/21-system-contracts-v03.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/21-system-contracts-v03.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/22-playtest-metrics-and-review.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/22-playtest-metrics-and-review.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/23-v03-design-decisions-and-questions.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/23-v03-design-decisions-and-questions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0001-technology.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0001-technology.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0002-determinism.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0002-determinism.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0003-nonlinear-civilizations.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0003-nonlinear-civilizations.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0004-playability-first.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0004-playability-first.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0005-projection-renderer.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0005-projection-renderer.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0006-portable-workers.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/adr/ADR-0006-portable-workers.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md`](<../../history/Fake-Polytopia/PROJECT4X-V03/docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03/evidence/MANIFEST-v0.1.json`](<../../history/Fake-Polytopia/PROJECT4X-V03/evidence/MANIFEST-v0.1.json>)
- [`history/Fake-Polytopia/PROJECT4X-V03/evidence/open-source-audit.json`](<../../history/Fake-Polytopia/PROJECT4X-V03/evidence/open-source-audit.json>)
- [`history/Fake-Polytopia/PROJECT4X-V03/evidence/open-source-review-v03.json`](<../../history/Fake-Polytopia/PROJECT4X-V03/evidence/open-source-review-v03.json>)

### PROJECT4X-V04（70 檔）

- [`history/Fake-Polytopia/PROJECT4X-V04/AGENTS.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/AGENTS.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/CHANGELOG.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/CHANGELOG.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/DESIGN-BASELINE.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/DESIGN-BASELINE.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/HANDOFF-START-HERE.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/HANDOFF-START-HERE.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/MANIFEST.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/MANIFEST.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/README.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/README.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/V04-AUDIT-opencode-2026-10-11.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/V04-AUDIT-opencode-2026-10-11.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/agents/V04-CODEX-IMPLEMENTATION-GATE.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/agents/V04-CODEX-IMPLEMENTATION-GATE.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/agents/V04-INDEPENDENT-REVIEW-INSTRUCTIONS.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/agents/V04-INDEPENDENT-REVIEW-INSTRUCTIONS.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/00-vision-and-decisions.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/00-vision-and-decisions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/01-game-design.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/01-game-design.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/02-rules-and-economy.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/02-rules-and-economy.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/03-diplomacy-faith-politics.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/03-diplomacy-faith-politics.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/04-content-and-victory.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/04-content-and-victory.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/05-system-architecture.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/05-system-architecture.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/06-performance-engineering.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/06-performance-engineering.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/07-ai-opponents.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/07-ai-opponents.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/08-art-pipeline.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/08-art-pipeline.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/09-platforms-and-ux.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/09-platforms-and-ux.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/10-agent-workflow.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/10-agent-workflow.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/11-review-and-acceptance.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/11-review-and-acceptance.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/12-dependency-evidence.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/12-dependency-evidence.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/13-roadmap.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/13-roadmap.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/14-risks-and-open-questions.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/14-risks-and-open-questions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/15-world-bible-nonlinear.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/15-world-bible-nonlinear.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/16-survival-and-discovery.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/16-survival-and-discovery.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/17-first-playable-spec.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/17-first-playable-spec.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/18-faction-evolution-and-content-packs.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/18-faction-evolution-and-content-packs.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/19-army-command-and-low-micro.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/19-army-command-and-low-micro.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/20-open-source-integration.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/20-open-source-integration.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/21-system-contracts-v03.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/21-system-contracts-v03.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/22-playtest-metrics-and-review.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/22-playtest-metrics-and-review.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/23-v03-design-decisions-and-questions.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/23-v03-design-decisions-and-questions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/24-energy-metaphysics.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/24-energy-metaphysics.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/25-civilization-metabolism-resource-contract.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/25-civilization-metabolism-resource-contract.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/26-asymmetry-comeback-and-artifacts.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/26-asymmetry-comeback-and-artifacts.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/27-asymmetric-mapgen-and-fairness.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/27-asymmetric-mapgen-and-fairness.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/28-civilization-transformation.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/28-civilization-transformation.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/29-contact-diplomacy-unions.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/29-contact-diplomacy-unions.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/30-diaspora-culture-and-insurgency.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/30-diaspora-culture-and-insurgency.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/31-ecology-scarcity-and-path-dependence.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/31-ecology-scarcity-and-path-dependence.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/32-origin-truth-and-discovery-arc.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/32-origin-truth-and-discovery-arc.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/33-surreal-tone-meme-civilizations.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/33-surreal-tone-meme-civilizations.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/34-worldlayers-and-endgame.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/34-worldlayers-and-endgame.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/35-g1-g15-experiment-and-gameplay.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/35-g1-g15-experiment-and-gameplay.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/36-architecture-api-data-contracts.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/36-architecture-api-data-contracts.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/37-review-risk-test-matrix.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/37-review-risk-test-matrix.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/38-user-decisions-and-open-questions-v04.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/38-user-decisions-and-open-questions-v04.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/39-open-source-sourcing-v04.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/39-open-source-sourcing-v04.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0001-technology.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0001-technology.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0002-determinism.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0002-determinism.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0003-nonlinear-civilizations.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0003-nonlinear-civilizations.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0004-playability-first.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0004-playability-first.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0005-projection-renderer.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0005-projection-renderer.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0006-portable-workers.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0006-portable-workers.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0007-civilization-metabolism.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0007-civilization-metabolism.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0008-counterplay-and-fair-mapgen.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0008-counterplay-and-fair-mapgen.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0009-identity-polity-continuity.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0009-identity-polity-continuity.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0010-single-origin-many-interpretations.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/adr/ADR-0010-single-origin-many-interpretations.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/docs/superpowers/specs/2026-10-11-project4x-world-v04-design.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/docs/superpowers/specs/2026-10-11-project4x-world-v04-design.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/CHANGELOG-v0.3.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/CHANGELOG-v0.3.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/DESIGN-BASELINE-v0.3.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/DESIGN-BASELINE-v0.3.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/MANIFEST-v0.1.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/MANIFEST-v0.1.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/MANIFEST-v0.3.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/MANIFEST-v0.3.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/open-source-audit.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/open-source-audit.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/open-source-review-v03.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/open-source-review-v03.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/evidence/source-provenance-v04.json`](<../../history/Fake-Polytopia/PROJECT4X-V04/evidence/source-provenance-v04.json>)
- [`history/Fake-Polytopia/PROJECT4X-V04/world/field-crystal.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/world/field-crystal.md>)
- [`history/Fake-Polytopia/PROJECT4X-V04/world/origin-wish-loom.md`](<../../history/Fake-Polytopia/PROJECT4X-V04/world/origin-wish-loom.md>)

### 第二階段審查-20261011（37 檔）

- [`history/Fake-Polytopia/第二階段審查-20261011/修訂文件/G1-實作計畫-審查修訂.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/修訂文件/G1-實作計畫-審查修訂.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/修訂文件/G1-機制規格-審查修訂.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/修訂文件/G1-機制規格-審查修訂.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/修訂文件/契約驗收與反例.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/修訂文件/契約驗收與反例.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/全新審查報告.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/全新審查報告.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/原始交付/MANIFEST.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/原始交付/MANIFEST.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/原始交付/README.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/原始交付/README.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/原始交付/agents/G1-REVIEW-CHECKLIST.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/原始交付/agents/G1-REVIEW-CHECKLIST.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/原始交付/agents/REVIEW-RECONCILIATION.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/原始交付/agents/REVIEW-RECONCILIATION.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/原始交付/docs/specs/2026-10-11-g1-mechanics-targets.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/原始交付/docs/specs/2026-10-11-g1-mechanics-targets.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/原始交付/docs/superpowers/plans/2026-10-11-g1-first-playable.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/原始交付/docs/superpowers/plans/2026-10-11-g1-first-playable.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/圖示/TUI-架構與路線圖.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/圖示/TUI-架構與路線圖.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/技能矩陣與研究待辦.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/技能矩陣與研究待辦.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/第一輪研究封存.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/第一輪研究封存.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/第三輪入口封存.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/第三輪入口封存.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/第三輪深入審查.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/第三輪深入審查.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/OCR-執行說明.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/OCR-執行說明.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/OCR-檔案掃描.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/OCR-檔案掃描.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/OCR-規則解析.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/OCR-規則解析.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/交付檔案清單.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/交付檔案清單.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/獨立修訂複查.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/獨立修訂複查.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-六檔規則解析.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-六檔規則解析.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-執行記錄.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-執行記錄.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂掃描.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂掃描.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂文件規則.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂文件規則.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂納入規則.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂納入規則.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂警告.txt`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-自訂警告.txt>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-規則解析警告.txt`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-規則解析警告.txt>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-預設掃描.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-預設掃描.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-預設警告.txt`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-預設警告.txt>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-顯式納入掃描.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-顯式納入掃描.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-顯式納入警告.txt`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/OCR-顯式納入警告.txt>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/逐檔覆蓋與完整性.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/第三輪/逐檔覆蓋與完整性.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/結構化審查發現.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/結構化審查發現.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/規格手算與反例.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/規格手算與反例.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/證據/輸入完整性.json`](<../../history/Fake-Polytopia/第二階段審查-20261011/證據/輸入完整性.json>)
- [`history/Fake-Polytopia/第二階段審查-20261011/開源接入研究.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/開源接入研究.md>)
- [`history/Fake-Polytopia/第二階段審查-20261011/閱讀入口.md`](<../../history/Fake-Polytopia/第二階段審查-20261011/閱讀入口.md>)

### 第四輪CCTS審查-20261011（17 檔）

- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/CCTS-增量計畫與技能路由.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/CCTS-增量計畫與技能路由.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/CCTS-審查與衝突整理.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/CCTS-審查與衝突整理.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/G1-裁決整合稿.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/G1-裁決整合稿.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/DECISIONS-20261011.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/DECISIONS-20261011.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/MANIFEST.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/MANIFEST.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/PROJECT4X-CCTS-DECISION-ADDENDUM.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/PROJECT4X-CCTS-DECISION-ADDENDUM.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/README.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/README.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/agents/IMPLEMENTATION-HANDOFF.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/agents/IMPLEMENTATION-HANDOFF.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/agents/INDEPENDENT-REVIEW-CHECKLIST.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/原始交付/agents/INDEPENDENT-REVIEW-CHECKLIST.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/圖示/TUI-CCTS架構與路線圖.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/圖示/TUI-CCTS架構與路線圖.md>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS執行記錄.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS執行記錄.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS掃描.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS掃描.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS規則.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS規則.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS規則解析.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/OCR-CCTS規則解析.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/原型來源查找.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/原型來源查找.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/輸入完整性.json`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/證據/輸入完整性.json>)
- [`history/Fake-Polytopia/第四輪CCTS審查-20261011/開源延續機制研究.md`](<../../history/Fake-Polytopia/第四輪CCTS審查-20261011/開源延續機制研究.md>)

### 頂層設計原件及 ZIP

- [`history/Fake-Polytopia/PROJECT-4X.md`](<../../history/Fake-Polytopia/PROJECT-4X.md>)
- [`history/Fake-Polytopia/PROJECT-4X V0.4 獨立設計審查報告.md`](<../../history/Fake-Polytopia/PROJECT-4X V0.4 獨立設計審查報告.md>)
- [`history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip`](<../../history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip>)
  - SHA-256：`c57d30e8fea45196d71307bb97c6697e87efa292b322471324ea207f5e8a921c`
- [`history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip`](<../../history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip>)
  - SHA-256：`96222d6c486bc925dad04725f2bcd0dfdaf7a0495d378a11c3bc0d86086982d0`
- [`history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip`](<../../history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip>)
  - SHA-256：`bb656511b464fd06b7ccf4be4bd3ef7b3659232df7f3f5ac16ae724d1dc5ea3e`
- [`history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip`](<../../history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip>)
  - SHA-256：`19de5d78ce9c7c292a1cde85f7b2a9ac729e058a7aa84682b1d98c3397eb593a`
- [`history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip`](<../../history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip>)
  - SHA-256：`9f7aaac0a4714ac611080e21313bcb9d157196eb8a33ae05598d16c2d44e50d9`

實體設計原件索引合計：197 檔；以下 ZIP 成員是相同／較早歷史快照的獨立索引，不與實體檔相加成批准數。

### PROJECT4X-V03-DESIGN-PACK.zip 內部成員（40 檔）

- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/AGENTS.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/CHANGELOG.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/DESIGN-BASELINE.json`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/HANDOFF-START-HERE.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/MANIFEST.json`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/README.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/00-vision-and-decisions.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/01-game-design.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/02-rules-and-economy.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/03-diplomacy-faith-politics.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/04-content-and-victory.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/05-system-architecture.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/06-performance-engineering.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/07-ai-opponents.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/08-art-pipeline.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/09-platforms-and-ux.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/10-agent-workflow.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/11-review-and-acceptance.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/12-dependency-evidence.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/13-roadmap.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/14-risks-and-open-questions.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/15-world-bible-nonlinear.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/16-survival-and-discovery.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/17-first-playable-spec.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/18-faction-evolution-and-content-packs.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/19-army-command-and-low-micro.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/20-open-source-integration.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/21-system-contracts-v03.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/22-playtest-metrics-and-review.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/23-v03-design-decisions-and-questions.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/adr/ADR-0001-technology.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/adr/ADR-0002-determinism.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/adr/ADR-0003-nonlinear-civilizations.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/adr/ADR-0004-playability-first.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/adr/ADR-0005-projection-renderer.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/adr/ADR-0006-portable-workers.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/evidence/MANIFEST-v0.1.json`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/evidence/open-source-audit.json`
- `history/Fake-Polytopia/PROJECT4X-V03-DESIGN-PACK.zip::PROJECT4X-V03/evidence/open-source-review-v03.json`

### PROJECT4X-V04-DESIGN-PACK.zip 內部成員（69 檔）

- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/AGENTS.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/CHANGELOG.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/DESIGN-BASELINE.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/HANDOFF-START-HERE.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/MANIFEST.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/README.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/agents/V04-CODEX-IMPLEMENTATION-GATE.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/agents/V04-INDEPENDENT-REVIEW-INSTRUCTIONS.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/00-vision-and-decisions.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/01-game-design.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/02-rules-and-economy.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/03-diplomacy-faith-politics.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/04-content-and-victory.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/05-system-architecture.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/06-performance-engineering.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/07-ai-opponents.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/08-art-pipeline.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/09-platforms-and-ux.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/10-agent-workflow.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/11-review-and-acceptance.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/12-dependency-evidence.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/13-roadmap.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/14-risks-and-open-questions.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/15-world-bible-nonlinear.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/16-survival-and-discovery.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/17-first-playable-spec.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/18-faction-evolution-and-content-packs.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/19-army-command-and-low-micro.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/20-open-source-integration.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/21-system-contracts-v03.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/22-playtest-metrics-and-review.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/23-v03-design-decisions-and-questions.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/24-energy-metaphysics.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/25-civilization-metabolism-resource-contract.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/26-asymmetry-comeback-and-artifacts.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/27-asymmetric-mapgen-and-fairness.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/28-civilization-transformation.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/29-contact-diplomacy-unions.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/30-diaspora-culture-and-insurgency.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/31-ecology-scarcity-and-path-dependence.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/32-origin-truth-and-discovery-arc.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/33-surreal-tone-meme-civilizations.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/34-worldlayers-and-endgame.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/35-g1-g15-experiment-and-gameplay.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/36-architecture-api-data-contracts.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/37-review-risk-test-matrix.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/38-user-decisions-and-open-questions-v04.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/39-open-source-sourcing-v04.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0001-technology.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0002-determinism.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0003-nonlinear-civilizations.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0004-playability-first.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0005-projection-renderer.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0006-portable-workers.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0007-civilization-metabolism.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0008-counterplay-and-fair-mapgen.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0009-identity-polity-continuity.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/adr/ADR-0010-single-origin-many-interpretations.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/superpowers/specs/2026-10-11-project4x-nonlinear-survival-design.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/docs/superpowers/specs/2026-10-11-project4x-world-v04-design.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/CHANGELOG-v0.3.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/DESIGN-BASELINE-v0.3.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/MANIFEST-v0.1.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/MANIFEST-v0.3.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/open-source-audit.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/open-source-review-v03.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/evidence/source-provenance-v04.json`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/world/field-crystal.md`
- `history/Fake-Polytopia/PROJECT4X-V04-DESIGN-PACK.zip::PROJECT4X-V04/world/origin-wish-loom.md`

### PROJECT4X-G1-START-20261011.zip 內部成員（6 檔）

- `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip::PROJECT4X-G1-START-20261011/MANIFEST.json`
- `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip::PROJECT4X-G1-START-20261011/README.md`
- `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip::PROJECT4X-G1-START-20261011/agents/G1-REVIEW-CHECKLIST.md`
- `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip::PROJECT4X-G1-START-20261011/agents/REVIEW-RECONCILIATION.md`
- `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip::PROJECT4X-G1-START-20261011/docs/specs/2026-10-11-g1-mechanics-targets.md`
- `history/Fake-Polytopia/PROJECT4X-G1-START-20261011.zip::PROJECT4X-G1-START-20261011/docs/superpowers/plans/2026-10-11-g1-first-playable.md`

### PROJECT-4X-第二階段審查修訂-20261011.zip 內部成員（22 檔）

- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::PROJECT-4X.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/修訂文件/G1-實作計畫-審查修訂.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/修訂文件/G1-機制規格-審查修訂.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/全新審查報告.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/原始交付/MANIFEST.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/原始交付/README.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/原始交付/agents/G1-REVIEW-CHECKLIST.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/原始交付/agents/REVIEW-RECONCILIATION.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/原始交付/docs/specs/2026-10-11-g1-mechanics-targets.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/原始交付/docs/superpowers/plans/2026-10-11-g1-first-playable.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/技能矩陣與研究待辦.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/第一輪研究封存.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/OCR-執行說明.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/OCR-檔案掃描.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/OCR-規則解析.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/交付檔案清單.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/獨立修訂複查.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/結構化審查發現.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/規格手算與反例.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/證據/輸入完整性.json`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/開源接入研究.md`
- `history/Fake-Polytopia/PROJECT-4X-第二階段審查修訂-20261011.zip::第二階段審查-20261011/閱讀入口.md`

### PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip 內部成員（6 檔）

- `history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip::PROJECT4X-CCTS-DECISION-ADDENDUM-20261011/DECISIONS-20261011.json`
- `history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip::PROJECT4X-CCTS-DECISION-ADDENDUM-20261011/MANIFEST.json`
- `history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip::PROJECT4X-CCTS-DECISION-ADDENDUM-20261011/PROJECT4X-CCTS-DECISION-ADDENDUM.md`
- `history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip::PROJECT4X-CCTS-DECISION-ADDENDUM-20261011/README.md`
- `history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip::PROJECT4X-CCTS-DECISION-ADDENDUM-20261011/agents/IMPLEMENTATION-HANDOFF.md`
- `history/Fake-Polytopia/PROJECT4X-CCTS-DECISION-ADDENDUM-20261011.zip::PROJECT4X-CCTS-DECISION-ADDENDUM-20261011/agents/INDEPENDENT-REVIEW-CHECKLIST.md`

### 未取得／不曾產出的引用

- `PROJECT4X-G1-PROTOTYPE-20261011/`：只見 CCTS 補充引用，來源與 QA 原件未取得。
- `PROJECT4X-G1-PROTOTYPE-QA-20261011.json`：只有舊補充所述 11/11，不是可核驗證據。
- 2026-10-12 候選 ZIP／候選交付說明：具名原件未找到，parent 記憶已記「尚未產生」。
- OpenCode R0 全文：歷史 v0.3／v0.4來源記為使用者摘要；不補造全文。
