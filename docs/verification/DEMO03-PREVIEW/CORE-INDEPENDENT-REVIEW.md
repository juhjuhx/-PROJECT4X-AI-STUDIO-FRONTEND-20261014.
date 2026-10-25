# Demo03 Preview Task1–4 Independent Review

REVIEWER：demo03_preview_core_review；精確範圍620669e → cf0e72e8d2c7056c4d01fdcb618517cf6872cb89；VERDICT APPROVE，無 blocker/重要缺陷。全程只讀；不包含Task5 UI或平衡。

親跑19 focused tests、check PASS。受審core/session/events/test bytes對該commit無diff；從git show cd59f348的舊Core獨立重跑4 golden：Save SHA/Replay SHA/canonical hash全部相符。另48種錯誤Save/Replay變體全拒絕，clean/dirty/pending AI的snapshot、保存內容與timer不變，dispose清理。

確認schema/ruleset/content/generator配對、exact keys/同版重建、request去重/conflict/generation/先驗後replace、預覽load G1不遷移/newGame回factory設定、新兵移動/視野/傷害界線、固定兩包不可變、AI/事件僅Observation、公開型別新literal限制明確。

工具事件：第一次獨立golden腳本用了TypeScript7不提供的舊transpile API而失敗；改Node stripTypeScriptTypes後成功，非產品FAIL。未執行完整Full100、真人/真機、策略平衡，未替Task5 Browser作結論。
