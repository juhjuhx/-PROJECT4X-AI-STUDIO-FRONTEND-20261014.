#!/bin/zsh
set -e
cd "${0:A:h}"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  print '找不到 Node.js。請先安裝 Node.js 22.12 以上版本。'
  read '?按 Enter 關閉：'
  exit 1
fi
if [[ ! -f dist/index.html ]]; then
  print '未找到已建置遊戲。請在此目錄執行 npm ci && npm run build。'
  read '?按 Enter 關閉：'
  exit 1
fi
(sleep 1; open 'http://127.0.0.1:4173') &
node scripts/serve.mjs
