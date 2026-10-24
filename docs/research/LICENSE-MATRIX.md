# 授權矩陣與重分發範圍

查證日期：2026-10-13。這是精確依賴／候選／資產的工程授權盤查；不替使用者選專案LICENSE。本輪只封存與交接，沒有公開發布或生產整合。

**2026-10-17 當前補充**：主創已明確重申採用根目錄 MIT LICENSE，README／LICENSE-STATUS 已對齊；下段「無 LICENSE／尚未選定」只描述 2026-10-13 原始封存，不再代表當前專案授權。第三方元件、素材及二進位義務仍各自有效，本次沒有新導入或重新授權它們。

## 2026-10-13 原始封存的授權狀態（歷史）

原始 `project-4x-mvp@0.1.0` 根目錄無LICENSE/COPYING/NOTICE，manifest也無license欄位；自有程式與原創素材的**對外授權UNVERIFIED**。`private: true`限制npm發布，並不是著作權license。使用者明確授權本次自己的專案交接／AI閱讀，這個範圍可保留；公共repository、商業散布或授權第三人二次創作不能由本盤查自行批准。[GitHub官方授權說明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)也把無license與開源授權區分。

工具的MIT／Apache不會自动為使用工具寫成的遊戲授同一license；根目錄無license也不取消第三方各自授權。未選定目標發布授權與實際借用檔案，因此這份文檔**不宣稱專案整體license相容性已通過**。

## 主授權、內嵌義務與發布範圍

