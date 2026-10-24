# C5 可攜振盪診斷器獨立審查

**診斷器審查：PASS（限定定義與此固定 prefix）。目前 AI：預期 RED／TESTED_FAIL。** 本次未確認 P0／P1／P2 診斷器缺陷。來源審查與一次 fresh 窄 run 顯示，新腳本確實重現先前真 seed010 prefix 的三個持續往返片段；沒有變更策略、門檻或生成世界。

範圍：`scripts/ai-oscillation-check.ts` 與 `package.json` 的 `qa:ai:oscillation`。基礎 checkpoint=`4cddfb3c9b50b80b45f85c1c4749e9f41ae392c9`，診斷器目前為未提交新增檔；精確腳本 SHA-256=`54932262062f26af70e7aec346aac6b6e2a59775f9909de13383aa0ad0e54e77`。使用已載入 canonical code-review-excellence／code-verification，只讀 project，唯一寫入此報告。

## Fresh 結果與舊 prefix 的獨立比對

`npm run qa:ai:oscillation`，Node `v26.10.0`，UTC `2026-10-18T04:52:12.559495+00:00` → `2026-10-18T04:52:15.458175+00:00`。腳本測得 **2621 ms**，完整生成1,100合法 commands，**exit=1**，結構化報告 `TESTED_FAIL`，最後 assertion 為 `3 !== 0`。這是原 AI 未修的預期 RED，不能把反例成立當遊戲 PASS。

| 單位（actor:id） | 半回合 | Command（1起） | Move 次數 | 固定 HP |
|---|---:|---:|---:|---:|
| `0:兵-31` | 35–45 | 459–703 | 6 | 10 |
| `0:兵-0` | 35–45 | 458–704 | 6 | 10 |
| `1:兵-34` | 46–56 | 735–1022 | 6 | 7 |

另外使用前一輪98秒完整生成旅程的 `seed010-actions.jsonl` 前1,100筆，依「逐單位動作分段」獨立計算第一個6步交替片段；**三單位及每一筆 command／from／to／HP／newlyKnown 都與新腳本輸出相等**。輸出順序由第6步發生時間決定，兵-31先於兵-0，屬正常 Map 插入順序，不影響內容。

```json
{
  "source": "LOCAL_HOME/Desktop/Fake-Polytopia/工程整合/C3-20261018-074653/evidence/獨立C5診斷/seed010-actions.jsonl",
  "sourceSHA256": "f306c873780d948ea4a0d00dda1016ca8d550f6e3d500dd7901f234f8f08a135",
  "commandsRead": 1100,
  "expectedUnits": [
    "0:兵-0",
    "0:兵-31",
    "1:兵-34"
  ],
  "sampleBySampleEquality": true,
  "method": "independent per-unit segment oracle over previous full generated trace, not current detector output"
}
```

## 定義核對

| 條件 | 新腳本來源 | 判斷 |
|---|---|---|
| 真固定 seed／原 production policy | 11–12、23–35行：`獨立QA-010`，1,100 commands；`chooseAction(observe(...))`，原 `headless-10-N` request IDs；每筆 `applyCommand` 合法且version+1 | PASS；無canonical/history注入policy、無合成winner。 |
| 同一單位六次連續 Move | 36–47行：actor+unitId分開追蹤；只保存該單位最近6次Move | PASS；連續是該單位自身意圖序列，允許中間其他單位或敵方行動。 |
| 中間無該單位 Attack/Capture | 38行兩者立即刪除該key的track | PASS；不會把同兵有戰鬥／佔領的 Move 窗口算成這種片段。 |
| 兩格來回與路徑連接 | 48–51行，同時計算from/to恰好兩個cell，且每對相鄰Move滿足前to=後from、前from=後to | PASS；不只檢查重複destination或一次轉向。 |
| 無新探索／無HP變化 | 40–50行：相鄰actor Observation已知格差=0，6筆Move前HP相等 | PASS（目前g1-ccts-1）；Move本身不造成傷害、沒有回血機制，因此相同HP足以排除窗口中的受傷。 |
| 保留第一次成立的反例 | 49–53行，不覆寫已有loop | PASS；之後有所進展也不抹去曾發生的6步片段。 |
| RED不等同全局品質判斷 | 9–10、62、66、69行保留finite-prefix範圍、QA-only與全局因果／終局率限制 | PASS；此命令沒有接入既有 `npm test` 或冒充full100。 |
| 可攜與來源一致性 | 14–18、58行按import.meta.url讀依賴source，沒有機器絕對路徑；package新增alias，無新依賴 | PASS；本review另保存診斷器自身/package與core的前後hash，均一致。 |

## 誤判邊界與未驗

