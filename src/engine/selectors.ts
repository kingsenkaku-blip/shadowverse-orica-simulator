import {
  ARMED_DRAGON_CARDS,
  CARD_IDS,
  DUAL_MODE_IDS,
  NORMAL_LAEVATEINN_MODE_IDS,
  getCardDefinition
} from "../data/cards/armed-dragon";
import type { CardInstance, FollowerInstance, GameState, PlayerId, Trait } from "./types";

export function opponentOf(playerId: PlayerId): PlayerId {
  return playerId === "human" ? "opponent" : "human";
}

export function effectiveCost(card: CardInstance): number {
  const definition = getCardDefinition(card.definitionId);
  return Math.max(0, definition.cost + (card.costModifier ?? 0));
}

export function cardLabel(card: CardInstance): string {
  const definition = getCardDefinition(card.definitionId);
  const cost = effectiveCost(card);
  return cost === definition.cost ? definition.name : `${definition.name} (${cost})`;
}

export function canPlayCard(state: GameState, playerId: PlayerId, card: CardInstance): boolean {
  const player = state.players[playerId];
  const definition = getCardDefinition(card.definitionId);
  if (state.winner || state.activePlayer !== playerId) return false;
  if (player.pp < effectiveCost(card)) return false;
  if (card.definitionId === CARD_IDS.dualRage) return getDualRagePlayErrors(state, playerId).length === 0;
  if (definition.type === "follower" && player.board.length >= 5) return false;
  return player.hand.some((handCard) => handCard.instanceId === card.instanceId);
}

export function canAttackFollower(state: GameState, attacker: FollowerInstance): boolean {
  if (state.winner || attacker.owner !== state.activePlayer) return false;
  return attacker.canAttackFollowers && getAttacksRemaining(attacker) > 0;
}

export function canAttackLeader(state: GameState, attacker: FollowerInstance): boolean {
  if (state.winner || attacker.owner !== state.activePlayer) return false;
  if (!attacker.canAttackLeader || getAttacksRemaining(attacker) <= 0) return false;
  return !hasWardFollower(state, opponentOf(attacker.owner));
}

export function canEvolve(state: GameState, follower: FollowerInstance): boolean {
  const player = state.players[follower.owner];
  if (state.winner || state.activePlayer !== follower.owner || follower.evolved) return false;
  if (player.turnNumber < (player.isFirst ? 5 : 4)) return false;
  return follower.freeEvolve || player.ep > 0;
}

export function getArmedFollowersLeftPlay(state: GameState, playerId: PlayerId): number {
  return state.armedFollowersLeftPlay?.[playerId] ?? state.players[playerId].armedFollowersLeftPlay;
}

export function getArmedFollowersDestroyed(state: GameState, playerId: PlayerId): number {
  return state.armedFollowersDestroyed?.[playerId] ?? state.players[playerId].armedFollowersDestroyed ?? 0;
}

export function getDistinctArmedFollowersDestroyed(state: GameState, playerId: PlayerId): string[] {
  return (
    state.distinctArmedFollowersDestroyed?.[playerId] ??
    state.players[playerId].distinctArmedFollowersDestroyed ??
    []
  );
}

export function getArmedCountSummary(state: GameState, playerId: PlayerId) {
  const distinct = getDistinctArmedFollowersDestroyed(state, playerId);
  return {
    leftPlay: getArmedFollowersLeftPlay(state, playerId),
    destroyed: getArmedFollowersDestroyed(state, playerId),
    distinctDestroyed: distinct,
    distinctDestroyedCount: distinct.length
  };
}

export function getDualRageModeChoices() {
  return DUAL_MODE_IDS.map((id) => getCardDefinition(id));
}

export function getDualRagePlayErrors(state: GameState, playerId: PlayerId): string[] {
  const player = state.players[playerId];
  const errors: string[] = [];
  if (player.pp < 6) errors.push("PPが足りません");
  if (player.ep < 1) errors.push("EPが足りません");
  if (!player.hand.some((card) => card.definitionId === CARD_IDS.laevateinnDragon)) {
    errors.push("手札にレーヴァテインドラゴンがありません");
  }
  if (getDraconicWeaponsInPlay(state, playerId).length < 2) {
    errors.push("場にドラゴウェポンが2枚必要です");
  }
  if (player.board.length >= 5) errors.push("場がいっぱいです");
  return errors;
}

export function getDraconicWeaponsInPlay(state: GameState, playerId: PlayerId): CardInstance[] {
  const player = state.players[playerId];
  const amulets = player.amulets ?? [];
  return amulets.filter((card) => card.definitionId === CARD_IDS.draconicWeapon);
}

export function getAttacksRemaining(follower: FollowerInstance): number {
  const maxAttacks = follower.maxAttacksPerTurn ?? 1;
  const used = follower.attacksThisTurn ?? (follower.hasAttacked ? 1 : 0);
  return Math.max(0, maxAttacks - used);
}

export function shouldShowLaevateinnModeChoice(state: GameState, follower: FollowerInstance): boolean {
  return (
    follower.definitionId === CARD_IDS.laevateinnDragon &&
    canEvolve(state, follower) &&
    getArmedFollowersLeftPlay(state, follower.owner) >= 4
  );
}

export function getLaevateinnNormalModeChoices() {
  return NORMAL_LAEVATEINN_MODE_IDS.map((id) => getCardDefinition(id));
}

export function hasWardFollower(state: GameState, playerId: PlayerId): boolean {
  return state.players[playerId].board.some((follower) => follower.keywords.includes("ward"));
}

export function isLegalFollowerTarget(state: GameState, target: FollowerInstance): boolean {
  const defendingPlayer = target.owner;
  const wards = state.players[defendingPlayer].board.filter((follower) =>
    follower.keywords.includes("ward")
  );
  return wards.length === 0 || target.keywords.includes("ward");
}

export function hasTrait(traits: Trait[], trait: Trait): boolean {
  return traits.includes(trait) || (trait === "armed" && traits.includes("Armed"));
}

export function isArmedFollower(follower: Pick<FollowerInstance, "traits">): boolean {
  return hasTrait(follower.traits, "armed");
}

export function isArmedCard(cardId: string): boolean {
  const definition = ARMED_DRAGON_CARDS[cardId];
  return definition ? hasTrait(definition.traits, "armed") : false;
}

export function findFollower(state: GameState, followerInstanceId: string): FollowerInstance | undefined {
  return [...state.players.human.board, ...state.players.opponent.board].find(
    (follower) => follower.instanceId === followerInstanceId
  );
}
