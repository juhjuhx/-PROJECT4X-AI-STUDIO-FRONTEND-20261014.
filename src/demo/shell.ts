import type {Action,Observation} from '../core/types';
import type {DeepReadonly,GameplayPort} from '../session/contracts';
import {DEMO_PACK,parseNarrativePack} from './content';
import {createProgress,advanceProgress,completeProgress,type DemoProgress} from './progress';
interface Options {gameplay:GameplayPort;mount:HTMLElement;hasSave:()=>boolean;start:(seed:string)=>boolean;load:(isCurrent:()=>boolean)=>Promise<boolean>;save:()=>void;help:()=>void;afterClose:()=>void;}
export function createDemoShell(options:Options){
 const pack=parseNarrativePack(DEMO_PACK);let progress=createProgress(options.gameplay.getObservation()),started=false,intent=0;
 const node=<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string,className?:string)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 const button=(text:string,act:()=>void,className='secondary-button')=>{const b=node('button',text,className);b.type='button';b.addEventListener('click',act);return b;};
 const menu=node('dialog',undefined,'game-dialog demo-menu');menu.setAttribute('aria-labelledby','demo-menu-title');
 const title=node('h2','霧境初航 · 探索Demo');title.id='demo-menu-title';
 const description=node('p','從一座城邦出發，探索未知地形、處置遺跡並研究能力，完成第一份觀測紀錄。之後仍可繼續對戰。');
 const seedLabel=node('label','世界種子');seedLabel.htmlFor='demo-world-seed';
 const seed=node('input',undefined,'seed-input');seed.id='demo-world-seed';seed.maxLength=120;
 const error=node('p',undefined,'is-error');error.setAttribute('role','alert');
 const actions=node('div',undefined,'dialog-actions demo-choices');
 const closeMenu=()=>{intent++;if(menu.open)menu.close();options.afterClose();};
 const start=button('開始探索Demo',()=>{const value=seed.value.trim();if(!value){error.textContent='請輸入世界種子。';seed.focus();return;}intent++;
  if(options.start(value)){started=true;progress=createProgress(options.gameplay.getObservation());closeMenu();}else {error.textContent='未建立新航程，目前進度仍保留。';load.disabled=!options.hasSave();}},'primary-button');
 const load=button('接續保存航程',()=>{const token=++intent;void(async()=>{load.disabled=true;
  try{const loaded=await options.load(()=>token===intent);if(token!==intent)return;if(loaded){started=true;closeMenu();}else error.textContent='未讀取保存，目前航程仍保留。';}
  catch(e){if(token===intent)error.textContent=e instanceof Error?e.message:String(e);}finally{if(token===intent)load.disabled=!options.hasSave();}})();});
 const save=button('保存目前航程',()=>{if(!started)return;closeMenu();options.save();});
 const resume=button('返回目前航程',closeMenu);actions.append(start,load,resume);
 const journal=node('dialog',undefined,'game-dialog demo-journal');journal.setAttribute('aria-labelledby','demo-journal-title');
 const journalTitle=node('h2',pack.text.title);journalTitle.id='demo-journal-title';
 const story=node('div',undefined,'demo-story');
 const journalClose=button('繼續探索',()=>{journal.close();if(!started)openMenu();else options.afterClose();},'primary-button');
 journal.append(journalTitle,story,journalClose);
 journal.addEventListener('cancel',e=>{if(!started){e.preventDefault();journal.close();openMenu();}});
 const openJournal=()=>{intent++;if(menu.open)menu.close();journalClose.textContent=started?'繼續探索':'返回主選單';story.replaceChildren();
  if(progress.relicChoice){story.append(node('p',pack.text.discovery),node('p',pack.text.interpretation),node('p',pack.text[progress.relicChoice]));
   if(progress.relicChoice==='intel')story.append(node('p','這次選擇揭開 '+progress.intelCount+' 格未知地形。'));
   story.append(node('p',pack.text.lead));
  }else story.append(node('p','觀測紀錄會在你處置遺跡後出現。先帶領部隊向未知邊界探索。'));
  if(completeProgress(progress))story.append(node('p',pack.text.completion,'demo-completion'));journal.showModal();
 };
 menu.append(title,description,seedLabel,seed,actions,error,
  node('p','探索：選取部隊並點合法目的地。發展：使用知識面板研究。遺跡：立即選擇金幣或地形情報。保存與匯入在「航行紀錄」。','muted'),
  button('玩法指南',()=>options.help()),button('探索手札',openJournal),save,
  node('p','開發中探索Demo · 本機單人對AI。探索紀錄完成不代表軍事勝利。','muted'));
 const panel=node('section',undefined,'panel-section journey-panel demo-progress');panel.append(node('h2','探索紀錄'));
 const list=node('ul',undefined,'demo-objectives'),status=node('p',undefined,'demo-status');panel.append(list,status,button('閱讀探索手札',openJournal));
 options.mount.append(panel);document.body.append(menu,journal);
 menu.addEventListener('cancel',e=>{if(!started)e.preventDefault();else {intent++;options.afterClose();}});
 const render=()=>{const done=completeProgress(progress);panel.dataset.complete=String(done);
  list.replaceChildren(...[['探索未知土地',progress.explored],['處置一處遺跡',progress.relicChoice!==null],['完成一項研究',progress.researched]].map(([text,ok])=>node('li',(ok?'✓':'○')+' '+text)));
  status.textContent=done?'首段觀測已完成，仍可繼續探索與對戰。':'完成三項觀測，留下第一份探索手札。';
 };
 const openMenu=()=>{intent++;seed.value=options.gameplay.getObservation().seed;load.disabled=!options.hasSave();resume.hidden=!started;save.hidden=!started;error.textContent='';if(journal.open)journal.close();if(!menu.open)menu.showModal();seed.focus();};
 render();openMenu();
 return {isMenuOpen:()=>menu.open,openMenu,render,getProgress:()=>({...progress}),
  reset:(view:DeepReadonly<Observation>)=>{progress=createProgress(view);render();},
  restore:(value:DemoProgress)=>{if(value.seed===options.gameplay.getObservation().seed){progress={...value};render();}},
  accepted:(action:DeepReadonly<Action>,before:DeepReadonly<Observation>,after:DeepReadonly<Observation>)=>{progress=advanceProgress(progress,action,before,after);render();}};
}
