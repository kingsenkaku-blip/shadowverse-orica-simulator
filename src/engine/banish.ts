import type { FollowerInstance, GameState } from "./types";

export function findBanishTargetByAttack(state: GameState, owner: FollowerInstance["owner"]): FollowerInstance | undefined {
  return [...state.players[owner].board].sort((a, b) => b.attack - a.attack)[0];
}
