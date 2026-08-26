// Shared math for the Bandits diagram: real epsilon-greedy, UCB1, and
// Thompson Sampling simulations run against the same fixed 3-arm
// Bernoulli bandit, tracking real cumulative regret pull by pull -- not
// illustrative curves, an actual run of each algorithm's real update rule.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Three arms, true (unknown to the algorithms) reward probabilities.
export const TRUE_PROBS = [0.3, 0.5, 0.7];
export const OPTIMAL_PROB = Math.max(...TRUE_PROBS);
export const N_ARMS = TRUE_PROBS.length;

function pullArm(rand: () => number, arm: number): number {
  return rand() < TRUE_PROBS[arm] ? 1 : 0;
}

export interface RegretTrace {
  epsilonGreedy: number[];
  ucb1: number[];
  thompson: number[];
}

/** Runs all three strategies for `pulls` rounds against the same seeded
 * reward stream (each strategy gets its own independent draw stream, same
 * seed, so differences in regret come from the algorithm, not lucky
 * draws) and returns cumulative regret after every pull. */
export function simulateBandits(pulls: number, seed: number, epsilon = 0.1): RegretTrace {
  const epsilonGreedy = simulateEpsilonGreedy(pulls, seed, epsilon);
  const ucb1 = simulateUcb1(pulls, seed);
  const thompson = simulateThompson(pulls, seed);
  return { epsilonGreedy, ucb1, thompson };
}

function simulateEpsilonGreedy(pulls: number, seed: number, epsilon: number): number[] {
  const rand = mulberry32(seed);
  const counts = new Array(N_ARMS).fill(0);
  const sums = new Array(N_ARMS).fill(0);
  const regret: number[] = [];
  let cumRegret = 0;
  for (let t = 0; t < pulls; t++) {
    let arm: number;
    if (rand() < epsilon) {
      arm = Math.floor(rand() * N_ARMS);
    } else {
      arm = argmax(sums.map((s, i) => (counts[i] > 0 ? s / counts[i] : Infinity)));
    }
    const reward = pullArm(rand, arm);
    counts[arm]++;
    sums[arm] += reward;
    cumRegret += OPTIMAL_PROB - TRUE_PROBS[arm];
    regret.push(cumRegret);
  }
  return regret;
}

function simulateUcb1(pulls: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const counts = new Array(N_ARMS).fill(0);
  const sums = new Array(N_ARMS).fill(0);
  const regret: number[] = [];
  let cumRegret = 0;
  for (let t = 0; t < pulls; t++) {
    let arm: number;
    const unplayed = counts.findIndex((c) => c === 0);
    if (unplayed !== -1) {
      arm = unplayed; // play every arm once before trusting the bound
    } else {
      const ucbValues = sums.map((s, i) => s / counts[i] + Math.sqrt((2 * Math.log(t + 1)) / counts[i]));
      arm = argmax(ucbValues);
    }
    const reward = pullArm(rand, arm);
    counts[arm]++;
    sums[arm] += reward;
    cumRegret += OPTIMAL_PROB - TRUE_PROBS[arm];
    regret.push(cumRegret);
  }
  return regret;
}

function simulateThompson(pulls: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const alpha = new Array(N_ARMS).fill(1); // Beta(1,1) prior per arm
  const beta = new Array(N_ARMS).fill(1);
  const regret: number[] = [];
  let cumRegret = 0;
  for (let t = 0; t < pulls; t++) {
    const samples = alpha.map((a, i) => sampleBeta(rand, a, beta[i]));
    const arm = argmax(samples);
    const reward = pullArm(rand, arm);
    if (reward === 1) alpha[arm]++; else beta[arm]++;
    cumRegret += OPTIMAL_PROB - TRUE_PROBS[arm];
    regret.push(cumRegret);
  }
  return regret;
}

// Beta sampling via two Gamma draws (Marsaglia-Tsang), standard and exact
// -- not an approximation swapped in for convenience.
function sampleGamma(rand: () => number, shape: number): number {
  if (shape < 1) {
    const u = rand();
    return sampleGamma(rand, shape + 1) * Math.pow(u, 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do {
      const u1 = rand(), u2 = rand();
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // Box-Muller normal
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rand();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function sampleBeta(rand: () => number, a: number, b: number): number {
  const ga = sampleGamma(rand, a);
  const gb = sampleGamma(rand, b);
  return ga / (ga + gb);
}

function argmax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
  return best;
}