| 類型 | 本版項目 | 本輪證據 | 重分發觸發與處理 |
|---|---|---|---|
| MIT | Vite core、tsx、@types/node及多個轉遞包 | 本機原文；完整清單93筆 | 若分發其程式／實質片段，保留copyright與授權原文；不是只留套件名字。 |
| Apache-2.0 | TypeScript、Playwright/core、detect-libc、TypeScript平台包；外部OCR主程式 | 本機license/notice；OCR官方v1.12.13 LICENSE | 分發作品時附LICENSE，保留相關NOTICE與原有資訊；修改檔标注；没有商標授權。[官方條款§4／§6](https://www.apache.org/licenses/LICENSE-2.0)。 |
| MPL-2.0 | lightningcss及11個optional平台包 | 本機lightningcss與darwin-arm64 LICENSE；其他平台lock声明 | MPL是檔案層級；若分發Covered Software的可執行形態，要提供受涵蓋source取得方式与notices，不因devDependency就免除。獨立新檔不自动变MPL。[MPL§3](https://www.mozilla.org/en-US/MPL/2.0/)、[Mozilla FAQ Q8–Q11](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)。 |
| ISC | picocolors | 本機LICENSE | 分發保留copyright与permission text。 |
| BSD-3-Clause | source-map-js | 本機LICENSE | source保留文字；binary在文檔等重現notices；不得用作者名為衍生品背書。 |
| 多授權內嵌元件 | Vite／TypeScript／Playwright／Rolldown bundles | 完整LICENSE.md、NOTICE.txt、sidecars、THIRD-PARTY-LICENSE | 若分發工具或片段，按其實際含入元件保留全文，不能把所有程式歸為package主license。 |
| native／browser二進位 | esbuild／Rolldown平台binary；Playwright下載的browsers | 平台主授權部分可驗；完整內嵌SBOM／browsers未查 | 本輪沒有把node_modules、CLI或瀏覽器二進位放進source交接；若另打包則重新驗明精确binary內容、source供給與notices。 |

工具在本機執行不等於它全部source進入瀏覽器遊戲。反過來，`dist`的modulepreload生成片段、可能內嵌工具程式以及附帶工具包需要依真正發布內容判斷；「零runtime dependencies」不能用作排除授權义務的結論。MPL的minified client JS仍可能屬Executable Form；這是[Mozilla FAQ Q16–Q17](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)的區分。

## 本機實際安裝25筆

版本／主授權均與lock一致。23筆有本機原文，兩個平台包沒有獨立LICENSE；其MIT僅由本機宣告與官方同版本root-license補證，不声称native binary全內嵌元件已驗。完整93筆含未裝平台見[依賴盤點](DEPENDENCY-INVENTORY.md)，原文SHA-256與provenance見[快照](../../evidence/research/依賴與授權快照.json)。

| 套件／版本 | status／用途 | 主授權 | 原文證據／補充 |
|---|---|---|---|
| `@esbuild/darwin-arm64@0.28.2` | DEPENDENCY_ONLY／轉遞dev | MIT | [同版本上游主套件補證；平台notice UNVERIFIED](第三方授權/@esbuild__darwin-arm64@0.28.2/) |
| `@oxc-project/types@0.153.0` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/@oxc-project__types@0.153.0/) |
| `@rolldown/binding-darwin-arm64@1.2.13` | DEPENDENCY_ONLY／轉遞dev | MIT | [同版本上游主套件補證；平台notice UNVERIFIED](第三方授權/@rolldown__binding-darwin-arm64@1.2.13/) |
| `@rolldown/pluginutils@1.0.1` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/@rolldown__pluginutils@1.0.1/) |
| `@types/node@26.6.5` | INTEGRATED／直接dev | MIT | [原文授權](第三方授權/@types__node@26.6.5/) |
| `@typescript/typescript-darwin-arm64@7.0.2` | DEPENDENCY_ONLY／轉遞dev | Apache-2.0 | [原文授權＋notices](第三方授權/@typescript__typescript-darwin-arm64@7.0.2/)；NOTICE／vendor例外完整保留 |
| `detect-libc@2.1.2` | DEPENDENCY_ONLY／轉遞dev | Apache-2.0 | [原文授權](第三方授權/detect-libc@2.1.2/) |
| `esbuild@0.28.2` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/esbuild@0.28.2/) |
| `fdir@6.5.0` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/fdir@6.5.0/) |
| `fsevents@2.3.3` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/fsevents@2.3.3/) |
| `lightningcss@1.33.0` | DEPENDENCY_ONLY／轉遞dev | MPL-2.0 | [原文授權](第三方授權/lightningcss@1.33.0/) |
| `lightningcss-darwin-arm64@1.33.0` | DEPENDENCY_ONLY／轉遞dev | MPL-2.0 | [原文授權](第三方授權/lightningcss-darwin-arm64@1.33.0/) |
| `nanoid@3.3.20` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/nanoid@3.3.20/) |
| `picocolors@1.1.1` | DEPENDENCY_ONLY／轉遞dev | ISC | [原文授權](第三方授權/picocolors@1.1.1/) |
| `picomatch@4.0.7` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/picomatch@4.0.7/) |
| `playwright@1.64.0` | INTEGRATED／直接dev | Apache-2.0 | [原文授權＋notices](第三方授權/playwright@1.64.0/)；NOTICE／bundle sidecars完整保留 |
| `playwright-core@1.64.0` | DEPENDENCY_ONLY／轉遞dev | Apache-2.0 | [原文授權＋notices](第三方授權/playwright-core@1.64.0/)；NOTICE／bundle sidecars完整保留 |
| `postcss@8.5.29` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/postcss@8.5.29/) |
| `rolldown@1.2.13` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權＋notices](第三方授權/rolldown@1.2.13/)；THIRD-PARTY-LICENSE保留 |
| `source-map-js@1.2.2` | DEPENDENCY_ONLY／轉遞dev | BSD-3-Clause | [原文授權](第三方授權/source-map-js@1.2.2/) |
| `tinyglobby@0.2.17` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/tinyglobby@0.2.17/) |
| `tsx@4.23.15` | INTEGRATED／直接dev | MIT | [原文授權](第三方授權/tsx@4.23.15/) |
| `typescript@7.0.2` | INTEGRATED／直接dev | Apache-2.0 | [原文授權＋notices](第三方授權/typescript@7.0.2/)；NOTICE／vendor例外完整保留 |
| `undici-types@8.9.0` | DEPENDENCY_ONLY／轉遞dev | MIT | [原文授權](第三方授權/undici-types@8.9.0/) |
| `vite@8.3.4` | INTEGRATED／直接dev | MIT | [原文授權](第三方授權/vite@8.3.4/)；Vite完整內嵌Apache-2.0/BSD-2-Clause/CC0-1.0/ISC/MIT |


## 必須完整保留的內嵌notices

