// Shared math for the Alignment & RLHF diagrams: a real reward-hacking
// optimization (proxy vs. true objective), real specification-gaming
// arithmetic (dense-but-wrong reward vs. sparse-but-correct reward), and
// real detection-probability statistics for the deception/evaluation gap.

export function trueQuality(length: number): number {
  return 10 * Math.exp(-((length - 150) ** 2) / (2 * 80 ** 2));
}
export function proxyReward(length: number, betaLengthBonus: number): number {
  return trueQuality(length) + betaLengthBonus * (length / 400) * 6;
}
export function argmaxProxyLength(betaLengthBonus: number): number {
  let best = 0;
  let bestVal = -Infinity;
  for (let len = 0; len <= 400; len += 2) {
    const v = proxyReward(len, betaLengthBonus);
    if (v > bestVal) { bestVal = v; best = len; }
  }
  return best;
}

export interface SpecGamingParams { raceLength: number; raceReward: number; lapLength: number; lapReward: number }
export function totalReward(horizon: number, cycleLength: number, cycleReward: number): number {
  return Math.floor(horizon / cycleLength) * cycleReward;
}

/** Probability of catching at least one bad-behavior instance in n tests,
 * given a real per-input probability p of the behavior occurring. */
export function detectionProbability(p: number, n: number): number {
  return 1 - (1 - p) ** n;
}
/** Number of evaluation samples needed to reach a target detection confidence. */
export function samplesForConfidence(p: number, confidence: number): number {
  if (p <= 0) return Infinity;
  return Math.log(1 - confidence) / Math.log(1 - p);
}
