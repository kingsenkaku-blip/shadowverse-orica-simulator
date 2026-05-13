import type { Dispatch } from "react";
import type { GameAction, GameState } from "../engine/types";
import { canPlayCard, getDualRagePlayErrors } from "../engine/selectors";
import { CardView } from "./CardView";
import { CARD_IDS } from "../data/cards/armed-dragon";

interface HandProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function Hand({ state, dispatch }: HandProps) {
  const player = state.players.human;
  return (
    <section className="handPanel" aria-label="Hand">
      <div className="panelHeader">
        <h2>Hand</h2>
        <span>{player.hand.length}/9</span>
      </div>
      <div className="handScroller">
        {player.hand.map((card) => (
          <CardView
            key={card.instanceId}
            card={card}
            variant="hand"
            playable={canPlayCard(state, "human", card)}
            playErrors={card.definitionId === CARD_IDS.dualRage ? getDualRagePlayErrors(state, "human") : []}
            onPlay={() => dispatch({ type: "PLAY_CARD", cardInstanceId: card.instanceId })}
          />
        ))}
      </div>
    </section>
  );
}
