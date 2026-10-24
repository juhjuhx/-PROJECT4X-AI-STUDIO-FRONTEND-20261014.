import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createGame, applyCommand, canonicalHash } from '../src/core/game';
import { deserializeGame, serializeGame, exportReplay, replayGame } from '../src/core/persistence';
import type { Command } from '../src/core/types';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/g1-compatibility.json', import.meta.url), 'utf8')) as {
  checkpoints: { label: string; commands: Command[]; saveSha256: string; replaySha256: string; canonicalHash: string; pendingRelic: boolean }[];
};
const sha = (text: string) => createHash('sha256').update(text).digest('hex');

for (const expected of fixture.checkpoints) test(`發布 G1 golden：${expected.label} Save/Replay bytes 與延續去重不變`, () => {
  let state = createGame('G1-公開相容範例');
  for (const command of expected.commands) {
    const result = applyCommand(state, command);
    assert.equal(result.ok, true, result.error ?? '發布版合法指令必須成立');
    state = result.state;
  }
  assert.equal(sha(serializeGame(state)), expected.saveSha256);
  assert.equal(sha(exportReplay(state)), expected.replaySha256);
  assert.equal(canonicalHash(state), expected.canonicalHash);
  assert.equal(state.pendingRelic !== null, expected.pendingRelic);
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded, state);
  assert.deepEqual(replayGame(exportReplay(state)), state);
  if (expected.commands.length) {
    const duplicate = applyCommand(loaded, expected.commands.at(-1)!);
    assert.equal(duplicate.ok, true);
    assert.equal(duplicate.state, loaded);
    assert.deepEqual(duplicate.events, []);
  }
});
