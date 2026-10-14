# 完整依賴盤點

盤點時間：2026-10-13T23:17:56.826281+08:00。來源：`package.json`、lockfile v3、本機 `node_modules` 與 `src`；本輪只封存，不增刪依賴。

## 結論與範圍

- 專案 `project-4x-mvp@0.1.0`，`private: true`；manifest **0 個 dependencies、5 個 devDependencies**。lock 不含根項共有 **93 筆**，全為 dev；其中 **73 筆 optional**。
- 此次來源主機為 macOS（Darwin）arm64。**25 筆已安裝、68 筆未安裝**；所有未安裝項均為其他平台 optional 套件。鎖定不代表安裝或執行。
- 25 筆本機 package.json 版本／主授權與 lock 一致；根 `node_modules` 未發現 lock 外的頂層套件。23 筆有本機授權檔；2 筆 native 平台包只有宣告與同版本上游授權證據，不能稱二進位完整 notice 已獨立驗明。
- 授權統計只計 lock 的主授權宣告：MIT 55、Apache-2.0 24、MPL-2.0 12、ISC 1、BSD-3-Clause 1。Vite／Playwright／TypeScript 內嵌元件另有 notices，此統計不是全工具鏈的完整元件 SBOM。
- `resolved`、`integrity`、依賴邊、平台條件、package.json／授權檔 SHA-256 完整保留於[機器可讀快照](../../evidence/research/依賴與授權快照.json)。未重抓 tarball，因此不宣稱本機目錄已與 npm integrity 做內容等同驗證。

## 五個直接開發依賴

| 套件 | 鎖定／本機版本 | 實際用途／status | 執行位置 | 主授權 |
|---|---|---|---|---|
| vite | 8.3.4 | INTEGRATED：dev/build、vite.config.ts | 工程工具 | MIT；內嵌授權另列 |
| typescript | 7.0.2 | INTEGRATED：check/build 的 tsc --noEmit | 型別檢查 | Apache-2.0；NOTICE 另列 |
| tsx | 4.23.15 | INTEGRATED：--import tsx 執行 TS tests/headless | Node QA | MIT |
| @types/node | 26.6.5 | INTEGRATED：tsconfig types=node | 僅型別 | MIT |
| playwright | 1.64.0 | INTEGRATED：scripts/browser-check.mjs import chromium | 瀏覽器 QA | Apache-2.0；NOTICE／sidecars 另列 |

## 轉遞依賴的來源

主要邊取自 lock，並保留完整 JSON：

- Vite → lightningcss → detect-libc／平台 lightningcss；Vite → rolldown → @oxc-project/types、@rolldown/pluginutils／平台 binding；Vite → postcss → nanoid、picocolors、source-map-js；Vite → tinyglobby → fdir、picomatch；Vite 亦直接用 picomatch，optional fsevents。
- tsx → esbuild／平台 @esbuild，optional fsevents。
- TypeScript → 平台 @typescript/typescript-*（optional）。
- @types/node → undici-types。Playwright → playwright-core。
- 上述轉遞工具全部為 DEPENDENCY_ONLY；不等於遊戲程式直接整合。未列入 lock 的 optional peer（例如 sass、terser、yaml、jiti、@vitejs/devtools）不算已安裝依賴。

## 瀏覽器執行期核對

`src/main.ts` 只 import 本地 CSS、game、ai、persistence、types 與 map；core/map imports 全指向本專案相對路徑。`index.html` 的 module script 只載入 `/src/main.ts`。source 無第三方 bare imports、dynamic imports、require 或外部 URL 載入；src/dist 無圖片、影音或字型檔。import／URL 行與來源雜湊列於[快照](../../evidence/research/依賴與授權快照.json)。

因此「零執行期第三方依賴」只表示本版遊戲不依賴安裝的第三方引擎／服務；`dist/assets/index-CnxDRYNx.js` 開頭仍含 Vite 生成的 modulepreload bootstrap。不能推導 bundle 沒有任何工具生成片段或 notices 義務。`scripts/browser-check.mjs` 的 Playwright 和 `vite.config.ts` 的 Vite 不在遊戲 source 的執行期 import 圖。

## 93 筆完整 lock 清單

`DIRECT`＝直接 dev；`TRANSITIVE`＝轉遞 dev；`Y`＝lock optional。所有列 dev=true。`INSTALLED` 只表示本次來源機 package.json 存在，封存包未帶 node_modules；新機仍需依 lock 重建。`LOCK_ONLY`＝未檢查不存在的套件授權文字；不是授權已缺失的判定。

