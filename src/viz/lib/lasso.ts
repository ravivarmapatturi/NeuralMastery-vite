// Real coordinate-descent Lasso with soft-thresholding, matching
// lasso-regression.md's own derivation and Python implementation exactly
// (including the lambda*n/2 scaling), reusing the same synthetic
// correlated-feature dataset as ridge.ts so the two pages' regularization
// paths are directly, honestly comparable -- same data, same lambda range.

import { generateData, FEATURE_NAMES, TRUE_W, TRUE_B, type Row, type Solution, type PathPoint } from './ridge';

export { generateData, FEATURE_NAMES, TRUE_W, TRUE_B };
export type { Row, Solution, PathPoint };

export const LAMBDA_MAX = 3;

function softThreshold(rho: number, lam: number): number {
  return Math.sign(rho) * Math.max(Math.abs(rho) - lam, 0);
}

/** Real coordinate descent: centers the data, then updates one weight at a
 * time via the closed-form soft-thresholding rule until convergence. */
export function lassoSolve(rows: Row[], lambda: number, epochs = 150): Solution {
  const n = rows.length;
  const d = rows[0].x.length;

  const xMean = new Array(d).fill(0);
  rows.forEach((r) => r.x.forEach((v, j) => { xMean[j] += v / n; }));
  const yMean = rows.reduce((s, r) => s + r.y, 0) / n;

  const Xc = rows.map((r) => r.x.map((v, j) => v - xMean[j]));
  const yc = rows.map((r) => r.y - yMean);

  const w: number[] = new Array(d).fill(0);
  const lamScaled = (lambda * n) / 2;

  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let j = 0; j < d; j++) {
      let rho = 0;
      let z = 0;
      for (let i = 0; i < n; i++) {
        let pred = 0;
        for (let k = 0; k < d; k++) pred += Xc[i][k] * w[k];
        const residual = yc[i] - pred + w[j] * Xc[i][j];
        rho += Xc[i][j] * residual;
        z += Xc[i][j] * Xc[i][j];
      }
      w[j] = z > 0 ? softThreshold(rho, lamScaled) / z : 0;
    }
  }

  const b = yMean - w.reduce((s, wj, j) => s + wj * xMean[j], 0);
  return { w, b };
}

export function mse(rows: Row[], b: number, w: number[]): number {
  let sum = 0;
  rows.forEach((r) => {
    const pred = b + r.x.reduce((s, xi, j) => s + w[j] * xi, 0);
    sum += (pred - r.y) ** 2;
  });
  return sum / rows.length;
}

export function regularizationPath(rows: Row[], steps = 30): PathPoint[] {
  const path: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const lambda = (i / steps) * LAMBDA_MAX;
    const { b, w } = lassoSolve(rows, lambda);
    path.push({ lambda, b, w, mse: mse(rows, b, w) });
  }
  return path;
}
