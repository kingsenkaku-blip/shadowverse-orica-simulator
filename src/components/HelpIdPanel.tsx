import { HELP_IDS, getCardById } from "../data/cards/armed-dragon";

const categoryLabels = {
  "normal-laevateinn": "normal-laevateinn",
  "dual-rage": "dual-rage",
  "armed-dragon": "armed-dragon",
  "royal-f-reveal": "royal-f-reveal",
  "royal-f-four-knights": "royal-f-four-knights",
  "royal-f-token": "royal-f-token"
} as const;

export function HelpIdPanel() {
  return (
    <section className="panel helpIdPanel" aria-label="help-id">
      <div className="panelHeader">
        <h2>help-id</h2>
        <span>IDs</span>
      </div>
      {Object.entries(HELP_IDS)
        .filter(([, ids]) => ids.length > 0)
        .map(([category, ids]) => (
          <div className="helpGroup" key={category}>
            <h3>{categoryLabels[category as keyof typeof categoryLabels]}</h3>
            <ul>
              {ids.map((id) => {
                const card = getCardById(id);
                return (
                  <li key={id}>
                    <code>{id}</code>
                    <span>{card ? `${card.name} / ${card.implemented}` : "missing-effect"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </section>
  );
}