- Vite 8.3.4的`LICENSE.md`除MIT core外，明列內嵌Apache-2.0、BSD-2-Clause、CC0-1.0、ISC、MIT。這些元件有的没有獨立lock項；不能把lock的93筆主license計數當成内嵌完整SBOM。
- TypeScript 7.0.2與其darwin-arm64包的`NOTICE.txt`列DefinitelyTyped、Unicode、W3C、Go相關BSD／專利附文等；`vendor/vscode-jsonrpc/License.txt`亦保留。NOTICE中的通用LGPL逆向工程聲明不單獨證明本次實際有某個LGPL library；若重分發native工具需繼續核對實際元件。
- Playwright／playwright-core保留`LICENSE`、`NOTICE`、`ThirdPartyNotices.txt`及現有全部六個`.LICENSE` sidecars（expect、babelBundle、esmLoader、utilsBundle、serverRegistry、webp_codec）。ThirdPartyNotices內的範例檔名不是已存在所有binary的完整證明；本輪只備份實際可取得檔案。
- Rolldown保留`LICENSE`及`THIRD-PARTY-LICENSE`；其他本機依賴原文也逐檔保留。總計37個原始授權／notice文件及2個註明來源的相同版本主套件附證。

## 候選開源專案授權矩陣

本輪candidate沒有引入新的產品code/assets。status、可借鑑概念與成本在[整合研究](OPEN-SOURCE-INTEGRATION.md)。root-license僅支持表列一般聲明；assets未逐項驗明不得直接復用。

