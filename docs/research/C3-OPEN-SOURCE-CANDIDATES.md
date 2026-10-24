# PROJECT4X 開源／公開來源候選研究（2026-10-18）

查詢日期：2026-10-18（Asia/Taipei）。範圍：官方 repository、官方 package metadata、官方文件與 W3C。這是採用決策的證據報告；**本輪新增依賴數為 0、第三方元件整合數為 0**，沒有改動 `project/`、lockfile、遊戲規則或既有 art。DHybrid 已批准的 art 整合由主整合工作處理，本報告不提出替換風格。

## 基準、證據限制與判定定義

本機唯讀證據：`project/package.json` 為 TypeScript **7.0.2**、Vite **8.3.4**，`dependencies` 不存在；devDependencies 另有 tsx 4.23.15、Playwright 1.64.0。`src/ui/map.ts:25` 使用 `canvas.getContext('2d')`，`src/main.ts:22` 使用 `document.createElement`。因此基準是 **Canvas2D + Native DOM + TypeScript**。此處沒有 React runtime，也沒有 Pixi renderer。

`project/AGENTS.md` 規定唯一可變權威是既有 GameState／applyCommand；UI 只能接 Observation、合法 Actions 與安全事件。任何候選都不得新增第二 reducer、繞過 session、將真實世界狀態洩漏到可見層，或改寫既有 save/load/replay。

- **DIRECT_USE**：技術棧可直接採用的候選，仍須在未來另行核定依賴、pin 版本、測量和實測。不是「本輪已使用」。
- **ADAPT_IDEA**：僅採納行為／資訊架構原則，以既有原生技術實作；未複製元件程式、assets 或引入 runtime。
- **RESEARCH_ONLY**：保留研究；當前不加入。明確觸發條件成立後才能 PoC。
- **REJECT**：本輪直接整合不合適；不是對該專案整體品質的否定。

所有 **BUNDLE_COST 的 bytes／gzip／brotli／解析時間／GPU 記憶體增量均為 UNVERIFIED**：本研究沒有安裝、下載發佈包或建立量測 build，不能以宣傳值或 npm unpacked size 代替本案增量。整合成本的低／中／高是針對本案的工程判斷，不是工時承諾。所有候選的完整弱點審計、當日 advisories、轉依賴稽核與本案安全實測均為 **UNVERIFIED**，不能由授權或人氣推導安全。

版本採官方 package.json 的 **repo 版本觀察值**；有驗到 GitHub latest release 時另列。monorepo 的 CLI／私有網站版本不等於每個元件版本。GitHub commits 頁部分由瀏覽服務標示「上月爬取」；其日期僅是**可觀察維護紀錄的下界**，不能當作 10-18 的最新 HEAD。未能取得的精確發佈年份／時間不補猜。官方 API 端點本次無法由瀏覽工具讀取，沒有把失敗讀取當作證據。

## 判定總表

| 候選 | 判定 | 本案理由 | 本輪狀態 |
|---|---|---|---|
| Floating UI `@floating-ui/dom` | DIRECT_USE（候選） | 原生 DOM 定位相容；只在既有定位確有需求時考慮 | NOT_INTEGRATED |
| PixiJS `pixi.js` | RESEARCH_ONLY | 需 Canvas2D 真實瓶頸證據才進隔離 PoC | NOT_INTEGRATED |
| Pixi UI `@pixi/ui` | REJECT | 需要 Pixi runtime；重做 DOM 控制並增加 a11y 工作 | NOT_INTEGRATED |
| Web Awesome 開源核心 | RESEARCH_ONLY | 可接原生 DOM，但 Lit／custom elements／主題與 assets 管理增加成本 | NOT_INTEGRATED |
| boardgame.io | REJECT | 對遊戲 state／moves／同步有所有權，與唯一既有 reducer 衝突 | NOT_INTEGRATED |
| Magic UI 開源元件 | ADAPT_IDEA | 只參考輕量狀態回饋；React／Next／registry 元件不直接移植 | REFERENCE_ONLY |
| shadcn/ui | ADAPT_IDEA | 參考可組合的控制層級與狀態設計；不導入 React 生態 | REFERENCE_ONLY |
| React Aria／react-spectrum | ADAPT_IDEA | 參考焦點、鍵盤、標籤規則；React 元件不整合 | REFERENCE_ONLY |
| React Bits | REJECT | React 不符現棧，且 MIT + Commons Clause 不是純 MIT | NOT_INTEGRATED |
| W3C WAI-ARIA APG | ADAPT_IDEA | 直接作驗收依據；參考文件不是 runtime 整合 | REFERENCE_ONLY |

