function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Synthetic validation-score surface over (x, y) in [0,1]^2, where x is
 * the hyperparameter that actually matters (a single real peak) and y is
 * effectively irrelevant (near-flat) -- the exact "only a few hyperparameters
 * really matter" setup Bergstra & Bengio's analysis found empirically. */
export function score(x: number, y: number): number {
  const important = Math.exp(-((x - 0.62) ** 2) / 0.03);
  const irrelevant = 0.03 * Math.sin(y * 9);
  return important + irrelevant;
}

export interface SamplePoint {
  x: number;
  y: number;
  s: number;
}

/** A k x k grid over [0,1]^2 -- k^2 total evaluations, but only k distinct
 * x-values ever get tried, no matter how large k is. */
export function gridSamples(k: number): SamplePoint[] {
  const pts: SamplePoint[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const x = (i + 0.5) / k;
      const y = (j + 0.5) / k;
      pts.push({ x, y, s: score(x, y) });
    }
  }
  return pts;
}

/** n independent uniform-random draws -- same budget as gridSamples(k) when
 * n = k^2, but every draw is a distinct x-value. */
export function randomSamples(n: number, seed: number): SamplePoint[] {
  const rand = mulberry32(seed);
  const pts: SamplePoint[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand();
    const y = rand();
    pts.push({ x, y, s: score(x, y) });
  }
  return pts;
}

/** A simplified but real sequential Bayesian-optimization loop: start from
 * a handful of random points, then repeatedly evaluate a coarse Expected
 * Improvement surrogate (nearest-neighbor mean + distance-based
 * uncertainty, standing in for a full Gaussian Process posterior) over a
 * candidate grid and pick the argmax -- same exploration/exploitation
 * shape as real EI (mu - best) + kappa * sigma, just without a real GP's
 * covariance kernel machinery. */
export function bayesianSamples(n: number, seed: number): SamplePoint[] {
  const rand = mulberry32(seed);
  const pts: SamplePoint[] = [];
  const nInit = Math.min(3, n);
  for (let i = 0; i < nInit; i++) {
    const x = rand();
    const y = rand();
    pts.push({ x, y, s: score(x, y) });
  }
  const candidates = 25;
  while (pts.length < n) {
    let best = pts[0];
    let bestAcq = -Infinity;
    const bestSoFar = Math.max(...pts.map((p) => p.s));
    for (let c = 0; c < candidates; c++) {
      const cx = rand();
      const cy = rand();
      let nearestD = Infinity;
      let nearestS = 0;
      for (const p of pts) {
        const d = Math.hypot(cx - p.x, cy - p.y);
        if (d < nearestD) {
          nearestD = d;
          nearestS = p.s;
        }
      }
      const mu = nearestS; // crude posterior mean: nearest observed value
      const sigma = Math.min(1, nearestD * 2); // crude posterior uncertainty: grows with distance from data
      const acq = (mu - bestSoFar) + 1.5 * sigma; // Expected-Improvement-shaped: exploit high mu, explore high sigma
      if (acq > bestAcq) {
        bestAcq = acq;
        best = { x: cx, y: cy, s: score(cx, cy) };
      }
    }
    pts.push(best);
  }
  return pts;
}
