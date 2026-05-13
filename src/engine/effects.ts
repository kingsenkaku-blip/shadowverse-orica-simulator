import { ARMED_DRAGON_CARDS, CARD_IDS, DUAL_MODE_IDS, getCardDefinition } from "../data/cards/armed-dragon";
import { randomInt } from "./rng";
import {
  canAttackFollower,
  canAttackLeader,
  canEvolve,
  canPlayCard,
  effectiveCost,
  getArmedFollowersDestroyed,
  getArmedFollowersLeftPlay,
  getDistinctArmedFollowersDestroyed,
  getDraconicWeaponsInPlay,
  getDualRagePlayErrors,
  isArmedCard,
  isArmedFollower,
  isLegalFollowerTarget,
  opponentOf
} from "./selectors";
import type {
  CardInstance,
  DualMode,
  EffectKey,
  FollowerInstance,
  GameState,
  LaevateinnMode,
  PlayerId
} from "./types";

const MAX_BOARD_SIZE = 5;
const MAX_HAND_SIZE = 9;
const MAX_PP = 10;

export function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

export function addLog(state: GameState, text: string): void {
  state.log.unshift({ id: state.nextLogId, text });
  state.nextLogId += 1;
  state.log = state.log.slice(0, 140);
}

export function addCardToHand(
  state: GameState,
  playerId: PlayerId,
  definitionId: string,
  costModifier = 0
): void {
  const player = state.players[playerId];
  const definition = getCardDefinition(definitionId);
  const card: CardInstance = {
    instanceId: `${playerId}-card-${state.nextInstanceNumber}`,
    definitionId,
    owner: playerId,
    costModifier
  };
  state.nextInstanceNumber += 1;

  if (player.hand.length >= MAX_HAND_SIZE) {
    player.graveyard.push(card);
    addLog(state, `${player.name} の手札が上限。${definition.name} は墓場へ。`);
    return;
  }
  player.hand.push(card);
  addLog(state, `${player.name} は ${definition.name} を手札に加えた。`);
}

export function drawCards(state: GameState, playerId: PlayerId, amount: number): void {
  const player = state.players[playerId];
  for (let count = 0; count < amount; count += 1) {
    const card = player.deck.shift();
    if (!card) {
      player.fatigue += 1;
      dealLeaderDamage(state, playerId, player.fatigue, "デッキ切れ");
      continue;
    }

    if (player.hand.length >= MAX_HAND_SIZE) {
      player.graveyard.push(card);
      addLog(state, `${player.name} の手札上限で ${getCardDefinition(card.definitionId).name} が燃えた。`);
    } else {
      player.hand.push(card);
      addLog(state, `${player.name} はカードを1枚引いた。`);
    }
  }
}

export function startTurn(input: GameState, playerId: PlayerId, skipDraw = false): GameState {
  const state = cloneGameState(input);
  mutateStartTurn(state, playerId, skipDraw);
  return state;
}

export function endTurn(input: GameState): GameState {
  const state = cloneGameState(input);
  if (state.winner) return state;

  const current = state.activePlayer;
  const currentPlayer = state.players[current];
  const opponent = opponentOf(current);

  for (const follower of [...currentPlayer.board]) {
    if (follower.definitionId === CARD_IDS.laevateinnBlastMode) {
      addLog(state, `${follower.name}: ターン終了時バーン ${follower.attack}点。`);
      dealLeaderDamage(state, opponent, follower.attack, follower.name);
      if (state.winner) return state;
    }
  }

  if (hasDefenseMode(state, current) || hasDualAlpha(state, current)) {
    addLog(state, "防御モード効果: ターン終了時に3回復。");
    healLeader(state, current, 3);
    for (const follower of currentPlayer.board) {
      healFollower(state, follower, 3);
    }
  }

  for (const beta of [...currentPlayer.board].filter(
    (follower) => follower.definitionId === CARD_IDS.laevateinnDualBeta
  )) {
    const x = getArmedFollowersDestroyed(state, current);
    addLog(state, `${beta.name}: デュアルモードβのX値は${x}。`);
    for (const enemyFollower of [...state.players[opponent].board]) {
      dealFollowerDamage(state, enemyFollower, x, beta.name);
    }
    if (x >= 5) dealLeaderDamage(state, opponent, 3, beta.name);
    drawCards(state, current, 2);
    putDraconicWeaponInPlay(state, current, `${beta.name}: ターン終了時`);
  }

  mutateStartTurn(state, opponent);
  return state;
}

export function playCard(input: GameState, playerId: PlayerId, cardInstanceId: string): GameState {
  const state = cloneGameState(input);
  const player = state.players[playerId];
  const cardIndex = player.hand.findIndex((card) => card.instanceId === cardInstanceId);
  const card = player.hand[cardIndex];
  if (!card) return state;

  if (!canPlayCard(state, playerId, card)) {
    if (card.definitionId === CARD_IDS.dualRage) {
      for (const reason of getDualRagePlayErrors(state, playerId)) {
        addLog(state, `デュアルレイジ条件不足: ${reason}`);
      }
    }
    return state;
  }

  const definition = getCardDefinition(card.definitionId);
  player.hand.splice(cardIndex, 1);
  player.pp -= effectiveCost(card);
  addLog(state, `${player.name} は ${definition.name} をプレイ。`);
  if (card.definitionId === CARD_IDS.dualRage) {
    addLog(state, "デュアルレイジは実際にプレイ可能です。");
  }

  if (definition.type === "follower") {
    const follower = summonFollower(state, playerId, definition.id, card.instanceId);
    if (follower) {
      applyFanfare(state, playerId, follower, card);
    } else {
      player.graveyard.push(card);
    }
  } else {
    applySpellOrAmulet(state, playerId, card);
    player.graveyard.push(card);
  }

  checkWinner(state);
  return state;
}

