import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { openSync, closeSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { artifactHashes } from './artifact-proof.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidenceDir = resolve(process.env.PROJECT4X_EVIDENCE_DIR || resolve(root, `證據/完整驗證-${Date.now()}`));
await mkdir(evidenceDir, { recursive: true });
const checks = [];
const labels = ['型別', '規則與反例', '建置', '完整對局', '依賴審計', '瀏覽器與觸控'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function fingerprints() {
  const walk = path => readdirSync(resolve(root, path), { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(`${path}/${item.name}`) : [`${path}/${item.name}`]);
  const paths = ['src', 'scripts', 'tests'].flatMap(walk).concat(['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.opencodereview/rule.json', '啟動遊戲.command']).sort();
  return Object.fromEntries(paths.map(path => [path, sha(readFileSync(resolve(root, path)))]));
}
const sourceStart = fingerprints();
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('PROJECT4X_QA_')));
async function run(label, command, args, extraEnv = {}) {
  const started = performance.now();
  const log = resolve(evidenceDir, `${checks.length + 1}-${label}.txt`);
  const fd = openSync(log, 'wx');
  let code = 1;
  try {
    code = await new Promise((resolve, reject) => {
      const child = spawn(command, args, { cwd: root, stdio: ['ignore', fd, fd], env: { ...cleanEnv, ...extraEnv } });
      child.once('error', reject);
      child.once('close', value => resolve(value ?? 1));
    });
  } finally {
    closeSync(fd);
    checks.push({ label, command: [command, ...args], env: extraEnv, exitCode: code, log, milliseconds: Math.round(performance.now() - started) });
    console.log(`${label} exit=${code} log=${log}`);
  }
  if (code !== 0) throw new Error(`${label}未通過，停止後續驗證。`);
}
const reservePort = () => new Promise((resolve, reject) => {
  const socket = createServer();
  socket.once('error', reject);
  socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(error => error ? reject(error) : resolve(port)); });
});
let server, serverLog, failure = null, servedIndexSha256 = null, buildStart = null;
try {
  await run('型別', 'npm', ['run', 'check']);
  await run('規則與反例', 'npm', ['test']);
  await run('建置', 'npm', ['run', 'build']);
  buildStart = artifactHashes(resolve(root, 'dist'));
  const headlessFile = resolve(evidenceDir, 'headless.json');
  await run('完整對局', process.execPath, ['--import', 'tsx', 'scripts/headless.ts'], { PROJECT4X_QA_OUTPUT: headlessFile, PROJECT4X_QA_START_SEED: '1', PROJECT4X_QA_GAMES: '100', PROJECT4X_QA_WORKERS: '4' });
  const matches = JSON.parse(await readFile(headlessFile, 'utf8'));
  if (matches.status !== 'PASS' || matches.requestedGames !== 100 || matches.completedGames !== 100 || matches.finishedGames !== 100 || matches.failedGames !== 0 || !matches.sourceUnchanged || !matches.methodUnchanged || matches.seedRange?.first !== 1 || matches.seedRange?.last !== 100) throw new Error('固定001–100證據不成立；診斷子集不能當發行驗證。');
  await run('依賴審計', 'npm', ['audit', '--json']);
  const port = await reservePort();
  const base = `http://127.0.0.1:${port}`;
  serverLog = openSync(resolve(evidenceDir, '本機服務.txt'), 'wx');
  server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: root, stdio: ['ignore', serverLog, serverLog], env: { ...cleanEnv, PROJECT4X_PORT: String(port) } });
  server.on('error', error => console.error(error.message));
  let ready = false;
  for (let attempt = 0; attempt < 25 && !ready; attempt++) {
    try {
      if (server.exitCode !== null) throw new Error('本輪服務已退出');
      const response = await fetch(`${base}/__project4x_health`, { signal: AbortSignal.timeout(500) });
      const health = response.ok && (await response.json()).app === 'project4x-mvp';
      if (health) {
        servedIndexSha256 = sha(Buffer.from(await (await fetch(base)).arrayBuffer()));
        ready = servedIndexSha256 === sha(await readFile(resolve(root, 'dist/index.html'))) && server.exitCode === null;
      }
    } catch { /* 啟動過程；只重試固定的本機健康端點。 */ }
    if (!ready) await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('本機遊戲服务無法啟動，未執行GUI驗證。');
  await run('瀏覽器與觸控', process.execPath, ['scripts/browser-check.mjs'], { PROJECT4X_URL: base, PROJECT4X_EVIDENCE_DIR: evidenceDir });
  const browser = JSON.parse(await readFile(resolve(evidenceDir, 'browser.json'), 'utf8'));
  if (browser.status !== 'PASS' || browser.scenarios.length !== 7 || browser.servedIndexSha256 !== servedIndexSha256 || JSON.stringify(browser.artifactHashes) !== JSON.stringify(buildStart)) throw new Error('browser證據與本輪完整建置不一致');
} catch (error) {
  failure = error.message;
  console.error(failure); process.exitCode = 1;
} finally {
  if (server?.exitCode === null) { const closed = new Promise(resolve => server.once('close', resolve)); server.kill('SIGTERM'); await closed; }
  if (serverLog !== undefined) closeSync(serverLog);
  const sourceEnd = fingerprints();
  const sourceUnchanged = JSON.stringify(sourceStart) === JSON.stringify(sourceEnd);
  if (!sourceUnchanged) { process.exitCode = 1; failure ??= '驗證期間source已變動，不能沿用PASS'; }
  const buildEnd = buildStart && artifactHashes(resolve(root, 'dist'));
  const buildUnchanged = buildStart === null ? null : JSON.stringify(buildStart) === JSON.stringify(buildEnd);
  if (buildUnchanged === false) { process.exitCode = 1; failure ??= '驗證期間dist已變動，不能沿用PASS'; }
  const report = { status: process.exitCode ? 'FAIL' : 'PASS', generatedAt: new Date().toISOString(), evidenceDir, checks, notExecuted: labels.filter(label => !checks.some(c => c.label === label)), sourceStart, sourceEnd, sourceUnchanged, buildStart, buildEnd, buildUnchanged, servedIndexSha256, failure, humanPlayability: 'NOT_VERIFIED', physicalMobile: 'NOT_VERIFIED' };
  await writeFile(resolve(evidenceDir, '驗證流程.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ status: report.status, sourceUnchanged, notExecuted: report.notExecuted, evidenceDir }));
}
