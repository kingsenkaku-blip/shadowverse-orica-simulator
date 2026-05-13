import { describe, expect, it } from "vitest";
import { HELP_IDS, CARD_IDS, getCardById } from "../data/cards/armed-dragon";
import { DECK_TOTAL } from "../data/decks/armed-dragon";
import { createGame } from "./game";
import {
  attackFollower,
  dealFollowerDamage,
  dealLeaderDamage,
  endTurn,
  evolveFollower,
  playCard
} from "./effects";
import { getArmedFollowersLeftPlay, getLaevateinnNormalModeChoices, shouldShowLaevateinnModeChoice } from "./selectors";
import type { FollowerInstance, GameState, PlayerId, Trait } from "./types";

describe("armed dragon simulator engine", () => {
  it("creates a 40-card mirror with opening hands", () => {
    const state = createGame("test-seed");

    expect(state.players.human.hand).toHaveLength(4);
    expect(state.players.opponent.hand).toHaveLength(4);
    expect(state.players.human.deck.length + state.players.human.hand.length).toBe(DECK_TOTAL);
    expect(state.players.opponent.deck.length + state.players.opponent.hand.length).toBe(DECK_TOTAL);
    expect(state.activePlayer).toBe("human");
    expect(state.players.human.pp).toBe(1);
  });

  it("registers laevateinn base and normal mode card ids", () => {
    expect(getCardById("laevateinn-dragon")).toBeTruthy();
    expect(getCardById("laevateinn-dragon-attack-mode")).toBeTruthy();
    expect(getCardById("laevateinn-dragon-defense-mode")).toBeTruthy();
    expect(getCardById("laevateinn-dragon-blast-mode")).toBeTruthy();
    expect(getCardById("draconic-weapon")).toBeTruthy();
  });

  it("defines laevateinn dragon as a 5 cost 5/5 legendary follower", () => {
    expect(getCardById(CARD_IDS.laevateinnDragon)).toMatchObject({
      cost: 5,
      attack: 5,
      defense: 5,
      evolvedAttack: 7,
      evolvedDefense: 7,
      rarity: "legendary"
    });
  });

  it("shows normal and dual ids separately in help-id", () => {
    expect(HELP_IDS["normal-laevateinn"]).toEqual(
      expect.arrayContaining([
        CARD_IDS.laevateinnDragon,
        CARD_IDS.laevateinnAttackMode,
        CARD_IDS.laevateinnDefenseMode,
        CARD_IDS.laevateinnBlastMode,
        CARD_IDS.draconicWeapon
      ])
    );
    expect(HELP_IDS["dual-rage"]).toEqual(
      expect.arrayContaining([
        CARD_IDS.dualRage,
        CARD_IDS.laevateinnDualAlpha,
        CARD_IDS.laevateinnDualBeta,
        CARD_IDS.laevateinnDualGamma
      ])
    );
  });

  it("normal laevateinn mode choices never include dual mode ids", () => {
    const ids = getLaevateinnNormalModeChoices().map((card) => card.id);

    expect(ids).toEqual([
      CARD_IDS.laevateinnAttackMode,
      CARD_IDS.laevateinnDefenseMode,
      CARD_IDS.laevateinnBlastMode
    ]);
    expect(ids).not.toContain(CARD_IDS.laevateinnDualAlpha);
    expect(ids).not.toContain(CARD_IDS.laevateinnDualBeta);
    expect(ids).not.toContain(CARD_IDS.laevateinnDualGamma);
  });

  it("lets dragon weapon arm the next follower", () => {
    let state = playableState();
    state.players.human.hand = [
      { instanceId: "weapon", definitionId: CARD_IDS.draconicWeapon, owner: "human" },
      { instanceId: "hammer", definitionId: CARD_IDS.hammerDragonewt, owner: "human" }
    ];

    state = playCard(state, "human", "weapon");
    state = playCard(state, "human", "hammer");

    expect(state.players.human.pendingWeapons).toBe(0);
    expect(state.players.human.board[0].traits).toContain("armed");
    expect(state.players.human.board[0].defense).toBe(3);
  });

  it("playing draconic weapon itself does not increase armed followers left play", () => {
    let state = playableState();
    state.players.human.hand = [{ instanceId: "weapon", definitionId: CARD_IDS.draconicWeapon, owner: "human" }];

    state = playCard(state, "human", "weapon");

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(0);
  });

  it("plays laevateinn dragon as a 5 cost 5/5 follower", () => {
    let state = playableState();
    state.players.human.hand = [{ instanceId: "laeva", definitionId: CARD_IDS.laevateinnDragon, owner: "human" }];

    state = playCard(state, "human", "laeva");

    expect(state.players.human.pp).toBe(5);
    expect(state.players.human.board[0]).toMatchObject({
      definitionId: CARD_IDS.laevateinnDragon,
      attack: 5,
      defense: 5
    });
  });

  it("discards one draconic weapon and grants free evolve when laevateinn is played", () => {
    let state = playableState();
    state.players.human.hand = [
      { instanceId: "weapon-1", definitionId: CARD_IDS.draconicWeapon, owner: "human" },
      { instanceId: "weapon-2", definitionId: CARD_IDS.draconicWeapon, owner: "human" },
      { instanceId: "laeva", definitionId: CARD_IDS.laevateinnDragon, owner: "human" }
    ];

    state = playCard(state, "human", "laeva");

    expect(state.players.human.hand.filter((card) => card.definitionId === CARD_IDS.draconicWeapon)).toHaveLength(1);
    expect(state.players.human.graveyard.some((card) => card.definitionId === CARD_IDS.draconicWeapon)).toBe(true);
    expect(state.players.human.board[0].freeEvolve).toBe(true);
  });

  it("free evolves laevateinn without spending EP", () => {
    let state = playableState();
    state.players.human.ep = 0;
    state.players.human.hand = [
      { instanceId: "weapon", definitionId: CARD_IDS.draconicWeapon, owner: "human" },
      { instanceId: "laeva", definitionId: CARD_IDS.laevateinnDragon, owner: "human" }
    ];

    state = playCard(state, "human", "laeva");
    state = evolveFollower(state, "human", "laeva", "base");

    expect(state.players.human.ep).toBe(0);
    expect(state.players.human.board[0].evolved).toBe(true);
    expect(state.players.human.board[0].attack).toBe(7);
  });

  it("normally evolves below four armed followers left play", () => {
    let state = playableState();
    state.players.human.hand = [{ instanceId: "laeva", definitionId: CARD_IDS.laevateinnDragon, owner: "human" }];
    state.players.opponent.board = [makeFollower("target", "opponent", CARD_IDS.gransAngel, 1, 6, ["neutral"])];

    state = playCard(state, "human", "laeva");
    state = evolveFollower(state, "human", "laeva", "base");

    expect(state.players.human.board[0]).toMatchObject({
      definitionId: CARD_IDS.laevateinnDragon,
      attack: 7,
      defense: 7
    });
    expect(state.players.opponent.board[0].defense).toBe(1);
    expect(state.players.human.hand.some((card) => card.definitionId === CARD_IDS.draconicWeapon)).toBe(true);
  });

  it("shows normal mode choice at four armed followers left play", () => {
    let state = playableState();
    state.players.human.hand = [{ instanceId: "laeva", definitionId: CARD_IDS.laevateinnDragon, owner: "human" }];
    setArmedLeft(state, "human", 4);
    state = playCard(state, "human", "laeva");

    expect(shouldShowLaevateinnModeChoice(state, state.players.human.board[0])).toBe(true);
    const unchanged = evolveFollower(state, "human", "laeva", "base");
    expect(unchanged.players.human.board[0].definitionId).toBe(CARD_IDS.laevateinnDragon);
  });

  it("attack mode replaces the same board slot as an 8/6 and deals 10 AOE", () => {
    let state = laevateinnReadyForMode();
    state.players.opponent.board = [
      makeFollower("enemy-1", "opponent", CARD_IDS.gransAngel, 1, 11, ["neutral"]),
      makeFollower("enemy-2", "opponent", CARD_IDS.gransAngel, 1, 10, ["neutral"])
    ];

    state = evolveFollower(state, "human", "laeva", "attack");

    expect(state.players.human.board).toHaveLength(1);
    expect(state.players.human.board[0]).toMatchObject({
      instanceId: "laeva",
      definitionId: CARD_IDS.laevateinnAttackMode,
      attack: 8,
      defense: 6
    });
    expect(state.players.opponent.board).toHaveLength(1);
    expect(state.players.opponent.board[0].defense).toBe(1);
    expect(state.players.human.hand.some((card) => card.definitionId === CARD_IDS.draconicWeapon)).toBe(true);
  });

  it("attack mode buffs other allied armed followers on attack, but not itself", () => {
    let state = playableState();
    state.players.human.board = [
      makeFollower("attack-mode", "human", CARD_IDS.laevateinnAttackMode, 8, 6, ["armed", "token", "laevateinn"]),
      makeFollower("ally", "human", CARD_IDS.hammerDragonewt, 1, 2, ["armed"])
    ];
    state.players.human.board[0].evolved = true;
    state.players.human.board[1].canAttackFollowers = true;
    state.players.opponent.board = [makeFollower("target", "opponent", CARD_IDS.gransAngel, 1, 10, ["neutral"])];

    state = attackFollower(state, "human", "ally", "target");

    expect(state.players.human.board.find((unit) => unit.instanceId === "ally")).toMatchObject({
      attack: 3,
      maxDefense: 4,
      defense: 3
    });
  });

  it("attack mode does not buff itself when it attacks", () => {
    let state = playableState();
    state.players.human.board = [
      makeFollower("attack-mode", "human", CARD_IDS.laevateinnAttackMode, 8, 6, ["armed", "token", "laevateinn"])
    ];
    state.players.human.board[0].canAttackFollowers = true;
    state.players.opponent.board = [makeFollower("target", "opponent", CARD_IDS.gransAngel, 1, 20, ["neutral"])];

    state = attackFollower(state, "human", "attack-mode", "target");

    expect(state.players.human.board[0].attack).toBe(8);
  });

  it("defense mode replaces the same board slot as a 6/8 ward and draws two", () => {
    let state = laevateinnReadyForMode();
    state.players.human.hand = [];
    state.players.human.deck = [
      { instanceId: "draw-1", definitionId: CARD_IDS.hammerDragonewt, owner: "human" },
      { instanceId: "draw-2", definitionId: CARD_IDS.dragnir, owner: "human" }
    ];

    state = evolveFollower(state, "human", "laeva", "defense");

    expect(state.players.human.board[0]).toMatchObject({
      instanceId: "laeva",
      definitionId: CARD_IDS.laevateinnDefenseMode,
      attack: 6,
      defense: 8
    });
    expect(state.players.human.board[0].keywords).toContain("ward");
    expect(state.players.human.hand).toHaveLength(2);
  });

  it("defense mode reduces leader and follower damage by two", () => {
    const state = playableState();
    state.players.human.board = [
      makeFollower("defense", "human", CARD_IDS.laevateinnDefenseMode, 6, 8, ["armed", "token", "laevateinn"]),
      makeFollower("ally", "human", CARD_IDS.hammerDragonewt, 1, 5, ["armed"])
    ];

    dealLeaderDamage(state, "human", 5, "test");
    dealFollowerDamage(state, state.players.human.board[1], 5, "test");

    expect(state.players.human.health).toBe(17);
    expect(state.players.human.board[1].defense).toBe(2);
  });

  it("defense mode heals leader and allied followers by three at turn end", () => {
    let state = playableState();
    state.players.human.health = 15;
    state.players.human.board = [
      makeFollower("defense", "human", CARD_IDS.laevateinnDefenseMode, 6, 5, ["armed", "token", "laevateinn"]),
      makeFollower("ally", "human", CARD_IDS.hammerDragonewt, 1, 1, ["armed"])
    ];
    state.players.human.board[0].maxDefense = 8;
    state.players.human.board[1].maxDefense = 4;

    state = endTurn(state);

    expect(state.players.human.health).toBe(18);
    expect(state.players.human.board[0].defense).toBe(8);
    expect(state.players.human.board[1].defense).toBe(4);
  });

  it("blast mode replaces the same board slot as a 7/7 and restores PP by two", () => {
    let state = laevateinnReadyForMode();
    state.players.human.pp = 3;
    state.players.human.maxPp = 4;

    state = evolveFollower(state, "human", "laeva", "blast");

    expect(state.players.human.board[0]).toMatchObject({
      instanceId: "laeva",
      definitionId: CARD_IDS.laevateinnBlastMode,
      attack: 7,
      defense: 7
    });
    expect(state.players.human.pp).toBe(4);
  });

  it("blast mode grants rush to later allied followers", () => {
    let state = playableState();
    state.players.human.board = [
      makeFollower("blast", "human", CARD_IDS.laevateinnBlastMode, 7, 7, ["armed", "token", "laevateinn"])
    ];
    state.players.human.hand = [{ instanceId: "hammer", definitionId: CARD_IDS.hammerDragonewt, owner: "human" }];

    state = playCard(state, "human", "hammer");

    expect(state.players.human.board.find((unit) => unit.instanceId === "hammer")?.keywords).toContain("rush");
  });

  it("blast mode burns the enemy leader for its current attack at turn end", () => {
    let state = playableState();
    state.players.human.board = [
      makeFollower("blast", "human", CARD_IDS.laevateinnBlastMode, 9, 7, ["armed", "token", "laevateinn"])
    ];

    state = endTurn(state);

    expect(state.players.opponent.health).toBe(11);
  });

  it("mode evolution does not increase armedFollowersLeftPlay", () => {
    let state = laevateinnReadyForMode();
    expect(getArmedFollowersLeftPlay(state, "human")).toBe(4);

    state = evolveFollower(state, "human", "laeva", "attack");

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(4);
  });

  it("normal armed followers increase armedFollowersLeftPlay when destroyed", () => {
    let state = playableState();
    state.activePlayer = "opponent";
    state.players.opponent.board = [makeFollower("attacker", "opponent", CARD_IDS.gransAngel, 3, 3, ["neutral"])];
    state.players.opponent.board[0].canAttackFollowers = true;
    state.players.human.board = [makeFollower("armed", "human", CARD_IDS.hammerDragonewt, 1, 1, ["armed"])];

    state = attackFollower(state, "opponent", "attacker", "armed");

    expect(getArmedFollowersLeftPlay(state, "human")).toBe(1);
  });
});

function playableState(): GameState {
  const state = createGame("unit-test");
  state.activePlayer = "human";
  state.players.human.turnNumber = 5;
  state.players.human.maxPp = 10;
  state.players.human.pp = 10;
  state.players.human.ep = 2;
  state.players.human.hand = [];
  state.players.human.board = [];
  state.players.human.graveyard = [];
  state.players.opponent.board = [];
  state.players.opponent.hand = [];
  return state;
}

function laevateinnReadyForMode(): GameState {
  const state = playableState();
  setArmedLeft(state, "human", 4);
  state.players.human.board = [makeFollower("laeva", "human", CARD_IDS.laevateinnDragon, 5, 5, ["armed", "laevateinn"])];
  state.players.human.board[0].freeEvolve = true;
  return state;
}

function setArmedLeft(state: GameState, playerId: PlayerId, count: number): void {
  state.armedFollowersLeftPlay[playerId] = count;
  state.players[playerId].armedFollowersLeftPlay = count;
}

function makeFollower(
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
    cantBeDestroyedByEffects: definitionId === CARD_IDS.laevateinnDefenseMode,
    buffTriggersUsed: []
  };
}