export function chooseDualMode(input: GameState, mode: DualMode): GameState {
  const state = cloneGameState(input);
  const playerId = state.pendingDualRageChoice?.playerId;
  if (!playerId) return state;

  const modeId = dualModeToCardId(mode);
  summonDualMode(state, playerId, modeId);
  state.pendingDualRageChoice = undefined;
  checkWinner(state);
  return state;
}

export function evolveFollower(
  input: GameState,
  playerId: PlayerId,
  followerInstanceId: string,
  mode: LaevateinnMode = "base"
): GameState {
  const state = cloneGameState(input);
  const player = state.players[playerId];
  const follower = player.board.find((unit) => unit.instanceId === followerInstanceId);
  if (!follower || !canEvolve(state, follower)) return state;

  const armedLeft = getArmedFollowersLeftPlay(state, playerId);
  if (follower.definitionId === CARD_IDS.laevateinnDragon && armedLeft >= 4) {
    addLog(state, `場を離れた味方武装フォロワー数: ${armedLeft}`);
    addLog(state, "条件達成: モード選択可能。");
    if (mode === "base") return state;
    payEvolveCost(player, follower);
    transformLaevateinn(state, follower, mode);
    checkWinner(state);
    return state;
  }

  payEvolveCost(player, follower);
  follower.evolved = true;
  evolveStats(follower);
  if (follower.definitionId === CARD_IDS.laevateinnDragon) {
    addLog(state, `場を離れた味方武装フォロワー数: ${armedLeft}`);
    addLog(state, "条件未達成: 通常進化。");
  } else {
    addLog(state, `${player.name} は ${follower.name} を進化。`);
  }
  applyEvolveEffect(state, playerId, follower, "base");

  checkWinner(state);
  return state;
}

export function attackFollower(
  input: GameState,
  playerId: PlayerId,
  attackerInstanceId: string,
  targetInstanceId: string
): GameState {
  const state = cloneGameState(input);
  const player = state.players[playerId];
  const enemy = state.players[opponentOf(playerId)];
  const attacker = player.board.find((unit) => unit.instanceId === attackerInstanceId);
  const target = enemy.board.find((unit) => unit.instanceId === targetInstanceId);
  if (!attacker || !target || !canAttackFollower(state, attacker) || !isLegalFollowerTarget(state, target)) {
    return state;
  }

  applyAttackModeBuff(state, attacker);
  applyDualGammaClash(state, attacker, target);
  markAttackUsed(attacker);
  state.selectedAttackerId = undefined;
  addLog(state, `${attacker.name} が ${target.name} を攻撃。`);

  const attackerDamage = attacker.attack;
  const targetDamage = target.attack;
  dealFollowerDamage(state, target, attackerDamage, "戦闘");
  if (player.board.some((unit) => unit.instanceId === attacker.instanceId)) {
    dealFollowerDamage(state, attacker, targetDamage, "戦闘");
  }
  checkWinner(state);
  return state;
}

export function attackLeader(input: GameState, playerId: PlayerId, attackerInstanceId: string): GameState {
  const state = cloneGameState(input);
  const player = state.players[playerId];
  const attacker = player.board.find((unit) => unit.instanceId === attackerInstanceId);
  if (!attacker || !canAttackLeader(state, attacker)) return state;

  applyAttackModeBuff(state, attacker);
  markAttackUsed(attacker);
  state.selectedAttackerId = undefined;
  addLog(state, `${attacker.name} がリーダーを攻撃。`);
  dealLeaderDamage(state, opponentOf(playerId), attacker.attack, attacker.name);
  checkWinner(state);
  return state;
}

export function dealLeaderDamage(state: GameState, playerId: PlayerId, amount: number, sourceName: string): void {
  const player = state.players[playerId];
  const actual = reduceLeaderDamage(state, playerId, amount);
  if (actual < amount) {
    addLog(state, `${player.name} へのダメージを${amount - actual}軽減。`);
  }
  player.health -= actual;
  addLog(state, `${sourceName}: ${player.name} に${actual}ダメージ。`);
  checkWinner(state);
}

export function dealFollowerDamage(
  state: GameState,
  follower: FollowerInstance,
  amount: number,
  sourceName: string
): void {
  const actual = reduceFollowerDamage(state, follower, amount);
  if (actual < amount) {
    addLog(state, `${follower.name} へのダメージを${amount - actual}軽減。`);
  }
  follower.defense -= actual;
  addLog(state, `${sourceName}: ${follower.name} に${actual}ダメージ。`);
  if (follower.defense <= 0) {
    destroyFollower(state, follower, sourceName, false);
  }
}

