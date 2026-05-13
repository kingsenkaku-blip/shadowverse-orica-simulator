import type { DeckEntry } from "../../engine/types";
import { CARD_IDS } from "../cards/armed-dragon";

export const ARMED_DRAGON_SOURCE_URL =
  "https://onj-shadowverse.game-info.wiki/d/%A5%B5%BD%AA%A4%B7%A4%C6%A4%E2%A4%E4%A4%EC%A4%BD%A4%A6%A4%CA%CB%E2%B2%FE%C2%A4%C9%F0%C1%F5%A5%C9%A5%E9";

export const ARMED_DRAGON_DECK_NAME = "サ終してもやれそうな魔改造武装ドラ";

export const ARMED_DRAGON_DECK: DeckEntry[] = [
  { cardId: CARD_IDS.laevateinnDragon, count: 3 },
  { cardId: CARD_IDS.hammerDragonewt, count: 3 },
  { cardId: CARD_IDS.dragnir, count: 3 },
  { cardId: CARD_IDS.swiftbladeDragonewt, count: 3 },
  { cardId: CARD_IDS.elegantDraconian, count: 3 },
  { cardId: CARD_IDS.dragonicArmor, count: 3 },
  { cardId: CARD_IDS.reggie, count: 3 },
  { cardId: CARD_IDS.dragonEmissary, count: 3 },
  { cardId: CARD_IDS.gransAngel, count: 3 },
  { cardId: CARD_IDS.disdainFollower, count: 3 },
  { cardId: CARD_IDS.dragonLancer, count: 3 },
  { cardId: CARD_IDS.asukaShiori, count: 3 },
  { cardId: CARD_IDS.dragonBreeder, count: 2 },
  { cardId: CARD_IDS.ruinousSwordsman, count: 2 }
];

export const DECK_TOTAL = ARMED_DRAGON_DECK.reduce((sum, entry) => sum + entry.count, 0);
