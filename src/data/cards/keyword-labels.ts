import type { Keyword } from "../../engine/types";

const KEYWORD_LABELS: Record<Keyword, string> = {
  rush: "突進",
  ward: "守護",
  storm: "疾走",
  bane: "必殺"
};

export function keywordLabel(keyword: Keyword): string {
  return KEYWORD_LABELS[keyword] ?? keyword;
}
