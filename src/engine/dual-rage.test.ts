import { describe, expect, it } from "vitest";
import { CARD_IDS, getCardById } from "../data/cards/armed-dragon";
import { banishFollower, chooseDualMode, dealFollowerDamage, playCard } from "./effects";
import { createGame } from "./game";
import { gameReducer } from "./reducer";
import {
  canPlayCard,
  getArmedFollowersDestroyed,
  getArmedFollowersLeftPlay,
  getDistinctArmedFollowersDestroyed,
  getDualRagePlayErrors
} from "./selectors";
import type { CardInstance, FollowerInstance, GameState, PlayerId, Trait } from "./types";

describe("dual rage", () => {
  it("registers dual rage and all dual mode cards", () => {
    expect(getCardById("dual-rage")).toBeTruthy();
    expect(getCardById("laevateinn-dragon-dual-mode-alpha")).toBeTruthy();
    expect(getCardById("laevateinn-dragon-dual-mode-beta")).toBeTruthy();
    expect(getCardById("laevateinn-dragon-dual-mode-gamma")).toBeTruthy();
  });

  it("cannot be played without enough PP", () => {
    const state = dualReadyState();
    state.players.human.pp = 5;

    expect(canPlayCard(state, "human", state.players.human.hand[0])).toBe(false);
    expect(getDualRagePlayErrors(state, "human")).toContain("PPが足りません");
  });

  it("cannot be played without EP", () => {
    const state = dualReadyState();
    state.players.human.ep = 0;

    expect(canPlayCard(state, "human", state.players.human.hand[0])).toBe(false);
    expect(getDualRagePlayErrors(state, "human")).toContain("EPが足りません");
  });

  it("cannot be played without laevateinn dragon in hand", () => {
    const state = dualReadyState();
    state.players.human.hand = [{ instanceId: "dual", definitionId: CARD_IDS.dualRage, owner: "human" }];

    expect(canPlayCard(state, "human", state.players.human.hand[0])).toBe(false);
    expect(getDualRagePlayErrors(state, "human")).toContain("手札にレーヴァテインドラゴンがありません");
  });

  it("cannot be played without two draconic weapons in play", () => {
    const state = dualReadyState();
    state.players.human.amulets = [weapon("w1")];

    expect(canPlayCard(state, "human", state.players.human.hand[0])).toBe(false);
    expect(getDualRagePlayErrors(state, "human")).toContain("場にドラゴウェポンが2枚必要です");
  });

  it("pays PP, EP, laevateinn, and two draconic weapons", () => {
    let state = dualReadyState();

    state = playCard(state, "human", "dual");

    expect(state.players.human.pp).toBe(4);
    expect(state.players.human.ep).toBe(1);
    expect(state.players.human.hand.some((card) => card.definitionId === CARD_IDS.laevateinnDragon)).toBe(false);
    expect(state.players.human.amulets).toHaveLength(0);
    expect(state.players.human.graveyard.filter((card) => card.definitionId === CARD_IDS.draconicWeapon)).toHaveLength(2);
    expect(state.pendingDualRageChoice?.playerId).toBe("human");
  });

  it("summons alpha, beta, and gamma from dual rage choices", () => {
    for (const [mode, cardId] of [
      ["alpha", CARD_IDS.laevateinnDualAlpha],
      ["beta", CARD_IDS.laevateinnDualBeta],
      ["gamma", CARD_IDS.laevateinnDualGamma]
    ] as const) {
      let state = playCard(dualReadyState(), "human", "dual");
      state = chooseDualMode(state, mode);

      expect(state.players.human.board[0].definitionId).toBe(cardId);
      expect(state.pendingDualRageChoice).toBeUndefined();
    }
  });

  it("exposes armed count selectors for UI", () => {
    const state = dualReadyState();
    state.armedFollowersLeftPlay.human = 4;
    state.players.human.armedFollowersLeftPlay = 4;
    state.armedFollowersDestroyed.human = 3;
    state.players.human.armedFollowersDestroyed = 3;
    state.distinctArmedFollowersDestroyed.human = [CARD_IDS.hammerDragonewt, CARD_IDS.dragnir];
    state.players.human.distinctArmedFollowersDestroyed = [...state.distinctArmedFollowersDestroyed.human];

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(4);
    expect(getArmedFollowersDestroyed(state, "human")).toBe(3);
    expect(getDistinctArmedFollowersDestroyed(state, "human")).toHaveLength(2);
  });

  it("destroying an armed follower increments left play, destroyed, and distinct counts", () => {
    const state = dualReadyState();
    state.players.human.board = [follower("armed-1", "human", CARD_IDS.hammerDragonewt, 1, 1, ["armed"])];

    dealFollowerDamage(state, state.players.human.board[0], 1, "test");

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(1);
    expect(getArmedFollowersDestroyed(state, "human")).toBe(1);
    expect(getDistinctArmedFollowersDestroyed(state, "human")).toEqual([CARD_IDS.hammerDragonewt]);
  });

  it("banishing an armed follower only increments left play", () => {
    let state = dualReadyState();
    state.players.human.board = [follower("armed-1", "human", CARD_IDS.hammerDragonewt, 1, 1, ["armed"])];

    state = banishFollower(state, "human", "armed-1");

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(1);
    expect(getArmedFollowersDestroyed(state, "human")).toBe(0);
  });

  it("destroying multiple same-name armed followers counts one distinct id", () => {
    const state = dualReadyState();
    state.players.human.board = [
      follower("armed-1", "human", CARD_IDS.hammerDragonewt, 1, 1, ["armed"]),
      follower("armed-2", "human", CARD_IDS.hammerDragonewt, 1, 1, ["armed"])
    ];

    dealFollowerDamage(state, state.players.human.board[0], 1, "test");
    dealFollowerDamage(state, state.players.human.board[0], 1, "test");

    expect(getArmedFollowersDestroyed(state, "human")).toBe(2);
    expect(getDistinctArmedFollowersDestroyed(state, "human")).toEqual([CARD_IDS.hammerDragonewt]);
  });

  it("debug actions can set, add, and reset armed counts", () => {
    let state = dualReadyState();

    state = gameReducer(state, { type: "DEBUG_SET_ARMED_LEFT_PLAY", playerId: "human", value: 4 });
    state = gameReducer(state, { type: "DEBUG_SET_ARMED_DESTROYED", playerId: "human", value: 5 });
    state = gameReducer(state, {
      type: "DEBUG_ADD_DISTINCT_ARMED_DESTROYED",
      playerId: "human",
      cardId: CARD_IDS.hammerDragonewt
    });

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(4);
    expect(getArmedFollowersDestroyed(state, "human")).toBe(5);
    expect(getDistinctArmedFollowersDestroyed(state, "human")).toEqual([CARD_IDS.hammerDragonewt]);

    state = gameReducer(state, { type: "DEBUG_RESET_ARMED_COUNTS", playerId: "human" });

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(0);
    expect(getArmedFollowersDestroyed(state, "human")).toBe(0);
    expect(getDistinctArmedFollowersDestroyed(state, "human")).toEqual([]);
  });

  it("debug action can set max PP and clamp current PP", () => {
    let state = dualReadyState();
    state.players.human.pp = 8;

    state = gameReducer(state, { type: "DEBUG_SET_MAX_PP", playerId: "human", value: 6 });

    expect(state.players.human.maxPp).toBe(6);
    expect(state.players.human.pp).toBe(6);
  });
});

