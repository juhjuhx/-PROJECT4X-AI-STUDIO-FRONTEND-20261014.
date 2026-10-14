import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '../dist'));
const port = Number(process.env.PROJECT4X_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PROJECT4X_PORT 必須介於 1024–65535');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json; charset=utf-8' };
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-cache');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if ((req.url?.length ?? 0) > 8192) { res.writeHead(414); res.end(); return; }
  try {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    if (url.pathname === '/__project4x_health') {
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ app: 'project4x-mvp', version: '0.1.0' })); return;
    }
    const name = decodeURIComponent(url.pathname);
    if (name.includes('\0')) { res.writeHead(400); res.end(); return; }
    const candidate = resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!candidate.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    const file = await realpath(candidate);
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) { res.writeHead(403); res.end(); return; }
    const body = await readFile(file);
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.setHeader('Content-Length', body.length);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : 404); res.end('找不到檔案');
  }
});
server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/__project4x_health`, { signal: AbortSignal.timeout(1500) });
      const health = await response.json();
      if (health.app === 'project4x-mvp') { console.log(`遊戲已啟動：http://127.0.0.1:${port}`); process.exit(0); }
    } catch { /* 此連接埠不是本遊戲；保留錯誤且不關閉其他程序。 */ }
  }
  console.error(`無法啟動：${error.message}。可用 PROJECT4X_PORT=4174 npm start 選另一個連接埠。`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`PROJECT-4X 霧境初航：http://127.0.0.1:${port}（關閉此視窗或按 Ctrl+C 停止）`));
