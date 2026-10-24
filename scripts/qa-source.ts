import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {canonicalJson} from './qa-ledger';
export const sha=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
function walk(root:string,name:string):string[] {
  return readdirSync(join(root,name),{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(root,join(name,entry.name)):entry.name==='.DS_Store'?[]:[join(name,entry.name)]);
}
export function productSources(root:string):Record<string,string> {
  const children=new Set(readdirSync(root));
  const paths=['src','public','assets'].filter(name=>children.has(name)).flatMap(name=>walk(root,name))
    .concat(['package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html']).sort();
  return Object.fromEntries(paths.map(path=>[path,sha(readFileSync(join(root,path)))]));
}
export function sourceHash(files:Record<string,string>):string {return sha(canonicalJson(files));}
export function methodSources(root:string):Record<string,string> {
  return Object.fromEntries(walk(root,'scripts').filter(path=>/\.(ts|mjs)$/.test(path)).sort().map(path=>[path,sha(readFileSync(join(root,path)))]));
}
export function methodHash(files:Record<string,string>,shadowHash:string|null):string {return sha(canonicalJson({files,shadowHash}));}

