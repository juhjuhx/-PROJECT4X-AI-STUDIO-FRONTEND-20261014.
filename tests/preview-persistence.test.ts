import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewJourney } from './helpers/preview-journey';
import { createGame, canonicalHash } from '../src/core/game';
import { serializeGame, deserializeGame, exportReplay, replayGame } from '../src/core/persistence';
import { getRuleset } from '../src/core/rulesets';

test('新局 Save2/Replay2 綁定內容與生成器，兩新兵真命令重建相同世界', () => {
  const state=createPreviewJourney();
  assert.ok(state.units.some(u=>u.kind==='shieldGuard')&&state.units.some(u=>u.kind==='mobileScout'));
  const save=serializeGame(state), replay=exportReplay(state), dto=JSON.parse(replay);
  assert.equal(dto.schema,'project4x-replay-2');
  assert.equal(dto.contentHash,getRuleset('demo03-preview-1').contentHash);
  assert.equal(dto.generatorVersion,'g1-mapgen-1');
  assert.deepEqual(deserializeGame(save),state);
  assert.deepEqual(replayGame(replay),state);
  assert.equal(canonicalHash(replayGame(replay)),canonicalHash(state));
});

test('新舊混搭、未知內容/生成器、歷史/兵種/HP篡改拒絕，不靜默 migration', () => {
  const state=createPreviewJourney(), save=JSON.parse(serializeGame(state)), replay=JSON.parse(exportReplay(state));
  const mutations: ((v: any)=>void)[]=[
    v=>{v.schema='project4x-save-1';},v=>{v.ruleset='g1-ccts-1';},
    v=>{v.contentHash='0'.repeat(64);},v=>{v.generatorVersion='future';},v=>{delete v.contentHash;},
    v=>{v.units.find((u:any)=>u.kind==='shieldGuard').hp=11;},v=>{v.units[0].kind='future';},
    v=>{v.factions[0].techs=['militaryMobility'];},v=>{v.history[0].action.tech='militaryMobility';},
    v=>{v.extra=true;},
  ];
  for(const mutate of mutations){const value=structuredClone(save);mutate(value);assert.throws(()=>deserializeGame(JSON.stringify(value)));}
  for(const mutation of [
    (v:any)=>{v.schema='project4x-replay-1';},(v:any)=>{v.ruleset='g1-ccts-1';},
    (v:any)=>{v.contentHash='0'.repeat(64);},(v:any)=>{v.generatorVersion='future';},
    (v:any)=>{v.commands[0].action.tech='militaryMobility';},(v:any)=>{v.hash='0'.repeat(16);},
  ]){const value=structuredClone(replay);mutation(value);assert.throws(()=>replayGame(JSON.stringify(value)));}
  const legacy=JSON.parse(serializeGame(createGame('G1不能偷加metadata')));legacy.contentHash=save.contentHash;
  assert.throws(()=>deserializeGame(JSON.stringify(legacy)));
});
