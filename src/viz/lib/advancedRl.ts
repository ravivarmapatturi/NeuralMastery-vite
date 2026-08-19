// Shared math for the Advanced RL diagrams: a real Monte Carlo
// demonstration of Q-learning's overestimation bias (and TD3's twin-critic
// fix), real policy entropy for SAC's exploration bonus, a real polynomial
// regression showing offline-RL extrapolation error, and a real
// random-walk simulation of behavioral cloning's compounding error.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Irwin-Hall approximation to a standard normal via sum of uniforms.
function gaussian(rand: () => number, sigma: number): number {
  const u = rand() + rand() + rand() - 1.5; // mean 0, roughly bell-shaped
  return u * sigma * 1.6;
}

// --- TD3: overestimation bias, single critic vs. twin critics -----------
const ACTIONS = Array.from({ length: 21 }, (_, i) => -1 + (i / 20) * 2);
export function trueQ(a: number): number { return 1 - (a - 0.3) ** 2; }

export function overestimationBiasSimulation(trials: number, seed: number) {
  const rand = mulberry32(seed);
  let singleEstSum = 0, singleTrueSum = 0, twinEstSum = 0, twinTrueSum = 0;
  for (let trial = 0; trial < trials; trial++) {
    const noisy1 = ACTIONS.map((a) => trueQ(a) + gaussian(rand, 0.3));
    const noisy2 = ACTIONS.map((a) => trueQ(a) + gaussian(rand, 0.3));

    let bestSingle = 0;
    for (let i = 1; i < ACTIONS.length; i++) if (noisy1[i] > noisy1[bestSingle]) bestSingle = i;
    singleEstSum += noisy1[bestSingle];
    singleTrueSum += trueQ(ACTIONS[bestSingle]);

    const twinMin = ACTIONS.map((_, i) => Math.min(noisy1[i], noisy2[i]));
    let bestTwin = 0;
    for (let i = 1; i < ACTIONS.length; i++) if (twinMin[i] > twinMin[bestTwin]) bestTwin = i;
    twinEstSum += twinMin[bestTwin];
    twinTrueSum += trueQ(ACTIONS[bestTwin]);
  }
  return {
    single: { est: singleEstSum / trials, true: singleTrueSum / trials },
    twin: { est: twinEstSum / trials, true: twinTrueSum / trials },
    trueOptimal: Math.max(...ACTIONS.map(trueQ)),
  };
}

// --- SAC: real entropy + expected-value trade-off ------------------------
export function entropy(probs: number[]): number {
  return -probs.reduce((s, p) => s + (p > 0 ? p * Math.log(p) : 0), 0);
}
export function expectedValue(probs: number[], values: number[]): number {
  return probs.reduce((s, p, i) => s + p * values[i], 0);
}

// --- Offline RL: polynomial regression + extrapolation error ------------
function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** Real least-squares polynomial fit via normal equations. */
export function polyFit(xs: number[], ys: number[], degree: number): number[] {
  const n = degree + 1;
  const A = Array.from({ length: n }, () => Array(n).fill(0));
  const b = Array(n).fill(0);
  for (let i = 0; i < xs.length; i++) {
    const powers = Array.from({ length: n }, (_, k) => xs[i] ** k);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) A[r][c] += powers[r] * powers[c];
      b[r] += powers[r] * ys[i];
    }
  }
  return solveLinear(A, b);
}
export function evalPoly(coeffs: number[], x: number): number {
  return coeffs.reduce((s, c, k) => s + c * x ** k, 0);
}

// --- Behavioral cloning: real compounding-error random walk -------------
export function compoundingErrorTrace(steps: number, seed: number, sigma: number) {
  const rand = mulberry32(seed);
  const noise = Array.from({ length: steps }, () => gaussian(rand, sigma));
  let cumulative = 0;
  const compounding = noise.map((n) => (cumulative += n));
  const corrected = noise.slice(); // expert-corrected each step: error never accumulates
  return { compounding, corrected };
}
