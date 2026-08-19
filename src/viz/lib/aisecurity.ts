// Shared math for the AI Security diagrams: real layered-defense
// detection probability, real membership-inference confidence
// distributions (and differential-privacy noise reducing separability),
// a real model-extraction fidelity learning curve, a real 2D adversarial
// decision-boundary crossing, and real backdoor-trigger detection odds
// under random black-box testing.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Defense in depth: independent layers, combined catch probability --
export function combinedCatchProbability(layerCatchRates: number[]): number {
  const missAll = layerCatchRates.reduce((prod, p) => prod * (1 - p), 1);
  return 1 - missAll;
}

// --- Membership inference: confidence distributions -----------------
function gaussianSample(rand: () => number, mean: number, sigma: number): number {
  return mean + (rand() + rand() + rand() - 1.5) * sigma * 1.4;
}
export function memberConfidenceSamples(n: number, seed: number, gap: number, noise: number): { member: number[]; nonMember: number[] } {
  const rand = mulberry32(seed);
  const member = Array.from({ length: n }, () => Math.min(1, Math.max(0, gaussianSample(rand, 0.5 + gap / 2, 0.12 + noise))));
  const nonMember = Array.from({ length: n }, () => Math.min(1, Math.max(0, gaussianSample(rand, 0.5 - gap / 2, 0.12 + noise))));
  return { member, nonMember };
}
export function classificationRatesAtThreshold(member: number[], nonMember: number[], threshold: number) {
  const tpr = member.filter((v) => v >= threshold).length / member.length;
  const fpr = nonMember.filter((v) => v >= threshold).length / nonMember.length;
  return { tpr, fpr };
}

// --- Model extraction: surrogate fidelity vs. query budget -----------
export function surrogateFidelity(queries: number): number {
  return 1 - Math.exp(-queries / 4000);
}

// --- Adversarial perturbation: real 2D quadratic boundary -------------
export function classifierScore(x: number, y: number): number {
  return x * x + y * y - 1.6; // decision boundary at score=0, a circle
}
export function classify(x: number, y: number): 0 | 1 {
  return classifierScore(x, y) > 0 ? 1 : 0;
}
export function gradient(x: number, y: number): [number, number] {
  return [2 * x, 2 * y];
}

// --- Backdoor trigger: random black-box testing detection odds --------
export function triggerDetectionProbability(triggerSpaceSize: number, testsRun: number): number {
  const p = 1 / triggerSpaceSize;
  return 1 - (1 - p) ** testsRun;
}
