import type { Dispatch } from "react";
import { canAttackFollower, canEvolve, findFollower, getArmedCountSummary, getArmedFollowersLeftPlay } from "../engine/selectors";
import type { GameAction, GameState, PlayerId } from "../engine/types";
import { CardView } from "./CardView";
import { Hand } from "./Hand";
import { PlayerPanel } from "./PlayerPanel";

interface BoardProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

export function Board({ state, dispatch }: BoardProps) {
  const selected = state.selectedAttackerId ? findFollower(state, state.selectedAttackerId) : undefined;
  const opponentCounts = getArmedCountSummary(state, "opponent");
  const humanCounts = getArmedCountSummary(state, "human");

  return (
    <section className="battleSurface" aria-label="Battlefield">
      <PlayerPanel
        player={state.players.opponent}
        active={state.activePlayer === "opponent"}
        winner={state.winner === "opponent"}
        armedLeftPlay={opponentCounts.leftPlay}
        armedDestroyed={opponentCounts.destroyed}
        distinctArmedDestroyed={opponentCounts.distinctDestroyedCount}
        onLeaderClick={() => dispatch({ type: "ATTACK_LEADER" })}
      />

      <FollowerRow
        owner="opponent"
        state={state}
        dispatch={dispatch}
        selectedAttackerId={state.selectedAttackerId}
      />

      <div className="centerLine">
        <span>
          {state.winner
            ? state.winner === "draw"
              ? "Draw"
              : `${state.players[state.winner].name} Win`
            : state.activePlayer === "human"
              ? selected
                ? `${selected.name} の攻撃先を選択`
                : "Your Action"
              : "AI Thinking"}
        </span>
      </div>

      <FollowerRow
        owner="human"
        state={state}
        dispatch={dispatch}
        selectedAttackerId={state.selectedAttackerId}
      />

      <PlayerPanel
        player={state.players.human}
        active={state.activePlayer === "human"}
        winner={state.winner === "human"}
        armedLeftPlay={humanCounts.leftPlay}
        armedDestroyed={humanCounts.destroyed}
        distinctArmedDestroyed={humanCounts.distinctDestroyedCount}
      />

      <Hand state={state} dispatch={dispatch} />
    </section>
  );
}

interface FollowerRowProps {
  owner: PlayerId;
  state: GameState;
  dispatch: Dispatch<GameAction>;
  selectedAttackerId?: string;
}

function FollowerRow({ owner, state, dispatch, selectedAttackerId }: FollowerRowProps) {
  const player = state.players[owner];
  const isHumanRow = owner === "human";
  const armedLeftPlay = getArmedFollowersLeftPlay(state, owner);

  return (
    <div className={`boardRow ${isHumanRow ? "humanBoard" : "opponentBoard"}`}>
      {player.board.length === 0 ? <div className="emptySlots">No followers</div> : null}
      {player.board.map((follower) => {
        const selected = follower.instanceId === selectedAttackerId;
        const canSelect = isHumanRow && canAttackFollower(state, follower);
        const canTarget = !isHumanRow && Boolean(selectedAttackerId);
        return (
          <CardView
            key={follower.instanceId}
            follower={follower}
            variant="board"
            selected={selected}
            canSelect={canSelect}
            canTarget={canTarget}
            canEvolve={isHumanRow && canEvolve(state, follower)}
            armedLeftPlay={armedLeftPlay}
            onSelect={() => {
              if (canSelect) dispatch({ type: "SELECT_ATTACKER", followerInstanceId: follower.instanceId });
              if (canTarget) dispatch({ type: "ATTACK_FOLLOWER", targetInstanceId: follower.instanceId });
            }}
            onEvolve={(mode) => dispatch({ type: "EVOLVE", followerInstanceId: follower.instanceId, mode })}
          />
        );
      })}
    </div>
  );
}
