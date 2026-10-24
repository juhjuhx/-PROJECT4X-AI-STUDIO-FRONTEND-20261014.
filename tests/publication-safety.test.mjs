import test from 'node:test';
import assert from 'node:assert/strict';
import {scanPublicationFile} from '../scripts/publication-policy.mjs';
test('publication guard rejects personal and ephemeral paths without echoing their values',()=>{
 const personal=['','Users','example','Desktop','private'].join('/'),temporary=['','private','var','folders','xx','random','T','qa.json'].join('/');
 for(const value of [personal,temporary]){const issues=scanPublicationFile('docs/report.md',value);assert.ok(issues.some(x=>x.code==='LOCAL_PATH'));assert.ok(!JSON.stringify(issues).includes(value));}
});
test('publication guard rejects actual-looking credentials, never prints matched secrets',()=>{
 const secret=['ghp','x'.repeat(36)].join('_');const issues=scanPublicationFile('docs/config.txt',secret);assert.ok(issues.some(x=>x.code==='SECRET'));assert.ok(!JSON.stringify(issues).includes(secret));
});
test('publication guard rejects nested canonical world while allowing actor observation',()=>{
 const truth={width:2,height:2,terrain:['plain','water','hill','plain'],units:[],history:[]};assert.ok(scanPublicationFile('docs/dump.json',JSON.stringify({debug:truth})).some(x=>x.code==='CANONICAL_WORLD'));
 const observation={actor:0,tiles:[{visibility:'unknown',terrain:null}],units:[],legalActions:[]};assert.deepEqual(scanPublicationFile('tests/observation.json',JSON.stringify(observation)),[]);
});
test('publication guard accepts public results and preserves empty historical stdout',()=>{
 assert.deepEqual(scanPublicationFile('docs/results.json',JSON.stringify({status:'TURN_LIMIT',history:800,units:12,sourceHash:'a'.repeat(64),url:'https://github.com/example/game'})),[]);
 assert.deepEqual(scanPublicationFile('docs/history/error.stdout.json',''),[]);
});
