export type PlayerId = "human" | "opponent";
export type CardType = "follower" | "spell" | "amulet";
export type CardKind = CardType;
export type CardClass = "dragon" | "neutral";
export type Keyword = "rush" | "storm" | "ward" | "bane";
export type Trait =
  | "armed"
  | "dragon"
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
  | "LAEVATEINN_DUAL_MODE_GAMMA";

export type ImplementationStatus = "implemented" | "partial" | "todo";
export type HelpCategory = "normal-laevateinn" | "dual-rage" | "armed-dragon";
export type LaevateinnMode = "base" | "attack" | "defense" | "blast";
export type DualMode = "alpha" | "beta" | "gamma";

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
  | { type: "NEW_GAME"; seed?: string }
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
  | { type: "DEBUG_SET_MAX_PP"; playerId: PlayerId; value: number };
