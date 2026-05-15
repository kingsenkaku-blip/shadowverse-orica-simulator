import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { Dispatch } from "react";
import { describe, expect, it } from "vitest";
import { cardRegistry, getCardById } from "../data/cards/armed-dragon";
import { ROYAL_CARD_IDS, ROYAL_FOUR_KNIGHTS_CARD_IDS, ROYAL_REVEAL_CARD_IDS } from "../data/cards/royal-f";
import { DECK_OPTIONS, getDeckDefinition } from "../data/decks";
import { revealFourKnightsRoyalDeck } from "../data/decks/reveal-four-knights-royal";
import { Controls } from "../components/Controls";
import {
  attackFollower,
  dealFollowerDamage,
  playCard
} from "./effects";
import { createGame } from "./game";
import { canEvolve, getRoyalDebugSummary } from "./selectors";
import type { CardInstance, FollowerInstance, GameAction, GameState, PlayerId, Trait } from "./types";

describe("reveal four knights royal", () => {
  it("registers a 40-card deck with 22 reveal cards and 18 four-knights cards", () => {
    const deck = getDeckDefinition("reveal-four-knights-royal");
    const revealCount = revealFourKnightsRoyalDeck
      .filter((entry) => ROYAL_REVEAL_CARD_IDS.includes(entry.cardId as (typeof ROYAL_REVEAL_CARD_IDS)[number]))
      .reduce((sum, entry) => sum + entry.count, 0);
    const fourKnightCount = revealFourKnightsRoyalDeck
      .filter((entry) => ROYAL_FOUR_KNIGHTS_CARD_IDS.includes(entry.cardId as (typeof ROYAL_FOUR_KNIGHTS_CARD_IDS)[number]))
      .reduce((sum, entry) => sum + entry.count, 0);

    expect(deck.total).toBe(40);
    expect(revealCount).toBe(22);
    expect(fourKnightCount).toBe(18);
    expect(revealFourKnightsRoyalDeck).not.toContainEqual({
      cardId: ROYAL_CARD_IDS.sunlightCrimsonSkysword,
      count: expect.any(Number)
    });
    expect(cardRegistry[ROYAL_CARD_IDS.sunlightCrimsonSkysword]).toBeTruthy();
    for (const entry of revealFourKnightsRoyalDeck) expect(cardRegistry[entry.cardId]).toBeTruthy();
  });

  it("supports royal deck selection in game setup UI", () => {
    const state = createGame("royal-select", {
      human: "reveal-four-knights-royal",
      opponent: "armed-dragon"
    });
    const html = renderToStaticMarkup(
      createElement(Controls, { state, dispatch: (() => undefined) as Dispatch<GameAction> })
    );

    expect(DECK_OPTIONS.map((deck) => deck.id)).toContain("reveal-four-knights-royal");
    expect(state.players.human.deckId).toBe("reveal-four-knights-royal");
    expect(state.players.opponent.deckId).toBe("armed-dragon");
    expect(html).toContain("公開ロイヤル＋四騎士");
  });

  it("reveals a card without removing it and triggers solar-knight draw", () => {
    let state = playableRoyalState();
    state.players.human.hand = [
      card("guide", ROYAL_CARD_IDS.sunGuidingSwordsman),
      card("sunlight", ROYAL_CARD_IDS.solarKnightSunlight)
    ];
    state.players.human.deck = [card("draw", ROYAL_CARD_IDS.sunSeekingWarrior)];

    state = playCard(state, "human", "guide");

    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.solarKnightSunlight)).toBe(true);
    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.sunSeekingWarrior)).toBe(true);
    expect(state.revealedCardThisTurn.human).toBe(true);
    expect(state.revealedCards.human).toContain(ROYAL_CARD_IDS.solarKnightSunlight);
  });

  it("starlight and moonlight onReveal effects apply to the board", () => {
    let state = playableRoyalState();
    state.players.human.hand = [
      card("guide", ROYAL_CARD_IDS.sunGuidingSwordsman),
      card("starlight", ROYAL_CARD_IDS.stellarKnightStarlight)
    ];

    state = playCard(state, "human", "guide");
    expect(state.players.human.board[0]).toMatchObject({ attack: 2, defense: 2 });

    state.players.human.hand = [
      card("guide-2", ROYAL_CARD_IDS.sunGuidingSwordsman),
      card("moonlight", ROYAL_CARD_IDS.lunarKnightMoonlight)
    ];
    state.players.human.board = [follower("big", "human", ROYAL_CARD_IDS.solarKnightSunlight, 4, 4, ["commander", "reveal", "sun"])];

    state = playCard(state, "human", "guide-2");
    expect(state.players.human.board[0].keywords).toContain("rush");
  });

  it("main reveal royal cards resolve their MVP effects", () => {
    let state = playableRoyalState();
    state.players.human.hand = [
      card("seeker", ROYAL_CARD_IDS.sunSeekingWarrior),
      card("sunlight", ROYAL_CARD_IDS.solarKnightSunlight)
    ];

    state = playCard(state, "human", "seeker");
    expect(state.players.human.board[0].keywords).toContain("storm");

    state.players.human.hand = [
      card("charge", ROYAL_CARD_IDS.sunlightCharge),
      card("sunlight-2", ROYAL_CARD_IDS.solarKnightSunlight)
    ];
    state.players.human.pp = 5;
    state = playCard(state, "human", "charge");
    expect(state.players.human.pp).toBe(5);
    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.sunlightCrimsonSkysword)).toBe(true);
  });

  it("crimson sunlight reveal draws, restores PP, and burns leader", () => {
    let state = playableRoyalState();
    state.players.human.pp = 5;
    state.players.human.maxPp = 5;
    state.players.human.hand = [
      card("guide", ROYAL_CARD_IDS.sunGuidingSwordsman),
      card("crimson", ROYAL_CARD_IDS.sunlightCrimsonSkysword)
    ];
    state.players.human.deck = [card("draw", ROYAL_CARD_IDS.sunSeekingWarrior)];

    state = playCard(state, "human", "guide");

    expect(state.players.human.pp).toBe(5);
    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.sunSeekingWarrior)).toBe(true);
    expect(state.players.opponent.health).toBe(18);
  });

  it("four knights cannot normally evolve with EP", () => {
    const state = playableRoyalState();
    state.players.human.turnNumber = 5;
    state.players.human.board = [
      follower("victorious", "human", ROYAL_CARD_IDS.victoriousFirstKnight, 2, 2, ["commander", "four-knights"])
    ];

    expect(canEvolve(state, state.players.human.board[0])).toBe(false);
  });

  it("annihilation and destruction blademasters search four knights, and annihilation last words adds bray", () => {
    let state = playableRoyalState();
    state.players.human.hand = [card("annihilation", ROYAL_CARD_IDS.annihilationBlademaster)];
    state.players.human.deck = [card("victorious", ROYAL_CARD_IDS.victoriousFirstKnight)];

    state = playCard(state, "human", "annihilation");
    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.victoriousFirstKnight)).toBe(true);

    dealFollowerDamage(state, state.players.human.board[0], 1, "test");
    expect(state.players.human.deck.some((deckCard) => deckCard.definitionId === ROYAL_CARD_IDS.brayOfTheEnd)).toBe(true);

    state = playableRoyalState();
    state.players.human.pp = 2;
    state.players.human.maxPp = 2;
    state.players.human.hand = [card("destruction", ROYAL_CARD_IDS.destructionBlademaster)];
    state.players.human.deck = [card("woteus", ROYAL_CARD_IDS.woteusSecondKnight)];
    state = playCard(state, "human", "destruction");
    expect(state.players.human.pp).toBe(1);
    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.woteusSecondKnight)).toBe(true);
  });

  it("other allied attacks trigger four knights effects", () => {
    let state = playableRoyalState();
    state.players.human.health = 12;
    state.players.human.deck = [card("draw", ROYAL_CARD_IDS.sunSeekingWarrior)];
    state.players.human.board = [
      follower("victorious", "human", ROYAL_CARD_IDS.victoriousFirstKnight, 2, 2, ["commander", "four-knights"]),
      follower("woteus", "human", ROYAL_CARD_IDS.woteusSecondKnight, 1, 3, ["commander", "four-knights"]),
      follower("stabelus", "human", ROYAL_CARD_IDS.stabelusThirdKnight, 1, 4, ["commander", "four-knights"]),
      follower("attacker", "human", ROYAL_CARD_IDS.sunSeekingWarrior, 1, 2, ["soldier", "reveal", "sun"])
    ];
    state.players.human.board[3].canAttackFollowers = true;
    state.players.opponent.board = [follower("enemy", "opponent", ROYAL_CARD_IDS.sunGuidingSwordsman, 1, 5, ["soldier"])];

    state = attackFollower(state, "human", "attacker", "enemy");

    expect(state.players.human.health).toBe(15);
    expect(state.players.human.hand.some((hand) => hand.definitionId === ROYAL_CARD_IDS.sunSeekingWarrior)).toBe(true);
    expect(state.players.opponent.board[0].defense).toBe(3);
  });

  it("desterion banishes instead of destroying", () => {
    let state = playableRoyalState();
    state.players.human.board = [
      follower("desterio", "human", ROYAL_CARD_IDS.desterioFourthKnight, 3, 1, ["commander", "four-knights"]),
      follower("attacker", "human", ROYAL_CARD_IDS.sunSeekingWarrior, 1, 2, ["soldier", "reveal", "sun"])
    ];
    state.players.human.board[1].canAttackFollowers = true;
    state.players.opponent.board = [follower("enemy", "opponent", ROYAL_CARD_IDS.sunGuidingSwordsman, 9, 5, ["soldier"])];

    state = attackFollower(state, "human", "attacker", "enemy");

    expect(state.players.opponent.board).toHaveLength(0);
    expect(state.players.opponent.banished).toHaveLength(1);
    expect(state.destroyedTwoCostCommanderCardIds.opponent).toEqual([]);
  });

  it("destroyed four knights are tracked uniquely and bray reanimates them evolved at 8 max PP", () => {
    let state = playableRoyalState();
    state.players.human.maxPp = 8;
    state.players.human.pp = 8;
    state.players.human.board = [
      follower("victorious", "human", ROYAL_CARD_IDS.victoriousFirstKnight, 2, 1, ["commander", "four-knights"]),
      follower("victorious-2", "human", ROYAL_CARD_IDS.victoriousFirstKnight, 2, 1, ["commander", "four-knights"]),
      follower("stabelus", "human", ROYAL_CARD_IDS.stabelusThirdKnight, 1, 1, ["commander", "four-knights"])
    ];

    dealFollowerDamage(state, state.players.human.board[0], 1, "test");
    dealFollowerDamage(state, state.players.human.board[0], 1, "test");
    dealFollowerDamage(state, state.players.human.board[0], 1, "test");
    expect(state.destroyedTwoCostCommanderCardIds.human).toEqual([
      ROYAL_CARD_IDS.victoriousFirstKnight,
      ROYAL_CARD_IDS.stabelusThirdKnight
    ]);

    state.players.human.hand = [card("bray", ROYAL_CARD_IDS.brayOfTheEnd)];
    state = playCard(state, "human", "bray");

    expect(state.players.human.board.some((unit) => unit.definitionId === ROYAL_CARD_IDS.victoriousFirstKnight)).toBe(true);
    expect(state.players.human.board.every((unit) => unit.evolved)).toBe(true);
    expect(getRoyalDebugSummary(state, "human").reanimateTargets).toContain(ROYAL_CARD_IDS.stabelusThirdKnight);
  });

  it("help-id contains royal categories and token", () => {
    expect(getCardById(ROYAL_CARD_IDS.sunGuidingSwordsman)).toBeTruthy();
    expect(getCardById(ROYAL_CARD_IDS.brayOfTheEnd)).toBeTruthy();
    expect(getCardById(ROYAL_CARD_IDS.sunlightCrimsonSkysword)).toBeTruthy();
  });
});

