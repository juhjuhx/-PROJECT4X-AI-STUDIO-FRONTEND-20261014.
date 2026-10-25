import { getRuleset } from '../core/rulesets';
import type { Observation } from '../core/types';
import type { DeepReadonly } from '../session/contracts';

export type RecruitmentStatus = 'occupied' | 'pending-relic' | 'waiting' | 'available' | 'insufficient-gold' | 'unavailable';
/** 只說明目前可知的限制；沒有合法候選不等於本回合曾招募。 */
export function recruitmentStatus(view: DeepReadonly<Observation>, siteId: string): RecruitmentStatus {
  const tile = view.tiles.find(t => t.site?.id === siteId && t.site.owner === view.actor);
  if (!tile) return 'unavailable';
  if (view.units.some(u => u.x === tile.x && u.y === tile.y)) return 'occupied';
  if (view.pendingRelic) return 'pending-relic';
  if (view.active !== view.actor) return 'waiting';
  if (view.legalActions.some(a => a.type === 'Recruit' && a.siteId === siteId)) return 'available';
  if (view.faction.gold < Math.min(...getRuleset(view.ruleset).units.map(u => u.cost))) return 'insufficient-gold';
  return 'unavailable';
}
