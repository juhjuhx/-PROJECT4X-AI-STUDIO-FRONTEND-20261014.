import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

export function artifactHashes(directory) {
  const walk = path => readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]);
  return Object.fromEntries(walk(directory).sort().map(path => [relative(directory, path).split(sep).join('/'), createHash('sha256').update(readFileSync(path)).digest('hex')]));
}
