import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('C5 真生成seed010 prefix不應連續六次兩格往返，亦保留真終局', { timeout: 65_000 }, () => {
  const run = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/ai-oscillation-check.ts'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', timeout: 60_000, maxBuffer: 1_048_576,
  });
  assert.equal(run.error, undefined, run.error?.message ?? '診斷子程序必須正常啟動並完成');
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  const report = JSON.parse(run.stdout);
  assert.equal(report.schema, 'project4x-ai-oscillation-1');
  assert.equal(report.seed, '獨立QA-010');
  assert.equal(report.status, 'TESTED_PASS');
  assert.equal(report.maxCommands, 1100);
  assert.ok(report.commands > 0 && report.commands <= report.maxCommands);
  assert.ok(report.commands === report.maxCommands || report.terminalWinner === 0 || report.terminalWinner === 1,
    '不能未跑完prefix且沒有真實winner就當通過');
  assert.deepEqual(report.loops, []);
});
