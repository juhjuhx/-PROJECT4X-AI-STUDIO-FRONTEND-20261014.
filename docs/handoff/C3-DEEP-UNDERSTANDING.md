# C3 深讀結果與設計方向

已深讀C2 session/contract/tests與D3 main/map/CSS的實際控制流；此文件整理既有批准方向，不重新設計遊戲。

- C2 canonical state只存在session閉包，applyCommand唯一reducer；main只取frozen Observation。files是可信本機capability，不能交HUD。
- submitAction先shape/instance/generation，再由core duplicate→version→turn→terminal→legal。重送events空且不發布；發布鎖禁止listener交易重入。
- AI timer有epoch/generation取消；失敗load先驗候選，不能停AI/清dirty。真正IO成功且stamp相同才ack，下載只發起匯出。
- D3 main仍是舊state/AI/file編排，且前88行吞錯/selector patch；因此只採DOM/render函式片段，保留C2安全函式。
- D3 map接Observation；屋頂色與標籤把undefined當enemy，政治中心名稱硬編。已用真renderer Canvas call recorder重現2fail，再最小修正2處；相同觀測不同hidden truth的draw-call差分通過。
- D3 recruit把無合法候選錯當已徵召，對手回合/遺跡時誤導。改由可知上下文+合法actions呈現一般限制，不新增規則或暴露site.recruited。
- 根LICENSE實際與C2及manifest完全相符。前輪稽核用basename同時匹配第三方LICENSE，產生假陰性；只修來源紀錄。
- 技術棧與D Hybrid已批准：NativeDOM/Canvas2D、微縮地形；沒有框架替換／新數值／第二reducer。新排版取捨依主創要求grill-me，手機分頁偏好已提問，等待引導；現有bug修復不依賴該答案。

```text
[Design: 主創裁決 / GAME-RULEBOOK / CCTS]
                    |
[Core: GameState + applyCommand] <--- [Session: 驗版/去重/AI/保存]
                    |                           ^
              Observation                       | 合法Action意圖
                    v                           |
          [Presentation projector] ---> [D3 Canvas + Native DOM]
                    |
              actor-safe events

進程：R0恢復[完成] -> C2 fresh[完成] -> D3 blockers[進行]
      -> C3 integration -> independent review -> checkpoint
      -> C4既有玩法E2E -> C5 trace/root cause -> 新規則[待裁決]
```

此TUI圖為工程閱讀視圖；不是新美術概念稿。Visual Atelier v2採Diagram路由與可讀層級，未引入其p5/Three.js動畫依賴。
