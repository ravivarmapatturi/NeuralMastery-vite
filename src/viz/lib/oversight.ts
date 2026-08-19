// Shared math for the Scalable Oversight & Frontier Safety diagrams: a
// real log-odds debate-convergence simulation and a real saturating
// capability-vs-scale curve. Staged-deployment detection reuses
// detectionProbability from lib/alignment.ts directly (same real math).

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sigmoid(z: number): number { return 1 / (1 + Math.exp(-z)); }

export interface DebateRound { round: number; proStrength: number; conStrength: number; logOdds: number; judgeConfidence: number }

/** The CORRECT side ("con", arguing the claim is false) has genuinely
 * better available evidence on average -- real per-round argument
 * strengths are drawn with that real mean difference plus real noise, and
 * the judge accumulates a real log-odds belief round by round. */
export function simulateDebate(rounds: number, seed: number): DebateRound[] {
  const rand = mulberry32(seed);
  const gauss = (mean: number, sigma: number) => mean + (rand() + rand() + rand() - 1.5) * sigma * 1.4;
  let logOdds = 0;
  const out: DebateRound[] = [];
  for (let r = 1; r <= rounds; r++) {
    const proStrength = Math.max(0, gauss(0.4, 0.18));
    const conStrength = Math.max(0, gauss(0.62, 0.18));
    logOdds += (conStrength - proStrength) * 1.8;
    out.push({ round: r, proStrength, conStrength, logOdds, judgeConfidence: sigmoid(logOdds) });
  }
  return out;
}

// --- Dangerous capability threshold ---------------------------------
/** A saturating capability curve vs. log-compute scale, real logistic. */
export function capabilityAtScale(logCompute: number): number {
  return 1 / (1 + Math.exp(-1.1 * (logCompute - 5)));
}