| # | 套件 | 版本 | 層級 | Optional | OS / CPU 條件 | 本機狀態 | 主授權／證據 |
|---|---|---|---|---|---|---|---|
| 1 | `@esbuild/aix-ppc64` | 0.28.2 | TRANSITIVE | Y | aix / ppc64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 2 | `@esbuild/android-arm` | 0.28.2 | TRANSITIVE | Y | android / arm | NOT_INSTALLED | MIT／LOCK_ONLY |
| 3 | `@esbuild/android-arm64` | 0.28.2 | TRANSITIVE | Y | android / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 4 | `@esbuild/android-x64` | 0.28.2 | TRANSITIVE | Y | android / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 5 | `@esbuild/darwin-arm64` | 0.28.2 | TRANSITIVE | Y | darwin / arm64 | INSTALLED | MIT／宣告＋上游 tag；平台 notice UNVERIFIED |
| 6 | `@esbuild/darwin-x64` | 0.28.2 | TRANSITIVE | Y | darwin / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 7 | `@esbuild/freebsd-arm64` | 0.28.2 | TRANSITIVE | Y | freebsd / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 8 | `@esbuild/freebsd-x64` | 0.28.2 | TRANSITIVE | Y | freebsd / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 9 | `@esbuild/linux-arm` | 0.28.2 | TRANSITIVE | Y | linux / arm | NOT_INSTALLED | MIT／LOCK_ONLY |
| 10 | `@esbuild/linux-arm64` | 0.28.2 | TRANSITIVE | Y | linux / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 11 | `@esbuild/linux-ia32` | 0.28.2 | TRANSITIVE | Y | linux / ia32 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 12 | `@esbuild/linux-loong64` | 0.28.2 | TRANSITIVE | Y | linux / loong64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 13 | `@esbuild/linux-mips64el` | 0.28.2 | TRANSITIVE | Y | linux / mips64el | NOT_INSTALLED | MIT／LOCK_ONLY |
| 14 | `@esbuild/linux-ppc64` | 0.28.2 | TRANSITIVE | Y | linux / ppc64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 15 | `@esbuild/linux-riscv64` | 0.28.2 | TRANSITIVE | Y | linux / riscv64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 16 | `@esbuild/linux-s390x` | 0.28.2 | TRANSITIVE | Y | linux / s390x | NOT_INSTALLED | MIT／LOCK_ONLY |
| 17 | `@esbuild/linux-x64` | 0.28.2 | TRANSITIVE | Y | linux / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 18 | `@esbuild/netbsd-arm64` | 0.28.2 | TRANSITIVE | Y | netbsd / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 19 | `@esbuild/netbsd-x64` | 0.28.2 | TRANSITIVE | Y | netbsd / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 20 | `@esbuild/openbsd-arm64` | 0.28.2 | TRANSITIVE | Y | openbsd / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 21 | `@esbuild/openbsd-x64` | 0.28.2 | TRANSITIVE | Y | openbsd / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 22 | `@esbuild/openharmony-arm64` | 0.28.2 | TRANSITIVE | Y | openharmony / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 23 | `@esbuild/sunos-x64` | 0.28.2 | TRANSITIVE | Y | sunos / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 24 | `@esbuild/win32-arm64` | 0.28.2 | TRANSITIVE | Y | win32 / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 25 | `@esbuild/win32-ia32` | 0.28.2 | TRANSITIVE | Y | win32 / ia32 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 26 | `@esbuild/win32-x64` | 0.28.2 | TRANSITIVE | Y | win32 / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 27 | `@oxc-project/types` | 0.153.0 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 28 | `@rolldown/binding-android-arm-eabi` | 1.2.13 | TRANSITIVE | Y | android / arm | NOT_INSTALLED | MIT／LOCK_ONLY |
| 29 | `@rolldown/binding-android-arm64` | 1.2.13 | TRANSITIVE | Y | android / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 30 | `@rolldown/binding-darwin-arm64` | 1.2.13 | TRANSITIVE | Y | darwin / arm64 | INSTALLED | MIT／宣告＋上游 tag；平台 notice UNVERIFIED |
| 31 | `@rolldown/binding-darwin-x64` | 1.2.13 | TRANSITIVE | Y | darwin / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 32 | `@rolldown/binding-freebsd-x64` | 1.2.13 | TRANSITIVE | Y | freebsd / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 33 | `@rolldown/binding-linux-arm-gnueabihf` | 1.2.13 | TRANSITIVE | Y | linux / arm | NOT_INSTALLED | MIT／LOCK_ONLY |
| 34 | `@rolldown/binding-linux-arm64-gnu` | 1.2.13 | TRANSITIVE | Y | linux / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 35 | `@rolldown/binding-linux-arm64-musl` | 1.2.13 | TRANSITIVE | Y | linux / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 36 | `@rolldown/binding-linux-ppc64-gnu` | 1.2.13 | TRANSITIVE | Y | linux / ppc64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 37 | `@rolldown/binding-linux-s390x-gnu` | 1.2.13 | TRANSITIVE | Y | linux / s390x | NOT_INSTALLED | MIT／LOCK_ONLY |
| 38 | `@rolldown/binding-linux-x64-gnu` | 1.2.13 | TRANSITIVE | Y | linux / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 39 | `@rolldown/binding-linux-x64-musl` | 1.2.13 | TRANSITIVE | Y | linux / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 40 | `@rolldown/binding-openharmony-arm64` | 1.2.13 | TRANSITIVE | Y | openharmony / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 41 | `@rolldown/binding-win32-arm64-msvc` | 1.2.13 | TRANSITIVE | Y | win32 / arm64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 42 | `@rolldown/binding-win32-x64-msvc` | 1.2.13 | TRANSITIVE | Y | win32 / x64 | NOT_INSTALLED | MIT／LOCK_ONLY |
| 43 | `@rolldown/pluginutils` | 1.0.1 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 44 | `@types/node` | 26.6.5 | DIRECT | N | all / all | INSTALLED | MIT／本機授權檔 |
| 45 | `@typescript/typescript-aix-ppc64` | 7.0.2 | TRANSITIVE | Y | aix / ppc64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 46 | `@typescript/typescript-darwin-arm64` | 7.0.2 | TRANSITIVE | Y | darwin / arm64 | INSTALLED | Apache-2.0／本機授權檔 |
| 47 | `@typescript/typescript-darwin-x64` | 7.0.2 | TRANSITIVE | Y | darwin / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 48 | `@typescript/typescript-freebsd-arm64` | 7.0.2 | TRANSITIVE | Y | freebsd / arm64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 49 | `@typescript/typescript-freebsd-x64` | 7.0.2 | TRANSITIVE | Y | freebsd / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 50 | `@typescript/typescript-linux-arm` | 7.0.2 | TRANSITIVE | Y | linux / arm | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 51 | `@typescript/typescript-linux-arm64` | 7.0.2 | TRANSITIVE | Y | linux / arm64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 52 | `@typescript/typescript-linux-loong64` | 7.0.2 | TRANSITIVE | Y | linux / loong64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 53 | `@typescript/typescript-linux-mips64el` | 7.0.2 | TRANSITIVE | Y | linux / mips64el | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 54 | `@typescript/typescript-linux-ppc64` | 7.0.2 | TRANSITIVE | Y | linux / ppc64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 55 | `@typescript/typescript-linux-riscv64` | 7.0.2 | TRANSITIVE | Y | linux / riscv64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 56 | `@typescript/typescript-linux-s390x` | 7.0.2 | TRANSITIVE | Y | linux / s390x | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 57 | `@typescript/typescript-linux-x64` | 7.0.2 | TRANSITIVE | Y | linux / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 58 | `@typescript/typescript-netbsd-arm64` | 7.0.2 | TRANSITIVE | Y | netbsd / arm64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 59 | `@typescript/typescript-netbsd-x64` | 7.0.2 | TRANSITIVE | Y | netbsd / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 60 | `@typescript/typescript-openbsd-arm64` | 7.0.2 | TRANSITIVE | Y | openbsd / arm64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 61 | `@typescript/typescript-openbsd-x64` | 7.0.2 | TRANSITIVE | Y | openbsd / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 62 | `@typescript/typescript-sunos-x64` | 7.0.2 | TRANSITIVE | Y | sunos / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 63 | `@typescript/typescript-win32-arm64` | 7.0.2 | TRANSITIVE | Y | win32 / arm64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 64 | `@typescript/typescript-win32-x64` | 7.0.2 | TRANSITIVE | Y | win32 / x64 | NOT_INSTALLED | Apache-2.0／LOCK_ONLY |
| 65 | `detect-libc` | 2.1.2 | TRANSITIVE | N | all / all | INSTALLED | Apache-2.0／本機授權檔 |
| 66 | `esbuild` | 0.28.2 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 67 | `fdir` | 6.5.0 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 68 | `fsevents` | 2.3.3 | TRANSITIVE | Y | darwin / all | INSTALLED | MIT／本機授權檔 |
| 69 | `lightningcss` | 1.33.0 | TRANSITIVE | N | all / all | INSTALLED | MPL-2.0／本機授權檔 |
| 70 | `lightningcss-android-arm64` | 1.33.0 | TRANSITIVE | Y | android / arm64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 71 | `lightningcss-darwin-arm64` | 1.33.0 | TRANSITIVE | Y | darwin / arm64 | INSTALLED | MPL-2.0／本機授權檔 |
| 72 | `lightningcss-darwin-x64` | 1.33.0 | TRANSITIVE | Y | darwin / x64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 73 | `lightningcss-freebsd-x64` | 1.33.0 | TRANSITIVE | Y | freebsd / x64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 74 | `lightningcss-linux-arm-gnueabihf` | 1.33.0 | TRANSITIVE | Y | linux / arm | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 75 | `lightningcss-linux-arm64-gnu` | 1.33.0 | TRANSITIVE | Y | linux / arm64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 76 | `lightningcss-linux-arm64-musl` | 1.33.0 | TRANSITIVE | Y | linux / arm64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 77 | `lightningcss-linux-x64-gnu` | 1.33.0 | TRANSITIVE | Y | linux / x64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 78 | `lightningcss-linux-x64-musl` | 1.33.0 | TRANSITIVE | Y | linux / x64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 79 | `lightningcss-win32-arm64-msvc` | 1.33.0 | TRANSITIVE | Y | win32 / arm64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 80 | `lightningcss-win32-x64-msvc` | 1.33.0 | TRANSITIVE | Y | win32 / x64 | NOT_INSTALLED | MPL-2.0／LOCK_ONLY |
| 81 | `nanoid` | 3.3.20 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 82 | `picocolors` | 1.1.1 | TRANSITIVE | N | all / all | INSTALLED | ISC／本機授權檔 |
| 83 | `picomatch` | 4.0.7 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 84 | `playwright` | 1.64.0 | DIRECT | N | all / all | INSTALLED | Apache-2.0／本機授權檔 |
| 85 | `playwright-core` | 1.64.0 | TRANSITIVE | N | all / all | INSTALLED | Apache-2.0／本機授權檔 |
| 86 | `postcss` | 8.5.29 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 87 | `rolldown` | 1.2.13 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 88 | `source-map-js` | 1.2.2 | TRANSITIVE | N | all / all | INSTALLED | BSD-3-Clause／本機授權檔 |
| 89 | `tinyglobby` | 0.2.17 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 90 | `tsx` | 4.23.15 | DIRECT | N | all / all | INSTALLED | MIT／本機授權檔 |
| 91 | `typescript` | 7.0.2 | DIRECT | N | all / all | INSTALLED | Apache-2.0／本機授權檔 |
| 92 | `undici-types` | 8.9.0 | TRANSITIVE | N | all / all | INSTALLED | MIT／本機授權檔 |
| 93 | `vite` | 8.3.4 | DIRECT | N | all / all | INSTALLED | MIT／本機授權檔 |

