import { useEffect, useMemo, useReducer } from "react";
import { ARMED_DRAGON_DECK_NAME, ARMED_DRAGON_SOURCE_URL, DECK_TOTAL } from "../data/decks/armed-dragon";
import { createGame, deckSummary } from "../engine/game";
import { gameReducer } from "../engine/reducer";
import { Board } from "./Board";
import { Controls } from "./Controls";
import { DebugPanel } from "./DebugPanel";
import { DualRageChoicePanel } from "./DualRageChoicePanel";
import { HelpIdPanel } from "./HelpIdPanel";
import { LogPanel } from "./LogPanel";

export function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGame("armed-dragon-mirror"));
  const cards = useMemo(() => deckSummary(), []);

  useEffect(() => {
    if (state.activePlayer !== "opponent" || state.winner) return;
    const handle = window.setTimeout(() => dispatch({ type: "RUN_AI_TURN" }), 550);
    return () => window.clearTimeout(handle);
  }, [state.activePlayer, state.turn, state.winner]);

  return (
    <main className="appShell">
      <section className="topBar">
        <div>
          <p className="eyebrow">Text Card Mirror Simulator</p>
          <h1>{ARMED_DRAGON_DECK_NAME}</h1>
        </div>
        <div className="sourceBox">
          <span>40枚ミラー</span>
          <a href={ARMED_DRAGON_SOURCE_URL} target="_blank" rel="noreferrer">
            参照ページ
          </a>
        </div>
      </section>

      <section className="layout">
        <Board state={state} dispatch={dispatch} />
        <aside className="sideRail">
          <Controls state={state} dispatch={dispatch} />
          <DualRageChoicePanel state={state} dispatch={dispatch} />
          <DebugPanel state={state} dispatch={dispatch} />
          <section className="panel deckPanel" aria-label="Deck list">
            <div className="panelHeader">
              <h2>Deck</h2>
              <span>{DECK_TOTAL} cards</span>
            </div>
            <div className="deckList">
              {cards.map((card) => (
                <div className="deckRow" key={card.name}>
                  <span className="miniCost">{card.cost}</span>
                  <span>{card.name}</span>
                  <strong>x{card.count}</strong>
                </div>
              ))}
            </div>
          </section>
          <HelpIdPanel />
          <LogPanel logs={state.log} />
        </aside>
      </section>
    </main>
  );
}