function dualReadyState(): GameState {
  const state = createGame("dual-rage-test");
  state.activePlayer = "human";
  state.players.human.turnNumber = 6;
  state.players.human.maxPp = 10;
  state.players.human.pp = 10;
  state.players.human.ep = 2;
  state.players.human.hand = [
    { instanceId: "dual", definitionId: CARD_IDS.dualRage, owner: "human" },
    { instanceId: "laeva", definitionId: CARD_IDS.laevateinnDragon, owner: "human" }
  ];
  state.players.human.board = [];
  state.players.human.amulets = [weapon("w1"), weapon("w2")];
  state.players.human.pendingWeapons = 2;
  state.players.human.graveyard = [];
  state.players.opponent.board = [];
  return state;
}

function weapon(instanceId: string): CardInstance {
  return { instanceId, definitionId: CARD_IDS.draconicWeapon, owner: "human" };
}

function follower(
  instanceId: string,
  owner: PlayerId,
  definitionId: string,
  attack: number,
  defense: number,
  traits: Trait[]
): FollowerInstance {
  return {
    instanceId,
    definitionId,
    sourceDefinitionId: definitionId,
    owner,
    name: getCardById(definitionId)?.name ?? definitionId,
    attack,
    defense,
    maxDefense: defense,
    traits,
    keywords: getCardById(definitionId)?.keywords ? [...(getCardById(definitionId)?.keywords ?? [])] : [],
    evolved: false,
    canAttackLeader: false,
    canAttackFollowers: false,
    hasAttacked: false,
    attacksThisTurn: 0,
    maxAttacksPerTurn: 1,
    freeEvolve: false,
    cantBeDestroyedByEffects: false,
    buffTriggersUsed: []
  };
}
