import type { CardDefinition, HelpCategory } from "../../engine/types";

export const ROYAL_CARD_IDS = {
  sunGuidingSwordsman: "sun-guiding-swordsman",
  sunSeekingWarrior: "sun-seeking-warrior",
  sunKnowingStrategist: "sun-knowing-strategist",
  starWishingSpearman: "star-wishing-spearman",
  waxingMoonBrawler: "waxing-moon-brawler",
  solarKnightSunlight: "solar-knight-sunlight",
  stellarKnightStarlight: "stellar-knight-starlight",
  lunarKnightMoonlight: "lunar-knight-moonlight",
  sunlightCharge: "sunlight-charge",
  sunlightCrimsonSkysword: "sunlight-crimson-skysword",
  annihilationBlademaster: "annihilation-blademaster",
  destructionBlademaster: "destruction-blademaster",
  victoriousFirstKnight: "victorious-first-knight",
  woteusSecondKnight: "woteus-second-knight",
  stabelusThirdKnight: "stabelus-third-knight",
  desterioFourthKnight: "desterio-fourth-knight",
  brayOfTheEnd: "bray-of-the-end"
} as const;

export const ROYAL_REVEAL_CARD_IDS = [
  ROYAL_CARD_IDS.sunGuidingSwordsman,
  ROYAL_CARD_IDS.sunSeekingWarrior,
  ROYAL_CARD_IDS.sunKnowingStrategist,
  ROYAL_CARD_IDS.starWishingSpearman,
  ROYAL_CARD_IDS.waxingMoonBrawler,
  ROYAL_CARD_IDS.solarKnightSunlight,
  ROYAL_CARD_IDS.stellarKnightStarlight,
  ROYAL_CARD_IDS.lunarKnightMoonlight,
  ROYAL_CARD_IDS.sunlightCharge
] as const;

export const ROYAL_FOUR_KNIGHTS_CARD_IDS = [
  ROYAL_CARD_IDS.annihilationBlademaster,
  ROYAL_CARD_IDS.destructionBlademaster,
  ROYAL_CARD_IDS.victoriousFirstKnight,
  ROYAL_CARD_IDS.woteusSecondKnight,
  ROYAL_CARD_IDS.stabelusThirdKnight,
  ROYAL_CARD_IDS.desterioFourthKnight,
  ROYAL_CARD_IDS.brayOfTheEnd
] as const;

export const ROYAL_HELP_IDS: Pick<
  Record<HelpCategory, string[]>,
  "royal-f-reveal" | "royal-f-four-knights" | "royal-f-token"
> = {
  "royal-f-reveal": [...ROYAL_REVEAL_CARD_IDS],
  "royal-f-four-knights": [...ROYAL_FOUR_KNIGHTS_CARD_IDS],
  "royal-f-token": [ROYAL_CARD_IDS.sunlightCrimsonSkysword]
};

const royalFollower = {
  class: "royal",
  kind: "follower",
  type: "follower"
} as const;

const royalSpell = {
  class: "royal",
  kind: "spell",
  type: "spell"
} as const;