export function banishFollower(input: GameState, playerId: PlayerId, followerInstanceId: string): GameState {
  const state = cloneGameState(input);
  const follower = state.players[playerId].board.find((unit) => unit.instanceId === followerInstanceId);
  if (follower) {
    removeFollowerFromPlay(state, follower, "消滅", false);
  }
  return state;
}

export function debugSetArmedLeftPlay(input: GameState, playerId: PlayerId, value: number): GameState {
  const state = cloneGameState(input);
  setArmedLeftPlay(state, playerId, value);
  addLog(state, `デバッグ: ${state.players[playerId].name}の場を離れた武装カウントを${value}に変更`);
  return state;
}

export function debugSetArmedDestroyed(input: GameState, playerId: PlayerId, value: number): GameState {
  const state = cloneGameState(input);
  state.armedFollowersDestroyed[playerId] = Math.max(0, value);
  state.players[playerId].armedFollowersDestroyed = state.armedFollowersDestroyed[playerId];
  addLog(state, `デバッグ: ${state.players[playerId].name}の破壊された武装カウントを${value}に変更`);
  return state;
}

export function debugAddDistinctArmedDestroyed(input: GameState, playerId: PlayerId, cardId: string): GameState {
  const state = cloneGameState(input);
  addDistinctArmedDestroyed(state, playerId, cardId);
  addLog(state, `デバッグ: ${state.players[playerId].name}の異名武装破壊リストに ${cardId} を追加`);
  return state;
}

export function debugResetArmedCounts(input: GameState, playerId: PlayerId): GameState {
  const state = cloneGameState(input);
  setArmedLeftPlay(state, playerId, 0);
  state.armedFollowersDestroyed[playerId] = 0;
  state.players[playerId].armedFollowersDestroyed = 0;
  state.distinctArmedFollowersDestroyed[playerId] = [];
  state.players[playerId].distinctArmedFollowersDestroyed = [];
  addLog(state, `デバッグ: ${state.players[playerId].name}の武装カウントをリセット`);
  return state;
}

export function debugAddCardToHand(input: GameState, playerId: PlayerId, cardId: string): GameState {
  const state = cloneGameState(input);
  addCardToHand(state, playerId, cardId);
  addLog(state, `デバッグ: ${state.players[playerId].name}の手札に ${cardId} を追加`);
  return state;
}

export function debugSetMaxPp(input: GameState, playerId: PlayerId, value: number): GameState {
  const state = cloneGameState(input);
  const player = state.players[playerId];
  const nextMaxPp = Math.min(MAX_PP, Math.max(0, value));
  player.maxPp = nextMaxPp;
  player.pp = Math.min(player.pp, nextMaxPp);
  addLog(state, `デバッグ: ${player.name}のPP最大値を${nextMaxPp}に変更`);
  return state;
}

function mutateStartTurn(state: GameState, playerId: PlayerId, skipDraw = false): void {
  state.activePlayer = playerId;
  state.selectedAttackerId = undefined;
  state.turn += 1;

  const player = state.players[playerId];
  player.turnNumber += 1;
  player.maxPp = Math.min(MAX_PP, player.maxPp + 1);
  player.pp = player.maxPp;

  for (const follower of player.board) {
    follower.hasAttacked = false;
    follower.attacksThisTurn = 0;
    follower.canAttackFollowers = true;
    follower.canAttackLeader = true;
    follower.buffTriggersUsed = [];
  }

  addLog(state, `-- ${player.name} ターン ${player.turnNumber} / PP ${player.pp} --`);
  if (!skipDraw) drawCards(state, playerId, 1);
  checkWinner(state);
}

function summonFollower(
  state: GameState,
  playerId: PlayerId,
  definitionId: string,
  sourceCardInstanceId?: string
): FollowerInstance | undefined {
  const player = state.players[playerId];
  if (player.board.length >= MAX_BOARD_SIZE) {
    addLog(state, `${player.name} の場がいっぱい。`);
    return undefined;
  }

  const definition = getCardDefinition(definitionId);
  const follower: FollowerInstance = {
    instanceId: sourceCardInstanceId ?? `${playerId}-token-${state.nextInstanceNumber}`,
    definitionId,
    sourceDefinitionId: definitionId,
    owner: playerId,
    name: definition.name,
    attack: definition.attack ?? 0,
    defense: definition.defense ?? 0,
    maxDefense: definition.defense ?? 0,
    traits: [...definition.traits],
    keywords: [...(definition.keywords ?? [])],
    evolved: false,
    canAttackLeader: definition.keywords?.includes("storm") ?? false,
    canAttackFollowers:
      definition.keywords?.includes("storm") || definition.keywords?.includes("rush") || hasBlastMode(state, playerId),
    hasAttacked: false,
    attacksThisTurn: 0,
    maxAttacksPerTurn: definitionId === CARD_IDS.laevateinnDualAlpha ? 2 : 1,
    freeEvolve: false,
    buffTriggersUsed: []
  };

  if (!sourceCardInstanceId) state.nextInstanceNumber += 1;

  applyBlastModeRush(state, playerId, follower);
  player.board.push(follower);
  consumeDraconicWeaponForFollower(state, playerId, follower);
  applyDualGammaStorm(state, playerId, follower);
  return follower;
}

