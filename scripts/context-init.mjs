import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const path of ['CONTEXT.md', 'memory/session-handoff-LATEST.md']) {
  console.log(readFileSync(resolve(root, path), 'utf8'));
}
try {
  const latest = resolve(root, '證據/最新續接.json');
  const checkpoint = JSON.parse(readFileSync(existsSync(latest) ? latest : resolve(root, '證據/20261012-checkpoint.json'), 'utf8'));
  const changed = Object.entries(checkpoint.sourceHashes).filter(([path, hash]) => {
    try { return createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex') !== hash; }
    catch { return true; }
  }).map(([path]) => path);
  console.log(JSON.stringify({
    證據日期: checkpoint.generatedAt,
    核對範圍: '只核對快照內列出的檔案；新增檔案仍須審查',
    狀態: changed.length ? '來源已變動：重驗相關範圍' : '列出來源與快照一致：未重新執行測試',
    變動檔案: changed,
    固定100局: checkpoint.full100,
  }, null, 2));
} catch (error) {
  console.error('無法核對來源快照，先讀待辦與實際證據：', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
