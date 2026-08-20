// Real coordinate-descent Elastic Net, extending lasso.ts's exact
// soft-thresholding solver with the added L2 term from elastic-net.mdx's
// own derivation (z += n*lambda*(1-alpha) in the denominator) -- same
// synthetic correlated-feature dataset as Ridge/Lasso, so all three
// pages' regularization paths are directly, honestly comparable.

import { generateData, FEATURE_NAMES, TRUE_W, TRUE_B, type Row, type Solution, type PathPoint } from './ridge';

export { generateData, FEATURE_NAMES, TRUE_W, TRUE_B };
export type { Row, Solution, PathPoint };

export const LAMBDA_MAX = 3;

function softThreshold(rho: number, lam: number): number {
  return Math.sign(rho) * Math.max(Math.abs(rho) - lam, 0);
}

export function elasticNetSolve(rows: Row[], lambda: number, alpha: number, epochs = 150): Solution {
  const n = rows.length;
  const d = rows[0].x.length;

  const xMean = new Array(d).fill(0);
  rows.forEach((r) => r.x.forEach((v, j) => { xMean[j] += v / n; }));
  const yMean = rows.reduce((s, r) => s + r.y, 0) / n;

  const Xc = rows.map((r) => r.x.map((v, j) => v - xMean[j]));
  const yc = rows.map((r) => r.y - yMean);

  const w: number[] = new Array(d).fill(0);
  const lamL1 = (lambda * alpha * n) / 2;
  const lamL2 = n * lambda * (1 - alpha);

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
      z += lamL2; // the L2 term's contribution to the denominator
      w[j] = z > 0 ? softThreshold(rho, lamL1) / z : 0;
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

export function regularizationPath(rows: Row[], alpha: number, steps = 30): PathPoint[] {
  const path: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const lambda = (i / steps) * LAMBDA_MAX;
    const { b, w } = elasticNetSolve(rows, lambda, alpha);
    path.push({ lambda, b, w, mse: mse(rows, b, w) });
  }
  return path;
}
