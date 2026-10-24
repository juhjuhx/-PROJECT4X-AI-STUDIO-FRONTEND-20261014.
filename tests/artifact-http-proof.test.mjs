import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import * as proof from '../scripts/artifact-proof.mjs';
const probe=proof.probeServedScript??(async()=>undefined);
const body='self.addEventListener("fetch",()=>{});';
const hash=createHash('sha256').update(body).digest('hex');
async function server(t,{status=200,mime='text/javascript; charset=utf-8',bytes=body}={}){
 const server=createServer((req,res)=>{res.writeHead(status,{'content-type':mime});res.end(bytes);});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 return 'http://127.0.0.1:'+server.address().port;
}
test('HTTP worker proof hashes actual response bytes with JavaScript MIME',async t=>{
 const url=await server(t);const result=await probe(url,'service-worker.js',hash);
 assert.deepEqual(result,{path:'service-worker.js',via:'http-probe',status:200,contentType:'text/javascript; charset=utf-8',sha256:hash});
});
for(const [name,options]of [['missing asset',{status:404}],['HTML fallback',{mime:'text/html'}],['different bytes',{bytes:'changed worker'}]])
 test('HTTP worker proof rejects '+name,async t=>{const url=await server(t,options);await assert.rejects(()=>probe(url,'service-worker.js',hash));});
