import type { Action, Observation, Point } from '../core/types';
import type { DeepReadonly, PresentationChange, PresentationEvent } from '../session/contracts';
import { freezePublic } from '../session/immutable';

const point = (value: DeepReadonly<Point>): Point => ({ x: value.x, y: value.y });
const compareId = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const samePoint = (a: DeepReadonly<Point>, b: DeepReadonly<Point>): boolean => a.x === b.x && a.y === b.y;
const nonnegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0;

/**
 * 只讀取 session 提供的相鄰觀測；不能接收 canonical world、history 或對手命令。
 * ownReceipt 僅能由 session 在本玩家命令成功後提供；候選比對只是額外保守檢查，
 * 不是用觀測自行認證命令成功。未知規則必須另行審核移除／觀測語意。
 */
export function projectPresentationEvents(
  before: DeepReadonly<Observation>,
  after: DeepReadonly<Observation>,
  generation: number,
  ownReceipt?: DeepReadonly<Action>,
): readonly PresentationEvent[] {
  if (!nonnegativeInteger(generation)
    || !nonnegativeInteger(before.version) || !nonnegativeInteger(after.version)
    || after.version !== before.version + 1
    || (before.actor !== 0 && before.actor !== 1) || before.actor !== after.actor
    || before.faction.id !== before.actor || after.faction.id !== after.actor
    || before.ruleset !== 'g1-ccts-1' || after.ruleset !== before.ruleset
    || before.seed !== after.seed || before.width !== after.width || before.height !== after.height
    || !Number.isSafeInteger(before.width) || before.width <= 0
    || !Number.isSafeInteger(before.height) || before.height <= 0) return freezePublic([]);

  const health: PresentationChange[] = [], destroyed: PresentationChange[] = [];
  const sites: PresentationChange[] = [], recruited: PresentationChange[] = [];
  const techs: PresentationChange[] = [], relics: PresentationChange[] = [], centers: PresentationChange[] = [];
  const oldUnits = new Map(before.units.map(unit => [unit.id, unit]));
  const newUnits = new Map(after.units.map(unit => [unit.id, unit]));
  for (const unit of [...before.units].sort((a, b) => compareId(a.id, b.id))) {
    const next = newUnits.get(unit.id);
    if (next && unit.hp !== next.hp) health.push({ type: 'UnitHealthChanged', unitId: unit.id, at: point(next), beforeHP: unit.hp, afterHP: next.hp });
    // g1-ccts-1 的己軍總是出現在自己的 Observation，僅 combat 能移除。
    if (!next && unit.owner === before.actor) destroyed.push({ type: 'OwnUnitDestroyed', unitId: unit.id, lastKnownAt: point(unit) });
  }

  const oldSites = new Map(before.tiles.flatMap(tile => tile.site ? [[tile.site.id, tile] as const] : []));
  const newSites = new Map(after.tiles.flatMap(tile => tile.site ? [[tile.site.id, tile] as const] : []));
  for (const [siteId, tile] of [...oldSites].sort(([a], [b]) => compareId(a, b))) {
    const next = newSites.get(siteId);
    const beforeOwner = tile.site?.owner, afterOwner = next?.site?.owner;
    if (next && tile.visibility === 'visible' && next.visibility === 'visible'
      && beforeOwner !== undefined && afterOwner !== undefined && beforeOwner !== afterOwner) {
      sites.push({ type: 'SiteOwnerChanged', siteId, at: point(next), beforeOwner, afterOwner });
    }
  }

  const receipt = before.active === before.actor && ownReceipt && before.legalActions.some(action =>
    action.type === 'Recruit' && ownReceipt.type === 'Recruit' && action.siteId === ownReceipt.siteId && action.kind === ownReceipt.kind
    || action.type === 'ResolveRelic' && ownReceipt.type === 'ResolveRelic' && action.choice === ownReceipt.choice)
    ? ownReceipt : undefined;
  if (receipt?.type === 'Recruit') {
    const additions = after.units.filter(unit => unit.owner === after.actor && !oldUnits.has(unit.id));
    const unit = additions[0], site = oldSites.get(receipt.siteId), nextSite = newSites.get(receipt.siteId);
    if (additions.length === 1 && unit.kind === receipt.kind && site && nextSite
      && site.site?.owner === before.actor && nextSite.site?.owner === before.actor
      && site.visibility === 'visible' && nextSite.visibility === 'visible'
      && samePoint(site, nextSite) && samePoint(unit, site)) {
      recruited.push({ type: 'UnitRecruited', siteId: receipt.siteId, unitId: unit.id, kind: unit.kind, at: point(unit) });
    }
  }
  const oldTechs = new Set(before.faction.techs);
  for (const tech of [...new Set(after.faction.techs)].filter(tech => !oldTechs.has(tech)).sort(compareId)) techs.push({ type: 'TechResearched', tech });

  if (receipt?.type === 'ResolveRelic' && before.pendingRelic
    && after.pendingRelic?.id !== before.pendingRelic.id) {
    const oldTiles = new Map(before.tiles.map(tile => [`${tile.x}:${tile.y}`, tile]));
    const revealedTiles = receipt.choice === 'gold' ? [] : after.tiles
      .filter(tile => tile.visibility !== 'unknown' && oldTiles.get(`${tile.x}:${tile.y}`)?.visibility === 'unknown')
      .sort((a, b) => a.y - b.y || a.x - b.x).map(point);
    relics.push({ type: 'RelicResolved', relicId: before.pendingRelic.id, choice: receipt.choice, revealedTiles });
  }
  if (before.faction.centerId !== after.faction.centerId) centers.push({
    type: 'PoliticalCenterChanged', beforeSiteId: before.faction.centerId, afterSiteId: after.faction.centerId,
  });

  return freezePublic([...health, ...destroyed, ...sites, ...recruited, ...techs, ...relics, ...centers].map((change, sequence) => ({
    ...change, schema: 'project4x-presentation-1' as const, viewer: before.actor, generation,
    fromVersion: before.version, toVersion: after.version, sequence,
    id: `${generation}:${before.version}:${after.version}:${before.actor}:${sequence}`,
  })));
}
