import type {Observation,Action} from '../core/types';
import type {DeepReadonly} from '../session/contracts';
export interface DemoProgress {readonly seed:string;readonly explored:boolean;readonly researched:boolean;readonly relicChoice:null|'gold'|'intel';readonly intelCount:number;}
export const createProgress=(view:DeepReadonly<Observation>):DemoProgress=>({seed:view.seed,explored:false,researched:view.faction.techs.length>0,relicChoice:null,intelCount:0});
export function advanceProgress(p:DemoProgress,action:DeepReadonly<Action>,before:DeepReadonly<Observation>,after:DeepReadonly<Observation>):DemoProgress {
 if(after.seed!==p.seed)return createProgress(after);
 if(before.actor!==after.actor||before.active!==before.actor||after.version!==before.version+1
   ||!before.legalActions.some(a=>JSON.stringify(a)===JSON.stringify(action)))return {...p};
 const explored=p.explored||(action.type==='Move'&&before.tiles.some((t,i)=>t.visibility==='unknown'&&after.tiles[i]?.visibility!=='unknown'));
 const researched=p.researched||(action.type==='Research'&&!before.faction.techs.includes(action.tech)&&after.faction.techs.includes(action.tech));
 const resolved=action.type==='ResolveRelic'&&before.pendingRelic!==null&&after.pendingRelic===null;
 return {...p,explored,researched,relicChoice:resolved?action.choice:p.relicChoice,intelCount:resolved?before.pendingRelic!.intelCount:p.intelCount};
}
export const completeProgress=(p:DemoProgress):boolean=>p.explored&&p.researched&&p.relicChoice!==null;
export function parseProgress(value:unknown):DemoProgress|null {
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(typeof v.seed!=='string'||v.seed.length===0||v.seed.length>256||typeof v.explored!=='boolean'||typeof v.researched!=='boolean'
   ||![null,'gold','intel'].includes(v.relicChoice as null|string)||!Number.isInteger(v.intelCount)||(v.intelCount as number)<0||(v.intelCount as number)>3)return null;
 return {seed:v.seed,explored:v.explored,researched:v.researched,relicChoice:v.relicChoice as DemoProgress['relicChoice'],intelCount:v.intelCount as number};
}
