import type { Dispatch } from "react";
import { keywordLabel } from "../data/cards/keyword-labels";
import { getDualRageModeChoices } from "../engine/selectors";
import type { GameAction, GameState } from "../engine/types";

interface DualRageChoicePanelProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function DualRageChoicePanel({ state, dispatch }: DualRageChoicePanelProps) {
  if (!state.pendingDualRageChoice || state.pendingDualRageChoice.playerId !== "human") return null;

  return (
    <section className="panel dualChoicePanel" aria-label="Dual Rage choice">
      <div className="panelHeader">
        <h2>Dual Rage</h2>
        <span>α / β / γ</span>
      </div>
      <div className="dualChoiceGrid">
        {getDualRageModeChoices().map((card) => {
          const mode = card.id.endsWith("alpha") ? "alpha" : card.id.endsWith("beta") ? "beta" : "gamma";
          return (
            <article className="modeOption" key={card.id}>
              <strong>{card.name}</strong>
              <span>
                {card.attack}/{card.defense}
                {card.keywords?.length ? ` ${card.keywords.map(keywordLabel).join(", ")}` : ""}
              </span>
              <small>{card.text}</small>
              <button type="button" onClick={() => dispatch({ type: "CHOOSE_DUAL_MODE", mode })}>
                このカードを出す
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
