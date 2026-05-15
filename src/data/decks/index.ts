import type { DeckEntry, DeckId } from "../../engine/types";
import { ARMED_DRAGON_DECK, ARMED_DRAGON_DECK_NAME, DECK_TOTAL } from "./armed-dragon";
import {
  REVEAL_FOUR_KNIGHTS_ROYAL_DECK_NAME,
  REVEAL_FOUR_KNIGHTS_ROYAL_TOTAL,
  revealFourKnightsRoyalDeck
} from "./reveal-four-knights-royal";

export interface DeckDefinition {
  id: DeckId;
  name: string;
  entries: DeckEntry[];
  total: number;
}

export const DECKS: Record<DeckId, DeckDefinition> = {
  "armed-dragon": {
    id: "armed-dragon",
    name: ARMED_DRAGON_DECK_NAME,
    entries: ARMED_DRAGON_DECK,
    total: DECK_TOTAL
  },
  "reveal-four-knights-royal": {
    id: "reveal-four-knights-royal",
    name: REVEAL_FOUR_KNIGHTS_ROYAL_DECK_NAME,
    entries: revealFourKnightsRoyalDeck,
    total: REVEAL_FOUR_KNIGHTS_ROYAL_TOTAL
  }
};

export const DECK_OPTIONS = Object.values(DECKS).map(({ id, name, total }) => ({ id, name, total }));

export function getDeckDefinition(deckId: DeckId): DeckDefinition {
  return DECKS[deckId];
}
