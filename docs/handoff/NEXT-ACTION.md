# NEXT-ACTION

Demo02已正式發布，Tag/Web/歸檔不變。Demo03視覺PR3已merge578a3d0e，精確head620669e的PR/main CI均SUCCESS；未發Demo03正式Release。

目前branch experiment/demo03-gameplay-preview，base620669e。D03-PREVIEW-001批准的盾衛/機動偵察及兩科技已完成隔離閉環：唯一reducer/Session、固定兩包/內容SHA、Save2/Replay2、AI只讀Observation、安全事件、真UI及分開存檔槽。runtime checkpoint分片見git log 62e210b→6d91550→9841994→cf0e72e→Task5。權威計畫在product/DEMO03-PREVIEW-IMPLEMENTATION-PLAN。

最新凍結runtime Gate：254 tests/check/build、Browser11/Gameplay12（原220門檻）/Demo4/PWA2/更新PASS；桌面1440×960與手機375×812真觸控模擬各20玩家指令，真研究/招募/三格移動/保存/讀取/Replay及舊槽不變PASS。Core獨立審查APPROVE，Task5全分支審查待完成。來源/收據/圖在verification/DEMO03-PREVIEW，原private/world在專案外。

G1 seed010補驗：winner1、247 EndTurn、6705commands，自然終局且Terminal Save/Replay PASS。這是1局，不是新Full100；R5原87/13與R6失敗不變，新ruleset Full100/T3/T6未驗。Alpha PARTIAL、真人/真機/平衡未驗。

NEXT：完成Task5獨立review與本地checkpoint→建立隔離預覽PR/CI及可啟動預覽包；不將測試數值升格正式平衡，不自動合併新規則main。再交主創真人試玩；城市/道路/新遺跡須另裁決，不自行補數值。尋徑額外視野仍僅舊scout。
