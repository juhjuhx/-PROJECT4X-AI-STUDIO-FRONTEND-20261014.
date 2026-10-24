import {execFileSync} from 'node:child_process';
import {readFileSync,lstatSync} from 'node:fs';
import {resolve} from 'node:path';
import {scanPublicationFile} from './publication-policy.mjs';
const root=resolve(process.argv[2]||'.');
const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean))];
const text=/\.(md|json|jsonl|log|ts|mjs|js|py|sh|command|html|css|yml|yaml|txt|webmanifest)$|(^|\/)(LICENSE|CONSTRAINTS\.md)$/;
const issues=[];
for(const path of files){
 const info=lstatSync(resolve(root,path));
 if(info.isSymbolicLink()){issues.push({path,code:'SYMLINK'});continue;}
 if(/(^|\/)(node_modules|private|evidence|\.git)(\/|$)|(^|\/)\.env(\.|$)|\.(pem|key|p12)$/.test(path)){if(!path.endsWith('.env.example'))issues.push({path,code:'PRIVATE_FILE'});continue;}
 if(text.test(path))issues.push(...scanPublicationFile(path,readFileSync(resolve(root,path),'utf8')));
}
console.log(JSON.stringify({status:issues.length?'TESTED_FAIL':'TESTED_PASS',scope:'tracked/untracked publishable tree; narrow path/credential/canonical-JSON checks only',files:files.length,issues},null,2));
if(issues.length)process.exitCode=1;