## 1. Floating UI

| 欄位 | 核對結果 |
|---|---|
| LICENSE | MIT；散布程式或實質部分須保留版權及授權聲明。[官方 LICENSE](https://raw.githubusercontent.com/floating-ui/floating-ui/master/LICENSE) |
| VERSION | `@floating-ui/dom` **1.8.0**，官方 master package.json 的 repo 觀察值；release 清單也列出同版。[metadata](https://raw.githubusercontent.com/floating-ui/floating-ui/master/packages/dom/package.json)、[releases](https://github.com/floating-ui/floating-ui/releases) |
| MAINTENANCE | release 清單可見 DOM 1.8.0 與 utils/core 同批更新，含 viewport／observer／型別修正；頁面標示 07-11，精確年份不由簡略 UI 推定。[release 清單](https://github.com/floating-ui/floating-ui/releases) |
| TECH_STACK | TypeScript／ESM，DOM 套件依賴 core、utils；React 是另選套件，不是 DOM 版的 runtime 必要條件。[package](https://raw.githubusercontent.com/floating-ui/floating-ui/master/packages/dom/package.json)、[vanilla 文件](https://floating-ui.com/docs/getting-started#vanilla) |
| BUNDLE_COST | **UNVERIFIED**。官方說明模組化／tree shaking，package 標示 sideEffects=false；這不提供本案實際增量。[設計說明](https://floating-ui.com/docs/getting-started#design) |
| INTEGRATION_COST | **低～中（判斷）**：只處理 tooltip／popover 的 viewport collision、scroll／resize 重新定位；須有 mount/unmount 清理，不改 command 接線。[autoUpdate](https://floating-ui.com/docs/autoupdate) |
| COMPATIBILITY | Native DOM／ESM 符合；Canvas 選格可用 virtual reference 對映畫面座標，但 camera／DPR／zoom 座標正確性未測。TS7／Vite8 實際 build 為 **UNVERIFIED**。[virtual elements](https://floating-ui.com/docs/virtual-elements) |
| SECURITY | **UNVERIFIED**。沒有執行依賴／弱點掃描；安全責任仍包括只將 Observation 可見內容寫入 DOM、避免不可信 HTML。定位工具不處理本案資料授權邊界。 |
| ACCESSIBILITY | DOM 版只提供定位；官方把互動 hooks／可存取浮層組合放在 React 選項。採 DOM 版仍要自己完成 accessible name、keyboard、focus、Escape；不得宣稱裝套件就通過。[功能分層](https://github.com/floating-ui/floating-ui)、[APG 原則](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) |

**決策：DIRECT_USE（候選，未採用）。** 原生 DOM 相容性最佳；目前沒有證據顯示既有 DHybrid 必須新增這個 dependency。未來若多個 tooltip／popover 的碰撞處理重複且實測有缺陷，再做最小接點與尺寸量測。不要為了使用它引入 React。

## 2. PixiJS

| 欄位 | 核對結果 |
|---|---|
| LICENSE | MIT，保留上游聲明。[LICENSE](https://raw.githubusercontent.com/pixijs/pixijs/dev/LICENSE) |
| VERSION | 官方 GitHub latest release 指向 **v8.22.0**；dev package.json 也為 8.22.0，查詢日 2026-10-18。[stable release](https://github.com/pixijs/pixijs/releases/tag/v8.22.0)、[repo package](https://raw.githubusercontent.com/pixijs/pixijs/dev/package.json) |
| MAINTENANCE | latest release 可見 10-01 與後續 dev commits；有獨立單元／視覺／型別測試 scripts。簡略 release UI 未顯示年份，未補猜。[release](https://github.com/pixijs/pixijs/releases/tag/v8.22.0)、[scripts](https://raw.githubusercontent.com/pixijs/pixijs/dev/package.json) |
| TECH_STACK | TypeScript、WebGL／WebGPU renderer、scene graph、textures、ticker；與現有 Canvas2D 是不同 renderer 路徑。[官方 repository](https://github.com/pixijs/pixijs) |
| BUNDLE_COST | **UNVERIFIED**。GPU textures、renderer、選用 extensions 與載入成本均未量測；不可只引用「lightweight」。[exports／dependencies](https://raw.githubusercontent.com/pixijs/pixijs/dev/package.json) |
| INTEGRATION_COST | **高（判斷）**：需重接 camera、圖層、命中測試、asset lifecycle、context-loss 與觀察者安全邊界；不應以畫面看起來流暢代替 regression 驗證。 |
| COMPATIBILITY | Vite ESM 形式上相容；Canvas2D 繪製程式不能原封搬入。TS7／Vite8、裝置 WebGL/WebGPU 支援與本案 fog、DPR、touch 路徑均 **UNVERIFIED**。 |
| SECURITY | **UNVERIFIED**。官方 package 有 SVG／XML 與圖像解析相關依賴，未掃描其發佈圖；PoC 僅使用已批准的本機 art，不能藉 renderer 替換擴張可讀 canonical state。[依賴](https://raw.githubusercontent.com/pixijs/pixijs/dev/package.json) |
| ACCESSIBILITY | 官方明示 opt-in DOM overlay，需 import accessibility 並逐物件標示可存取屬性；canvas 視覺物件不會自動取得完整語意。[a11y 文件](https://pixijs.com/8.x/guides/components/accessibility) |

**決策：RESEARCH_ONLY。** 只有在相同地圖／seed／art／裝置的 profiler 顯示 Canvas2D 繪圖為瓶頸，且先做快取、避免不必要 redraw 後仍不足，才建立隔離 PoC。比較 frame-time 分布、初始載入、記憶體、選格與鍵盤實作；沒有數據就維持目前 renderer。官方效能文件也建議依實際需要優化，culling 是否有利取決於 CPU/GPU 瓶頸。[performance tips](https://pixijs.com/8.x/guides/concepts/performance-tips)

## 3. Pixi UI（pixijs/ui）

| 欄位 | 核對結果 |
|---|---|
| LICENSE | MIT。[LICENSE](https://raw.githubusercontent.com/pixijs/ui/main/LICENSE) |
| VERSION | `@pixi/ui` **2.4.1**，官方 main package.json 的 repo 觀察值；latest release 端點本次讀取失敗，**不聲稱為已驗證 npm latest**。[package](https://raw.githubusercontent.com/pixijs/ui/main/package.json) |
| MAINTENANCE | 可見 commits 紀錄到 **2026-08-26**（resize／fit 驗證修正）；此 commits 頁有快取，不能當當日 HEAD。其舊版本紀錄與當日 package 版本不同，不以舊 commit 列表推翻 package。[history](https://github.com/pixijs/ui/commits/main/) |
| TECH_STACK | TypeScript、Pixi 控制元件；peerDependency `pixi.js ^8.6.2`，runtime 依賴 `tweedle.js ^2.1.0`。[package](https://raw.githubusercontent.com/pixijs/ui/main/package.json) |
| BUNDLE_COST | **UNVERIFIED**，必須連同 Pixi peer runtime 與動畫依賴計算，不能只報 UI 自身。 |
| INTEGRATION_COST | **高（判斷）**：將既有 DOM buttons／panels 換成場景元件，需重新做文字縮放、焦點、可存取名稱及事件接線。 |
| COMPATIBILITY | 不是 Native DOM 控制庫；僅版本範圍形式上接納目前 Pixi 8 候選，本案並未引入 Pixi。TS7／Vite8／實際 renderer 相容 **UNVERIFIED**。 |
| SECURITY | **UNVERIFIED**，未稽核 Pixi／tweedle.js 轉依賴；控制的 enabled 狀態仍不能取代 session 對 command 的驗證。 |
| ACCESSIBILITY | repo／package 不提供足夠證據保證所有控制元件具備 DOM 等價鍵盤語意。需另啟用並驗證 Pixi accessibility layer；完成度 **UNVERIFIED**。[Pixi a11y](https://pixijs.com/8.x/guides/components/accessibility) |

**決策：REJECT（本輪直接整合）。** 現有 Native DOM 適合 HUD／控制。即使未來地圖 renderer 採 Pixi，也可保留 DOM 控制，沒有必要同時遷移 UI。

## 4. Web Awesome（開源核心）

| 欄位 | 核對結果 |
|---|---|
| LICENSE | `@awesome.me/webawesome` 核心 MIT；**Pro 元件／圖示／patterns 不是由核心 MIT 自動授權**，實際項目要另核對。[repo LICENSE](https://raw.githubusercontent.com/shoelace-style/webawesome/next/LICENSE.md)、[核心授權](https://webawesome.com/license)、[安裝文件的 Pro 區分](https://webawesome.com/docs/) |
| VERSION | 核心 package 與官方 latest release 均為 **3.14.0**。[package](https://raw.githubusercontent.com/shoelace-style/webawesome/next/packages/webawesome/package.json)、[stable release](https://github.com/shoelace-style/webawesome/releases/tag/v3.14.0) |
| MAINTENANCE | latest release 顯示 09-24，next 有後續 commits；package 有 browser／SSR／hydration／parts 驗證 scripts。精確 release 年份未由簡略 UI 補猜。[release](https://github.com/shoelace-style/webawesome/releases/tag/v3.14.0)、[scripts](https://raw.githubusercontent.com/shoelace-style/webawesome/next/packages/webawesome/package.json) |
| TECH_STACK | Lit 3、Custom Elements、ESM，另有 React wrapper；使用原生 HTML 不必遷移 React。[repo 技術說明](https://github.com/shoelace-style/webawesome)、[package](https://raw.githubusercontent.com/shoelace-style/webawesome/next/packages/webawesome/package.json) |
| BUNDLE_COST | **UNVERIFIED**。官方允許 cherry-pick；Vite 應用 dist 讓 bundler 共享依賴。theme CSS、Lit、元件與 assets 都必須納入。[安裝細節](https://webawesome.com/docs/) |
| INTEGRATION_COST | **中～高（判斷）**：事件與 attributes／properties、CSS parts／tokens、custom-element 焦點、assets base path 都需接線；既有 DHybrid CSS/控制有回歸成本。 |
| COMPATIBILITY | Native DOM 方向相容；TS7／Vite8、既有 CSS／overlay 與瀏覽器矩陣實測 **UNVERIFIED**。官方有獨立瀏覽器支援政策，不能只看套件可 import。[browser policy](https://webawesome.com/docs/resources/browser-support) |
| SECURITY | **UNVERIFIED**。本案若採用應 pin 本機版本及 assets；官方示例的外部 CDN／kit code 不等於本案已同意外部載入。未執行 SCA。 |
| ACCESSIBILITY | 官方有無障礙承諾，dialog 文件列出 label、Escape、autofocus；使用方仍需給名稱、測焦點回復與真實讀屏行為。[承諾](https://webawesome.com/docs/resources/accessibility)、[dialog](https://webawesome.com/docs/components/dialog) |

**決策：RESEARCH_ONLY。** 是不需 React 的完整控制庫備選，但本輪現有 art／HUD 整合不需要替換整組控制。未來若多個原生複合控制維護成本已被證實，可挑單個開源核心元件試用，不能整包載入 Pro 或全域 reset。

## 5. boardgame.io

| 欄位 | 核對結果 |
|---|---|
| LICENSE | MIT。[LICENSE](https://raw.githubusercontent.com/boardgameio/boardgame.io/main/LICENSE) |
| VERSION | repo package **0.50.2**；GitHub latest 端點導回 release 清單，未取得可驗證的 latest tag，所以只記 repo 版。[package](https://raw.githubusercontent.com/boardgameio/boardgame.io/main/package.json)、[releases](https://github.com/boardgameio/boardgame.io/releases) |
| MAINTENANCE | 可見 history 到 **2026-08-10** 的 ESLint migration；有 2026-08 的 CI／依賴維護紀錄，不因版本數字小就宣稱無維護。快取限制同前。[history](https://github.com/boardgameio/boardgame.io/commits/main/) |
| TECH_STACK | JS／TS 回合制引擎、state management、moves／phases、client/server/storage 同步、AI、logs；有 vanilla JS client，**不是只能用 React**。[官方 README](https://raw.githubusercontent.com/boardgameio/boardgame.io/main/README.md) |
| BUNDLE_COST | **UNVERIFIED**；client、core、server 等有獨立 exports，但本案實際引用圖未建立。[exports](https://raw.githubusercontent.com/boardgameio/boardgame.io/main/package.json) |
| INTEGRATION_COST | **極高（判斷）**：即使能用 vanilla client，也要改寫 state／moves／turn／persistence 所有權，與既有 canonical session 形成第二控制中心。 |
| COMPATIBILITY | 語言及 view-agnostic 形式相容；**架構不相容**。本案不能加入第二 reducer／繞過 GameplayPort，不能以元件外觀採用之名遷移引擎。 |
| SECURITY | **UNVERIFIED**；不啟動其 server／同步／儲存層；其 multiplayer 能力也不能證明本案 fog-safe、requestId 冪等或 import 驗證已符合。 |
| ACCESSIBILITY | 官方定位為 view-layer agnostic，引擎不保證本案 DOM／Canvas 控制可存取；本案介面 QA 仍獨立。[README](https://raw.githubusercontent.com/boardgameio/boardgame.io/main/README.md) |

**決策：REJECT（本輪整合）。** 現有 deterministic core/session/command 邊界已具權威；導入另一個遊戲狀態框架沒有局部 UI 收益，也違反唯一 reducer 約束。此判斷基於架構，不是因為它支援 React。

## 6. Magic UI

| 欄位 | 核對結果 |
|---|---|
| LICENSE | 公開 repository 元件 MIT；Pro templates／premium 項目另算，不把公開 repo 授權外推。[LICENSE](https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md)、[官方安裝頁 Pro 區塊](https://magicui.design/docs/installation) |
| VERSION | repo 根為 private monorepo **0.1.0**，**不是所有元件共同發佈版**；採用單個 registry 元件時須另 pin source。此研究只記 2026-10-18 repo 觀察值。[package](https://raw.githubusercontent.com/magicuidesign/magicui/main/package.json) |
| MAINTENANCE | 可見 history 到 **2026-09-08**，含 lockfile／Next 安全更新；上游這些維護不構成本案安全 PASS。[history](https://github.com/magicuidesign/magicui/commits/main/) |
| TECH_STACK | 以 shadcn registry 流程拷入元件，安裝頁使用 Next 專案與 JSX；個別元件依賴需逐項檢查，不能把整站依賴當成每個元件必需品。[官方安裝](https://magicui.design/docs/installation) |
| BUNDLE_COST | **UNVERIFIED**，取決於選定元件、動畫依賴與 copied source。根 package 版本無法代表 runtime 成本。 |
| INTEGRATION_COST | 直接移植 **高（判斷）**；僅以原生 CSS／DOM 做簡單狀態回饋則低。不要為視覺裝飾加 React／Next 或執行 registry init。 |
| COMPATIBILITY | JSX 元件不能直接接現有 Native DOM；本輪只可參考已批准視覺中的狀態過渡概念。TS7／Vite8 的直接整合 **UNVERIFIED**。 |
| SECURITY | **UNVERIFIED**。未執行 shadcn CLI、未取 registry code；若未來拷入程式，責任將包含 source review、轉依賴與後續更新。 |
| ACCESSIBILITY | repo MIT 與視覺 demo 不等於可存取保證；需個別檢驗 reduced motion、flash、焦點與讀屏是否受裝飾干擾，完成度 **UNVERIFIED**。 |

**決策：ADAPT_IDEA。** 可參考有節制的狀態回饋，沿用本案 art、原生 CSS 與 DOM；沒有複製元件、沒有新增設計方向，也未聲稱已使用 Magic UI。

## 7. shadcn/ui

| 欄位 | 核對結果 |
|---|---|
| LICENSE | 公開 repo MIT；取用實質程式仍需保留聲明，第三方 registry 各有來源責任。[LICENSE](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md) |
| VERSION | 官方 CLI package `shadcn` **4.22.0** 是 repo 觀察值；**不是全部 UI 元件版本**。`releases/latest` 本次指到 helpers 子包，故未把它當 CLI latest。[CLI package](https://raw.githubusercontent.com/shadcn-ui/ui/main/packages/shadcn/package.json)、[monorepo releases](https://github.com/shadcn-ui/ui/releases) |
| MAINTENANCE | 可見 commits 到 **2026-09-08**；repo 版與單頁快取可能時間不同，不宣稱是當日 HEAD。[history](https://github.com/shadcn-ui/ui/commits/main/) |
| TECH_STACK | 官方定位為可修改元件原碼與 code distribution；既有 Vite 安裝路徑是 React／TSX 與 Tailwind 生態，不等於原生 Vite TS 都能直接使用。[設計原則](https://ui.shadcn.com/docs)、[Vite 安裝](https://ui.shadcn.com/docs/installation/vite) |
| BUNDLE_COST | **UNVERIFIED**。CLI 不是瀏覽器 runtime 成本；應算 copied components、React、實際 primitive／icons／styles。 |
| INTEGRATION_COST | 直接採元件 **高（判斷）**：引入 JSX／React／CSS 工具鏈與現有 DOM 共存；本輪不允許為此重寫。 |
| COMPATIBILITY | 部分 CSS／資訊結構原則可參考；React 控制不可當 drop-in Native DOM。TS7／Vite8 實測 **UNVERIFIED**。 |
| SECURITY | **UNVERIFIED**。registry/CLI 會把外部 code 寫入專案；本輪未執行。複製式分發由本案承擔後續 patch 與 source review。 |
| ACCESSIBILITY | 官方宣稱 accessible components；這是元件設計起點，不能保證本案修改後的焦點、labels、disabled 與 canvas 接線仍正確。[官方介紹](https://ui.shadcn.com/docs) |

**決策：ADAPT_IDEA。** 僅參考按鈕層級、狀態、一致的命名和複合控制拆分；不用 React 替換 HUD，也沒有執行 CLI。核心 a11y 行為以 APG 對照實作。

## 8. React Aria／adobe/react-spectrum

| 欄位 | 核對結果 |
|---|---|
| LICENSE | Apache-2.0；若未來散布實質程式，需遵守授權、修改註記與適用 NOTICE 保留義務；不是把它改標本案 MIT。[LICENSE](https://raw.githubusercontent.com/adobe/react-spectrum/main/LICENSE) |
| VERSION | `react-aria-components` main package **1.22.1**；官方 latest release 目前指向 **1.22.0**。前者是 repo 觀察值，後者是已核對 release，不混稱。[package](https://raw.githubusercontent.com/adobe/react-spectrum/main/packages/react-aria-components/package.json)、[release](https://github.com/adobe/react-spectrum/releases/tag/react-aria-components@1.22.0) |
| MAINTENANCE | release 頁可見 10-09 與其後 main commits。精確年份未從簡略 UI 補猜；repo 1.22.1 表示 source 與 release 存在版本差。[release](https://github.com/adobe/react-spectrum/releases/tag/react-aria-components@1.22.0) |
| TECH_STACK | React components／React Aria／React Stately；react、react-dom 都是 peer dependencies。[package](https://raw.githubusercontent.com/adobe/react-spectrum/main/packages/react-aria-components/package.json) |
| BUNDLE_COST | **UNVERIFIED**，需計 React/DOM、實際 Aria/Stately/i18n imports；不能把未引用的 monorepo 都算入，也不能只報單 hook。 |
| INTEGRATION_COST | 直接採用 **高（判斷）**；只參照鍵盤、focus、label 等行為模式為低～中，仍需原生實作與測試。 |
| COMPATIBILITY | 現有 Native DOM 無 React host；不為此改 TSX／renderer。本案 TS7／Vite8 與 actual browser／AT 組合 **UNVERIFIED**。 |
| SECURITY | **UNVERIFIED**。沒有 dependency/advisory scan；不能從 Adobe 維護或 accessibility 測試推導輸入／遊戲資料邊界安全。 |
| ACCESSIBILITY | 官方敘明角色／鍵盤／focus／screen reader 支援與跨 AT 測試，但仍要求有意義標籤、對比、hit targets、focus rings 及 motion preferences。[quality](https://react-aria.adobe.com/quality) |

**決策：ADAPT_IDEA。** 作行為參考，不移植 React components 或建立另一套 state。優先將 APG/原生 HTML 規則映射到現有 controls，且只讀 Observation。

## 9. React Bits

| 欄位 | 核對結果 |
|---|---|
| LICENSE | **MIT + Commons Clause License Condition v1.0**，不是純 MIT。當日官方 LICENSE 允許作為 app／website／product 的一部分使用（含商用），但禁止元件本身的出售、再授權或再散布，範圍含獨立元件、bundle 與移植版；須保留原聲明。不能因 docs 使用 open-source 字樣而省略這個限制。[實際 LICENSE](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md)、[官方介紹的授權摘要](https://reactbits.dev/get-started/introduction#license) |
| VERSION | private 網站 package **0.0.0**，不是可採用的穩定套件版；記錄 2026-10-18 repo snapshot，單元件需精確 source 識別。[package](https://raw.githubusercontent.com/DavidHDev/react-bits/main/package.json) |
| MAINTENANCE | 可見 commits 到 **2026-09-11**，含 prop 文件／預設值一致性修正；09-10 有讀屏文字相關 fix。快取限制同前。[history](https://github.com/DavidHDev/react-bits/commits/main/) |
| TECH_STACK | React 元件，JS／TS × plain CSS／Tailwind 四種 flavor；CSS flavor 仍是 React 元件，**不是 vanilla DOM 版**。個別元件可能需動畫／WebGL 依賴。[官方介紹](https://reactbits.dev/get-started/introduction)、[repo package](https://raw.githubusercontent.com/DavidHDev/react-bits/main/package.json) |
| BUNDLE_COST | **UNVERIFIED**，需逐元件、實際 animation/3D deps 測量；整站 package.json 的依賴不是每個元件都必需。 |
| INTEGRATION_COST | **高（判斷）**：React 遷移與授權再散布邊界均需處理；不能藉轉寫成原生 TS 避開其明文包含 ported version 的限制。 |
| COMPATIBILITY | 不符合本輪 Native DOM/Canvas2D 零新增 runtime 原則；公開 MIT 專案不應默認能將它的實質元件碼重授權為 MIT。實際法律適用／個別商業授權未核定。 |
| SECURITY | **UNVERIFIED**；沒有執行 registry 或動畫／3D 依賴，無安全 PASS。 |
| ACCESSIBILITY | 無本次可驗證的全庫符合性證據；動畫／分字效果需逐項檢驗 reduced motion、讀屏文字與焦點。可見 a11y fix 不等於全庫已驗收。 |

**決策：REJECT（本輪元件碼／移植碼採用）。** 技術棧與特殊限制同時增加成本。純粹看 demo 的抽象視覺觀察不算集成；本輪沒有複製或轉寫任何 React Bits 元件，也不把受限元件內容混入本案 MIT 來源。

## 10. W3C WAI-ARIA Authoring Practices Guide（APG）

| 欄位 | 核對結果 |
|---|---|
| LICENSE | repo 文件採 W3C Software and Document License；所連官方條款現為 **2023 版（2023-01-01 生效）**。若拷入文件／範例碼的實質部分，需保留通知、既有聲明並註記修改，不改標成純 MIT。[repo LICENSE](https://raw.githubusercontent.com/w3c/aria-practices/main/LICENSE.md)、[2023 條款](https://www.w3.org/copyright/software-license-2023/) |
| VERSION | 持續更新的 guide，沒有本案可安裝 semver；記錄查詢日 **2026-10-18**、觀察的 repo history 識別 **7e4034b（2026-07-22）**，此為快取頁可見識別，不宣稱當日 HEAD。[APG](https://www.w3.org/WAI/ARIA/apg/)、[history](https://github.com/w3c/aria-practices/commits/main/) |
| MAINTENANCE | 可見 2026-07 文件／link-checker 更新，2026 年持續有 patterns 行為修正；應以查詢日記錄適用模式，不能把舊記憶當最新規則。[history](https://github.com/w3c/aria-practices/commits/main/) |
| TECH_STACK | HTML／CSS／JavaScript 行為模式與語意指引，非 React 或遊戲 runtime。[官方 guide](https://www.w3.org/WAI/ARIA/apg/) |
| BUNDLE_COST | **UNVERIFIED／不適用於文件參照**。僅參照模式無 runtime package；若未來複製範例程式，增量須另測，不宣稱已量測 0 bytes。 |
| INTEGRATION_COST | **低～中（判斷）**：原生 button／dialog／tabs／keyboard/focus 接線及 QA；依實際控制複雜度增加，不需要重寫遊戲核心。 |
| COMPATIBILITY | 可直接套用 Native DOM 行為原則。APG 明示範例不是跨所有 browser/AT 問題的完整 workaround，且 mobile/touch 支援有局限，仍需真實測試。[read-me-first](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) |
| SECURITY | 沒有新增 runtime 依賴；本案仍需遵守 Observation 與 DOM 安全邊界。文件不提供本案的安全認證，整體驗證 **UNVERIFIED**。 |
| ACCESSIBILITY | 優先使用原生語意；ARIA role 自身不提供鍵盤行為。modal 的 focus／Tab／Escape／回復焦點與 tabs 的 selection／focus 規則可作驗收依據。[原則](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/)、[modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)、[tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) |

**決策：ADAPT_IDEA（行為與驗收參照）。** 可立即用來檢驗既有控制；這是 source reference，並未匯入 W3C runtime、複製範例或聲稱本案通過 WCAG／AT 測試。

## 後續採用門檻與本輪交付狀態

1. **本輪維持既有技術棧與已批准 DHybrid art。** 研究無依賴／lockfile／source mutation；reference 與 integration 分列。
2. 若未來確需 Floating UI 或 Web Awesome，先定義具體失敗案例，再核准單包／單元件版本與授權 notices，量測 production build 的增量，實測鍵盤／pointer／focus／zoom。
3. PixiJS 只在原生 Canvas2D 有可重現效能瓶頸時作隔離 PoC；不得以它重建 canonical state、session 或 command。
4. 不導入 React、不新增 reducer、不加入未審查 assets。所有 UI 仍經 GameplayPort，顯示內容只取安全 Observation。
5. 這份報告沒有產品功能變更，故沒有宣稱 build／玩法／無障礙／安全 gate PASS。驗證僅為來源與報告結構核對。現有產品的實際 QA 與 playability 狀態由主整合 evidence 報告。

工具限制：本 session 沒有可呼叫的 `lsp_diagnostics`；本文件只改外層 Markdown，無程式碼診斷結果可宣稱。未啟動測試 server、未建立 token/cookie、未安裝套件，無背景 QA 程序待清理。
