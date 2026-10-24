import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// A worker fetch is not a page response. Probe its real HTTP bytes separately.
export async function probeServedScript(base, path, expectedHash) {
  const response = await fetch(new URL(path, base.endsWith('/') ? base : base + '/'), { redirect: 'error', signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200, 'worker HTTP status');
  const contentType = response.headers.get('content-type') ?? '';
  assert.match(contentType, /^(?:text|application)\/javascript(?:\s*;|$)/i, 'worker JavaScript MIME');
  const sha256 = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
  assert.equal(sha256, expectedHash, 'served worker differs from build');
  return { path, via: 'http-probe', status: response.status, contentType, sha256 };
}

export function artifactHashes(directory) {
  const walk = path => readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]);
  return Object.fromEntries(walk(directory).sort().map(path => [relative(directory, path).split(sep).join('/'), createHash('sha256').update(readFileSync(path)).digest('hex')]));
}
