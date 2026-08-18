// Real temperature / top-k / top-p sampling math over a small fixed set of
// candidate next-tokens, for the LLM Inference Flow Visualizer's sampling
// playground. The logits themselves are illustrative (a plausible-looking
// completion of "the cat sat on the ___"), but softmax, temperature scaling,
// top-k truncation, and top-p (nucleus) truncation below are the real formulas.

export interface Candidate {
  token: string;
  baseLogit: number;
}

export interface DistributionEntry extends Candidate {
  prob: number;
  keptByTopK: boolean;
  keptByTopP: boolean;
  finalProb: number;
}

export const CANDIDATES: Candidate[] = [
  { token: 'mat', baseLogit: 4.8 },
  { token: 'chair', baseLogit: 3.9 },
  { token: 'table', baseLogit: 3.1 },
  { token: 'floor', baseLogit: 2.0 },
  { token: 'roof', baseLogit: 1.2 },
  { token: 'moon', baseLogit: -0.5 },
];

function softmax(xs: number[]): number[] {
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Computes the final sampling distribution for the fixed candidate set.
 * Returns each candidate with its post-temperature probability, whether
 * top-k kept it, whether top-p kept it, and its final (renormalized) prob.
 */
export function computeDistribution(temperature: number, topK: number, topP: number): DistributionEntry[] {
  const logits = CANDIDATES.map((c) => c.baseLogit);
  const scaled = logits.map((l) => l / Math.max(temperature, 0.05));
  const probs = softmax(scaled);

  const withProb = CANDIDATES.map((c, i) => ({ ...c, prob: probs[i] }));
  const ranked = [...withProb].sort((a, b) => b.prob - a.prob);

  const topKSet = new Set(ranked.slice(0, topK).map((r) => r.token));

  let cumulative = 0;
  const topPSet = new Set<string>();
  for (const r of ranked) {
    if (cumulative >= topP) break;
    topPSet.add(r.token);
    cumulative += r.prob;
  }

  const kept = withProb.map((c) => ({
    ...c,
    keptByTopK: topKSet.has(c.token),
    keptByTopP: topPSet.has(c.token),
  }));

  const survivors = kept.filter((c) => c.keptByTopK && c.keptByTopP);
  const survivorSum = survivors.reduce((s, c) => s + c.prob, 0) || 1;

  return kept.map((c) => ({
    ...c,
    finalProb: c.keptByTopK && c.keptByTopP ? c.prob / survivorSum : 0,
  }));
}
