# NEXT-ACTION

目前branch experiment/demo03-gameplay-preview；PR4維持DRAFT，不merge main。D03-001～008已交隔離預覽工程，Demo02 Release保持；新數值僅D03-PREVIEW-001試驗基準。產品及method身份見verification/DEMO03-PREVIEW/SOURCE-BOUNDARY。

本輪恢復已核GitHub與本機HEAD d35a977fa5b126b58275bc70d3813f828f794664、乾淨；對應CI40127870051 completed/success。這是基線紀錄，不代表之後提交已通過。257 tests及原G1/新預覽/跨版本工程證據在TASK5-RESULTS及CI-VERIFICATION，不重新做Demo02或改舊Save/Replay。

**現在D03-009：唯一人工Gate/試玩清單/回饋紀錄在 [D03-009-PLAYTEST](../verification/DEMO03-PREVIEW/D03-009-PLAYTEST.md)。** 文件已備，真人/實體手機/平衡/新版Full100仍未驗；手機連線前置未取得可驗證受控HTTPS URL。127.0.0.1僅本機，觸控模擬不能替實機。主創回報基線GPT-6唯讀審查尚無確認工程阻擋，新diff仍交GPT-6獨立審查，不自行Ready。

追加已授權順序：完成試玩準備文件→整理符合當前版本的README/新Banner與真實圖/遊戲意圖與長期思路→commit/push原分支→盤點桌面PROJECT-4X/Fake-Polytopia相關資料與安全可回退歸檔。MASTER-TODO的D03-DOC01、D03-WS01追蹤；不移動有效Git worktrees、不刪私人world/歷史/Downloads舊ZIP、不改未批准玩法數值。

NEXT_COMMAND：git status --porcelain=v2 --untracked-files=all → gh pr view 4（核最新完整HEAD及checks）→讀D03-009權威Gate表。收集真人/裝置版本/來源/evidence後才填實測。產品Alpha維持PARTIAL；R5原87/13與歷史FAIL保留，新規則Full100/T3/T6沒有新PASS。