export const ROYAL_F_CARDS: Record<string, CardDefinition> = {
  [ROYAL_CARD_IDS.sunGuidingSwordsman]: {
    id: ROYAL_CARD_IDS.sunGuidingSwordsman,
    name: "太陽導く剣士",
    ...royalFollower,
    cost: 1,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["soldier", "reveal", "sun"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_SUN_GUIDING_SWORDSMAN",
    text: "ファンファーレ: 手札のロイヤル・フォロワー1枚を公開する。公開したなら、ランダムな相手フォロワー1体に2ダメージ。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.sunSeekingWarrior]: {
    id: ROYAL_CARD_IDS.sunSeekingWarrior,
    name: "太陽求む戦士",
    ...royalFollower,
    cost: 1,
    attack: 1,
    defense: 2,
    evolvedAttack: 3,
    evolvedDefense: 4,
    traits: ["soldier", "reveal", "sun"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_SUN_SEEKING_WARRIOR",
    text: "ファンファーレ: 手札のロイヤル・フォロワー1枚を公開する。公開したなら、このフォロワーは疾走を持つ。攻撃時: 手札のロイヤル・フォロワー1枚を+1/+0する。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.sunKnowingStrategist]: {
    id: ROYAL_CARD_IDS.sunKnowingStrategist,
    name: "太陽知る軍師",
    ...royalFollower,
    cost: 2,
    attack: 2,
    defense: 2,
    evolvedAttack: 4,
    evolvedDefense: 4,
    traits: ["commander", "reveal", "sun"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_SUN_KNOWING_STRATEGIST",
    text: "ファンファーレ: 手札のロイヤル・カード1枚を公開する。公開したなら、このフォロワーを+1/+1する。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.starWishingSpearman]: {
    id: ROYAL_CARD_IDS.starWishingSpearman,
    name: "星願う槍術師",
    ...royalFollower,
    cost: 2,
    attack: 2,
    defense: 1,
    evolvedAttack: 4,
    evolvedDefense: 3,
    traits: ["soldier", "reveal", "star"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_STAR_WISHING_SPEARMAN",
    text: "ファンファーレ: 手札のロイヤル・カード1枚を公開する。公開したなら、相手フォロワーすべてに1ダメージ。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.waxingMoonBrawler]: {
    id: ROYAL_CARD_IDS.waxingMoonBrawler,
    name: "月満たす拳闘士",
    ...royalFollower,
    cost: 3,
    attack: 2,
    defense: 4,
    evolvedAttack: 4,
    evolvedDefense: 6,
    traits: ["soldier", "reveal", "moon"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_WAXING_MOON_BRAWLER",
    text: "能力によって破壊されない。このフォロワーが次に受けるダメージを0にする。",
    notes: "TODO_ROYAL_EFFECT: damage shield is implemented; fine-grained effect-destruction immunity shares the existing MVP flag.",
    implemented: "partial"
  },
  [ROYAL_CARD_IDS.solarKnightSunlight]: {
    id: ROYAL_CARD_IDS.solarKnightSunlight,
    name: "太陽の騎士・サンライト",
    ...royalFollower,
    cost: 5,
    attack: 4,
    defense: 4,
    evolvedAttack: 6,
    evolvedDefense: 6,
    traits: ["commander", "reveal", "sun"],
    keywords: ["storm"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_SOLAR_KNIGHT_SUNLIGHT",
    text: "このカードが手札から公開されたとき、カードを1枚引く。ファンファーレ: 手札のロイヤル・カード1枚を公開する。公開したなら、ランダムな相手フォロワー1体を破壊する。疾走。攻撃時: このターン中に手札のカードを公開していたなら、このフォロワーはもう1回攻撃できる。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.stellarKnightStarlight]: {
    id: ROYAL_CARD_IDS.stellarKnightStarlight,
    name: "星の騎士・スターライト",
    ...royalFollower,
    cost: 5,
    attack: 3,
    defense: 5,
    evolvedAttack: 5,
    evolvedDefense: 7,
    traits: ["commander", "reveal", "star"],
    keywords: ["ward"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_STELLAR_KNIGHT_STARLIGHT",
    text: "このカードが手札から公開されたとき、自分のフォロワー1体を+1/+1する。守護。進化時: 手札のロイヤル・カード1枚を公開する。公開したなら、自分のPPを2回復する。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.lunarKnightMoonlight]: {
    id: ROYAL_CARD_IDS.lunarKnightMoonlight,
    name: "月の騎士・ムーンライト",
    ...royalFollower,
    cost: 7,
    attack: 5,
    defense: 7,
    evolvedAttack: 7,
    evolvedDefense: 9,
    traits: ["commander", "reveal", "moon"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_LUNAR_KNIGHT_MOONLIGHT",
    text: "このカードが手札から公開されたとき、自分の高コストフォロワー1体は突進を持つ。ファンファーレ: 相手フォロワーすべてに7ダメージ。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.sunlightCharge]: {
    id: ROYAL_CARD_IDS.sunlightCharge,
    name: "サンライト・チャージ",
    ...royalSpell,
    cost: 1,
    traits: ["reveal", "sun"],
    helpCategory: "royal-f-reveal",
    effect: "ROYAL_SUNLIGHT_CHARGE",
    text: "手札のロイヤル・カード1枚を公開する。公開したなら、自分のPPを1回復する。自分の手札に《太陽の騎士・サンライト》があるなら、それ1枚を《紅蓮の天剣・サンライト》に変身させる。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.sunlightCrimsonSkysword]: {
    id: ROYAL_CARD_IDS.sunlightCrimsonSkysword,
    name: "紅蓮の天剣・サンライト",
    ...royalFollower,
    cost: 8,
    attack: 6,
    defense: 6,
    evolvedAttack: 8,
    evolvedDefense: 8,
    traits: ["commander", "reveal", "sun", "token"],
    keywords: ["storm"],
    rarity: "token",
    helpCategory: "royal-f-token",
    effect: "ROYAL_SUNLIGHT_CRIMSON_SKYSWORD",
    text: "このカードが手札から公開されたとき、カードを1枚引き、自分のPPを2回復し、相手リーダーに2ダメージ。疾走。ファンファーレ: 手札のロイヤル・カード1枚を公開する。公開したなら、相手フォロワーすべてに4ダメージ。攻撃時: 相手リーダーに2ダメージ。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.annihilationBlademaster]: {
    id: ROYAL_CARD_IDS.annihilationBlademaster,
    name: "滅亡の剣士",
    ...royalFollower,
    cost: 1,
    attack: 1,
    defense: 1,
    evolvedAttack: 3,
    evolvedDefense: 3,
    traits: ["soldier", "apocalypse"],
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_ANNIHILATION_BLADEMASTER",
    text: "ファンファーレ: デッキからコスト2の指揮官フォロワー1枚をランダムに手札に加える。ラストワード: 《終焉のいななき》1枚をデッキに加える。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.destructionBlademaster]: {
    id: ROYAL_CARD_IDS.destructionBlademaster,
    name: "破滅の剣士",
    ...royalFollower,
    cost: 2,
    attack: 2,
    defense: 2,
    evolvedAttack: 4,
    evolvedDefense: 4,
    traits: ["soldier", "apocalypse"],
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_DESTRUCTION_BLADEMASTER",
    text: "自分の場に《滅亡の剣士》がいるなら、このフォロワーは攻撃されない。ファンファーレ: デッキからコスト2の指揮官フォロワー1枚をランダムに手札に加える。自分のPPを1回復する。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.victoriousFirstKnight]: {
    id: ROYAL_CARD_IDS.victoriousFirstKnight,
    name: "第一の騎士・ヴィクトリアス",
    ...royalFollower,
    cost: 2,
    attack: 2,
    defense: 2,
    evolvedAttack: 4,
    evolvedDefense: 4,
    traits: ["commander", "four-knights"],
    cannotEvolveWithEp: true,
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_VICTORIOUS_FIRST_KNIGHT",
    text: "EPを消費して進化できない。他の味方フォロワーが攻撃するとき、相手フォロワーすべてに1ダメージ。進化後: 疾走。守護を無視して攻撃できる。ラストワード: カードを1枚引く。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.woteusSecondKnight]: {
    id: ROYAL_CARD_IDS.woteusSecondKnight,
    name: "第二の騎士・ウォーテウス",
    ...royalFollower,
    cost: 2,
    attack: 1,
    defense: 3,
    evolvedAttack: 3,
    evolvedDefense: 5,
    traits: ["commander", "four-knights"],
    cannotEvolveWithEp: true,
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_WOTEUS_SECOND_KNIGHT",
    text: "EPを消費して進化できない。他の味方フォロワーが攻撃するとき、カードを1枚引く。進化後ラストワード: 特殊な終焉デッキへ置換する。",
    notes: "TODO_ROYAL_EFFECT: Woteus deck replacement effect is simplified to adding bray-of-the-end and drawing.",
    implemented: "partial"
  },
  [ROYAL_CARD_IDS.stabelusThirdKnight]: {
    id: ROYAL_CARD_IDS.stabelusThirdKnight,
    name: "第三の騎士・スタヴェラス",
    ...royalFollower,
    cost: 2,
    attack: 1,
    defense: 4,
    evolvedAttack: 3,
    evolvedDefense: 6,
    traits: ["commander", "four-knights"],
    cannotEvolveWithEp: true,
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_STABELUS_THIRD_KNIGHT",
    text: "EPを消費して進化できない。他の味方フォロワーが攻撃するとき、自分のリーダーを3回復する。進化後ラストワード: 自分のリーダーの体力が10未満なら10にする。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.desterioFourthKnight]: {
    id: ROYAL_CARD_IDS.desterioFourthKnight,
    name: "第四の騎士・デステリオン",
    ...royalFollower,
    cost: 2,
    attack: 3,
    defense: 1,
    evolvedAttack: 5,
    evolvedDefense: 3,
    traits: ["commander", "four-knights"],
    cannotEvolveWithEp: true,
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_DESTERIO_FOURTH_KNIGHT",
    text: "EPを消費して進化できない。他の味方フォロワーが攻撃するとき、攻撃力最大の相手フォロワー1体を消滅させる。進化後ラストワード: 相手フォロワーすべてを消滅させる。",
    implemented: "implemented"
  },
  [ROYAL_CARD_IDS.brayOfTheEnd]: {
    id: ROYAL_CARD_IDS.brayOfTheEnd,
    name: "終焉のいななき",
    ...royalSpell,
    cost: 5,
    traits: ["apocalypse", "four-knights"],
    helpCategory: "royal-f-four-knights",
    effect: "ROYAL_BRAY_OF_THE_END",
    text: "自分の破壊されたコスト2の指揮官フォロワーの中から、名前の異なるカードを場が上限になるまで出す。自分のPP最大値が8以上なら、それらを進化させる。",
    implemented: "implemented"
  }
};