1. **這是行為模式 gate，不是戰略最優性證明。** 六次無探索／無攻擊／HP未變的兩格交替，未來仍可能是刻意誘敵、防守換位或讓路。以目前原seed的已查分數／目標機制，它吻合已確認的路徑振盪；不可把這個判準泛化為任何策略下都錯。主創已明確選擇先修現有無記憶策略的最小反例；本review未擅自擴大策略限制。
2. scope中的「no Attack/Capture」只指該單位；不是全局沒有戰鬥。判準也沒有要求全局探索、據點、軍力皆停止。原seed其餘單位的戰鬥與補兵持續，這與診斷輸出並不矛盾。
3. 偵測窗口沒有限制必須在6個相鄰己回合內完成；若該兵長時間等待後仍連續採相同兩格交替，也可能入選。這符合目前「six consecutive unit Moves」定義，但不能解讀成全局即時重複狀態。
4. 60秒 timeout／無action／非法command／source變動都會在結構化loop報告前拋錯。這些屬未完成或環境／合法性異常，不能只憑exit1就歸類為本振盪已重現；本次實際有完整 `TESTED_FAIL` JSON、1100完成與3個witness，故沒有該誤判。
5. 目前 HP 證據依賴無回血／無轉籍／ID不重用的g1規則；規則改變時需重審。source hash 已約束本次版本。
6. 本次沒有對診斷器注入合成負例或跑全99/103tests、build、browser、seed010整局、full100。負條件依來源分支審查；真實positive case則有fresh執行與先前獨立trace逐欄核對。未聲稱新終局率或修復充分性。

## 建議保留的報告措辭

保留「**同一單位最近六次Move形成兩格交替的固定prefix回歸gate**」，不要稱「六回合全局無進展」或「已找到010唯一根因」。未來這一項轉綠，只能說原6步模式未在前1,100 commands出現；仍須原seed010整局與fixed100驗證。這些是解讀界線，並無阻擋本次可攜診斷器採納的缺陷。

以下完整保留本次命令、source hash、stdout/stderr，供核對預期RED與資源異常的差異。

---

# C5 regression review — fresh raw evidence

```json
{
  "command": [
    "npm",
    "run",
    "qa:ai:oscillation"
  ],
  "cwd": "LOCAL_HOME/Desktop/Fake-Polytopia/工程整合/C3-20261018-074653/project",
  "head": "4cddfb3c9b50b80b45f85c1c4749e9f41ae392c9",
  "startUTC": "2026-10-18T04:52:12.559495+00:00",
  "finishUTC": "2026-10-18T04:52:15.458175+00:00",
  "node": "v26.10.0",
  "exitCode": 1,
  "sourceStart": {
    "scripts/ai-oscillation-check.ts": "54932262062f26af70e7aec346aac6b6e2a59775f9909de13383aa0ad0e54e77",
    "package.json": "7af4232abcd0f27a6bbbb45f3bfcb1296f8274ae1808dca4b135c9466a38b83f",
    "src/core/ai.ts": "a97d731df122b363bfcce498af256d93a34a5aa35160cd90aaab7418ff9b447a",
    "src/core/game.ts": "d9153ec8a934f53b318dda2d21f4450b1ad8030e4d6d067ad089994fd26affb7",
    "src/core/types.ts": "8db6e1c4dd8e62e7271bf6d1820683fa9edab729fb7655b5e76515ced5a05edd",
    "package-lock.json": "23ead3d9b7bad847837036b1edeac1480717bb6b7f9358f82c00333c4eb69a67"
  },
  "sourceEnd": {
    "scripts/ai-oscillation-check.ts": "54932262062f26af70e7aec346aac6b6e2a59775f9909de13383aa0ad0e54e77",
    "package.json": "7af4232abcd0f27a6bbbb45f3bfcb1296f8274ae1808dca4b135c9466a38b83f",
    "src/core/ai.ts": "a97d731df122b363bfcce498af256d93a34a5aa35160cd90aaab7418ff9b447a",
    "src/core/game.ts": "d9153ec8a934f53b318dda2d21f4450b1ad8030e4d6d067ad089994fd26affb7",
    "src/core/types.ts": "8db6e1c4dd8e62e7271bf6d1820683fa9edab729fb7655b5e76515ced5a05edd",
    "package-lock.json": "23ead3d9b7bad847837036b1edeac1480717bb6b7f9358f82c00333c4eb69a67"
  }
}
```

STDOUT

