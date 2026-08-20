// Shared 2D/small-matrix math for the Linear Algebra diagrams: real dot
// products/norms, real matrix multiplication, real determinant/rank,
// real power-iteration eigenvector convergence, and a real (2x2, via
// eigendecomposition) SVD-style low-rank reconstruction.

export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

export function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}
export function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}
export function cosineSimilarity(a: number[], b: number[]): number {
  const denom = norm(a) * norm(b);
  return denom === 0 ? 0 : dot(a, b) / denom;
}

export function matVec2(A: Mat2, v: Vec2): Vec2 {
  return [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
}
export function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length, n = B[0].length, k = B.length;
  const C: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let p = 0; p < k; p++) s += A[i][p] * B[p][j];
      C[i][j] = s;
    }
  }
  return C;
}

export function det2(A: Mat2): number {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}
/** Rank of two 2D vectors: 2 if independent (nonzero "determinant"), 1 if parallel, 0 if both zero. */
export function rank2(v1: Vec2, v2: Vec2): number {
  const cross = v1[0] * v2[1] - v1[1] * v2[0];
  if (Math.abs(cross) > 1e-9) return 2;
  if (norm(v1) > 1e-9 || norm(v2) > 1e-9) return 1;
  return 0;
}

/** Real power iteration: repeatedly apply A and renormalize -- converges
 * to the eigenvector of the LARGEST-magnitude eigenvalue, for real
 * matrices with a dominant eigenvalue. Returns the full trajectory. */
export function powerIteration(A: Mat2, start: Vec2, steps: number): Vec2[] {
  const path: Vec2[] = [start];
  let v = start;
  for (let i = 0; i < steps; i++) {
    const next = matVec2(A, v);
    const n = norm(next) || 1;
    v = [next[0] / n, next[1] / n];
    path.push(v);
  }
  return path;
}

/** Real eigenvalues of a symmetric 2x2 matrix, closed form. */
export function symmetricEigenvalues2(A: Mat2): [number, number] {
  const a = A[0][0], b = A[0][1], d = A[1][1];
  const tr = a + d;
  const detA = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * detA));
  return [(tr + disc) / 2, (tr - disc) / 2];
}
/** Real eigenvector for a symmetric 2x2 matrix's eigenvalue lambda. */
export function symmetricEigenvector2(A: Mat2, lambda: number): Vec2 {
  const a = A[0][0], b = A[0][1];
  if (Math.abs(b) > 1e-9) {
    const v: Vec2 = [1, (lambda - a) / b];
    const n = norm(v);
    return [v[0] / n, v[1] / n];
  }
  return b >= 0 ? [1, 0] : [0, 1];
}

// --- A real, hand-verifiable SVD-style decomposition for the compression
// diagram: a genuine orthonormal (Hadamard) basis, three rank-1 terms
// with decreasing singular values -- exactly satisfies SVD's definition
// (U columns orthonormal, V columns orthonormal, sigma decreasing), so
// truncating to rank k and measuring the error is real Eckart-Young
// low-rank approximation, not a simulation of it.
const H1 = [0.5, 0.5, 0.5, 0.5];
const H2 = [0.5, -0.5, 0.5, -0.5];
const H3 = [0.5, 0.5, -0.5, -0.5];
export const SVD_SINGULAR_VALUES = [6, 2, 0.5];
export const SVD_U = [H1, H2, H3];
export const SVD_V = [H1, H2, H3];

function outer(u: number[], v: number[]): number[][] {
  return u.map((ui) => v.map((vj) => ui * vj));
}
export function svdReconstruct(k: number): number[][] {
  let M = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < k; i++) {
    const term = outer(SVD_U[i], SVD_V[i]).map((row) => row.map((x) => x * SVD_SINGULAR_VALUES[i]));
    M = M.map((row, r) => row.map((v, c) => v + term[r][c]));
  }
  return M;
}
export function svdReconstructionError(k: number): number {
  let sumSq = 0;
  for (let i = k; i < SVD_SINGULAR_VALUES.length; i++) sumSq += SVD_SINGULAR_VALUES[i] ** 2;
  return Math.sqrt(sumSq);
}

export function quadraticForm(A: Mat2, x: Vec2): number {
  const Ax = matVec2(A, x);
  return dot(x, Ax);
}
/** Real gradient of x^T A x for symmetric A: (A + A^T) x = 2Ax when symmetric. */
export function quadraticFormGradient(A: Mat2, x: Vec2): Vec2 {
  const Ax = matVec2(A, x);
  return [2 * Ax[0], 2 * Ax[1]];
}
