import { ROYAL_CARD_IDS } from "../data/cards/royal-f";
import type { GameState, PlayerId } from "./types";

export const FOUR_KNIGHTS_REANIMATE_ORDER = [
  ROYAL_CARD_IDS.victoriousFirstKnight,
  ROYAL_CARD_IDS.woteusSecondKnight,
  ROYAL_CARD_IDS.stabelusThirdKnight,
  ROYAL_CARD_IDS.desterioFourthKnight
] as const;

export function getFourKnightsReanimateTargets(state: GameState, playerId: PlayerId): string[] {
  const destroyed = state.destroyedTwoCostCommanderCardIds[playerId] ?? [];
  return FOUR_KNIGHTS_REANIMATE_ORDER.filter((cardId) => destroyed.includes(cardId));
}
