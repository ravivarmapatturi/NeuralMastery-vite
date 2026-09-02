// Reciprocal Rank Fusion: combine ranked lists by each item's 1-indexed
// POSITION, not its raw (differently-scaled) score. Extracted from
// HybridSearchFusionDiagram.tsx so it can be unit-tested in isolation.

/** Standard default RRF constant. */
export const RRF_DEFAULT_K = 60;

/** A single ranking's contribution for an item at 1-indexed `rank`. */
export function rrfScoreForRank(rank: number, k: number = RRF_DEFAULT_K): number {
  return 1 / (k + rank);
}

export interface RrfResult {
  doc: string;
  score: number;
}

/** Fuse any number of ranked lists into one, sorted by summed RRF score
 * (descending). A doc absent from a given list contributes 0 from it. */
export function reciprocalRankFusion(rankings: string[][], k: number = RRF_DEFAULT_K): RrfResult[] {
  const docs = new Set<string>();
  for (const ranking of rankings) for (const doc of ranking) docs.add(doc);

  const scored = [...docs].map((doc) => {
    const score = rankings.reduce((sum, ranking) => {
      const idx = ranking.indexOf(doc);
      return idx === -1 ? sum : sum + rrfScoreForRank(idx + 1, k);
    }, 0);
    return { doc, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}
