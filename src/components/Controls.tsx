import { useState, type Dispatch } from "react";
import type { DeckId, GameAction, GameState } from "../engine/types";
import { DeckSelector } from "./DeckSelector";

interface ControlsProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function Controls({ state, dispatch }: ControlsProps) {
  const [seed, setSeed] = useState("armed-dragon-mirror");
  const [humanDeckId, setHumanDeckId] = useState<DeckId>(state.players.human.deckId);
  const [opponentDeckId, setOpponentDeckId] = useState<DeckId>(state.players.opponent.deckId);
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
      <DeckSelector label="自分のデッキ" value={humanDeckId} onChange={setHumanDeckId} />
      <DeckSelector label="AIのデッキ" value={opponentDeckId} onChange={setOpponentDeckId} />
      <div className="buttonRow">
        <button type="button" onClick={() => dispatch({ type: "NEW_GAME", seed, humanDeckId, opponentDeckId })}>
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
