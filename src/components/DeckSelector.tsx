import { DECK_OPTIONS } from "../data/decks";
import type { DeckId } from "../engine/types";

interface DeckSelectorProps {
  label: string;
  value: DeckId;
  onChange: (value: DeckId) => void;
}

export function DeckSelector({ label, value, onChange }: DeckSelectorProps) {
  return (
    <label className="seedInput">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as DeckId)}>
        {DECK_OPTIONS.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name} ({deck.total})
          </option>
        ))}
      </select>
    </label>
  );
}
