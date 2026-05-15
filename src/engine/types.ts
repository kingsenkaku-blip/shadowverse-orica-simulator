export type PlayerId = "human" | "opponent";
export type CardType = "follower" | "spell" | "amulet";
export type CardKind = CardType;
export type CardClass = "dragon" | "royal" | "neutral";
export type Keyword = "rush" | "storm" | "ward" | "bane";
export type Trait =
  | "armed"
  | "dragon"
  | "soldier"
  | "commander"
  | "heroic"
  | "reveal"
  | "sun"
  | "moon"
  | "star"
  | "four-knights"
  | "apocalypse"
  | "neutral"
  | "token"
  | "laevateinn"
  | "normal-mode"
  | "dual-mode"
  | "Armed"
  | "Dragoncraft"
  | "Neutral"
  | "Token";

export type EffectKey =
  | "TODO_EFFECT"
  | "TODO_LAEVATEINN_MODE"
  | "DRAGON_WEAPON"
  | "DRAGON_SMASH"
  | "LAEVATEINN_DRAGON"
  | "HAMMER_DRAGONEWT"
  | "DRAGNIR"
  | "SWIFTBLADE_DRAGONEWT"
  | "ELEGANT_DRACONIAN"
  | "DRAGONIC_ARMOR"
  | "REGGIE"
  | "DRAGON_EMISSARY"
  | "GRANS_ANGEL"
  | "DISDAIN_FOLLOWER"
  | "DRAGON_LANCER"
  | "ASUKA_SHIORI"
  | "DRAGON_BREEDER"
  | "RUINOUS_SWORDSMAN"
  | "LAEVATEINN_ATTACK_MODE"
  | "LAEVATEINN_DEFENSE_MODE"
  | "LAEVATEINN_BLAST_MODE"
  | "DUAL_RAGE"
  | "LAEVATEINN_DUAL_MODE_ALPHA"
  | "LAEVATEINN_DUAL_MODE_BETA"
  | "LAEVATEINN_DUAL_MODE_GAMMA"
  | "ROYAL_SUN_GUIDING_SWORDSMAN"
  | "ROYAL_SUN_SEEKING_WARRIOR"
  | "ROYAL_SUN_KNOWING_STRATEGIST"
  | "ROYAL_STAR_WISHING_SPEARMAN"
  | "ROYAL_WAXING_MOON_BRAWLER"
  | "ROYAL_SOLAR_KNIGHT_SUNLIGHT"
  | "ROYAL_STELLAR_KNIGHT_STARLIGHT"
  | "ROYAL_LUNAR_KNIGHT_MOONLIGHT"
  | "ROYAL_SUNLIGHT_CHARGE"
  | "ROYAL_SUNLIGHT_CRIMSON_SKYSWORD"
  | "ROYAL_ANNIHILATION_BLADEMASTER"
  | "ROYAL_DESTRUCTION_BLADEMASTER"
  | "ROYAL_VICTORIOUS_FIRST_KNIGHT"
  | "ROYAL_WOTEUS_SECOND_KNIGHT"
  | "ROYAL_STABELUS_THIRD_KNIGHT"
  | "ROYAL_DESTERIO_FOURTH_KNIGHT"
  | "ROYAL_BRAY_OF_THE_END";

export type ImplementationStatus = "implemented" | "partial" | "todo";
export type HelpCategory =
  | "normal-laevateinn"
  | "dual-rage"
  | "armed-dragon"
  | "royal-f-reveal"
  | "royal-f-four-knights"
  | "royal-f-token";
export type LaevateinnMode = "base" | "attack" | "defense" | "blast";
export type DualMode = "alpha" | "beta" | "gamma";
export type DeckId = "armed-dragon" | "reveal-four-knights-royal";

export interface CardDefinition {
  id: string;
  name: string;
  class: CardClass;
  kind: CardKind;
  type: CardType;
  cost: number;
  attack?: number;
  defense?: number;
  evolvedAttack?: number;
  evolvedDefense?: number;
  traits: Trait[];
  keywords?: Keyword[];
  rarity?: "bronze" | "silver" | "gold" | "legendary" | "token";
  treatedAs?: string[];
  formOf?: string;
  mode?: Exclude<LaevateinnMode, "base">;
  helpCategory?: HelpCategory;
  effect: EffectKey;
  text: string;
  notes?: string;
  implemented: ImplementationStatus;
  cannotEvolveWithEp?: boolean;
}