function applyFanfare(
  state: GameState,
  playerId: PlayerId,
  follower: FollowerInstance,
  sourceCard: CardInstance
): void {
  const player = state.players[playerId];
  const opponent = opponentOf(playerId);
  const armedLeft = getArmedFollowersLeftPlay(state, playerId);

  switch (getCardDefinition(sourceCard.definitionId).effect) {
    case "LAEVATEINN_DRAGON": {
      const weaponIndices = player.hand
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => card.definitionId === CARD_IDS.draconicWeapon)
        .map(({ index }) => index);
      if (weaponIndices.length > 0) {
        const roll = randomInt(state.rngSeed, weaponIndices.length);
        state.rngSeed = roll.seed;
        const [discarded] = player.hand.splice(weaponIndices[roll.value], 1);
        player.graveyard.push(discarded);
        follower.freeEvolve = true;
        addLog(state, "ドラゴウェポンを捨てて0EP進化可能になった。");
      }
      addLog(state, `場を離れた味方武装フォロワー数: ${armedLeft}`);
      break;
    }
    case "HAMMER_DRAGONEWT":
      if (armedLeft >= 4) {
        buffFollower(state, follower, 2, 2, follower.name);
        if (!follower.keywords.includes("storm")) follower.keywords.push("storm");
        follower.canAttackLeader = true;
        follower.canAttackFollowers = true;
      }
      break;
    case "DRAGNIR":
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      if (armedLeft >= 4) {
        player.ep += 1;
        addLog(state, `${player.name} のEPが1回復。`);
      }
      break;
    case "SWIFTBLADE_DRAGONEWT":
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      if (armedLeft >= 4) {
        const target = chooseDamagedEnemy(state, opponent);
        if (target) dealFollowerDamage(state, target, 3, follower.name);
        dealLeaderDamage(state, opponent, 3, follower.name);
      }
      break;
    case "ELEGANT_DRACONIAN":
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      if (armedLeft >= 4) {
        buffFollower(state, follower, 2, 0, follower.name);
        if (!follower.keywords.includes("storm")) follower.keywords.push("storm");
        follower.canAttackLeader = true;
        follower.canAttackFollowers = true;
        recoverHighestCostArmedFollower(state, playerId);
      }
      break;
    case "REGGIE":
      if (player.maxPp >= 7 && !follower.keywords.includes("storm")) {
        follower.keywords.push("storm");
        follower.canAttackLeader = true;
        follower.canAttackFollowers = true;
      }
      break;
    case "GRANS_ANGEL":
      addLog(state, "直接召喚封じはこのMVPではログのみ処理。");
      break;
    case "DISDAIN_FOLLOWER": {
      const target = chooseAlliedSelfDamageTarget(player.board, follower.instanceId, 1);
      if (target) {
        dealFollowerDamage(state, target, 1, follower.name);
        drawCards(state, playerId, 1);
      }
      break;
    }
    case "DRAGON_LANCER": {
      const target = chooseAlliedSelfDamageTarget(player.board, follower.instanceId, 2);
      if (target) {
        dealFollowerDamage(state, target, 2, follower.name);
        drawCards(state, playerId, 1);
        buffFollower(state, follower, 2, 1, follower.name);
      }
      break;
    }
    case "ASUKA_SHIORI":
      drawCards(state, playerId, 2);
      if (player.ep > state.players[opponent].ep) {
        healLeader(state, playerId, 2);
        player.pp = Math.min(player.maxPp, player.pp + 2);
        addLog(state, `${player.name} はPPを2回復。`);
      }
      break;
    case "DRAGON_BREEDER": {
      const target = chooseBuffTarget(player.board, follower.instanceId);
      if (target) buffFollower(state, target, 1, 1, follower.name);
      if (player.maxPp >= 7) drawCards(state, playerId, 1);
      break;
    }
    case "RUINOUS_SWORDSMAN":
      if (player.maxPp >= 7) {
        if (!follower.keywords.includes("rush")) follower.keywords.push("rush");
        follower.canAttackFollowers = true;
        drawCards(state, playerId, 1);
      }
      break;
    default:
      break;
  }
}

function applySpellOrAmulet(state: GameState, playerId: PlayerId, card: CardInstance): void {
  const player = state.players[playerId];
  const opponent = opponentOf(playerId);
  const definition = getCardDefinition(card.definitionId);

  switch (definition.effect) {
    case "DRAGON_WEAPON":
      putDraconicWeaponInPlay(state, playerId, definition.name);
      break;
    case "DUAL_RAGE":
      resolveDualRageCosts(state, playerId);
      break;
    case "DRAGON_SMASH": {
      const target = chooseDamagedEnemy(state, opponent);
      if (target) dealFollowerDamage(state, target, 2, definition.name);
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      break;
    }
    case "DRAGONIC_ARMOR":
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      if (
        player.hand.some(
          (handCard) => isArmedCard(handCard.definitionId) && getCardDefinition(handCard.definitionId).type === "follower"
        )
      ) {
        searchDeckToHand(
          state,
          playerId,
          (deckCard) =>
            isArmedCard(deckCard.definitionId) && getCardDefinition(deckCard.definitionId).type === "follower"
        );
      }
      break;
    case "DRAGON_EMISSARY":
      searchDeckToHand(state, playerId, (deckCard) => getCardDefinition(deckCard.definitionId).cost >= 5, -1);
      break;
    default:
      addLog(state, `${definition.name}: TODO_EFFECT（プレイのみ処理）。`);
      break;
  }
}

