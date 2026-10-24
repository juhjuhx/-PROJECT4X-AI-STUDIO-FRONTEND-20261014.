# Demo02 Release 狀態（唯一遠端發布入口）

目前狀態：IN_PROGRESS；尚無真PR/merge/Release URL，不宣稱DONE。

| 欄位 | 真實值 |
|---|---|
| Local source baseline | 4448ade8d0f07ccfc2257884e455b1b3eac6bae9 |
| Tested runtime baseline | 6bfbb98b5c0e5136f1fe3807ba0f7cbb01933729 |
| Portable product SHA | 8ad7d798b910e774c929a277787f2f7c7e4c20d9f4583c4e586200e1d37dedb5 |
| AI SHA | 972f564ea1bc795b269e4c5db066fe209623ffa42961d84eacc30ee374529b67 |
| Remote main at recovery | c21b16cd75572d069369f41426f7323c63c05083 |
| Release branch | release/demo02-playable-web |
| PR | https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./pull/1 |
| Merge commit | TODO |
| GitHub Release | TODO |
| Target asset | PROJECT4X-DEMO02-WEB-20261024-r3.zip |
| Asset SHA256 | 6b7d54df848887cd1c487742f7dbcebedfe4b0ee90bf39830a23cf25410af8f3 |
| Asset size | 91350 bytes／19files |
| CI | PR run 40063200214 已觸發，尚待結果；以最新PR SHA為準 |
| Unit baseline | 203原測試＋4 publication＋4 release-proof＋5 worker HTTP/contract＋7審查隱私/生命週期＝223/223 fresh PASS |
| Human/physical phone | UNVERIFIED |
| Playable Alpha | PARTIAL |

原28段本地history與150份原文件保留本機；公開branch以main為parent匯入完整正式source及去識別副本。PUBLICATION-PROVENANCE記原/公開hash；不是改寫或刪除原FAIL。

發布步驟按MASTER-TODO；如403或branch保護阻擋，不關規則、不暴露憑證、不force push，保留BLOCKED及下一條可執行命令。GitHub connector無Release附件API，使用本機已授權gh CLI補足。

獨立review：d6caa389c3c8387e648434170f2805eb60722083 APPROVE（詳RELEASE02/INDEPENDENT-REVIEW）。GitHub connector寫PR回403，已核對juhjuhx CLI身分後建立PR1；不是繞過權限。兩次Git HTTP408保留，單次32MiB POST transport重試才成功，不改全域Git配置。
