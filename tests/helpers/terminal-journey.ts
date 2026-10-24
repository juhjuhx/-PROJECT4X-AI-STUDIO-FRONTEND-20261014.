import { applyCommand, createGame, legalActions, passable } from '../../src/core/game';
import type { Action, Command, GameState, Point } from '../../src/core/types';

export interface TerminalJourney {
  final: GameState;
  previous: GameState;
  lastCommand: Command;
  earlyHumanCommand: Command;
}

/**
 * 測試專用全知 BFS planner，不是 production AI。
 * 僅從 createGame 經合法 applyCommand 前進，不改寫 state 或合成 winner。
 * 玩家 0 的初始斥候進軍、清除敵軍、佔領首都；玩家 1 只結束回合。
 */
export function createTerminalJourney(): TerminalJourney {
  let state = createGame('霧境初航-01');
  let previous = state;
  let earlyHumanCommand: Command | undefined;
  const scoutId = '兵-1';

  function pathDistance(start: Point, goals: readonly Point[]): number {
    const blocked = new Set(state.units.filter(unit => unit.id !== scoutId).map(unit => unit.y * state.width + unit.x));
    const seen = new Set<number>();
    const queue = [{ ...start, steps: 0 }];
    for (let index = 0; index < queue.length; index++) {
      const point = queue[index];
      const key = point.y * state.width + point.x;
      if (seen.has(key)) continue;
      seen.add(key);
      if (goals.some(goal => goal.x === point.x && goal.y === point.y)) return point.steps;
      const neighbors = [
        { x: point.x, y: point.y - 1 }, { x: point.x - 1, y: point.y },
        { x: point.x + 1, y: point.y }, { x: point.x, y: point.y + 1 },
      ];
      for (const next of neighbors) {
        const nextKey = next.y * state.width + next.x;
        if (next.x >= 0 && next.x < state.width && next.y >= 0 && next.y < state.height
          && !blocked.has(nextKey) && !seen.has(nextKey) && passable(state.terrain[nextKey])) {
          queue.push({ ...next, steps: point.steps + 1 });
        }
      }
    }
    return Infinity;
  }

  for (let index = 0; index < 300 && state.winner === null; index++) {
    const legal = legalActions(state, state.active);
    let action = legal.find(candidate => candidate.type === 'ResolveRelic' && candidate.choice === 'gold');
    if (!action && state.active === 0) {
      const scout = state.units.find(unit => unit.id === scoutId);
      if (!scout) throw new Error('終局旅程的玩家斥候不存在');
      action = legal.find(candidate => candidate.type === 'Attack' && candidate.unitId === scoutId);
      const enemies = state.units.filter(unit => unit.owner === 1);
      if (!action && enemies.length === 0) {
        action = legal.find(candidate => candidate.type === 'Capture' && candidate.unitId === scoutId);
      }
      if (!action) {
        const enemySite = state.sites.find(site => site.owner === 1);
        if (!enemies.length && !enemySite) throw new Error('敵軍與據點均已清除卻未終局');
        const goals: Point[] = enemies.length ? enemies.flatMap(enemy => [
          { x: enemy.x, y: enemy.y - 1 }, { x: enemy.x - 1, y: enemy.y },
          { x: enemy.x + 1, y: enemy.y }, { x: enemy.x, y: enemy.y + 1 },
        ]) : [{ x: enemySite!.x, y: enemySite!.y }];
        const before = pathDistance(scout, goals);
        action = legal
          .filter((candidate): candidate is Extract<Action, { type: 'Move' }> => candidate.type === 'Move' && candidate.unitId === scoutId)
          .map(candidate => ({ action: candidate, remaining: pathDistance(candidate.to, goals) }))
          .filter(candidate => candidate.remaining < before)
          .sort((left, right) => left.remaining - right.remaining)[0]?.action;
      }
    }
    action ??= legal.find(candidate => candidate.type === 'EndTurn');
    if (!action) throw new Error('終局旅程沒有合法後續行動');
    const command: Command = {
      actor: state.active, requestId: `terminal-journey-${index}`,
      expectedVersion: state.version, action,
    };
    const result = applyCommand(state, command);
    if (!result.ok) throw new Error(`終局旅程核心拒絕：${result.error}`);
    previous = state;
    state = result.state;
    if (!earlyHumanCommand && command.actor === 0) earlyHumanCommand = state.history.at(-1);
  }
  const lastCommand = state.history.at(-1);
  if (state.winner !== 0 || !lastCommand || !earlyHumanCommand) {
    throw new Error('終局旅程未在 300 個合法指令內產生玩家 0 勝利');
  }
  return { final: state, previous, lastCommand, earlyHumanCommand };
}
