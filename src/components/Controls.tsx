import { useState, type Dispatch } from "react";
import type { GameAction, GameState } from "../engine/types";

interface ControlsProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function Controls({ state, dispatch }: ControlsProps) {
  const [seed, setSeed] = useState("armed-dragon-mirror");
  const humanActive = state.activePlayer === "human" && !state.winner;

  return (
    <section className="panel controlsPanel" aria-label="Controls">
      <div className="panelHeader">
        <h2>Control</h2>
        <span>Turn {state.turn}</span>
      </div>
      <label className="seedInput">
        <span>Seed</span>
        <input value={seed} onChange={(event) => setSeed(event.target.value)} />
      </label>
      <div className="buttonRow">
        <button type="button" onClick={() => dispatch({ type: "NEW_GAME", seed })}>
          New Game
        </button>
        <button type="button" disabled={!humanActive} onClick={() => dispatch({ type: "END_TURN" })}>
          End Turn
        </button>
      </div>
      {state.winner ? (
        <p className="resultText">{state.winner === "draw" ? "Draw" : `${state.players[state.winner].name} wins`}</p>
      ) : null}
    </section>
  );
}