| 項目／status | 程式授權與官方來源 | Copyleft | 素材／例外／相容性邊界 |
|---|---|---|---|
| Alibaba Open Code Review／INTEGRATED | Apache-2.0；[官方授權](https://github.com/alibaba/open-code-review/blob/v1.12.13/LICENSE) | 無；保留 LICENSE／相關 NOTICE、修改標記；商標權不隨授權移轉 | 未使用上游素材；native CLI 全部 notices UNVERIFIED。 |
| PixiJS／PROPOSED | MIT；[官方授權](https://github.com/pixijs/pixijs/blob/dev/LICENSE) | 無；保留版權與授權文字 | 框架 MIT 不能替外掛、texture、字型授權；未使用。 |
| Phaser／REJECTED | MIT；[官方授權](https://github.com/phaserjs/phaser/blob/master/LICENSE.md) | 無；保留版權與授權文字 | 框架主授權不代表所有示例 assets 相同；未使用。 |
| Unciv／REFERENCE_ONLY | MPL-2.0；例外 TextureArraySpriteBatch.java 為 CC0-1.0；[官方授權](https://github.com/yairm210/Unciv/blob/master/LICENSE) | MPL 檔案層級；媒體依各自 CC BY／BY-SA／CC0／public domain 證據 | CC BY-SA 4.0、CC BY 3.0/4.0、CC0、public domain 混合；逐件 UNVERIFIED。 |
| FreeOrion／REFERENCE_ONLY | 程式 GPL v2；assets CC-BY-SA-3.0；game content scripts 同時有兩種授權要求（見 COPYING）；[官方授權](https://github.com/freeorion/freeorion/blob/master/default/COPYING) | 程式強 copyleft；創作資產 ShareAlike；不能只取 GPL 標籤 | CC-BY-SA-3.0 為上游一般聲明，另外字型／第三方例外；逐件 UNVERIFIED。 |
| Freeciv／REFERENCE_ONLY | GPL v2；已查看的 common/game.h 明確允許 v2 或更晚版本；[官方授權](https://github.com/freeciv/freeciv/blob/main/COPYING) | 強 copyleft；具體引入檔仍查 header／例外 | 素材本輪未逐件驗證，UNVERIFIED。 |
| The Battle for Wesnoth／REFERENCE_ONLY | 程式 GPL-2.0-or-later；多数美術／音樂 GPL v2+，新的創作貢獻 CC-BY-SA-4.0；[官方授權](https://github.com/wesnoth/wesnoth/blob/master/COPYING) | 程式強 copyleft；素材 GPL／ShareAlike 分項 | GPL v2+／CC-BY-SA-4.0 混合，具體項目 UNVERIFIED。 |
| Mindustry／REFERENCE_ONLY | GPL v3；only/or-later suffix 本輪 UNVERIFIED；[官方授權](https://github.com/Anuken/Mindustry/blob/master/LICENSE) | 強 copyleft；不能僅憑完整 GPL 範本斷言 or-later | 具體 asset 授權未驗明，UNVERIFIED。 |
| Widelands／REFERENCE_ONLY | GPL-2.0-or-later；部分素材另依各目錄 Creative Commons 授權；[官方授權](https://github.com/widelands/widelands/blob/master/COPYING) | 程式強 copyleft；素材依個別 CC 条件 | 各目錄混合 Creative Commons；單件授權 UNVERIFIED。 |
| boardgame.io／REFERENCE_ONLY | MIT；[官方授權](https://github.com/boardgameio/boardgame.io/blob/main/LICENSE) | 無；保留版權與授權文字 | 示例／素材另查；本輪未使用。 |
| Zod／PROPOSED | MIT；[官方授權](https://github.com/colinhacks/zod/blob/main/LICENSE) | 無；保留版權與授權文字 | 非素材庫；未使用上游素材。 |
| Vitest／REFERENCE_ONLY | MIT；[官方授權](https://github.com/vitest-dev/vitest/blob/main/LICENSE) | 無；主授權不替其全部轉遞依賴授權 | 非素材庫；內嵌／轉遞義務需重新盤查。 |
| Playwright／INTEGRATED | Apache-2.0；NOTICE 與 bundled sidecar licenses 另保留；[官方授權](https://github.com/microsoft/playwright/blob/v1.64.0/LICENSE) | 主程式無；內嵌／browser binaries 依各自授權 | 工具 bundles 的 sidecars 已複製；瀏覽器二進位本輪未盤查，UNVERIFIED。 |


GPL程式只作閱讀／概念研究沒有產生本輪直接移植義務。若日後複製／翻譯／改寫受授權的實際code，仍可能成為衍生或受涵蓋作品；換語言、把函式拆開並不構成授權豁免。GPL的source供給與整體衍生作品條件依具体GPL版本與引入方式判斷；本輪未作定案。官方上游[Freeciv COPYING](https://github.com/freeciv/freeciv/blob/main/COPYING)§2／§3、[Mindustry LICENSE](https://github.com/Anuken/Mindustry/blob/master/LICENSE)提供條款。

Creative Commons BY素材需保存作者、来源、license與修改資訊；BY-SA衍生素材另有ShareAlike要求，不能只保留URL或改標MIT。参考[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)與[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；實際3.0／4.0版本要隨個別檔查。CC0／public domain聲明也不替第三方商標、肖像或未授權素材担保。

## 自有Canvas與資產來源

現行`docs/開源與資產盤查.md`和專案AGENTS聲明：地形、單位、據點與遺跡以自行撰寫Canvas2D幾何繪圖，不使用Polytopia專有圖、UI、圖示、字型、音效、地圖或程式。本輪掃描`src/ui/map.ts`可見path/arc/fillRect/fillText幾何繪法；`src`與`dist`沒有外部圖、影音、字型檔，source沒有外部資產URL／new Image／new Audio。CSS僅指定使用者裝置字型名稱，沒有嵌入字型。

這支持**目前沒有打包第三方媒體的來源觀測**，不等於獨立完成原創／所有權法律鉴定。原創聲明不提供public license；系統字体名称也不提供重分發字体文件的權利。若之後加入美術／聲音／字型，需逐件新增作者、下載URL、精確檔SHA-256、license原文、修改、署名方式與發布範圍。

## 待處理的重分發決策

- 本次使用者自己的專案內部交接可依現有授權保留；對外发布前需要使用者決定自有程式／素材的授權與權利範圍。本研究没有替root新增LICENSE或把原版改成開源。
- Source-only包保留manifest/lock與本份notices；若只發布browser dist，应确认真正包含的第三方片段；若包含native/browsers/node_modules則重新盤查實際平台与source提供。
- 未安裝的68個optional包：目前只有lock宣告，授權文字／native內嵌義務UNVERIFIED。重建別的平台后需重新核對；不把NOT_INSTALLED寫成授權不存在。
- 候選游戏素材、GPL suffix例外、OCR release完整notices及原生binary元件仍有UNVERIFIED項；本輪沒有直接借用，沒有把這些項填PASS。
