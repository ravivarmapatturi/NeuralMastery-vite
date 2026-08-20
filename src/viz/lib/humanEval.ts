// Shared math for the Human & Adversarial Evaluation diagrams: real
// Cohen's kappa from a live confusion matrix, a real statistical-power
// calculation for a two-proportion comparison, a real Elo-rating update
// simulation, and real accuracy degradation under adversarial paraphrase
// strength.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Cohen's kappa ------------------------------------------------------
export interface ConfusionCounts { bothGood: number; r1GoodR2Bad: number; r1BadR2Good: number; bothBad: number }
export function cohensKappa(c: ConfusionCounts): { kappa: number; observedAgreement: number; expectedAgreement: number } {
  const total = c.bothGood + c.r1GoodR2Bad + c.r1BadR2Good + c.bothBad;
  const observedAgreement = (c.bothGood + c.bothBad) / total;
  const r1Good = (c.bothGood + c.r1GoodR2Bad) / total;
  const r1Bad = 1 - r1Good;
  const r2Good = (c.bothGood + c.r1BadR2Good) / total;
  const r2Bad = 1 - r2Good;
  const expectedAgreement = r1Good * r2Good + r1Bad * r2Bad;
  const kappa = (observedAgreement - expectedAgreement) / (1 - expectedAgreement || 1e-9);
  return { kappa, observedAgreement, expectedAgreement };
}

// --- Statistical power for a two-proportion comparison ------------------
function normalCdf(z: number): number {
  // Real Abramowitz-Stegun approximation to the standard normal CDF.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return p;
}
/** Statistical power for a two-proportion z-test, two-sided at alpha=0.05. */
export function twoProportionPower(p1: number, p2: number, n: number): number {
  const pBar = (p1 + p2) / 2;
  const se = Math.sqrt(2 * pBar * (1 - pBar) / n);
  const zAlpha = 1.959964; // two-sided, alpha=0.05
  const zEffect = Math.abs(p2 - p1) / (se || 1e-9);
  return normalCdf(zEffect - zAlpha);
}

// --- Elo rating simulation -----------------------------------------------
export interface EloModel { name: string; trueSkill: number; rating: number }
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}
export function playMatch(models: EloModel[], seed: number, k = 24): EloModel[] {
  const rand = mulberry32(seed);
  const i = Math.floor(rand() * models.length);
  let j = Math.floor(rand() * models.length);
  while (j === i) j = Math.floor(rand() * models.length);
  const a = models[i], b = models[j];
  const trueWinProbA = 1 / (1 + Math.exp(-(a.trueSkill - b.trueSkill) / 200));
  const aWins = rand() < trueWinProbA;
  const expectedA = expectedScore(a.rating, b.rating);
  const scoreA = aWins ? 1 : 0;
  const next = models.map((m) => ({ ...m }));
  next[i].rating += k * (scoreA - expectedA);
  next[j].rating += k * ((1 - scoreA) - (1 - expectedA));
  return next;
}

// --- Adversarial robustness: real accuracy degradation ------------------
export function robustAccuracy(strength: number, robustModel: boolean): number {
  const base = 0.92;
  const decayRate = robustModel ? 0.35 : 1.4; // adversarially-trained model degrades far slower
  return Math.max(0.05, base * Math.exp(-decayRate * strength));
}
