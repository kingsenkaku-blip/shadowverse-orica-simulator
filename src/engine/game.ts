import { CARD_IDS, DUAL_MODE_IDS, getCardDefinition } from "../data/cards/armed-dragon";
import { getDeckDefinition } from "../data/decks";
import { drawCards, startTurn } from "./effects";
import { hashSeed, shuffleWithSeed } from "./rng";
import type { CardInstance, DeckId, GameState, PlayerId, PlayerState } from "./types";

export function createGame(
  seedText = String(Date.now()),
  decks: Partial<Record<PlayerId, DeckId>> = {}
): GameState {
  let nextInstanceNumber = 1;
  let seed = hashSeed(seedText);
  const humanDeckId = decks.human ?? "armed-dragon";
  const opponentDeckId = decks.opponent ?? humanDeckId;

  const humanDeckResult = shuffleWithSeed(buildDeck("human", nextInstanceNumber, humanDeckId), seed);
  seed = humanDeckResult.seed;
  nextInstanceNumber += humanDeckResult.items.length;

  const opponentDeckResult = shuffleWithSeed(buildDeck("opponent", nextInstanceNumber, opponentDeckId), seed);
  seed = opponentDeckResult.seed;
  nextInstanceNumber += opponentDeckResult.items.length;

  const state: GameState = {
    players: {
      human: createPlayer("human", "あなた", true, humanDeckResult.items, humanDeckId),
      opponent: createPlayer("opponent", "AI", false, opponentDeckResult.items, opponentDeckId)
    },
    armedFollowersLeftPlay: {
      human: 0,
      opponent: 0
    },
    armedFollowersDestroyed: {
      human: 0,
      opponent: 0
    },
    distinctArmedFollowersDestroyed: {
      human: [],
      opponent: []
    },
    revealedCards: {
      human: [],
      opponent: []
    },
    revealedCardThisTurn: {
      human: false,
      opponent: false
    },
    destroyedCommanderFollowerCardIds: {
      human: [],
      opponent: []
    },
    destroyedTwoCostCommanderCardIds: {
      human: [],
      opponent: []
    },
    activePlayer: "human",
    turn: 0,
    log: [],
    rngSeed: seed,
    nextInstanceNumber,
    nextLogId: 1
  };

  drawCards(state, "human", 4);
  drawCards(state, "opponent", 4);
  return startTurn(state, "human", true);
}

export function deckSummary(): { name: string; cost: number; count: number }[] {
  return deckSummaryFor("armed-dragon");
}

export function deckSummaryFor(deckId: DeckId): { name: string; cost: number; count: number }[] {
  return getDeckDefinition(deckId)
    .entries.map((entry) => ({
      name: getCardDefinition(entry.cardId).name,
      cost: getCardDefinition(entry.cardId).cost,
      count: entry.count
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "ja"));
}

function buildDeck(owner: PlayerId, startingInstanceNumber: number, deckId: DeckId): CardInstance[] {
  let next = startingInstanceNumber;
  const deck: CardInstance[] = [];
  for (const entry of getDeckDefinition(deckId).entries) {
    for (let copy = 0; copy < entry.count; copy += 1) {
      deck.push({
        instanceId: `${owner}-deck-${next}`,
        definitionId: entry.cardId,
        owner
      });
      next += 1;
    }
  }
  return deck;
}

function createPlayer(
  id: PlayerId,
  name: string,
  isFirst: boolean,
  deck: CardInstance[],
  deckId: DeckId
): PlayerState {
  return {
    id,
    name,
    health: 20,
    maxHealth: 20,
    maxPp: 0,
    pp: 0,
    ep: isFirst ? 2 : 3,
    deck,
    hand: [],
    board: [],
    amulets: [],
    extraDeck: buildExtraDeck(id),
    graveyard: [],
    banished: [],
    pendingWeapons: 0,
    armedFollowersLeftPlay: 0,
    armedFollowersDestroyed: 0,
    distinctArmedFollowersDestroyed: [],
    fatigue: 0,
    turnNumber: 0,
    isFirst,
    deckId
  };
}

function buildExtraDeck(owner: PlayerId): CardInstance[] {
  return [
    { instanceId: `${owner}-ex-dual-rage`, definitionId: CARD_IDS.dualRage, owner },
    ...DUAL_MODE_IDS.map((definitionId, index) => ({
      instanceId: `${owner}-ex-dual-mode-${index + 1}`,
      definitionId,
      owner
    }))
  ];
}
