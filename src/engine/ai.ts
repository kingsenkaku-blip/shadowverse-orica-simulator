import { CARD_IDS, getCardDefinition } from "../data/cards/armed-dragon";
import {
  attackFollower,
  attackLeader,
  chooseDualMode,
  endTurn,
  evolveFollower,
  playCard
} from "./effects";
import {
  canAttackFollower,
  canAttackLeader,
  canEvolve,
  canPlayCard,
  effectiveCost,
  getArmedFollowersLeftPlay,
  hasWardFollower,
  isLegalFollowerTarget,
  opponentOf
} from "./selectors";
import type { CardInstance, FollowerInstance, GameState, LaevateinnMode, PlayerId } from "./types";

export function runAiTurn(input: GameState, playerId: PlayerId = "opponent"): GameState {
  let state = input;
  if (state.winner || state.activePlayer !== playerId) return state;

  for (let step = 0; step < 12; step += 1) {
    const card = chooseCardToPlay(state, playerId);
    if (!card) break;
    const next = playCard(state, playerId, card.instanceId);
    if (next === state) break;
    state = next;
    if (state.pendingDualRageChoice?.playerId === playerId) {
      state = chooseDualMode(state, chooseDualRageMode(state, playerId));
    }
  }

  const evolveTarget = chooseEvolveTarget(state, playerId);
  if (evolveTarget) {
    state = evolveFollower(state, playerId, evolveTarget.instanceId, chooseLaevateinnMode(state, evolveTarget));
  }

  for (let step = 0; step < 8; step += 1) {
    const attack = chooseAttack(state, playerId);
    if (!attack) break;
    state =
      attack.target === "leader"
        ? attackLeader(state, playerId, attack.attacker.instanceId)
        : attackFollower(state, playerId, attack.attacker.instanceId, attack.target.instanceId);
  }

  return endTurn(state);
}

function chooseDualRageMode(state: GameState, playerId: PlayerId) {
  const player = state.players[playerId];
  const enemy = state.players[opponentOf(playerId)];
  if (enemy.health <= 6) return "gamma" as const;
  if (player.health <= 8) return "beta" as const;
  return "alpha" as const;
}

function chooseCardToPlay(state: GameState, playerId: PlayerId): CardInstance | undefined {
  const player = state.players[playerId];
  return [...player.hand]
    .filter((card) => canPlayCard(state, playerId, card))
    .sort((a, b) => scoreCard(state, playerId, b) - scoreCard(state, playerId, a))[0];
}

function scoreCard(state: GameState, playerId: PlayerId, card: CardInstance): number {
  const definition = getCardDefinition(card.definitionId);
  const player = state.players[playerId];
  let score = effectiveCost(card) * 10;

  if (definition.id === CARD_IDS.laevateinnDragon) score += getArmedFollowersLeftPlay(state, playerId) >= 4 ? 80 : 35;
  if (definition.id === CARD_IDS.dualRage) score += 120;
  if (definition.id === CARD_IDS.dragonicArmor || definition.id === CARD_IDS.dragnir) score += 24;
  if (definition.id === CARD_IDS.dragonWeapon) score += player.board.length < 4 ? 22 : -15;
  if (definition.id === CARD_IDS.dragonEmissary) score += player.hand.some((hand) => hand.definitionId === CARD_IDS.laevateinnDragon) ? -20 : 30;
  if (definition.id === CARD_IDS.asukaShiori) score += player.hand.length <= 4 ? 30 : 5;
  if (definition.type === "follower") score += Math.min(20, (definition.attack ?? 0) + (definition.defense ?? 0));
  if (player.pp === effectiveCost(card)) score += 8;
  return score;
}

function chooseEvolveTarget(state: GameState, playerId: PlayerId): FollowerInstance | undefined {
  const player = state.players[playerId];
  return [...player.board]
    .filter((follower) => canEvolve(state, follower))
    .sort((a, b) => evolveScore(state, playerId, b) - evolveScore(state, playerId, a))[0];
}

function evolveScore(state: GameState, playerId: PlayerId, follower: FollowerInstance): number {
  const enemy = state.players[opponentOf(playerId)];
  let score = follower.attack + follower.defense;
  if (follower.definitionId === CARD_IDS.laevateinnDragon) {
    score += getArmedFollowersLeftPlay(state, playerId) >= 4 ? 100 : 35;
  }
  if (follower.definitionId === CARD_IDS.gransAngel && enemy.board.length > 0) score += 35;
  if (follower.definitionId === CARD_IDS.reggie && state.players[playerId].board.length >= 2) score += 25;
  if (follower.freeEvolve) score += 18;
  return score;
}

function chooseLaevateinnMode(state: GameState, follower: FollowerInstance): LaevateinnMode {
  if (follower.definitionId !== CARD_IDS.laevateinnDragon) return "base";
  const player = state.players[follower.owner];
  const enemy = state.players[opponentOf(follower.owner)];
  if (getArmedFollowersLeftPlay(state, follower.owner) < 4) return "base";
  if (enemy.health <= follower.attack + 7 || player.board.some((unit) => unit.canAttackLeader && unit.attack >= enemy.health)) {
    return "blast";
  }
  const lowHealthEnemies = enemy.board.filter((unit) => unit.defense <= 10).length;
  if (lowHealthEnemies >= 2) return "attack";
  if (player.health <= 10 || enemy.board.reduce((sum, unit) => sum + unit.attack, 0) >= player.health) {
    return "defense";
  }
  if (player.hand.length <= 2) return "defense";
  return "blast";
}

function chooseAttack(
  state: GameState,
  playerId: PlayerId
): { attacker: FollowerInstance; target: FollowerInstance | "leader" } | undefined {
  const player = state.players[playerId];
  const enemyId = opponentOf(playerId);
  const enemy = state.players[enemyId];
  const attackers = [...player.board].filter((follower) => canAttackFollower(state, follower));

  for (const attacker of attackers.sort((a, b) => b.attack - a.attack)) {
    const target = chooseFollowerTarget(state, attacker, enemy.board);
    if (target) return { attacker, target };
  }

  const leaderAttacker = [...player.board]
    .filter((follower) => canAttackLeader(state, follower))
    .sort((a, b) => b.attack - a.attack)[0];
  if (leaderAttacker && !hasWardFollower(state, enemyId)) {
    return { attacker: leaderAttacker, target: "leader" };
  }

  return undefined;
}

function chooseFollowerTarget(
  state: GameState,
  attacker: FollowerInstance,
  enemyBoard: FollowerInstance[]
): FollowerInstance | undefined {
  const legalTargets = enemyBoard.filter((target) => isLegalFollowerTarget(state, target));
  const wards = legalTargets.filter((target) => target.keywords.includes("ward"));
  const pool = wards.length > 0 ? wards : legalTargets;
  return pool
    .filter((target) => target.defense <= attacker.attack || target.attack >= attacker.defense)
    .sort((a, b) => a.defense - b.defense || b.attack - a.attack)[0];
}
