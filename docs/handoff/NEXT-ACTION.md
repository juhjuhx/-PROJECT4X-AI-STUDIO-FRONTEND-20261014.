# NEXT-ACTION

**現在繼續D03-009。** branch `experiment/demo03-gameplay-preview`；[PR4](https://github.com/juhjuhx/-PROJECT4X-AI-STUDIO-FRONTEND-20261014./pull/4)維持DRAFT，不merge main、不改正式Demo02或未批准平衡。

## 本輪已完成

- D03-009真人／實機清單與回饋表：43ebb9b，CI40196643483 success。
- README、Banner、真實圖版與版本／世界意圖／架構／路線入口：283d8c0a8026b03a5e911a1651df41eff9d48c44，CI40197690324 success。新圖像來源及SHA見media/readme/ASSET-MANIFEST；宣傳裝飾與真實截圖已區分。
- D03-WS01本機入口再整理：12個文件／規則捷徑指向當前預覽；5個舊捷徑依版本/完成狀態分類，原始worktrees/Git/證據/Downloads均保留。9個Git目錄操作前後狀態相同，3處原有修改未動；新舊rollback只check均READY。詳WORKSPACE-INVENTORY及DEMO03-PREVIEW/WORKSPACE-REFRESH。

本文件所在提交的最終HEAD/CI須即時查PR4，以上明確SHA的結果不冒稱涵蓋後續提交。產品35檔與method29檔仍對應DEMO03-PREVIEW/SOURCE-BOUNDARY；本輪未改runtime。預覽257tests及原G1/新預覽/跨版本工程證據見TASK5-RESULTS/CI-VERIFICATION，沒有重新建立Demo02。

## 唯一待驗Gate

人工Gate、裝置前置、操作表與回饋只在 [D03-009-PLAYTEST](../verification/DEMO03-PREVIEW/D03-009-PLAYTEST.md) 維護。真人／實體手機／平衡／新版Full100仍未驗；手機前置尚缺可驗證的受控HTTPS URL。127.0.0.1僅本機，touch模擬不可代替實機。

主創回報GPT-6對d35a977基線唯讀審查尚無確認工程阻擋；**本輪新增diff仍待GPT-6獨立審查**，不自行改Ready。R5原87/13及歷史T3/T6 FAIL保留，新規則Full100/T3/T6 UNVERIFIED；Alpha PARTIAL。

## 下一個實際動作

1. `git status --porcelain=v2 --untracked-files=all`、`git rev-parse HEAD`；查PR4最新完整HEAD與checks，不把舊CI當新證據。
2. 將最新GitHub diff交GPT-6，只讀獨立審查；依確認finding另立最小修補，不能先改平衡。
3. 在獨立測試profile以`PROJECT4X_PORT=4174 npm start`啟動，開`http://127.0.0.1:4174/?preview=demo03`；依D03-009收集真實真人紀錄。實體手機由部署owner先提供同build受控HTTPS，再逐項執行；缺項保持UNVERIFIED。
4. 只有實際新回饋／Gate／source變動才commit/push原分支。新Review、人工與產品Gate成立後才由主創考慮Ready及RC，不自動合併。

本機恢復從統一管理根00-START-HERE進01-ACTIVE-WORKSPACE的Demo03-玩法預覽；04-DOCUMENTATION已指當前文件，舊完成工作在05-ARCHIVES捷徑。舊MVP有未提交staged檔案及unborn HEAD，禁止誤用或清理。