function resolveDualRageCosts(state: GameState, playerId: PlayerId): void {
  const player = state.players[playerId];
  const laevateinnIndex = player.hand.findIndex((card) => card.definitionId === CARD_IDS.laevateinnDragon);
  if (laevateinnIndex >= 0) {
    const [discarded] = player.hand.splice(laevateinnIndex, 1);
    player.graveyard.push(discarded);
    addLog(state, "デュアルレイジ: 手札のレーヴァテインドラゴンを捨てた。");
  }

  for (let count = 0; count < 2; count += 1) {
    const weaponIndex = player.amulets.findIndex((card) => card.definitionId === CARD_IDS.draconicWeapon);
    if (weaponIndex >= 0) {
      const [destroyed] = player.amulets.splice(weaponIndex, 1);
      player.graveyard.push(destroyed);
      addLog(state, "デュアルレイジ: 場のドラゴウェポンを破壊した。");
    }
  }
  syncPendingWeapons(state, playerId);

  player.ep -= 1;
  addLog(state, "デュアルレイジ: EPを1消費。");
  state.pendingDualRageChoice = { playerId };
  addLog(state, "デュアルレイジ: デュアルモードα/β/γを選択してください。");
}

function summonDualMode(state: GameState, playerId: PlayerId, definitionId: string): void {
  const definition = getCardDefinition(definitionId);
  const player = state.players[playerId];
  const exIndex = player.extraDeck.findIndex((card) => card.definitionId === definitionId);
  const source = exIndex >= 0 ? player.extraDeck[exIndex] : undefined;
  const follower = summonFollower(
    state,
    playerId,
    definitionId,
    `${playerId}-${definitionId}-${state.nextInstanceNumber}`
  );
  if (!follower) return;
  state.nextInstanceNumber += 1;
  follower.evolved = true;
  follower.maxAttacksPerTurn = definitionId === CARD_IDS.laevateinnDualAlpha ? 2 : 1;
  follower.canAttackLeader = follower.keywords.includes("storm");
  follower.canAttackFollowers = follower.keywords.includes("rush") || follower.keywords.includes("storm");
  if (source) addLog(state, `EXデッキから ${definition.name} を場に出した。`);
  addLog(state, `デュアルレイジで選択: ${definition.name}`);
  applyDualModeOnEnter(state, playerId, follower);
}

function applyDualModeOnEnter(state: GameState, playerId: PlayerId, follower: FollowerInstance): void {
  if (follower.definitionId === CARD_IDS.laevateinnDualGamma) {
    for (const ally of state.players[playerId].board) {
      if (ally.instanceId !== follower.instanceId && isArmedFollower(ally) && !ally.keywords.includes("storm")) {
        ally.keywords.push("storm");
        ally.canAttackLeader = true;
      }
    }
    addLog(state, `${follower.name}: 他の味方武装フォロワーすべてに疾走を付与。`);
  }
}

function applyEvolveEffect(
  state: GameState,
  playerId: PlayerId,
  follower: FollowerInstance,
  laevateinnMode: LaevateinnMode
): void {
  const opponent = opponentOf(playerId);
  switch (follower.definitionId) {
    case CARD_IDS.laevateinnDragon: {
      const target = chooseDamagedEnemy(state, opponent);
      if (target) dealFollowerDamage(state, target, 5, follower.name);
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      break;
    }
    case CARD_IDS.laevateinnAttackMode:
      addLog(state, "アタックモードの10点AOE。");
      for (const enemyFollower of [...state.players[opponent].board]) {
        dealFollowerDamage(state, enemyFollower, 10, follower.name);
      }
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      break;
    case CARD_IDS.laevateinnDefenseMode:
      addLog(state, "ディフェンスモードの2ドロー。");
      drawCards(state, playerId, 2);
      break;
    case CARD_IDS.laevateinnBlastMode: {
      const before = state.players[playerId].pp;
      state.players[playerId].pp = Math.min(state.players[playerId].maxPp, state.players[playerId].pp + 2);
      addLog(state, `ブラストモードのPP2回復。${before} -> ${state.players[playerId].pp}`);
      break;
    }
    case CARD_IDS.dragnir: {
      const target = chooseDamagedEnemy(state, opponent);
      if (target) dealFollowerDamage(state, target, 4, follower.name);
      addCardToHand(state, playerId, CARD_IDS.draconicWeapon);
      break;
    }
    case CARD_IDS.reggie:
      for (const ally of [...state.players[playerId].board]) {
        buffFollower(state, ally, 1, 1, follower.name);
      }
      break;
    case CARD_IDS.gransAngel: {
      const target = chooseDamagedEnemy(state, opponent);
      if (target) destroyFollower(state, target, follower.name, true);
      break;
    }
    default:
      if (laevateinnMode !== "base") {
        addLog(state, `${follower.name} は ${laevateinnMode} モードへ。`);
      }
      break;
  }
}

