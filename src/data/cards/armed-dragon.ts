import type { CardDefinition, HelpCategory } from "../../engine/types";
import { ROYAL_F_CARDS, ROYAL_HELP_IDS } from "./royal-f";

export const CARD_IDS = {
  dragonWeapon: "draconic-weapon",
  draconicWeapon: "draconic-weapon",
  dragonSmash: "dragon-smash",
  laevateinnDragon: "laevateinn-dragon",
  laevateinnAttackMode: "laevateinn-dragon-attack-mode",
  laevateinnDefenseMode: "laevateinn-dragon-defense-mode",
  laevateinnBlastMode: "laevateinn-dragon-blast-mode",
  dualRage: "dual-rage",
  laevateinnDualAlpha: "laevateinn-dragon-dual-mode-alpha",
  laevateinnDualBeta: "laevateinn-dragon-dual-mode-beta",
  laevateinnDualGamma: "laevateinn-dragon-dual-mode-gamma",
  hammerDragonewt: "hammer-dragonewt",
  dragnir: "knuckle-dragon-dragnir",
  swiftbladeDragonewt: "swiftblade-dragonewt",
  elegantDraconian: "elegant-draconian",
  dragonicArmor: "dragonic-armor",
  reggie: "reggie-peerless-artisan",
  dragonEmissary: "dragon-emissary",
  gransAngel: "grans-angel",
  disdainFollower: "disciple-of-disdain",
  dragonLancer: "dragon-lancer",
  asukaShiori: "twin-sisters-asuka-shiori",
  dragonBreeder: "dragon-breeder",
  ruinousSwordsman: "ruinous-dragon-swordsman"
} as const;

export const NORMAL_LAEVATEINN_MODE_IDS = [
  CARD_IDS.laevateinnAttackMode,
  CARD_IDS.laevateinnDefenseMode,
  CARD_IDS.laevateinnBlastMode
] as const;

export const DUAL_MODE_IDS = [
  CARD_IDS.laevateinnDualAlpha,
  CARD_IDS.laevateinnDualBeta,
  CARD_IDS.laevateinnDualGamma
] as const;

export const HELP_IDS: Record<HelpCategory, string[]> = {
  "normal-laevateinn": [
    CARD_IDS.laevateinnDragon,
    CARD_IDS.laevateinnAttackMode,
    CARD_IDS.laevateinnDefenseMode,
    CARD_IDS.laevateinnBlastMode,
    CARD_IDS.draconicWeapon
  ],
  "dual-rage": [
    CARD_IDS.dualRage,
    CARD_IDS.laevateinnDualAlpha,
    CARD_IDS.laevateinnDualBeta,
    CARD_IDS.laevateinnDualGamma
  ],
  "armed-dragon": [],
  ...ROYAL_HELP_IDS
};

const dragonFollower = {
  class: "dragon",
  kind: "follower",
  type: "follower"
} as const;

const dragonSpell = {
  class: "dragon",
  kind: "spell",
  type: "spell"
} as const;

const dragonAmulet = {
  class: "dragon",
  kind: "amulet",
  type: "amulet"
} as const;

