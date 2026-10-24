import {rm} from 'node:fs/promises';
import {withQaCleanup,cleanupBrowserArtifacts} from './qa-download.mjs';

export function observeUpdatePages(context,errors){
 context.on('page',page=>{
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))errors.push(message.text());});
 });
}

export async function cleanupUpdateResources({context,profile,server,root}){
 let disconnected=!context;
 await withQaCleanup(async()=>{},[
  {stage:'context.close',run:async()=>{await context?.close();disconnected=true;}},
  {stage:'owned-profile',run:()=>cleanupBrowserArtifacts(profile,disconnected)},
  {stage:'owned-server',run:async()=>{if(server?.listening){server.closeAllConnections();await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}}},
  {stage:'owned-fixture',run:async()=>{if(root)await rm(root,{recursive:true});}},
 ]);
}
