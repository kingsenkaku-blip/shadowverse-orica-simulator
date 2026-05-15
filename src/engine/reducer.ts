import { runAiTurn } from "./ai";
import {
  attackFollower,
  attackLeader,
  chooseDualMode,
  debugAddDistinctArmedDestroyed,
  debugAddCardToHand,
  debugAddDestroyedTwoCostCommander,
  debugResetArmedCounts,
  debugResetDestroyedTwoCostCommanders,
  debugSetArmedDestroyed,
  debugSetArmedLeftPlay,
  debugSetMaxPp,
  debugSetRevealedThisTurn,
  debugTransformSunlight,
  endTurn,
  evolveFollower,
  playCard
} from "./effects";
import { createGame } from "./game";
import type { GameAction, GameState } from "./types";

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "NEW_GAME") {
    return createGame(action.seed, {
      human: action.humanDeckId,
      opponent: action.opponentDeckId
    });
  }

  if (state.winner && action.type !== "END_TURN") {
    return state;
  }

  switch (action.type) {
    case "PLAY_CARD":
      return playCard(state, "human", action.cardInstanceId);
    case "SELECT_ATTACKER":
      return {
        ...state,
        selectedAttackerId:
          state.selectedAttackerId === action.followerInstanceId ? undefined : action.followerInstanceId
      };
    case "ATTACK_FOLLOWER":
      if (!state.selectedAttackerId) return state;
      return attackFollower(state, "human", state.selectedAttackerId, action.targetInstanceId);
    case "ATTACK_LEADER":
      if (!state.selectedAttackerId) return state;
      return attackLeader(state, "human", state.selectedAttackerId);
    case "EVOLVE":
      return evolveFollower(state, "human", action.followerInstanceId, action.mode);
    case "CHOOSE_DUAL_MODE":
      return chooseDualMode(state, action.mode);
    case "END_TURN":
      return endTurn(state);
    case "RUN_AI_TURN":
      return runAiTurn(state);
    case "DEBUG_SET_ARMED_LEFT_PLAY":
      return debugSetArmedLeftPlay(state, action.playerId, action.value);
    case "DEBUG_SET_ARMED_DESTROYED":
      return debugSetArmedDestroyed(state, action.playerId, action.value);
    case "DEBUG_ADD_DISTINCT_ARMED_DESTROYED":
      return debugAddDistinctArmedDestroyed(state, action.playerId, action.cardId);
    case "DEBUG_RESET_ARMED_COUNTS":
      return debugResetArmedCounts(state, action.playerId);
    case "DEBUG_ADD_CARD_TO_HAND":
      return debugAddCardToHand(state, action.playerId, action.cardId);
    case "DEBUG_SET_MAX_PP":
      return debugSetMaxPp(state, action.playerId, action.value);
    case "DEBUG_SET_REVEALED_THIS_TURN":
      return debugSetRevealedThisTurn(state, action.playerId, action.value);
    case "DEBUG_ADD_DESTROYED_TWO_COST_COMMANDER":
      return debugAddDestroyedTwoCostCommander(state, action.playerId, action.cardId);
    case "DEBUG_RESET_DESTROYED_TWO_COST_COMMANDERS":
      return debugResetDestroyedTwoCostCommanders(state, action.playerId);
    case "DEBUG_TRANSFORM_SUNLIGHT":
      return debugTransformSunlight(state, action.playerId);
    default:
      return state;
  }
}
