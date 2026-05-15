import { getCardDefinition } from "../data/cards/armed-dragon";
import { ROYAL_CARD_IDS } from "../data/cards/royal-f";
import type { CardInstance, GameState, PlayerId } from "./types";

const REVEAL_PRIORITY = [
  ROYAL_CARD_IDS.sunlightCrimsonSkysword,
  ROYAL_CARD_IDS.solarKnightSunlight,
  ROYAL_CARD_IDS.stellarKnightStarlight,
  ROYAL_CARD_IDS.lunarKnightMoonlight
];

export function chooseRevealCard(
  state: GameState,
  playerId: PlayerId,
  predicate: (card: CardInstance) => boolean
): CardInstance | undefined {
  const candidates = state.players[playerId].hand.filter(predicate);
  return [...candidates].sort((a, b) => revealScore(b) - revealScore(a))[0];
}

export function revealCard(state: GameState, playerId: PlayerId, card: CardInstance): void {
  card.isRevealed = true;
  card.revealedThisTurn = true;
  state.revealedCardThisTurn[playerId] = true;
  state.revealedCards[playerId] = [...(state.revealedCards[playerId] ?? []), card.definitionId];
}

function revealScore(card: CardInstance): number {
  const priority = REVEAL_PRIORITY.indexOf(card.definitionId as (typeof REVEAL_PRIORITY)[number]);
  const definition = getCardDefinition(card.definitionId);
  return (priority >= 0 ? 1000 - priority * 20 : 0) + definition.cost * 5;
}
