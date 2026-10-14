# 開源整合與參考研究

查證日期：2026-10-13（Asia/Taipei）。本輪為工程交接封存：沒有安裝候選套件、取用候選遊戲 source/assets、改 package／lock、改 provider 配置或部署。

## 先決限制

1. 現行專案根沒有 LICENSE／COPYING／NOTICE，package.json 也沒有 license 欄位。專案自有程式與素材的**對外授權仍 UNVERIFIED**。使用者授權把自己專案交接给兩個 AI，支持本次內部封存／閱讀；不能因此推導任何公眾 MIT／Apache 授權或發布批准。依 [GitHub 授權說明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)，沒有 license 不會自動成為可公開重用的開源程式。
2. Canvas 原創聲明、掃描沒有媒體檔，以及專案對外授權，是三種不同證據。此盤查不能獨立證明所有歷史程式的原創性或所有商標權利；授權義務與實際採用版本詳见[授權矩陣](LICENSE-MATRIX.md)。
3. 五直接依賴全為工程／QA；lock 共93筆，主授權含MPL。原生二進位、內嵌程式、瀏覽器套件不能只看頂層 package license。[完整依賴盤點](DEPENDENCY-INVENTORY.md)區分已裝／未裝和证據強度。

## 状態字典

| 狀態 | 定義 |
|---|---|
| INTEGRATED | 有本地 source、script 或本輪執行證據的實際使用；仍標出工程／runtime範圍。 |
| DEPENDENCY_ONLY | 鎖定為轉遞工具依賴，沒有本專案直接 API 整合證據。 |
| REFERENCE_ONLY | 已讀官方材料，作概念／比較研究，沒有採用其 code/assets。 |
| PROPOSED | 只在將來明確需求下考慮的隔離試作；尚未安裝、未核准生產整合。 |
| REJECTED | 現行 MVP 選擇不採用該整體方案，不否定參考價值。 |
| UNVERIFIED | 授權／版本／個別權利無足夠證據；不得填成已確認。 |

候選狀態與授權查證是兩個維度：例如 REFERENCE_ONLY 的程式根授權可以已確認，但它的單件素材仍 UNVERIFIED。下面的成本、相容性與優先序為本次工程評估／推論，沒有跑上游 demo、效能 benchmark 或移植實驗。

## 12個指定候選＋優先工程工具

