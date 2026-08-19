// Shared math for the classical-interpretability diagrams (LIME's local
// surrogate fit, in particular) -- kept in one place so every diagram that
// perturbs-and-refits uses the identical "true model" and identical
// weighted-least-squares solver, rather than each component re-deriving it.

export function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A genuinely non-linear "black box": a smooth circular decision boundary. */
export function trueProb(x: number, y: number, r = 1.5, k = 3) {
  return 1 / (1 + Math.exp(-k * (r * r - x * x - y * y)));
}

function solve3(A: number[][], c: number[]): number[] {
  const M = A.map((row, i) => [...row, c[i]]);
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let cc = col; cc < 4; cc++) M[r][cc] -= f * M[col][cc];
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}

export interface LimeSample { x: number; y: number; prob: number; weight: number }

/** Perturb around (instX, instY) using `offsets`, score with the real
 * nonlinear model, weight by an RBF kernel, and fit a real weighted
 * linear regression prob ~ b0 + b1*x + b2*y via closed-form normal
 * equations -- the actual computation LIME performs, at toy scale. */
export function fitLocalLinear(instX: number, instY: number, offsets: { dx: number; dy: number }[], sigma: number) {
  const points: LimeSample[] = offsets.map(({ dx, dy }) => {
    const x = instX + dx;
    const y = instY + dy;
    const dist = Math.hypot(dx, dy);
    return { x, y, prob: trueProb(x, y), weight: Math.exp(-(dist * dist) / (2 * sigma * sigma)) };
  });
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const c = [0, 0, 0];
  for (const p of points) {
    const row = [1, p.x, p.y];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) A[i][j] += p.weight * row[i] * row[j];
      c[i] += p.weight * row[i] * p.prob;
    }
  }
  A[0][0] += 1e-6; A[1][1] += 1e-6; A[2][2] += 1e-6;
  const [b0, b1, b2] = solve3(A, c);
  return { points, b0, b1, b2 };
}

export function offsetsFromSeed(seed: number, n: number, spread = 1.1) {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, () => ({ dx: (rng() - 0.5) * spread * 2, dy: (rng() - 0.5) * spread * 2 }));
}
