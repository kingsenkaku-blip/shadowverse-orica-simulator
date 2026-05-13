import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CARD_IDS } from "../data/cards/armed-dragon";
import type { FollowerInstance } from "../engine/types";
import { CardView } from "./CardView";

describe("CardView laevateinn mode choice", () => {
  it("shows only attack, defense, and blast normal modes when condition is met", () => {
    const html = renderToStaticMarkup(
      <CardView
        follower={laevateinn()}
        variant="board"
        canEvolve
        armedLeftPlay={4}
        onEvolve={() => undefined}
      />
    );

    expect(html).toContain("レーヴァテインドラゴン・アタックモード");
    expect(html).toContain("レーヴァテインドラゴン・ディフェンスモード");
    expect(html).toContain("レーヴァテインドラゴン・ブラストモード");
    expect(html).not.toContain("デュアル");
    expect(html).not.toContain("dual-mode");
  });

  it("does not show normal mode choices before four armed followers have left play", () => {
    const html = renderToStaticMarkup(
      <CardView
        follower={laevateinn()}
        variant="board"
        canEvolve
        armedLeftPlay={3}
        onEvolve={() => undefined}
      />
    );

    expect(html).not.toContain("このモードに進化");
    expect(html).toContain("Evolve");
  });

  it("shows free evolve label for free-evolve laevateinn below mode threshold", () => {
    const follower = laevateinn();
    follower.freeEvolve = true;
    const html = renderToStaticMarkup(
      <CardView
        follower={follower}
        variant="board"
        canEvolve
        armedLeftPlay={0}
        onEvolve={() => undefined}
      />
    );

    expect(html).toContain("0EP進化可");
  });

  it("renders keyword labels in Japanese", () => {
    const follower = laevateinn();
    follower.keywords = ["rush", "ward", "storm"];
    const html = renderToStaticMarkup(<CardView follower={follower} variant="board" />);

    expect(html).toContain("突進");
    expect(html).toContain("守護");
    expect(html).toContain("疾走");
    expect(html).not.toContain(">rush<");
    expect(html).not.toContain(">ward<");
    expect(html).not.toContain(">storm<");
  });
});

function laevateinn(): FollowerInstance {
  return {
    instanceId: "laeva",
    definitionId: CARD_IDS.laevateinnDragon,
    sourceDefinitionId: CARD_IDS.laevateinnDragon,
    owner: "human",
    name: "レーヴァテインドラゴン",
    attack: 5,
    defense: 5,
    maxDefense: 5,
    traits: ["armed", "laevateinn"],
    keywords: [],
    evolved: false,
    canAttackLeader: false,
    canAttackFollowers: false,
    hasAttacked: false,
    attacksThisTurn: 0,
    maxAttacksPerTurn: 1,
    freeEvolve: false,
    buffTriggersUsed: []
  };
}
