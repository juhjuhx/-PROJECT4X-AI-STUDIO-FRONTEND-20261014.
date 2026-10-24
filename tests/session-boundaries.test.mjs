import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const source = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
test('C2-G：composition root 不持 canonical state、不執行 core/AI/persistence 編排', () => {
  const main=source('src/main.ts');
  assert.doesNotMatch(main, /from ['"]\.\/core\/(?:game|ai|persistence)['"]/);
  assert.doesNotMatch(main, /\b(?:GameState|applyCommand|observe|aiTimer|beginAI|stopAI|canonicalHash)\b/);
  assert.match(main, /createGameSession/);
  assert.match(main, /gameplay\.subscribe/);
  assert.match(main, /gameplay\.submitAction/);
  assert.match(main, /files\.acknowledgeSave/);
  assert.doesNotMatch(source('src/ui/map.ts'), /from ['"].*(?:session\/game-session|core\/(?:game|persistence|ai))['"]/);
});
test('C0-01 regression：不覆寫原生 selector、不安裝全域吞錯 guard', () => {
  const roots=['src/main.ts',...readdirSync(new URL('../src/ui/',import.meta.url)).filter(p=>p.endsWith('.ts')).map(p=>'src/ui/'+p)];
  for(const path of roots){
    const text=source(path);
    assert.doesNotMatch(text, /(?:Document|Element)\.prototype\.(?:querySelector|querySelectorAll)\s*=/,path);
    assert.doesNotMatch(text, /(?:window|globalThis)\.on(?:error|unhandledrejection)\s*=/,path);
    assert.doesNotMatch(text, /addEventListener\(['"](?:error|unhandledrejection)['"]/ ,path);
  }
});