function payEvolveCost(player: { ep: number }, follower: FollowerInstance): void {
  if (!follower.freeEvolve) {
    player.ep -= 1;
  }
  follower.freeEvolve = false;
}

function transformLaevateinn(state: GameState, follower: FollowerInstance, mode: Exclude<LaevateinnMode, "base">): void {
  const nextId =
    mode === "attack"
      ? CARD_IDS.laevateinnAttackMode
      : mode === "defense"
        ? CARD_IDS.laevateinnDefenseMode
        : CARD_IDS.laevateinnBlastMode;
  const definition = getCardDefinition(nextId);

  follower.definitionId = definition.id;
  follower.sourceDefinitionId = CARD_IDS.laevateinnDragon;
  follower.name = definition.name;
  follower.attack = definition.attack ?? follower.attack;
  follower.defense = definition.defense ?? follower.defense;
  follower.maxDefense = definition.defense ?? follower.maxDefense;
  follower.traits = [...definition.traits];
  follower.keywords = [...(definition.keywords ?? [])];
  follower.evolved = true;
  follower.hasAttacked = false;
  follower.attacksThisTurn = 0;
  follower.maxAttacksPerTurn = 1;
  follower.canAttackFollowers = true;
  follower.canAttackLeader = false;
  follower.cantBeDestroyedByEffects = mode === "defense";
  follower.buffTriggersUsed = [];

  addLog(state, `${definition.name}に進化。`);
  applyEvolveEffect(state, follower.owner, follower, mode);
}

function evolveStats(follower: FollowerInstance): void {
  const definition = getCardDefinition(follower.definitionId);
  const nextAttack = definition.evolvedAttack ?? follower.attack + 2;
  const nextDefense = definition.evolvedDefense ?? follower.maxDefense + 2;
  const damage = follower.maxDefense - follower.defense;
  follower.attack = nextAttack;
  follower.maxDefense = nextDefense;
  follower.defense = Math.max(1, nextDefense - damage);
}

function buffFollower(
  state: GameState,
  follower: FollowerInstance,
  attackDelta: number,
  defenseDelta: number,
  sourceName: string
): void {
  if (attackDelta === 0 && defenseDelta === 0) return;
  follower.attack += attackDelta;
  follower.maxDefense += defenseDelta;
  follower.defense += defenseDelta;
  addLog(state, `${sourceName}: ${follower.name} を +${attackDelta}/+${defenseDelta}。`);
  triggerBuffListeners(state, follower);
}

function triggerBuffListeners(state: GameState, follower: FollowerInstance): void {
  if (state.activePlayer !== follower.owner) return;
  const player = state.players[follower.owner];
  const used = follower.buffTriggersUsed;

  if (follower.definitionId === CARD_IDS.reggie && !used.includes("REGGIE")) {
    used.push("REGGIE");
    if (player.maxPp < MAX_PP) {
      player.maxPp += 1;
      player.pp = Math.min(MAX_PP, player.pp + 1);
      addLog(state, `${follower.name} の能力でPP最大値+1。`);
    }
  }

  if (follower.definitionId === CARD_IDS.ruinousSwordsman && !used.includes("RUINOUS_SWORDSMAN")) {
    used.push("RUINOUS_SWORDSMAN");
    drawCards(state, follower.owner, 1);
  }
}

function applyAttackModeBuff(state: GameState, attacker: FollowerInstance): void {
  if (!isArmedFollower(attacker)) return;
  const owner = state.players[attacker.owner];
  const attackMode = owner.board.find(
    (follower) =>
      follower.definitionId === CARD_IDS.laevateinnAttackMode &&
      follower.instanceId !== attacker.instanceId
  );
  if (attackMode) {
    addLog(state, "アタックモードの+2/+2付与。");
    buffFollower(state, attacker, 2, 2, attackMode.name);
  }
}

function applyDualGammaClash(state: GameState, attacker: FollowerInstance, target: FollowerInstance): void {
  const gamma =
    attacker.definitionId === CARD_IDS.laevateinnDualGamma
      ? attacker
      : target.definitionId === CARD_IDS.laevateinnDualGamma
        ? target
        : undefined;
  if (!gamma) return;

  const x = getDistinctArmedFollowersDestroyed(state, gamma.owner).length;
  addLog(state, `${gamma.name}: デュアルモードγのX値は${x}。`);
  const enemy = opponentOf(gamma.owner);
  for (const enemyFollower of [...state.players[enemy].board]) {
    dealFollowerDamage(state, enemyFollower, x, gamma.name);
  }
}

function markAttackUsed(follower: FollowerInstance): void {
  follower.attacksThisTurn = (follower.attacksThisTurn ?? 0) + 1;
  follower.hasAttacked = follower.attacksThisTurn >= (follower.maxAttacksPerTurn ?? 1);
}

