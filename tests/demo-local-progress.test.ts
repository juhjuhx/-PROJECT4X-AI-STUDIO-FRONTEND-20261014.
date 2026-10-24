import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameSession} from '../src/session/game-session';
import {createProgress} from '../src/demo/progress';
import {bindProgressToSave,readBoundProgress} from '../src/demo/local-progress';
test('private local I/O binds public journal to exact save bytes; other/corrupt save never restores completion',async()=>{
 const session=createGameSession({seed:'demo-binding'}),view=session.gameplay.getObservation();
 try{
  const saved=session.files.save();assert.ok(saved.ok);
  const p={...createProgress(view),explored:true,researched:true,relicChoice:'gold' as const};
  const raw=await bindProgressToSave(saved.file.text,p);
  assert.deepEqual(await readBoundProgress(saved.file.text,raw),p);
  assert.equal(await readBoundProgress(saved.file.text+' ',raw),null);
  assert.equal(await readBoundProgress(saved.file.text,'{"schema":"bad"}'),null);
  assert.equal(await readBoundProgress(saved.file.text,'{'),null);
  const stalePack=JSON.parse(raw);stalePack.packVersion='9.0.0';
  assert.equal(await readBoundProgress(saved.file.text,JSON.stringify(stalePack)),null);
  const sidecar=JSON.parse(raw);assert.equal('terrain' in sidecar,false);assert.equal('history' in sidecar,false);
  assert.equal(session.gameplay.getSnapshot().hasUnsavedChanges,false);
 }finally{session.dispose();}
});
