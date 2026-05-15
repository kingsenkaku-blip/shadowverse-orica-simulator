import type { PlayerState } from "../engine/types";

interface PlayerPanelProps {
  player: PlayerState;
  active: boolean;
  winner?: boolean;
  armedLeftPlay?: number;
  armedDestroyed?: number;
  distinctArmedDestroyed?: number;
  revealedThisTurn?: boolean;
  destroyedFourKnights?: number;
  onLeaderClick?: () => void;
}

export function PlayerPanel({
  player,
  active,
  winner = false,
  armedLeftPlay,
  armedDestroyed,
  distinctArmedDestroyed,
  revealedThisTurn,
  destroyedFourKnights,
  onLeaderClick
}: PlayerPanelProps) {
  return (
    <button
      className={["playerPanel", active ? "active" : "", winner ? "winner" : ""].join(" ")}
      type="button"
      onClick={onLeaderClick}
      disabled={!onLeaderClick}
    >
      <div>
        <strong>{player.name}</strong>
        <span>{active ? "Active" : "Standby"}</span>
      </div>
      <div className="meterGroup">
        <Meter label="HP" value={player.health} max={player.maxHealth} tone="hp" />
        <Meter label="PP" value={player.pp} max={player.maxPp} tone="pp" />
      </div>
      <div className="playerStats">
        <span>EP {player.ep}</span>
        <span>Deck {player.deck.length}</span>
        <span>EX {player.extraDeck.length}</span>
        <span>場離れ武装 {armedLeftPlay ?? player.armedFollowersLeftPlay}</span>
        <span>破壊武装 {armedDestroyed ?? player.armedFollowersDestroyed}</span>
        <span>異名破壊 {distinctArmedDestroyed ?? player.distinctArmedFollowersDestroyed.length}</span>
        <span>Weapon {player.amulets?.length ?? player.pendingWeapons}</span>
        <span>公開 {revealedThisTurn ? "済" : "未"}</span>
        <span>四騎士破壊 {destroyedFourKnights ?? 0}</span>
        <span>{player.deckId}</span>
      </div>
    </button>
  );
}

function Meter({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const width = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meter">
      <div className="meterLabel">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="meterTrack">
        <span className={`meterFill ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