function reduceLeaderDamage(state: GameState, playerId: PlayerId, amount: number): number {
  let reduction = hasDefenseMode(state, playerId) ? 2 : 0;
  if (hasDualAlpha(state, playerId)) reduction += 3;
  return Math.max(0, amount - reduction);
}

function reduceFollowerDamage(state: GameState, follower: FollowerInstance, amount: number): number {
  let reduction = hasDefenseMode(state, follower.owner) ? 2 : 0;
  if (follower.definitionId === CARD_IDS.laevateinnDualAlpha) reduction += 3;
  return Math.max(0, amount - reduction);
}

function destroyFollower(
  state: GameState,
  follower: FollowerInstance,
  sourceName: string,
  byDestroyEffect: boolean
): void {
  if (byDestroyEffect && follower.cantBeDestroyedByEffects) {
    addLog(state, `${follower.name} は能力破壊を受けない。`);
    return;
  }
  removeFollowerFromPlay(state, follower, sourceName, true);
}

function removeFollowerFromPlay(
  state: GameState,
  follower: FollowerInstance,
  sourceName: string,
  destroyed: boolean
): void {
  const owner = state.players[follower.owner];
  const boardIndex = owner.board.findIndex((unit) => unit.instanceId === follower.instanceId);
  if (boardIndex < 0) return;
  const [removed] = owner.board.splice(boardIndex, 1);
  owner.graveyard.push({
    instanceId: `${removed.instanceId}-grave-${state.nextInstanceNumber}`,
    definitionId: removed.sourceDefinitionId,
    owner: removed.owner
  });
  state.nextInstanceNumber += 1;
  if (isArmedFollower(removed)) {
    incrementArmedFollowersLeftPlay(state, removed.owner);
    if (destroyed) incrementArmedFollowersDestroyed(state, removed.owner, removed.sourceDefinitionId);
  }
  addLog(state, `${sourceName}: ${removed.name} は場を離れた。`);

  if (destroyed && removed.sourceDefinitionId === CARD_IDS.hammerDragonewt) {
    addCardToHand(state, removed.owner, CARD_IDS.dragonSmash);
  }
}

function incrementArmedFollowersLeftPlay(state: GameState, playerId: PlayerId): void {
  setArmedLeftPlay(state, playerId, getArmedFollowersLeftPlay(state, playerId) + 1);
  addLog(state, `場を離れた味方武装フォロワー数: ${state.armedFollowersLeftPlay[playerId]}`);
}

function incrementArmedFollowersDestroyed(state: GameState, playerId: PlayerId, cardId: string): void {
  state.armedFollowersDestroyed[playerId] = getArmedFollowersDestroyed(state, playerId) + 1;
  state.players[playerId].armedFollowersDestroyed = state.armedFollowersDestroyed[playerId];
  addDistinctArmedDestroyed(state, playerId, cardId);
  addLog(state, `破壊された味方武装フォロワー数: ${state.armedFollowersDestroyed[playerId]}`);
}

function setArmedLeftPlay(state: GameState, playerId: PlayerId, value: number): void {
  state.armedFollowersLeftPlay[playerId] = Math.max(0, value);
  state.players[playerId].armedFollowersLeftPlay = state.armedFollowersLeftPlay[playerId];
}

function addDistinctArmedDestroyed(state: GameState, playerId: PlayerId, cardId: string): void {
  const current = getDistinctArmedFollowersDestroyed(state, playerId);
  if (!current.includes(cardId)) {
    state.distinctArmedFollowersDestroyed[playerId] = [...current, cardId];
    state.players[playerId].distinctArmedFollowersDestroyed = state.distinctArmedFollowersDestroyed[playerId];
  }
}

function healLeader(state: GameState, playerId: PlayerId, amount: number): void {
  const player = state.players[playerId];
  const before = player.health;
  player.health = Math.min(player.maxHealth, player.health + amount);
  if (player.health > before) addLog(state, `${player.name} は${player.health - before}回復。`);
}

function healFollower(state: GameState, follower: FollowerInstance, amount: number): void {
  const before = follower.defense;
  follower.defense = Math.min(follower.maxDefense, follower.defense + amount);
  if (follower.defense > before) addLog(state, `${follower.name} は${follower.defense - before}回復。`);
}

function chooseDamagedEnemy(state: GameState, playerId: PlayerId): FollowerInstance | undefined {
  return [...state.players[playerId].board].sort((a, b) => a.defense - b.defense || b.attack - a.attack)[0];
}

function chooseAlliedSelfDamageTarget(
  board: FollowerInstance[],
  sourceInstanceId: string,
  damage: number
): FollowerInstance | undefined {
  const candidates = board.filter((follower) => follower.instanceId !== sourceInstanceId);
  return (
    candidates.find((follower) => isArmedFollower(follower) && follower.defense <= damage) ??
    candidates.find((follower) => follower.defense > damage) ??
    candidates[0]
  );
}

function chooseBuffTarget(board: FollowerInstance[], sourceInstanceId: string): FollowerInstance | undefined {
  const candidates = board.filter((follower) => follower.instanceId !== sourceInstanceId);
  return (
    candidates.find((follower) => follower.definitionId === CARD_IDS.reggie) ??
    candidates.find((follower) => follower.definitionId === CARD_IDS.ruinousSwordsman) ??
    candidates.sort((a, b) => b.attack - a.attack)[0]
  );
}

