#!/usr/bin/env python3
"""Run frozen variants sequentially and preserve command metadata and raw output."""
from pathlib import Path
import datetime
import hashlib
import json
import platform
import subprocess
import sys
import time

root = Path(__file__).resolve().parent
project = next(parent / 'project' for parent in root.parents if (parent / 'project' / 'package.json').is_file())
label, *variants = sys.argv[1:]
if not variants:
    raise SystemExit('Usage: 執行量測.py label baseline [candidate]')
command = ['node', '--import', str(project / 'node_modules/tsx/dist/loader.mjs'), str(root / '有界性能.ts'), *variants]
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
start = time.perf_counter()
run = subprocess.run(command, cwd=root, capture_output=True, text=True)
elapsed = time.perf_counter() - start
(root / f'{label}.stdout.json').write_text(run.stdout)
(root / f'{label}.stderr.log').write_text(run.stderr)
meta = {
    'schema': 'c5-r4-performance-command-1',
    'startedAt': started,
    'command': command,
    'cwd': str(root),
    'exitCode': run.returncode,
    'durationSeconds': elapsed,
    'nodeVersion': subprocess.check_output(['node', '--version'], text=True).strip(),
    'platform': platform.platform(),
    'machine': platform.machine(),
    'dependencyInstall': 'Not performed; existing project node_modules tsx loader reused.',
    'processInventory': 'ps and CPU-brand sysctl are sandbox-denied. No performance process was spawned concurrently by this runner; coordinator schedules final timing separately from headless.',
    'sourceSha256': {
        f'{variant}/src/core/{filename}': hashlib.sha256((root / 'frozen' / variant / 'src' / 'core' / filename).read_bytes()).hexdigest()
        for variant in variants for filename in ['ai.ts', 'measured-ai.ts', 'game.ts', 'types.ts']
    },
    'harnessSha256': hashlib.sha256((root / '有界性能.ts').read_bytes()).hexdigest(),
    'stdoutSha256': hashlib.sha256(run.stdout.encode()).hexdigest(),
    'stderrBytes': len(run.stderr.encode()),
}
(root / f'{label}.command.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(meta, ensure_ascii=False, indent=2))
if run.returncode == 0:
    data = json.loads(run.stdout)
    print(json.dumps([
        {k: v for k, v in result.items() if k != 'latency'} |
        {'latency': {k: v for k, v in result['latency'].items() if k != 'samplesMs'}}
        for result in data['results']
    ], ensure_ascii=False, indent=2))
else:
    print(run.stdout, run.stderr)
raise SystemExit(run.returncode)