```text

> project-4x-mvp@0.1.0 qa:ai:oscillation
> node --import tsx scripts/ai-oscillation-check.ts

{
  "schema": "project4x-ai-oscillation-1",
  "seed": "獨立QA-010",
  "maxCommands": 1100,
  "commands": 1100,
  "status": "TESTED_FAIL",
  "scope": "six consecutive unit Moves alternating two cells, no new exploration/Attack/Capture or HP change; finite generated prefix only",
  "policyBoundary": "chooseAction(observe(state, actor))",
  "sourceStart": {
    "src/core/ai.ts": "a97d731df122b363bfcce498af256d93a34a5aa35160cd90aaab7418ff9b447a",
    "src/core/game.ts": "d9153ec8a934f53b318dda2d21f4450b1ad8030e4d6d067ad089994fd26affb7",
    "src/core/types.ts": "8db6e1c4dd8e62e7271bf6d1820683fa9edab729fb7655b5e76515ced5a05edd",
    "package-lock.json": "23ead3d9b7bad847837036b1edeac1480717bb6b7f9358f82c00333c4eb69a67"
  },
  "milliseconds": 2621,
  "loops": [
    {
      "unit": "0:兵-31",
      "moves": [
        {
          "command": 459,
          "turn": 35,
          "from": {
            "x": 3,
            "y": 6
          },
          "to": {
            "x": 4,
            "y": 6
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 502,
          "turn": 37,
          "from": {
            "x": 4,
            "y": 6
          },
          "to": {
            "x": 3,
            "y": 6
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 552,
          "turn": 39,
          "from": {
            "x": 3,
            "y": 6
          },
          "to": {
            "x": 4,
            "y": 6
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 597,
          "turn": 41,
          "from": {
            "x": 4,
            "y": 6
          },
          "to": {
            "x": 3,
            "y": 6
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 648,
          "turn": 43,
          "from": {
            "x": 3,
            "y": 6
          },
          "to": {
            "x": 4,
            "y": 6
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 703,
          "turn": 45,
          "from": {
            "x": 4,
            "y": 6
          },
          "to": {
            "x": 3,
            "y": 6
          },
          "hp": 10,
          "newlyKnown": 0
        }
      ]
    },
    {
      "unit": "0:兵-0",
      "moves": [
        {
          "command": 458,
          "turn": 35,
          "from": {
            "x": 4,
            "y": 7
          },
          "to": {
            "x": 5,
            "y": 7
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 503,
          "turn": 37,
          "from": {
            "x": 5,
            "y": 7
          },
          "to": {
            "x": 4,
            "y": 7
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 551,
          "turn": 39,
          "from": {
            "x": 4,
            "y": 7
          },
          "to": {
            "x": 5,
            "y": 7
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 598,
          "turn": 41,
          "from": {
            "x": 5,
            "y": 7
          },
          "to": {
            "x": 4,
            "y": 7
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 645,
          "turn": 43,
          "from": {
            "x": 4,
            "y": 7
          },
          "to": {
            "x": 5,
            "y": 7
          },
          "hp": 10,
          "newlyKnown": 0
        },
        {
          "command": 704,
          "turn": 45,
          "from": {
            "x": 5,
            "y": 7
          },
          "to": {
            "x": 4,
            "y": 7
          },
          "hp": 10,
          "newlyKnown": 0
        }
      ]
    },
    {
      "unit": "1:兵-34",
      "moves": [
        {
          "command": 735,
          "turn": 46,
          "from": {
            "x": 19,
            "y": 16
          },
          "to": {
            "x": 18,
            "y": 16
          },
          "hp": 7,
          "newlyKnown": 0
        },
        {
          "command": 794,
          "turn": 48,
          "from": {
            "x": 18,
            "y": 16
          },
          "to": {
            "x": 19,
            "y": 16
          },
          "hp": 7,
          "newlyKnown": 0
        },
        {
          "command": 846,
          "turn": 50,
          "from": {
            "x": 19,
            "y": 16
          },
          "to": {
            "x": 18,
            "y": 16
          },
          "hp": 7,
          "newlyKnown": 0
        },
        {
          "command": 913,
          "turn": 52,
          "from": {
            "x": 18,
            "y": 16
          },
          "to": {
            "x": 19,
            "y": 16
          },
          "hp": 7,
          "newlyKnown": 0
        },
        {
          "command": 964,
          "turn": 54,
          "from": {
            "x": 19,
            "y": 16
          },
          "to": {
            "x": 18,
            "y": 16
          },
          "hp": 7,
          "newlyKnown": 0
        },
        {
          "command": 1022,
          "turn": 56,
          "from": {
            "x": 18,
            "y": 16
          },
          "to": {
            "x": 19,
            "y": 16
          },
          "hp": 7,
          "newlyKnown": 0
        }
      ]
    }
  ],
  "limitations": "Does not establish global causality, completion, or full100 rate. Output is QA-only; never a HUD data source."
}

```

STDERR

```text
node:internal/modules/run_main:111
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: 固定生成prefix出現六次無探索兩格往返；AI尚未修復

3 !== 0

    at <anonymous> (LOCAL_HOME/Desktop/Fake-Polytopia/工程整合/C3-20261018-074653/project/scripts/ai-oscillation-check.ts:69:8)
    at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
    at async node:internal/modules/esm/loader:650:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:105:5) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: 3,
  expected: 0,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v26.10.0

```
