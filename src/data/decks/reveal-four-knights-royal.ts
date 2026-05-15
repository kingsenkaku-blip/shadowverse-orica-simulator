import type { DeckEntry } from "../../engine/types";
import { ROYAL_CARD_IDS } from "../cards/royal-f";

export const REVEAL_FOUR_KNIGHTS_ROYAL_DECK_ID = "reveal-four-knights-royal";
export const REVEAL_FOUR_KNIGHTS_ROYAL_DECK_NAME = "公開ロイヤル＋四騎士";

export const revealFourKnightsRoyalDeck: DeckEntry[] = [
  { cardId: ROYAL_CARD_IDS.sunGuidingSwordsman, count: 3 },
  { cardId: ROYAL_CARD_IDS.sunSeekingWarrior, count: 3 },
  { cardId: ROYAL_CARD_IDS.sunKnowingStrategist, count: 2 },
  { cardId: ROYAL_CARD_IDS.starWishingSpearman, count: 2 },
  { cardId: ROYAL_CARD_IDS.waxingMoonBrawler, count: 2 },
  { cardId: ROYAL_CARD_IDS.solarKnightSunlight, count: 3 },
  { cardId: ROYAL_CARD_IDS.stellarKnightStarlight, count: 2 },
  { cardId: ROYAL_CARD_IDS.lunarKnightMoonlight, count: 2 },
  { cardId: ROYAL_CARD_IDS.sunlightCharge, count: 3 },
  { cardId: ROYAL_CARD_IDS.annihilationBlademaster, count: 3 },
  { cardId: ROYAL_CARD_IDS.destructionBlademaster, count: 3 },
  { cardId: ROYAL_CARD_IDS.victoriousFirstKnight, count: 3 },
  { cardId: ROYAL_CARD_IDS.woteusSecondKnight, count: 2 },
  { cardId: ROYAL_CARD_IDS.stabelusThirdKnight, count: 2 },
  { cardId: ROYAL_CARD_IDS.desterioFourthKnight, count: 2 },
  { cardId: ROYAL_CARD_IDS.brayOfTheEnd, count: 3 }
];

export const REVEAL_FOUR_KNIGHTS_ROYAL_TOTAL = revealFourKnightsRoyalDeck.reduce(
  (sum, entry) => sum + entry.count,
  0
);
