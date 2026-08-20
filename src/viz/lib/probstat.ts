// Shared math for the Probability & Statistics diagrams: real PMF/PDF
// evaluation, a real Bayesian update, real MLE vs. MAP estimates, a real
// Monte Carlo Central Limit Theorem simulation, a real permutation-test
// p-value, a real bootstrap resample, a real confounder simulation, and
// real entropy/cross-entropy/KL computations.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Distributions --------------------------------------------------
export function gaussianPdf(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
}
export function binomialPmf(k: number, n: number, p: number): number {
  function choose(n: number, k: number) {
    let r = 1;
    for (let i = 0; i < k; i++) r *= (n - i) / (i + 1);
    return r;
  }
  return choose(n, k) * p ** k * (1 - p) ** (n - k);
}

// --- Bayes' theorem --------------------------------------------------
export function bayesUpdate(prior: number, likelihoodGivenTrue: number, likelihoodGivenFalse: number): number {
  const evidence = likelihoodGivenTrue * prior + likelihoodGivenFalse * (1 - prior);
  return (likelihoodGivenTrue * prior) / (evidence || 1e-12);
}

// --- MLE vs. MAP for a coin bias ---------------------------------------
export function mleEstimate(heads: number, flips: number): number {
  return flips === 0 ? 0.5 : heads / flips;
}
/** MAP with a Beta(alpha, alpha) symmetric prior around 0.5 -- real
 * closed-form posterior mode for Bernoulli + Beta conjugate prior. */
export function mapEstimate(heads: number, flips: number, priorStrength: number): number {
  return (heads + priorStrength) / (flips + 2 * priorStrength);
}

// --- Central Limit Theorem: real Monte Carlo sampling -------------------
/** Skewed source distribution: exponential-like via -ln(uniform). */
function skewedSample(rand: () => number): number { return -Math.log(1 - rand() * 0.999); }
export function cltSampleMeans(batchSize: number, numBatches: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const means: number[] = [];
  for (let b = 0; b < numBatches; b++) {
    let sum = 0;
    for (let i = 0; i < batchSize; i++) sum += skewedSample(rand);
    means.push(sum / batchSize);
  }
  return means;
}

// --- Hypothesis testing: real permutation test ---------------------------
export function generateGroups(seed: number, nA: number, nB: number, meanA: number, meanB: number, sigma: number) {
  const rand = mulberry32(seed);
  const gauss = (mu: number) => mu + (rand() + rand() + rand() - 1.5) * sigma * 1.4;
  return { groupA: Array.from({ length: nA }, () => gauss(meanA)), groupB: Array.from({ length: nB }, () => gauss(meanB)) };
}
export function permutationTest(groupA: number[], groupB: number[], numPermutations: number, seed: number) {
  const rand = mulberry32(seed);
  const meanDiff = (a: number[], b: number[]) => a.reduce((s, v) => s + v, 0) / a.length - b.reduce((s, v) => s + v, 0) / b.length;
  const observed = meanDiff(groupA, groupB);
  const pooled = [...groupA, ...groupB];
  const nA = groupA.length;
  const permutedDiffs: number[] = [];
  for (let p = 0; p < numPermutations; p++) {
    const shuffled = pooled.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    permutedDiffs.push(meanDiff(shuffled.slice(0, nA), shuffled.slice(nA)));
  }
  const asExtreme = permutedDiffs.filter((d) => Math.abs(d) >= Math.abs(observed)).length;
  return { observed, permutedDiffs, pValue: asExtreme / numPermutations };
}

// --- Bootstrap ---------------------------------------------------------
export function bootstrapResample(data: number[], statistic: (xs: number[]) => number, numResamples: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const results: number[] = [];
  for (let r = 0; r < numResamples; r++) {
    const resample = Array.from({ length: data.length }, () => data[Math.floor(rand() * data.length)]);
    results.push(statistic(resample));
  }
  return results;
}
export function median(xs: number[]): number {
  const sorted = xs.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// --- Confounder simulation ------------------------------------------
export function confounderSimulation(seed: number, n: number) {
  const rand = mulberry32(seed);
  const gauss = () => (rand() + rand() + rand() - 1.5) * 1.4;
  // Observational: confounder Z drives both X and Y -- creates spurious X-Y correlation.
  const obs = Array.from({ length: n }, () => {
    const z = gauss();
    const x = z + gauss() * 0.5;
    const y = z + gauss() * 0.5;
    return { x, y };
  });
  // RCT: X is randomly assigned, independent of Z -- breaks the spurious link.
  const rct = Array.from({ length: n }, () => {
    const z = gauss();
    const x = rand() < 0.5 ? -1 : 1; // random assignment
    const y = 0.1 * x + z + gauss() * 0.5; // tiny real causal effect of x, dominated by z's noise
    return { x, y };
  });
  return { obs, rct };
}
export function pearsonR(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; num += dx * dy; dx2 += dx * dx; dy2 += dy * dy; }
  return num / (Math.sqrt(dx2 * dy2) || 1);
}

// --- Entropy, cross-entropy, KL divergence -------------------------------
export function entropy(p: number[]): number { return -p.reduce((s, x) => s + (x > 0 ? x * Math.log2(x) : 0), 0); }
export function crossEntropy(p: number[], q: number[]): number { return -p.reduce((s, x, i) => s + (x > 0 ? x * Math.log2(q[i] || 1e-9) : 0), 0); }
export function klDivergence(p: number[], q: number[]): number { return crossEntropy(p, q) - entropy(p); }
