# QA · 重現方式與門檻

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
# 短案例：約原 Mac 103s；視 CPU／環境可能不同
PROJECT4X_QA_START_SEED=10 PROJECT4X_QA_GAMES=1 PROJECT4X_QA_WORKERS=1 PROJECT4X_QA_OUTPUT=/tmp/project4x-seed010.json npm run qa:headless
# 全部 G1 Gate：耗時，2026-10-14 Mac 先前同來源約 51 分鐘
PROJECT4X_QA_START_SEED=1 PROJECT4X_QA_GAMES=100 PROJECT4X_QA_WORKERS=4 PROJECT4X_QA_OUTPUT=/tmp/project4x-full100.json npm run qa:headless
```

原有 `maxTurns=800`、`maxCommands=40000` 是**測試的診斷資源上限**，不是平手、判負或勝利條件。`seed010` 已知 FAIL，不得藉上調上限掩飾卡局。44 tests 通過不等於對戰能在合理時間結束。原始證據路徑在不公開工程包；未來在 GitHub CI 或新環境產生的結果應附帶 commit SHA、Node 版本、命令、退出碼與失敗 log。

前端 UI 改動至少測：Chrome 桌面起局、地圖平移縮放、選兵／移動／攻擊／占領、研究、遺跡必答、招募、結束回合 AI、保存／載入、損毀匯入拒絕、重播、窄直式／橫式與安全區。觸控模擬不能冒稱實體手機測試。
