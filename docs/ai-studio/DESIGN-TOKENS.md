# 現有token盤點

CONFIRMED：這是現有程式值，不是全新美術提案。src/styles.css:1–30為layer/base；styles:31–83為layout、85–163元件、165–188responsive；src/ui/map.ts:20–21、86–95、228–332為投影與原創素材。

| 名稱 | 現值 | 用途/來源 |
|---|---|---|
| --paper | #ece9d9 | 紙色背景 |
| --surface | #f5f2e7 | modal/input |
| --ink | #203b32 | 主文字/主要button |
| --ink-soft | #526151 | 次要資訊 |
| --line | #c9cbb3 | 分隔/邊框 |
| --copper | #986c35 | focus/裝飾 |
| --gold | #d6b56a | 遺跡 |
| --danger | #8c4235 | 失敗/攻擊 |
| --radius | 8px | 一般button/input |
| body fonts | PingFang TC、Heiti TC、Noto Sans TC、sans-serif | 系統fallback，不附字体file |
| 標題 | Songti TC、Noto Serif TC、serif | 系統fallback |
| 數值 | Georgia、Songti TC、serif | tabular-nums |
| terrain | plain #aab58b/forest #779783/hill #adb294/mountain #929d93/water #648f91 | map.drawTile |
| 未知格 | #2b4941/格線#38564a | 不揭露地形 |
| 己方/敵方旗 | #ebc26e/#c17a63 | map.drawSite；owner未知不能敵方化 |
| 移動/選取 | #e4ce8d/#f3c478 | 只由legalActions/selection產生 |
| tile | 76×42px，厚度8px | 2.5D diamond原點投影 |
| zoom | clamp0.24–2.2；home窄0.86、寬1.12 | WorldMap.zoomBy/home |
| dpr | max2 | Canvas resize |
| button | min-height44px | base；focus3px |
| desktop sidebar | 338px；1440起360px；1023以下300px | grid |
| mobile | 767以下上下排列；374以下窄式 | media query |
| Canvas height | desktop clamp490–900；mobile390；窄340 | CSS |
| 互動transition | 150ms，按下scale.98 | CSS；prefers-reduced-motion禁用 |
| AI呈現節奏 | 95ms/初180；reduce20ms | main.beginAI，僅driver時序不可改規則 |

素材為程式多邊形/圓/文字，沒有圖庫、sprite atlas、外部font、音訊、貼圖或asset loader。沒有WebGL、Pixi、Phaser、Three.js。改用框架屬PROPOSED後續成本評估，這份封包未接入。