| 名稱／官方 repository | status | 範圍 | 已採用精確版本或查證分支 | 主授權 |
|---|---|---|---|---|
| [Alibaba Open Code Review](https://github.com/alibaba/open-code-review) | INTEGRATED | 既有外部工程工具；非遊戲 runtime、非本專案 npm dependency | v1.12.13；CLI 自報短 commit fabbdb29，darwin/arm64；未核對完整 40 位 commit | Apache-2.0 |
| [PixiJS](https://github.com/pixijs/pixijs) | PROPOSED | 未來 renderer 實驗候選；本版未整合 | 未選版本／未整合；此次 dev 授權及 8.x Application 文件快照 | MIT |
| [Phaser](https://github.com/phaserjs/phaser) | REJECTED | 本輪／現行 MVP 不採用整套遊戲引擎；可保留概念參考 | 未選版本／未整合；此次 master 授權快照 | MIT |
| [Unciv](https://github.com/yairm210/Unciv) | REFERENCE_ONLY | 4X 規則／資料組織研究 | 未整合；此次 master 官方文件快照 | MPL-2.0；例外 TextureArraySpriteBatch.java 為 CC0-1.0 |
| [FreeOrion](https://github.com/freeorion/freeorion) | REFERENCE_ONLY | 4X AI／內容脚本組織研究 | 未整合；此次 master 文件快照 | 程式 GPL v2；assets CC-BY-SA-3.0；game content scripts 同時有兩種授權要求（見 COPYING） |
| [Freeciv](https://github.com/freeciv/freeciv) | REFERENCE_ONLY | 回合制帝國遊戲規則／伺服器分層研究 | 未整合；此次 main README／COPYING／common/game.h 快照 | GPL v2；已查看的 common/game.h 明確允許 v2 或更晚版本 |
| [The Battle for Wesnoth](https://github.com/wesnoth/wesnoth) | REFERENCE_ONLY | 回合戰術、教學與可改內容研究 | 未整合；此次 master README／COPYING 快照 | 程式 GPL-2.0-or-later；多数美術／音樂 GPL v2+，新的創作貢獻 CC-BY-SA-4.0 |
| [Mindustry](https://github.com/Anuken/Mindustry) | REFERENCE_ONLY | 指令、資料與模組邊界研究 | 未整合；此次 master README／LICENSE／Vars.java 快照 | GPL v3；only/or-later suffix 本輪 UNVERIFIED |
| [Widelands](https://github.com/widelands/widelands) | REFERENCE_ONLY | 經濟／內容與物流研究 | 未整合；此次 master README／COPYING 快照 | GPL-2.0-or-later；部分素材另依各目錄 Creative Commons 授權 |
| [boardgame.io](https://github.com/boardgameio/boardgame.io) | REFERENCE_ONLY | 未來網路多人／回合流程比較 | 未整合；此次 main README／LICENSE 快照 | MIT |
| [Zod](https://github.com/colinhacks/zod) | PROPOSED | 未來匯入／外部資料邊界的隔離試作候選 | 未選版本／未整合；此次 main LICENSE、官方 basics 快照 | MIT |
| [Vitest](https://github.com/vitest-dev/vitest) | REFERENCE_ONLY | 未來測試／coverage 工具研究 | 未整合；此次 main README／LICENSE 與官方 guide 快照 | MIT |
| [Playwright](https://github.com/microsoft/playwright) | INTEGRATED | 既有瀏覽器 QA；非遊戲 runtime | npm playwright@1.64.0＋playwright-core@1.64.0，lock resolved/integrity 固定；未記 repository commit | Apache-2.0；NOTICE 與 bundled sidecar licenses 另保留 |


## 個別研究與取捨

### Alibaba Open Code Review — INTEGRATED

官方來源：[alibaba/open-code-review](https://github.com/alibaba/open-code-review)；[官方文件](https://github.com/alibaba/open-code-review/blob/main/README.md)、[LICENSE／COPYING](https://github.com/alibaba/open-code-review/blob/v1.12.13/LICENSE)。

**用途／可借鑑概念。** 選取審查檔案、解析規則，再由 host agent 做逐檔審查。 把確定性的選檔／規則解析與推論審查分開，將具體可重現缺陷作為輸出。官方 README 明確區分 delegation 與 OCR 管理的 LLM 審查。

**直接 code／assets 使用。** 本輪 root 已執行 version、delegate preview、scan --preview、delegate rule；不另呼叫外部 LLM。未複製 OCR source/assets 到 src，未變更 provider／全域配置。

**相容性與成本。** 適用目前沒有既存 HEAD 的 source 全檔盤查；官方 scan 不需要 Git 歷史。preview exit0 不代表覆蓋審查已完成，也不代表產品正確。 成本評估：低至中：使用既有 CLI／host；未新增另一個 API 費用，但 host 審查仍耗模型額度。官方效能數字未在本專案重現。

**授權／copyleft／風險。** Apache-2.0；無；保留 LICENSE／相關 NOTICE、修改標記；商標權不隨授權移轉。工具預設 review 模式會把內容送往設定的模型端點；與本輪僅做選檔／規則解析的證據分開。native CLI 本身的全部內嵌元件／release notices 未納入 npm 盤點，仍 UNVERIFIED。

**研究建議。** 保留本次工具版本、選檔、規則與人工／host 覆蓋證據；重用現有 delegation 流程，先補 skipped/excluded 理由；不把安裝另一外部 LLM 當成必要步驟。

### PixiJS — PROPOSED

官方來源：[pixijs/pixijs](https://github.com/pixijs/pixijs)；[官方文件](https://pixijs.com/8.x/guides/components/application)、[LICENSE／COPYING](https://github.com/pixijs/pixijs/blob/dev/LICENSE)。

**用途／可借鑑概念。** 2D 顯示層；官方 Application 提供 renderer、ticker 與非同步初始化，支援 WebGL／WebGPU。 可研究顯示物件、裁切與 camera／ticker 管理；這些只屬顯示層，不寫回規則 state。

**直接 code／assets 使用。** 本輪未安裝 pixi.js，未剪入 source 或圖片；runtime import 圖沒有 PixiJS。

**相容性與成本。** 可由 Observation adapter 取代 map 的顯示實作；不得讓 ticker 改 canonical GameState。 成本評估：中：Canvas 幾何繪法、pointer hit test、縮放、文字與 GPU 資源生命週期需重新驗證。

**授權／copyleft／風險。** MIT；無；保留版權與授權文字。版本／GPU 功能與目標瀏覽器支持須實機驗證；沒有本專案效能 benchmark，不能宣稱換 renderer 一定較快。外掛與示例素材另查授權。

**研究建議。** 只有量測確認渲染成為瓶頸，才另立隔離試作；同一 Observation 截圖、互動與 canonicalHash 回歸為接受条件。

### Phaser — REJECTED

官方來源：[phaserjs/phaser](https://github.com/phaserjs/phaser)；[官方文件](https://github.com/phaserjs/phaser)、[LICENSE／COPYING](https://github.com/phaserjs/phaser/blob/master/LICENSE.md)。

**用途／可借鑑概念。** HTML5 2D 遊戲框架，官方 README 說明 Canvas／WebGL、desktop／mobile web。 可參考 scenes、輸入、資源載入與顯示生命週期的組織。

**直接 code／assets 使用。** 未安裝 phaser，未用上游 source/assets；目前 map 以 Canvas2D 自有幾何繪圖。

**相容性與成本。** 現有 applyCommand、save/replay、Observation 邊界已獨立；整套 scene/state 模型遷移容易重複權威。 成本評估：高：重寫圖形、UI、測試與顯示時鐘整合；本專案未做遷移／效能實驗。

**授權／copyleft／風險。** MIT；無；保留版權與授權文字。不能用引擎事件直接變更 GameState 或照搬範例素材；官方版本變動需按所選版本重新核對。

**研究建議。** 維持現版架構；若未來作品需要大量即時物理／場景，另開試作再比較，不在封存版換引擎。

### Unciv — REFERENCE_ONLY

官方來源：[yairm210/Unciv](https://github.com/yairm210/Unciv)；[官方文件](https://github.com/yairm210/Unciv#licensing-and-credits)、[LICENSE／COPYING](https://github.com/yairm210/Unciv/blob/master/LICENSE)、[官方文件](https://github.com/yairm210/Unciv/blob/master/docs/Modders/Mods.md)、[官方文件](https://github.com/yairm210/Unciv/blob/master/docs/Credits.md)。

**用途／可借鑑概念。** Android／desktop 4X；研究 ruleset JSON 與 Images 分離、base ruleset／mod 組織。 可由官方 mod 文件研究資料與美術分離、可替換規則表；適合日後文化內容表的設計研究。

**直接 code／assets 使用。** 沒有把 Kotlin／Java、規則 JSON、圖片或音訊搬入本專案；不在 lock 或 src imports。

**相容性與成本。** 與本版 TypeScript／browser stack 不直接相容；研究所得需重新依既有 command 契約設計。 成本評估：閱讀中；直接移植高，須處理 libGDX、語言差異、規則與保存語意。

**授權／copyleft／風險。** MPL-2.0；例外 TextureArraySpriteBatch.java 為 CC0-1.0；MPL 檔案層級；媒體依各自 CC BY／BY-SA／CC0／public domain 證據。不能一概標 MIT 或 GPL。README 指明程式例外與媒體混合授權；單一 assets 的作者、license、來源未盤查，因此素材可重用性 UNVERIFIED。

**研究建議。** 優先研究 JSON／圖像分離的方法；不複製現成 Civilization 內容、程式或美術；若將來借檔需定版並逐檔處理 MPL。

### FreeOrion — REFERENCE_ONLY

官方來源：[freeorion/freeorion](https://github.com/freeorion/freeorion)；[官方文件](https://github.com/freeorion/freeorion/blob/master/README.md#license)、[LICENSE／COPYING](https://github.com/freeorion/freeorion/blob/master/default/COPYING)。

**用途／可借鑑概念。** 太空 4X；官方 README 區分 Python AI、FOCS 內容與資產目錄。 可研究 AI 與資料內容分離、內容腳本化與本地化索引；研究方向不等於移植計劃。

**直接 code／assets 使用。** 未複製 C++／Python AI／FOCS／美術／字型；本版無 FreeOrion code/assets。

**相容性與成本。** 桌面 C++／Python 系統不直接適用 browser TypeScript；CCTS 和必答遺跡仍以本專案規則為準。 成本評估：閱讀中至高；移植高。

**授權／copyleft／風險。** 程式 GPL v2；assets CC-BY-SA-3.0；game content scripts 同時有兩種授權要求（見 COPYING）；程式強 copyleft；創作資產 ShareAlike；不能只取 GPL 標籤。COPYING 前段分別指定程式、內容與藝術；bundle 另有 GiGi、Roboto、DejaVuSans。only/or-later 與個別檔案例外必須重查，不能由 GPL 範本文字推定所有檔可升版。

**研究建議。** 以 README 目錄分層作研究索引；不要移植 AI 或內容表；若需直接用 source，先核定目標授權及特定檔案。

### Freeciv — REFERENCE_ONLY

官方來源：[freeciv/freeciv](https://github.com/freeciv/freeciv)；[官方文件](https://github.com/freeciv/freeciv/blob/main/README.md)、[LICENSE／COPYING](https://github.com/freeciv/freeciv/blob/main/COPYING)、[官方文件](https://github.com/freeciv/freeciv/blob/main/common/game.h)。

**用途／可借鑑概念。** 獨立 client/server 的文明建構遊戲；研究 common 規則／資料、server 與 AI 的職責。 可把上游權威狀態與 client 分層當比較材料；不把 client/server 功能加到本地 MVP。

**直接 code／assets 使用。** 未複製 C／ruleset／tileset／音訊；不在現行 source import 或 lock。

**相容性與成本。** 完整原生 client/server 與本版單機瀏覽器不同；不能以移植替代既有 deterministic commands。 成本評估：閱讀中；直接移植高。

**授權／copyleft／風險。** GPL v2；已查看的 common/game.h 明確允許 v2 或更晚版本；強 copyleft；具體引入檔仍查 header／例外。README／COPYING 不證明所有藝術或 tileset 的授權一致；只核对一個 source header 不足以替全樹定 SPDX suffix。

**研究建議。** 先研究分層與規則資料設計；若未來需要多人，重新驗證 authority／hidden information 契約，不直接帶現成規則。

### The Battle for Wesnoth — REFERENCE_ONLY

官方來源：[wesnoth/wesnoth](https://github.com/wesnoth/wesnoth)；[官方文件](https://github.com/wesnoth/wesnoth/blob/master/README.md#license)、[LICENSE／COPYING](https://github.com/wesnoth/wesnoth/blob/master/COPYING)。

**用途／可借鑑概念。** 回合戰術遊戲；官方 README 說明 campaigns、unit skills、map editor、mods、多種控制設定。 可研究以戰役分段教學、技能與地形信息的呈現、內容編輯器；細部機制需另讀正式 manual/source。

**直接 code／assets 使用。** 未複製 C++／Lua／WML、單位圖、戰役或音樂。

**相容性與成本。** 戰術導向不同於本版 CCTS 4X；概念比較可以，規則替換不在本輪範圍。 成本評估：閱讀中；移植高。

**授權／copyleft／風險。** 程式 GPL-2.0-or-later；多数美術／音樂 GPL v2+，新的創作貢獻 CC-BY-SA-4.0；程式強 copyleft；素材 GPL／ShareAlike 分項。官方 README 明確把歷史素材與新創作授權分開；不能將整包美術標為 MIT 或單一 CC 授權。manual 頁未取得足以驗明迷霧等細節，不以記憶填補。

**研究建議。** 研究上手教學與界面反饋；保留本版既定單位／視野規則；圖像與聲音另逐項授權。

### Mindustry — REFERENCE_ONLY

官方來源：[Anuken/Mindustry](https://github.com/Anuken/Mindustry)；[官方文件](https://github.com/Anuken/Mindustry)、[LICENSE／COPYING](https://github.com/Anuken/Mindustry/blob/master/LICENSE)、[官方文件](https://github.com/Anuken/Mindustry/blob/master/core/src/mindustry/Vars.java)。

**用途／可借鑑概念。** Java automation tower defense RTS；source 區分 AI、world、graphics、UI、net 等模組。 可研究模組職責與內容目錄，作為「渲染／AI 不擁有規則權威」的比較材料；不是已採用其中演算法。

**直接 code／assets 使用。** 未複製 Java／Arc 引擎、地圖、sprite、聲音；沒有把它編入瀏覽器產品。

**相容性與成本。** 即時 Java/Arc stack 與本版 TypeScript 回合架構差異大。 成本評估：閱讀中；直接移植高。

**授權／copyleft／風險。** GPL v3；only/or-later suffix 本輪 UNVERIFIED；強 copyleft；不能僅憑完整 GPL 範本斷言 or-later。根 LICENSE 為 GPL v3；資產與關聯 Arc／音訊等第三方的逐檔授權未驗明。這次只看 Vars 不能證明其整套架構契約。

**研究建議。** 保留低優先概念研究，禁止把即時更新 loop 移入 authoritative game.ts。

### Widelands — REFERENCE_ONLY

官方來源：[widelands/widelands](https://github.com/widelands/widelands)；[官方文件](https://github.com/widelands/widelands/blob/master/README.md)、[LICENSE／COPYING](https://github.com/widelands/widelands/blob/master/COPYING)。

**用途／可借鑑概念。** 以物流／經濟建構為主的即時策略遊戲；官方 README 列出原生 SDL 等建置依賴。 可把供給與經濟反馈作為未來文化／資源設計研究議題；此次未核對詳細經濟演算法。

**直接 code／assets 使用。** 未複製 C++／Lua、经济資料、美術或聲音。

**相容性與成本。** 原生即時策略／SDL stack 與 browser 回合 MVP 不直接相容；不能擴張既定規則範圍。 成本評估：閱讀中至高；移植高。

**授權／copyleft／風險。** GPL-2.0-or-later；部分素材另依各目錄 Creative Commons 授權；程式強 copyleft；素材依個別 CC 条件。官方明示素材例外需查各目錄；不應只讀 COPYING 就整包重用。

**研究建議。** 低優先研究經濟可讀性；若沒有對應需求就不導入物流系統。

### boardgame.io — REFERENCE_ONLY

官方來源：[boardgameio/boardgame.io](https://github.com/boardgameio/boardgame.io)；[官方文件](https://github.com/boardgameio/boardgame.io)、[LICENSE／COPYING](https://github.com/boardgameio/boardgame.io/blob/main/LICENSE)。

**用途／可借鑑概念。** JavaScript 回合遊戲 state、multiplayer、phase、lobby 與 log 管理。 可研究可重放 moves、player view 與 authority 分層；官方 README 確认 state/network/log features，hidden-information 細節尚未驗明。

**直接 code／assets 使用。** 未安裝 boardgame.io，未用它作 state authority 或網路層。

**相容性與成本。** 若直接採用需 adapter 包住 applyCommand；既有 GameState／history／replay 是唯一權威，不能並列兩套 state。 成本評估：高：沒有本輪多人需求，卻會增加 server、storage、lobby 與網路測試。

**授權／copyleft／風險。** MIT；無；保留版權與授權文字。官方文檔頁這次返回 0 行，故不宣稱具體 API 或 hidden-information 安全保證；錯用 optimistic client 可能破壞現有權威邊界。

**研究建議。** 現版只保留概念參考；等明確多人需求才定版並驗證 player view／命令去重／重放一致。

### Zod — PROPOSED

官方來源：[colinhacks/zod](https://github.com/colinhacks/zod)；[官方文件](https://zod.dev/basics)、[LICENSE／COPYING](https://github.com/colinhacks/zod/blob/main/LICENSE)。

**用途／可借鑑概念。** TypeScript schema validation；官方 parse/safeParse 可把未知資料轉成型別已驗證的結果。 可研究匯入 schema 定義與錯誤信息；只檢查資料形狀不能代替世界語意和歷史重播。

**直接 code／assets 使用。** src/core/persistence.ts 使用自有驗證；未安裝／import zod，未複製上游程式。

**相容性與成本。** 如有試作，僅放 unknown→schema 邊界；仍需 existing replay／semantic checks 成功後才能替換當前 state。 成本評估：低至中：要維護 schema、量測 bundle 及遷移錯誤文案；沒有必要只為省幾行判斷加依賴。

**授權／copyleft／風險。** MIT；無；保留版權與授權文字。schema 通過不是遊戲合法；忽略 command 歷史驗證會放過一致性問題。選版／API、bundle 指標尚未實測。

**研究建議。** 只有外部規則資料或匯入格式擴張造成維護負擔時再試作；既有保存反例必須原樣通過。

### Vitest — REFERENCE_ONLY

官方來源：[vitest-dev/vitest](https://github.com/vitest-dev/vitest)；[官方文件](https://github.com/vitest-dev/vitest)、[LICENSE／COPYING](https://github.com/vitest-dev/vitest/blob/main/LICENSE)、[官方文件](https://vitest.dev/guide/)。

**用途／可借鑑概念。** Vite 生態 testing framework，包含 watch、mock、coverage、browser mode 等功能。 可參考測試隔離、錯誤報告與 coverage；目前 Node test＋tsx 已執行既有反例。

**直接 code／assets 使用。** 未安裝 vitest，沒有把 tests 改為 vitest imports。Vite 內嵌 @vitest/utils 不等於已採用 Vitest runner。

**相容性與成本。** 與 Vite/TypeScript 技術相關，但需選定 runner 版本及 engines 再核對；不得用更換測試工具掩蓋原來失敗。 成本評估：中：遷移 assertion、並行／timeout、worker 與 coverage 语意；沒有本輪 runner 缺陷證據。

**授權／copyleft／風險。** MIT；無；主授權不替其全部轉遞依賴授權。upstream main／網站 guide 的 engine 要求可能變動；Vite8 與現有 Node 的可用性不能證明任一 Vitest 版本可用。

**研究建議。** 保留 Node 原生 test；只有新增coverage／browser component testing 的明確需求才定版比較。

### Playwright — INTEGRATED

官方來源：[microsoft/playwright](https://github.com/microsoft/playwright)；[LICENSE／COPYING](https://github.com/microsoft/playwright/blob/v1.64.0/LICENSE)、[官方文件](https://github.com/microsoft/playwright/blob/v1.64.0/NOTICE)、[官方文件](https://playwright.dev/docs/emulation)。

**用途／可借鑑概念。** scripts/browser-check.mjs 以 chromium 實測 production DOM／Canvas 操作、console、尺寸與模擬触控。 可重用既有可重現 UI 行程、viewport／touch emulation 與 screenshot 證據。

**直接 code／assets 使用。** 既有 QA import API；沒有把框架 source 放入 src，也沒有随遊戲發布瀏覽器二進位。本研究沒有執行或增設 GUI 測試。

**相容性與成本。** lock 要求 Node>=20。實際測試通過及 npm audit 狀態由工程證據另驗，不以授權盤點補填 PASS。 成本評估：既有重用低；浏览器下載與 CI 執行有磁碟／時間成本；本輪未下載。

**授權／copyleft／風險。** Apache-2.0；NOTICE 與 bundled sidecar licenses 另保留；主程式無；內嵌／browser binaries 依各自授權。emulation 不是實體手機驗證；主 Apache LICENSE 不涵蓋 Chromium／Firefox／WebKit 的全部第三方義務，未帶瀏覽器則不宣稱其 notices 盤查完成。

**研究建議。** 沿用現有 QA，保留 source/dist/測試版本對應；未來發布附帶工具或 browsers 時重新做完整 notices 盤點。

## 接續優先序

這是下一位工程師的研究路線，不是本輪安裝指令：

1. 沿用已整合的 Node/TypeScript/Vite/tsx/Playwright 與 OCR delegation，先完成本版失敗反例及覆蓋資料。新 framework 不會替代 CCTS、迷霧、保存／重播契約。
2. 若匯入格式或文化資料表變複雜，再評估 Zod 邊界試作；若實機量測確認渲染瓶頸，再評估 PixiJS。兩者都必须定版本、保留license/notices、對同一資料跑回歸后才討論採用。
3. Unciv／Freeciv／FreeOrion 優先用於規則資料與 AI 分層概念；Wesnoth 用於教學／資訊可讀性研究。Mindustry／Widelands 與現版需求較遠，保持低優先。
4. 只有多人需求或現有 test runner 的具體缺口，才重新評估 boardgame.io／Vitest。Phaser整套遷移不納入現版封存。

## 查證證據與仍未驗明事項

所有指定 repository 均有本輪 web search；授權以官方根 LICENSE／COPYING 與 README 例外聲明為主，不用 GitHub badge 單獨裁定。候選未整合，故未宣稱已固定其 commit／可再現 build；動態 main/master/dev 文件只是日期快照，正式採用需重新定版。

[官方來源 metadata](../../evidence/research/官方開源來源.json)記錄查證URL、分支、授權觀測、搜索query與失敗來源；[依賴快照](../../evidence/research/依賴與授權快照.json)保留實際版本、resolved/integrity及原文SHA-256。OCR工具版本與命令位於交接包頂層 `evidence/review/ocr-version.txt`、`executions.json`。

尚未驗明：遊戲自有程式／素材對外授權；候選單件素材與各例外文件；未安裝平台包的授權原文；原生二進位完整SBOM；OCR release的全部内嵌notice；Playwright瀏覽器二進位；Phaser／PixiJS／Zod／boardgame.io／Vitest的未來選版、效能或移植成本實測。
