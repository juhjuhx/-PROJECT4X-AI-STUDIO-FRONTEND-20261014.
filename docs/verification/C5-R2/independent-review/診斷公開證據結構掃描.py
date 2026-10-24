from pathlib import Path
import json
p=Path.cwd()
base=p/'docs/verification/C5-R2'
keys={'observation','evaluated','knownEnemyUnits','ownUnits','legalActions','decisions.jsonl'}
findings=[];scanned=0
for f in base.rglob('*'):
 if not f.is_file() or f.suffix not in ['.json','.txt','.log','.md']:continue
 scanned+=1;t=f.read_text(errors='replace')
 hits=[k for k in keys if ('"'+k+'"' in t)]
 if hits:findings.append({'file':str(f.relative_to(p)),'structural_markers':hits})
print(json.dumps({'scanned_public_evidence_files':scanned,'private_trace_structural_marker_hits':findings},ensure_ascii=False))
