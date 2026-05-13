import { CARD_IDS, getCardDefinition } from "../data/cards/armed-dragon";
import { keywordLabel } from "../data/cards/keyword-labels";
import { effectiveCost, getLaevateinnNormalModeChoices } from "../engine/selectors";
import type { CardInstance, FollowerInstance, LaevateinnMode } from "../engine/types";

interface CardViewProps {
  card?: CardInstance;
  follower?: FollowerInstance;
  variant: "hand" | "board";
  playable?: boolean;
  selected?: boolean;
  canSelect?: boolean;
  canTarget?: boolean;
  canEvolve?: boolean;
  armedLeftPlay?: number;
  playErrors?: string[];
  onPlay?: () => void;
  onSelect?: () => void;
  onEvolve?: (mode: LaevateinnMode) => void;
}

export function CardView({
  card,
  follower,
  variant,
  playable = false,
  selected = false,
  canSelect = false,
  canTarget = false,
  canEvolve = false,
  armedLeftPlay = 0,
  playErrors = [],
  onPlay,
  onSelect,
  onEvolve
}: CardViewProps) {
  const definition = getCardDefinition(card?.definitionId ?? follower?.definitionId ?? CARD_IDS.draconicWeapon);
  const cost = card ? effectiveCost(card) : definition.cost;
  const attack = follower?.attack ?? definition.attack;
  const defense = follower?.defense ?? definition.defense;
  const traits = follower?.traits ?? definition.traits;
  const keywords = follower?.keywords ?? definition.keywords ?? [];
  const implementedClass = definition.implemented === "todo" ? "todo" : definition.implemented;
  const isLaevateinn = follower?.definitionId === CARD_IDS.laevateinnDragon;
  const showModeChoice = isLaevateinn && canEvolve && armedLeftPlay >= 4;
  const modeChoices = showModeChoice ? getLaevateinnNormalModeChoices() : [];

  return (
    <article
      className={[
        "card",
        `card-${variant}`,
        selected ? "selected" : "",
        playable ? "playable" : "",
        canTarget ? "targetable" : "",
        implementedClass
      ].join(" ")}
      onClick={variant === "board" ? onSelect : undefined}
    >
      <div className="cardTop">
        <span className="costBadge">{cost}</span>
        <h3>{follower?.name ?? definition.name}</h3>
      </div>
      <div className="tagLine">
        {traits.map((trait) => (
          <span key={trait}>{trait}</span>
        ))}
      </div>
      <p className="cardText">{definition.text}</p>
      {keywords.length > 0 ? (
        <div className="keywordLine">
          {keywords.map((keyword) => (
            <span key={keyword}>{keywordLabel(keyword)}</span>
          ))}
        </div>
      ) : null}
      {attack !== undefined && defense !== undefined ? (
        <div className="stats">
          <span>{attack}</span>
          <span>{defense}</span>
        </div>
      ) : null}
      {playErrors.length > 0 ? (
        <ul className="playErrors">
          {playErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      {variant === "hand" ? (
        <button className="cardButton" type="button" disabled={!playable} onClick={onPlay}>
          Play
        </button>
      ) : null}
      {variant === "board" && canSelect ? (
        <button className="cardButton" type="button" onClick={onSelect}>
          Attack
        </button>
      ) : null}
      {variant === "board" && canTarget ? (
        <button className="cardButton danger" type="button" onClick={onSelect}>
          Target
        </button>
      ) : null}
      {variant === "board" && canEvolve ? (
        <div className="evolveButtons">
          {showModeChoice ? (
            <div className="modeChoice" data-testid="normal-laevateinn-mode-choice">
              {modeChoices.map((choice) => (
                <div className="modeOption" key={choice.id}>
                  <strong>{choice.name}</strong>
                  <span>
                    {choice.attack}/{choice.defense}
                    {choice.keywords?.length ? ` ${choice.keywords.map(keywordLabel).join(", ")}` : ""}
                  </span>
                  <small>{choice.text}</small>
                  <button type="button" onClick={() => onEvolve?.(choice.mode ?? "base")}>
                    このモードに進化
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => onEvolve?.("base")}>
              {follower?.freeEvolve ? "0EP進化可" : "Evolve"}
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}
