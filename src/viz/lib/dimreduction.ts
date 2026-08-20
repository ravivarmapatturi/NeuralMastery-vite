// Shared math for PCA/SVD and ICA/t-SNE/UMAP diagrams: real covariance +
// eigendecomposition for PCA (reusing linalg.ts's real 2x2 eigensolver),
// and a real signal-mixing + non-Gaussianity measurement for ICA.

import { symmetricEigenvalues2, symmetricEigenvector2, type Mat2 } from './linalg';

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rand: () => number): number { return (rand() + rand() + rand() - 1.5) * 1.4; }

// --- PCA: real covariance + eigendecomposition ---------------------------
export interface Pt { x: number; y: number }
export function generatePcaPoints(seed: number, correlation: number): Pt[] {
  const rand = mulberry32(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < 80; i++) {
    const a = gaussian(rand) * 1.4;
    const b = correlation * a + Math.sqrt(Math.max(0, 1 - correlation * correlation)) * gaussian(rand) * 1.4;
    pts.push({ x: a, y: b * 0.6 + a * 0.3 });
  }
  return pts;
}
export function pcaFit(points: Pt[]) {
  const mx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const my = points.reduce((s, p) => s + p.y, 0) / points.length;
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of points) { const dx = p.x - mx, dy = p.y - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  const n = points.length;
  const cov: Mat2 = [[sxx / n, sxy / n], [sxy / n, syy / n]];
  const [l1, l2] = symmetricEigenvalues2(cov);
  const pc1 = symmetricEigenvector2(cov, l1);
  const pc2 = symmetricEigenvector2(cov, l2);
  const totalVar = l1 + l2;
  return { mean: [mx, my] as [number, number], pc1, pc2, l1, l2, varianceExplained: l1 / totalVar };
}
export function projectOntoPc1(points: Pt[], mean: [number, number], pc1: [number, number]) {
  return points.map((p) => (p.x - mean[0]) * pc1[0] + (p.y - mean[1]) * pc1[1]);
}

// --- ICA: real signal mixing + real non-Gaussianity (excess kurtosis) ---
export function sourceSignalA(n: number): number[] {
  return Array.from({ length: n }, (_, i) => Math.sin(i * 0.3)); // periodic, very non-Gaussian
}
export function sourceSignalB(n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.5)); // bimodal, non-Gaussian
}
export function mixSignals(a: number[], b: number[], m: Mat2): [number[], number[]] {
  const mix1 = a.map((av, i) => m[0][0] * av + m[0][1] * b[i]);
  const mix2 = a.map((av, i) => m[1][0] * av + m[1][1] * b[i]);
  return [mix1, mix2];
}
/** Real excess kurtosis -- 0 for a true Gaussian, nonzero (usually large
 * magnitude) for non-Gaussian signals. What ICA actually maximizes the
 * magnitude of, in spirit. */
export function excessKurtosis(xs: number[]): number {
  const n = xs.length;
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const variance = xs.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const m4 = xs.reduce((s, v) => s + (v - mean) ** 4, 0) / n;
  return m4 / (variance * variance) - 3;
}