export const ARMED_DRAGON_CARDS: Record<string, CardDefinition> = {
  [CARD_IDS.draconicWeapon]: {
    id: CARD_IDS.draconicWeapon,
    name: "ドラゴウェポン",
    ...dragonAmulet,
    cost: 0,
    traits: ["armed", "token"],
    rarity: "token",
    helpCategory: "normal-laevateinn",
    effect: "DRAGON_WEAPON",
    text: "自分のターン中、自分の場にフォロワーが出たとき、それを+0/+1し、武装フォロワーにする。その後、このアミュレットを消滅させる。",
    notes: "MVPでは場を埋めるアミュレットではなく、次に出るフォロワーを強化する保留カウントとして扱う。",
    implemented: "partial"
  },
  [CARD_IDS.dragonSmash]: {
    id: CARD_IDS.dragonSmash,
    name: "ドラゴンスマッシュ",
    ...dragonSpell,
    cost: 0,
    traits: ["armed", "token"],
    rarity: "token",
    effect: "DRAGON_SMASH",
    text: "ランダムな相手のフォロワー1体に2ダメージ。ドラゴウェポン1枚を手札に加える。",
    implemented: "partial"
  },
  [CARD_IDS.laevateinnDragon]: {
    id: CARD_IDS.laevateinnDragon,
    name: "レーヴァテインドラゴン",
    ...dragonFollower,
    cost: 5,
    attack: 5,
    defense: 5,
    evolvedAttack: 7,
    evolvedDefense: 7,
    traits: ["armed", "laevateinn"],
    rarity: "legendary",
    helpCategory: "normal-laevateinn",
    effect: "LAEVATEINN_DRAGON",
    text:
      "ファンファーレ: 自分の手札に《ドラゴウェポン》があるなら、ランダムな1枚を捨て、EPを消費せず進化できる。進化時: 場を離れた味方武装フォロワーが4体以上なら、アタック/ディフェンス/ブラストモードから1体をチョイスして進化する。4体未満なら、相手フォロワー1体に5ダメージ。自分の手札に《ドラゴウェポン》1枚を加える。",
    implemented: "implemented"
  },
  [CARD_IDS.laevateinnAttackMode]: {
    id: CARD_IDS.laevateinnAttackMode,
    name: "レーヴァテインドラゴン・アタックモード",
    ...dragonFollower,
    cost: 5,
    attack: 8,
    defense: 6,
    evolvedAttack: 8,
    evolvedDefense: 6,
    traits: ["armed", "token", "laevateinn", "normal-mode"],
    rarity: "token",
    treatedAs: [CARD_IDS.laevateinnDragon],
    formOf: CARD_IDS.laevateinnDragon,
    mode: "attack",
    helpCategory: "normal-laevateinn",
    effect: "LAEVATEINN_ATTACK_MODE",
    text:
      "進化時: 相手のフォロワーすべてに10ダメージ。自分の手札に《ドラゴウェポン》1枚を加える。自分の他の武装フォロワーが攻撃するとき、それを+2/+2する。このカードは《レーヴァテインドラゴン》として扱う。",
    implemented: "implemented"
  },
  [CARD_IDS.laevateinnDefenseMode]: {
    id: CARD_IDS.laevateinnDefenseMode,
    name: "レーヴァテインドラゴン・ディフェンスモード",
    ...dragonFollower,
    cost: 5,
    attack: 6,
    defense: 8,
    evolvedAttack: 6,
    evolvedDefense: 8,
    traits: ["armed", "token", "laevateinn", "normal-mode"],
    keywords: ["ward"],
    rarity: "token",
    treatedAs: [CARD_IDS.laevateinnDragon],
    formOf: CARD_IDS.laevateinnDragon,
    mode: "defense",
    helpCategory: "normal-laevateinn",
    effect: "LAEVATEINN_DEFENSE_MODE",
    text:
      "守護。進化時: カードを2枚引く。能力によって破壊されない。ただし、能力によるダメージでは破壊される。これが場にいる限り、自分のリーダーと自分のフォロワーすべては受けるダメージを-2する。自分のターン終了時、自分のリーダーと味方フォロワーすべてを3回復する。このカードは《レーヴァテインドラゴン》として扱う。",
    implemented: "implemented"
  },
  [CARD_IDS.laevateinnBlastMode]: {
    id: CARD_IDS.laevateinnBlastMode,
    name: "レーヴァテインドラゴン・ブラストモード",
    ...dragonFollower,
    cost: 5,
    attack: 7,
    defense: 7,
    evolvedAttack: 7,
    evolvedDefense: 7,
    traits: ["armed", "token", "laevateinn", "normal-mode"],
    rarity: "token",
    treatedAs: [CARD_IDS.laevateinnDragon],
    formOf: CARD_IDS.laevateinnDragon,
    mode: "blast",
    helpCategory: "normal-laevateinn",
    effect: "LAEVATEINN_BLAST_MODE",
    text:
      "進化時: 自分のPPを2回復。自分の場にフォロワーが出るたび、それは突進を持つ。自分のターン終了時、相手リーダーにこのフォロワーの攻撃力と同じダメージ。このカードは《レーヴァテインドラゴン》として扱う。",
    implemented: "implemented"
  },
  [CARD_IDS.dualRage]: {
    id: CARD_IDS.dualRage,
    name: "デュアルレイジ",
    ...dragonSpell,
    cost: 6,
    traits: ["armed"],
    rarity: "legendary",
    helpCategory: "dual-rage",
    effect: "DUAL_RAGE",
    text:
      "自分の手札の《レーヴァテインドラゴン》1枚を捨てる。自分の場の《ドラゴウェポン》2枚を破壊し、EPを1消費する。《レーヴァテインドラゴン・デュアルモードα》《レーヴァテインドラゴン・デュアルモードβ》《レーヴァテインドラゴン・デュアルモードγ》の中から1枚をチョイスして場に出す。",
    implemented: "implemented"
  },
  [CARD_IDS.laevateinnDualAlpha]: {
    id: CARD_IDS.laevateinnDualAlpha,
    name: "レーヴァテインドラゴン・デュアルモードα",
    ...dragonFollower,
    cost: 6,
    attack: 6,
    defense: 6,
    evolvedAttack: 6,
    evolvedDefense: 6,
    traits: ["armed", "token", "laevateinn", "dual-mode"],
    keywords: ["rush", "ward"],
    rarity: "token",
    treatedAs: [CARD_IDS.laevateinnDragon],
    helpCategory: "dual-rage",
    effect: "LAEVATEINN_DUAL_MODE_ALPHA",
    text:
      "突進。守護。1ターンに2回攻撃できる。自分のリーダーと自身の被ダメージ-3。自分のターン終了時、自分のリーダーと味方フォロワーすべてを3回復する。TODO_DUAL_MODE_ALPHA: 細部はMVP処理。",
    implemented: "implemented"
  },
  [CARD_IDS.laevateinnDualBeta]: {
    id: CARD_IDS.laevateinnDualBeta,
    name: "レーヴァテインドラゴン・デュアルモードβ",
    ...dragonFollower,
    cost: 6,
    attack: 6,
    defense: 6,
    evolvedAttack: 6,
    evolvedDefense: 6,
    traits: ["armed", "token", "laevateinn", "dual-mode"],
    keywords: ["ward"],
    rarity: "token",
    treatedAs: [CARD_IDS.laevateinnDragon],
    helpCategory: "dual-rage",
    effect: "LAEVATEINN_DUAL_MODE_BETA",
    text:
      "守護。自分のターン終了時、相手フォロワーすべてにXダメージ。Xはこのバトル中に破壊された味方武装フォロワー数。Xが5以上なら相手リーダーに3ダメージ。自分のターン終了時、2枚引く。自分のターン終了時、《ドラゴウェポン》1枚を場に出す。TODO_DUAL_MODE_BETA: 細部はMVP処理。",
    implemented: "implemented"
  },
  [CARD_IDS.laevateinnDualGamma]: {
    id: CARD_IDS.laevateinnDualGamma,
    name: "レーヴァテインドラゴン・デュアルモードγ",
    ...dragonFollower,
    cost: 6,
    attack: 6,
    defense: 6,
    evolvedAttack: 6,
    evolvedDefense: 6,
    traits: ["armed", "token", "laevateinn", "dual-mode"],
    keywords: ["storm"],
    rarity: "token",
    treatedAs: [CARD_IDS.laevateinnDragon],
    helpCategory: "dual-rage",
    effect: "LAEVATEINN_DUAL_MODE_GAMMA",
    text:
      "疾走。他の味方武装フォロワーすべてに疾走を付与する。交戦時、相手フォロワーすべてにXダメージ。Xはこのバトル中に破壊された名前の異なる味方武装フォロワー数。TODO_DUAL_MODE_GAMMA: 細部はMVP処理。",
    implemented: "implemented"
  },
  [CARD_IDS.hammerDragonewt]: {
    id: CARD_IDS.hammerDragonewt,
    name: "ハンマードラゴニュート",
    ...dragonFollower,
    cost: 1,
    attack: 1,
    defense: 2,
    evolvedAttack: 3,
    evolvedDefense: 4,
    traits: ["armed", "dragon"],
    effect: "HAMMER_DRAGONEWT",
    text: "ファンファーレ 場を離れた味方武装フォロワーが4体以上なら+2/+2して疾走を持つ。ラストワード ドラゴンスマッシュ1枚を手札に加える。",
    implemented: "partial"
  },
  [CARD_IDS.dragnir]: {
    id: CARD_IDS.dragnir,
    name: "ナックルドラゴン・ドラグニル",
    ...dragonFollower,
    cost: 1,
    attack: 1,
    defense: 2,
    evolvedAttack: 3,
    evolvedDefense: 4,
    traits: ["armed", "dragon"],
    effect: "DRAGNIR",
    text: "ファンファーレ ドラゴウェポン1枚を手札に加える。場を離れた味方武装フォロワーが4体以上なら、自分のEPを1回復。進化時 相手のフォロワー1体に4ダメージ。ドラゴウェポン1枚を手札に加える。",
    implemented: "partial"
  },
  [CARD_IDS.swiftbladeDragonewt]: {
    id: CARD_IDS.swiftbladeDragonewt,
    name: "瞬刃のドラゴニュート",
    ...dragonFollower,
    cost: 2,
    attack: 3,
    defense: 1,
    evolvedAttack: 5,
    evolvedDefense: 3,
    traits: ["armed", "dragon"],
    keywords: ["rush"],
    effect: "SWIFTBLADE_DRAGONEWT",
    text: "突進。ファンファーレ ドラゴウェポン1枚を手札に加える。場を離れた味方武装フォロワーが4体以上なら、相手のフォロワー1体と相手のリーダーに3ダメージ。",
    implemented: "partial"
  },
  [CARD_IDS.elegantDraconian]: {
    id: CARD_IDS.elegantDraconian,
    name: "流麗なる竜人",
    ...dragonFollower,
    cost: 2,
    attack: 2,
    defense: 2,
    evolvedAttack: 4,
    evolvedDefense: 4,
    traits: ["armed", "dragon"],
    effect: "ELEGANT_DRACONIAN",
    text: "ファンファーレ ドラゴウェポン1枚を手札に加える。場を離れた味方武装フォロワーが4体以上なら+2/+0して疾走を持ち、墓場のコスト最大の武装フォロワーを手札に加える。",
    implemented: "partial"
  },
  [CARD_IDS.dragonicArmor]: {
    id: CARD_IDS.dragonicArmor,
    name: "ドラゴニックアーマー",
    ...dragonSpell,
    cost: 1,
    traits: ["armed", "dragon"],
    effect: "DRAGONIC_ARMOR",
    text: "ドラゴウェポン1枚を手札に加える。自分の手札に武装フォロワーがあるなら、武装フォロワーをランダムに1枚、自分のデッキから手札に加える。",
    implemented: "partial"
  },
  [CARD_IDS.reggie]: {
    id: CARD_IDS.reggie,
    name: "烈覇のアルチザン・レジー",
    ...dragonFollower,
    cost: 2,
    attack: 2,
    defense: 2,
    evolvedAttack: 4,
    evolvedDefense: 4,
    traits: ["dragon"],
    effect: "REGGIE",
    text: "自分のターンごとに1回、これの攻撃力か体力を能力で+したとき、自分のPP最大値を+1する。ファンファーレ 覚醒状態なら疾走を持つ。進化時 自分のフォロワーすべてを+1/+1する。",
    implemented: "partial"
  },
  [CARD_IDS.dragonEmissary]: {
    id: CARD_IDS.dragonEmissary,
    name: "竜の伝令",
    ...dragonSpell,
    cost: 2,
    traits: ["dragon"],
    effect: "DRAGON_EMISSARY",
    text: "コスト5以上のカードをランダムに1枚、自分のデッキから手札に加える。そのコストを-1する。",
    implemented: "partial"
  },
  [CARD_IDS.gransAngel]: {
    id: CARD_IDS.gransAngel,
    name: "グランスエンジェル",
    class: "neutral",
    kind: "follower",
    type: "follower",
    cost: 1,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["neutral"],
    keywords: ["ward"],
    effect: "GRANS_ANGEL",
    text: "守護。ファンファーレ 相手の直接召喚能力は働かない。進化時 相手のフォロワー1体を破壊する。",
    notes: "直接召喚封じはこのデッキ同士では影響がないためログのみ。",
    implemented: "partial"
  },
  [CARD_IDS.disdainFollower]: {
    id: CARD_IDS.disdainFollower,
    name: "侮蔑の信者",
    ...dragonFollower,
    cost: 1,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["dragon"],
    effect: "DISDAIN_FOLLOWER",
    text: "ファンファーレ 自分の場に他のフォロワーがいるなら、自分の他のフォロワー1体に1ダメージを与え、カードを1枚引く。",
    implemented: "partial"
  },
  [CARD_IDS.dragonLancer]: {
    id: CARD_IDS.dragonLancer,
    name: "竜装の槍術士",
    ...dragonFollower,
    cost: 1,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["dragon"],
    effect: "DRAGON_LANCER",
    text: "ファンファーレ 自分の場に他のフォロワーがいるなら、それ1体に2ダメージを与え、カードを1枚引き、これを+2/+1する。",
    implemented: "partial"
  },
  [CARD_IDS.asukaShiori]: {
    id: CARD_IDS.asukaShiori,
    name: "ツインシスター・アスカ＆シオリ",
    class: "neutral",
    kind: "follower",
    type: "follower",
    cost: 3,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["neutral"],
    effect: "ASUKA_SHIORI",
    text: "ファンファーレ カードを2枚引く。自分の残りEPが相手より多いなら、自分のリーダーを2回復。自分のPPを2回復。",
    implemented: "partial"
  },
  [CARD_IDS.dragonBreeder]: {
    id: CARD_IDS.dragonBreeder,
    name: "ドラゴンブリーダー",
    ...dragonFollower,
    cost: 1,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["dragon"],
    effect: "DRAGON_BREEDER",
    text: "ファンファーレ 自分の他のフォロワー1体を+1/+1する。覚醒状態なら、カードを1枚引く。",
    implemented: "partial"
  },
  [CARD_IDS.ruinousSwordsman]: {
    id: CARD_IDS.ruinousSwordsman,
    name: "竜壊の剣士",
    ...dragonFollower,
    cost: 2,
    attack: 3,
    defense: 1,
    evolvedAttack: 5,
    evolvedDefense: 3,
    traits: ["dragon"],
    effect: "RUINOUS_SWORDSMAN",
    text: "自分のターンごとに1回、これの攻撃力か体力を能力で+したとき、カードを1枚引く。ファンファーレ 覚醒状態なら、突進を持つ。カードを1枚引く。",
    implemented: "partial"
  }
};

export const cardRegistry: Record<string, CardDefinition> = {
  ...ARMED_DRAGON_CARDS,
  ...ROYAL_F_CARDS
};

export function getCardDefinition(cardId: string): CardDefinition {
  const definition = cardRegistry[cardId];
  if (!definition) {
    throw new Error(`Unknown card definition: ${cardId}`);
  }
  return definition;
}

export function getCardById(cardId: string): CardDefinition | undefined {
  return cardRegistry[cardId];
}
