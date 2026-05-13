import { CARD_IDS, DUAL_MODE_IDS, getCardDefinition } from "../data/cards/armed-dragon";
import { ARMED_DRAGON_DECK } from "../data/decks/armed-dragon";
import { drawCards, startTurn } from "./effects";
import { hashSeed, shuffleWithSeed } from "./rng";
import type { CardInstance, GameState, PlayerId, PlayerState } from "./types";

export function createGame(seedText = String(Date.now())): GameState {
  let nextInstanceNumber = 1;
  let seed = hashSeed(seedText);

  const humanDeckResult = shuffleWithSeed(buildDeck("human", nextInstanceNumber), seed);
  seed = humanDeckResult.seed;
  nextInstanceNumber += humanDeckResult.items.length;

  const opponentDeckResult = shuffleWithSeed(buildDeck("opponent", nextInstanceNumber), seed);
  seed = opponentDeckResult.seed;
  nextInstanceNumber += opponentDeckResult.items.length;

  const state: GameState = {
    players: {
      human: createPlayer("human", "あなた", true, humanDeckResult.items),
      opponent: createPlayer("opponent", "AI", false, opponentDeckResult.items)
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
  return ARMED_DRAGON_DECK.map((entry) => ({
    name: getCardDefinition(entry.cardId).name,
    cost: getCardDefinition(entry.cardId).cost,
    count: entry.count
  })).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "ja"));
}

function buildDeck(owner: PlayerId, startingInstanceNumber: number): CardInstance[] {
  let next = startingInstanceNumber;
  const deck: CardInstance[] = [];
  for (const entry of ARMED_DRAGON_DECK) {
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

function createPlayer(id: PlayerId, name: string, isFirst: boolean, deck: CardInstance[]): PlayerState {
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
    pendingWeapons: 0,
    armedFollowersLeftPlay: 0,
    armedFollowersDestroyed: 0,
    distinctArmedFollowersDestroyed: [],
    fatigue: 0,
    turnNumber: 0,
    isFirst
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