function recoverHighestCostArmedFollower(state: GameState, playerId: PlayerId): void {
  const player = state.players[playerId];
  const candidates = player.graveyard
    .filter((card) => isArmedCard(card.definitionId) && getCardDefinition(card.definitionId).type === "follower")
    .sort((a, b) => getCardDefinition(b.definitionId).cost - getCardDefinition(a.definitionId).cost);
  if (candidates[0]) addCardToHand(state, playerId, candidates[0].definitionId);
}

function searchDeckToHand(
  state: GameState,
  playerId: PlayerId,
  predicate: (card: CardInstance) => boolean,
  costModifier = 0
): void {
  const player = state.players[playerId];
  const index = player.deck.findIndex(predicate);
  if (index < 0) {
    addLog(state, `${player.name} のデッキに該当カードなし。`);
    return;
  }

  const [card] = player.deck.splice(index, 1);
  card.costModifier = (card.costModifier ?? 0) + costModifier;
  const definition = ARMED_DRAGON_CARDS[card.definitionId];
  if (player.hand.length >= MAX_HAND_SIZE) {
    player.graveyard.push(card);
    addLog(state, `${definition.name} は手札上限で墓場へ。`);
  } else {
    player.hand.push(card);
    addLog(state, `${player.name} は ${definition.name} をデッキから手札に加えた。`);
  }
}

function putDraconicWeaponInPlay(state: GameState, playerId: PlayerId, sourceName: string): void {
  const player = state.players[playerId];
  const card: CardInstance = {
    instanceId: `${playerId}-amulet-${state.nextInstanceNumber}`,
    definitionId: CARD_IDS.draconicWeapon,
    owner: playerId
  };
  state.nextInstanceNumber += 1;
  player.amulets.push(card);
  syncPendingWeapons(state, playerId);
  addLog(state, `${sourceName}: ドラゴウェポンを場に出した。`);
}

function consumeDraconicWeaponForFollower(
  state: GameState,
  playerId: PlayerId,
  follower: FollowerInstance
): void {
  const player = state.players[playerId];
  const weaponIndex = player.amulets.findIndex((card) => card.definitionId === CARD_IDS.draconicWeapon);
  if (weaponIndex < 0) return;

  const [weapon] = player.amulets.splice(weaponIndex, 1);
  player.graveyard.push(weapon);
  syncPendingWeapons(state, playerId);
  if (!isArmedFollower(follower)) follower.traits.push("armed");
  buffFollower(state, follower, 0, 1, "ドラゴウェポン");
  addLog(state, `ドラゴウェポンにより ${follower.name} が武装化。`);
}

function syncPendingWeapons(state: GameState, playerId: PlayerId): void {
  state.players[playerId].pendingWeapons = getDraconicWeaponsInPlay(state, playerId).length;
}

function applyBlastModeRush(state: GameState, playerId: PlayerId, follower: FollowerInstance): void {
  if (!hasBlastMode(state, playerId) || follower.keywords.includes("rush")) return;
  follower.keywords.push("rush");
  follower.canAttackFollowers = true;
  addLog(state, `ブラストモード: ${follower.name} は突進を持つ。`);
}

function applyDualGammaStorm(state: GameState, playerId: PlayerId, follower: FollowerInstance): void {
  const hasGamma = state.players[playerId].board.some(
    (ally) => ally.definitionId === CARD_IDS.laevateinnDualGamma && ally.instanceId !== follower.instanceId
  );
  if (!hasGamma || !isArmedFollower(follower) || follower.keywords.includes("storm")) return;
  follower.keywords.push("storm");
  follower.canAttackLeader = true;
  follower.canAttackFollowers = true;
  addLog(state, `デュアルモードγ: ${follower.name} は疾走を持つ。`);
}

function hasBlastMode(state: GameState, playerId: PlayerId): boolean {
  return state.players[playerId].board.some(
    (follower) => follower.definitionId === CARD_IDS.laevateinnBlastMode
  );
}

function hasDefenseMode(state: GameState, playerId: PlayerId): boolean {
  return state.players[playerId].board.some(
    (follower) => follower.definitionId === CARD_IDS.laevateinnDefenseMode
  );
}

function hasDualAlpha(state: GameState, playerId: PlayerId): boolean {
  return state.players[playerId].board.some(
    (follower) => follower.definitionId === CARD_IDS.laevateinnDualAlpha
  );
}

function dualModeToCardId(mode: DualMode): string {
  if (mode === "alpha") return CARD_IDS.laevateinnDualAlpha;
  if (mode === "beta") return CARD_IDS.laevateinnDualBeta;
  return CARD_IDS.laevateinnDualGamma;
}

function checkWinner(state: GameState): void {
  const humanDead = state.players.human.health <= 0;
  const opponentDead = state.players.opponent.health <= 0;
  if (humanDead && opponentDead) state.winner = "draw";
  else if (humanDead) state.winner = "opponent";
  else if (opponentDead) state.winner = "human";
}
