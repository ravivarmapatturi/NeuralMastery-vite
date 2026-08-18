// Real multi-feature ridge regression, from scratch: a hand-written
// Gauss-Jordan matrix inverse (no linear-algebra library) computes the real
// closed-form ridge solution w(lambda) = (X^TX + lambda*P)^-1 X^Ty for a
// small synthetic dataset with two deliberately correlated features -- the
// exact instability ridge-regression.md describes, made visible instead of
// just asserted.

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
function gaussian(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-6);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export interface Row {
  x: number[];
  y: number;
}

export interface Solution {
  b: number;
  w: number[];
}

export interface PathPoint extends Solution {
  lambda: number;
  mse: number;
}

export const FEATURE_NAMES = ['x1', 'x2', 'x3', 'x4'];
export const TRUE_W = [3, 3, 0, 1.5];
export const TRUE_B = 10;
export const LAMBDA_MAX = 4;

export function generateData(n: number, correlation: number, noise: number, seed: number): Row[] {
  const rand = mulberry32(seed);
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    const x1 = gaussian(rand);
    const x2 = correlation * x1 + Math.sqrt(Math.max(0, 1 - correlation * correlation)) * gaussian(rand);
    const x3 = gaussian(rand);
    const x4 = gaussian(rand);
    const eps = gaussian(rand) * noise;
    const x = [x1, x2, x3, x4];
    const y = TRUE_B + x.reduce((s, xi, j) => s + TRUE_W[j] * xi, 0) + eps;
    rows.push({ x, y });
  }
  return rows;
}

/** Gauss-Jordan inverse with partial pivoting -- small matrices only (d <= ~8). */
function matInverse(M: number[][]): number[][] {
  const n = M.length;
  const A = M.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > maxVal) {
        maxVal = Math.abs(A[r][col]);
        pivotRow = r;
      }
    }
    if (pivotRow !== col) [A[col], A[pivotRow]] = [A[pivotRow], A[col]];
    const pivot = A[col][col] || 1e-10;
    for (let j = 0; j < 2 * n; j++) A[col][j] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      for (let j = 0; j < 2 * n; j++) A[r][j] -= factor * A[col][j];
    }
  }
  return A.map((row) => row.slice(n));
}

function matVecMul(M: number[][], v: number[]): number[] {
  return M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
}

/** Real closed-form ridge solve: w = (X'^TX' + lambda*P)^-1 X'^Ty, bias unpenalized. */
export function ridgeSolve(rows: Row[], lambda: number): Solution {
  const d = rows[0].x.length;
  const Xaug = rows.map((r) => [1, ...r.x]);
  const y = rows.map((r) => r.y);
  const p = d + 1;

  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);
  Xaug.forEach((row, i) => {
    for (let a = 0; a < p; a++) {
      Xty[a] += row[a] * y[i];
      for (let b = 0; b < p; b++) {
        XtX[a][b] += row[a] * row[b];
      }
    }
  });
  for (let a = 1; a < p; a++) XtX[a][a] += lambda; // bias (index 0) never penalized

  const inv = matInverse(XtX);
  const w = matVecMul(inv, Xty);
  return { b: w[0], w: w.slice(1) };
}

export function mse(rows: Row[], b: number, w: number[]): number {
  let sum = 0;
  rows.forEach((r) => {
    const pred = b + r.x.reduce((s, xi, j) => s + w[j] * xi, 0);
    sum += (pred - r.y) ** 2;
  });
  return sum / rows.length;
}

export function regularizationPath(rows: Row[], steps = 40): PathPoint[] {
  const path: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const lambda = (i / steps) * LAMBDA_MAX;
    const { b, w } = ridgeSolve(rows, lambda);
    path.push({ lambda, b, w, mse: mse(rows, b, w) });
  }
  return path;
}
