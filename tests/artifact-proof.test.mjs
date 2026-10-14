import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { artifactHashes } from '../scripts/artifact-proof.mjs';

test('產物證據：入口HTML不變但bundle改寫或新增，完整雜湊必須拒絕沿用', () => {
  const folder = mkdtempSync(join(tmpdir(), 'project4x-artifact-'));
  try {
    mkdirSync(join(folder, 'assets'));
    writeFileSync(join(folder, 'index.html'), '<script src="assets/app.js"></script>');
    writeFileSync(join(folder, 'assets/app.js'), 'console.log(1);');
    const before = artifactHashes(folder);
    const index = readFileSync(join(folder, 'index.html'), 'utf8');
    assert.deepEqual(artifactHashes(folder), before);
    writeFileSync(join(folder, 'assets/app.js'), 'console.log(2);');
    assert.equal(readFileSync(join(folder, 'index.html'), 'utf8'), index);
    assert.notDeepEqual(artifactHashes(folder), before);
    writeFileSync(join(folder, 'assets/app.js'), 'console.log(1);');
    assert.deepEqual(artifactHashes(folder), before);
    writeFileSync(join(folder, 'assets/unexpected.js'), 'console.log(3);');
    assert.notDeepEqual(artifactHashes(folder), before);
  } finally { rmSync(folder, { recursive: true }); }
});