function playableRoyalState(): GameState {
  const state = createGame("royal-test", {
    human: "reveal-four-knights-royal",
    opponent: "reveal-four-knights-royal"
  });
  state.activePlayer = "human";
  state.players.human.turnNumber = 5;
  state.players.human.maxPp = 10;
  state.players.human.pp = 10;
  state.players.human.ep = 2;
  state.players.human.hand = [];
  state.players.human.board = [];
  state.players.human.graveyard = [];
  state.players.human.banished = [];
  state.players.opponent.board = [];
  state.players.opponent.hand = [];
  state.players.opponent.graveyard = [];
  state.players.opponent.banished = [];
  state.revealedCards.human = [];
  state.revealedCardThisTurn.human = false;
  state.destroyedCommanderFollowerCardIds.human = [];
  state.destroyedTwoCostCommanderCardIds.human = [];
  state.destroyedCommanderFollowerCardIds.opponent = [];
  state.destroyedTwoCostCommanderCardIds.opponent = [];
  return state;
}

function card(instanceId: string, definitionId: string): CardInstance {
  return { instanceId, definitionId, owner: "human" };
}

function follower(
  instanceId: string,
  owner: PlayerId,
  definitionId: string,
  attack: number,
  defense: number,
  traits: Trait[]
): FollowerInstance {
  const definition = getCardById(definitionId);
  return {
    instanceId,
    definitionId,
    sourceDefinitionId: definitionId,
    owner,
    name: definition?.name ?? definitionId,
    attack,
    defense,
    maxDefense: defense,
    traits,
    keywords: [...(definition?.keywords ?? [])],
    evolved: false,
    canAttackLeader: definition?.keywords?.includes("storm") ?? false,
    canAttackFollowers: definition?.keywords?.includes("rush") ?? false,
    hasAttacked: false,
    attacksThisTurn: 0,
    maxAttacksPerTurn: 1,
    freeEvolve: false,
    cannotEvolveWithEp: definition?.cannotEvolveWithEp,
    buffTriggersUsed: []
  };
}
