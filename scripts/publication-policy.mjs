// Narrow publication hygiene gate; not a general security or license audit.
export function scanPublicationFile(path,text) {
 const issues=[];
 const add=(code,index=0)=>issues.push({path,code,line:text.slice(0,index).split('\n').length});
 const local=/\/(?:Users|home)\/[^/\s]+|\/(?:private\/)?var\/folders\/|\/tmp\/(?:project4x|playwright|chromium)[^\s]*/;
 const credential=/gh[pousr]_[A-Za-z0-9]{24,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{32,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
 const location=local.exec(text);if(location)add('LOCAL_PATH',location.index);
 const secret=credential.exec(text);if(secret)add('SECRET',secret.index);
 if(/\.(json|jsonl)$/.test(path)){
  if(!text.trim()&&path.endsWith('.stdout.json'))return issues; // Preserved failed-command stdout, not a config.
  let data;try{data=path.endsWith('.jsonl')?text.split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x)):JSON.parse(text);}catch{add('INVALID_JSON');return issues;}
  const queue=[data];
  for(let i=0;i<queue.length;i++){
   const v=queue[i];if(!v||typeof v!=='object')continue;
   if(!Array.isArray(v)&&Array.isArray(v.terrain)&&Array.isArray(v.units)&&(Array.isArray(v.history)||Array.isArray(v.factions))){add('CANONICAL_WORLD');break;}
   queue.push(...Object.values(v).filter(x=>x&&typeof x==='object'));
  }
 }
 return issues;
}