## 本機授權證据與限制

`@esbuild/darwin-arm64@0.28.2` 與 `@rolldown/binding-darwin-arm64@1.2.13` 的本機 package.json 宣告 MIT，沒有獨立授權文字。另核對 [esbuild v0.28.2 LICENSE](https://github.com/evanw/esbuild/blob/v0.28.2/LICENSE.md) 與 [Rolldown v1.2.13 LICENSE](https://github.com/rolldown/rolldown/blob/v1.2.13/LICENSE)。封存子目錄的「上游主套件」檔來自相同版本本機主套件，已清楚標明 provenance；native binary 內嵌依賴完整性仍 UNVERIFIED。

本機實際可取得的 LICENSE、NOTICE、ThirdPartyNotices 與 sidecar 原文已逐檔複製到[第三方授權](第三方授權/)；未改寫或翻譯，SHA-256 對照在快照。未安裝的 68 筆沒有被下載或假造授權原文。重新安裝其他平台或打包工具鏈時，需對那次實際套件與二進位重新盤查。

## 工程外部工具

Alibaba Open Code Review 是 manifest／lock **以外**的既有工程工具；本輪 root 的 `ocr version` 證據為 **v1.12.13（短 commit fabbdb29），darwin/arm64，built 2026-10-08T11:54:55Z**。已執行 version、delegate preview、scan --preview、delegate rule；這些 exit0 只證明選檔／解析成功，不能替代 host 的逐檔審查。資料來自交接包頂層 `evidence/review/ocr-version.txt`、`executions.json`，不是此 lock 安裝的套件。候選狀態與官方授權见[整合研究](OPEN-SOURCE-INTEGRATION.md)。
