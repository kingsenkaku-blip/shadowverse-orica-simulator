import { useState, type Dispatch } from "react";
import { CARD_IDS } from "../data/cards/armed-dragon";
import { getArmedCountSummary } from "../engine/selectors";
import type { GameAction, GameState, PlayerId } from "../engine/types";

interface DebugPanelProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

function parseDebugNumber(value: string): number {
  return Number.parseInt(value, 10) || 0;
}

export function DebugPanel({ state, dispatch }: DebugPanelProps) {
  const [playerId, setPlayerId] = useState<PlayerId>("human");
  const [maxPp, setMaxPp] = useState("10");
  const [leftPlay, setLeftPlay] = useState("4");
  const [destroyed, setDestroyed] = useState("5");
  const [distinctCardId, setDistinctCardId] = useState<string>(CARD_IDS.hammerDragonewt);
  const player = state.players[playerId];
  const counts = getArmedCountSummary(state, playerId);

  return (
    <section className="panel debugPanel" aria-label="DebugPanel">
      <div className="panelHeader">
        <h2>Debug</h2>
        <span>検証用操作</span>
      </div>

      <label className="seedInput">
        <span>対象プレイヤー</span>
        <select value={playerId} onChange={(event) => setPlayerId(event.target.value as PlayerId)}>
          <option value="human">自分</option>
          <option value="opponent">相手</option>
        </select>
      </label>

      <div className="debugCounts">
        <span>
          PP: {player.pp}/{player.maxPp}
        </span>
        <span>場を離れた武装: {counts.leftPlay}</span>
        <span>破壊された武装: {counts.destroyed}</span>
        <span>破壊された異名武装: {counts.distinctDestroyedCount}</span>
        <code>{counts.distinctDestroyed.join(", ") || "none"}</code>
      </div>

      <label className="seedInput">
        <span>PP最大値</span>
        <input inputMode="numeric" value={maxPp} onChange={(event) => setMaxPp(event.target.value)} />
      </label>
      <button
        type="button"
        onClick={() => dispatch({ type: "DEBUG_SET_MAX_PP", playerId, value: parseDebugNumber(maxPp) })}
      >
        PP最大値を設定
      </button>

      <div className="buttonRow">
        <button
          type="button"
          onClick={() => dispatch({ type: "DEBUG_ADD_CARD_TO_HAND", playerId, cardId: CARD_IDS.dualRage })}
        >
          デュアルレイジを手札へ
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "DEBUG_ADD_CARD_TO_HAND", playerId, cardId: CARD_IDS.laevateinnDragon })}
        >
          レーヴァテインを手札へ
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          dispatch({ type: "DEBUG_ADD_CARD_TO_HAND", playerId, cardId: CARD_IDS.draconicWeapon });
          dispatch({ type: "DEBUG_ADD_CARD_TO_HAND", playerId, cardId: CARD_IDS.draconicWeapon });
        }}
      >
        ドラゴウェポン2枚を手札へ
      </button>

      <label className="seedInput">
        <span>場を離れた武装カウント</span>
        <input inputMode="numeric" value={leftPlay} onChange={(event) => setLeftPlay(event.target.value)} />
      </label>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: "DEBUG_SET_ARMED_LEFT_PLAY", playerId, value: parseDebugNumber(leftPlay) })
        }
      >
        leftPlayを設定
      </button>

      <label className="seedInput">
        <span>破壊された武装カウント</span>
        <input inputMode="numeric" value={destroyed} onChange={(event) => setDestroyed(event.target.value)} />
      </label>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: "DEBUG_SET_ARMED_DESTROYED", playerId, value: parseDebugNumber(destroyed) })
        }
      >
        destroyedを設定
      </button>

      <label className="seedInput">
        <span>異名武装 cardId</span>
        <input value={distinctCardId} onChange={(event) => setDistinctCardId(event.target.value)} />
      </label>
      <div className="buttonRow">
        <button
          type="button"
          onClick={() => dispatch({ type: "DEBUG_ADD_DISTINCT_ARMED_DESTROYED", playerId, cardId: distinctCardId })}
        >
          異名を追加
        </button>
        <button type="button" onClick={() => dispatch({ type: "DEBUG_RESET_ARMED_COUNTS", playerId })}>
          リセット
        </button>
      </div>
    </section>
  );
}