export interface DeckEntry {
  cardId: string;
  count: number;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  owner: PlayerId;
  costModifier?: number;
  attackModifier?: number;
  defenseModifier?: number;
  isRevealed?: boolean;
  revealedThisTurn?: boolean;
}

export interface FollowerInstance {
  instanceId: string;
  definitionId: string;
  sourceDefinitionId: string;
  owner: PlayerId;
  name: string;
  attack: number;
  defense: number;
  maxDefense: number;
  traits: Trait[];
  keywords: Keyword[];
  evolved: boolean;
  canAttackLeader: boolean;
  canAttackFollowers: boolean;
  hasAttacked: boolean;
  attacksThisTurn: number;
  maxAttacksPerTurn: number;
  freeEvolve: boolean;
  cantBeDestroyedByEffects?: boolean;
  damageShield?: number;
  canIgnoreWard?: boolean;
  cannotEvolveWithEp?: boolean;
  sunlightExtraAttackUsedThisTurn?: boolean;
  cannotBeAttacked?: boolean;
  buffTriggersUsed: EffectKey[];
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  health: number;
  maxHealth: number;
  maxPp: number;
  pp: number;
  ep: number;
  deck: CardInstance[];
  hand: CardInstance[];
  board: FollowerInstance[];
  amulets: CardInstance[];
  extraDeck: CardInstance[];
  graveyard: CardInstance[];
  pendingWeapons: number;
  armedFollowersLeftPlay: number;
  armedFollowersDestroyed: number;
  distinctArmedFollowersDestroyed: string[];
  fatigue: number;
  turnNumber: number;
  isFirst: boolean;
  deckId: DeckId;
  banished: CardInstance[];
}

export interface LogEntry {
  id: number;
  text: string;
}

export interface GameState {
  players: Record<PlayerId, PlayerState>;
  armedFollowersLeftPlay: Record<PlayerId, number>;
  armedFollowersDestroyed: Record<PlayerId, number>;
  distinctArmedFollowersDestroyed: Record<PlayerId, string[]>;
  revealedCards: Record<PlayerId, string[]>;
  revealedCardThisTurn: Record<PlayerId, boolean>;
  destroyedCommanderFollowerCardIds: Record<PlayerId, string[]>;
  destroyedTwoCostCommanderCardIds: Record<PlayerId, string[]>;
  activePlayer: PlayerId;
  turn: number;
  winner?: PlayerId | "draw";
  log: LogEntry[];
  rngSeed: number;
  nextInstanceNumber: number;
  nextLogId: number;
  selectedAttackerId?: string;
  pendingDualRageChoice?: {
    playerId: PlayerId;
  };
}

export type GameAction =
  | { type: "NEW_GAME"; seed?: string; humanDeckId?: DeckId; opponentDeckId?: DeckId }
  | { type: "PLAY_CARD"; cardInstanceId: string }
  | { type: "SELECT_ATTACKER"; followerInstanceId?: string }
  | { type: "ATTACK_FOLLOWER"; targetInstanceId: string }
  | { type: "ATTACK_LEADER" }
  | { type: "EVOLVE"; followerInstanceId: string; mode?: LaevateinnMode }
  | { type: "CHOOSE_DUAL_MODE"; mode: DualMode }
  | { type: "END_TURN" }
  | { type: "RUN_AI_TURN" }
  | { type: "DEBUG_SET_ARMED_LEFT_PLAY"; playerId: PlayerId; value: number }
  | { type: "DEBUG_SET_ARMED_DESTROYED"; playerId: PlayerId; value: number }
  | { type: "DEBUG_ADD_DISTINCT_ARMED_DESTROYED"; playerId: PlayerId; cardId: string }
  | { type: "DEBUG_RESET_ARMED_COUNTS"; playerId: PlayerId }
  | { type: "DEBUG_ADD_CARD_TO_HAND"; playerId: PlayerId; cardId: string }
  | { type: "DEBUG_SET_MAX_PP"; playerId: PlayerId; value: number }
  | { type: "DEBUG_SET_REVEALED_THIS_TURN"; playerId: PlayerId; value: boolean }
  | { type: "DEBUG_ADD_DESTROYED_TWO_COST_COMMANDER"; playerId: PlayerId; cardId: string }
  | { type: "DEBUG_RESET_DESTROYED_TWO_COST_COMMANDERS"; playerId: PlayerId }
  | { type: "DEBUG_TRANSFORM_SUNLIGHT"; playerId: PlayerId };
