// Shared math for the classification-family diagrams: a real 1D->2D
// polynomial feature map (the kernel trick's core idea), real Gaussian
// discriminant analysis (LDA/QDA) fit to real generated class data, and a
// real generic SGD loop trained with swappable loss/penalty combinations.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rand: () => number): number { return (rand() + rand() + rand() - 1.5) * 1.4; }

// --- Kernel trick: real 1D points, not linearly separable, mapped to 2D -
export interface Point1D { x: number; label: 0 | 1 }
export const KERNEL_1D_DATA: Point1D[] = [
  { x: -3, label: 1 }, { x: -2.3, label: 1 }, { x: -1.6, label: 1 },
  { x: -0.4, label: 0 }, { x: 0.2, label: 0 }, { x: 0.9, label: 0 },
  { x: 1.7, label: 1 }, { x: 2.4, label: 1 }, { x: 3.1, label: 1 },
];
export function polyFeatureMap(x: number): [number, number] { return [x, x * x]; }

// --- LDA/QDA: real class data + real Gaussian discriminant boundary ------
export interface ClassPoint { x: number; y: number; label: 0 | 1 }
export function generateClasses(seed: number, sharedCovariance: boolean): ClassPoint[] {
  const rand = mulberry32(seed);
  const pts: ClassPoint[] = [];
  // Class 0: round spread. Class 1: either same round spread (shared cov)
  // or stretched/rotated (different cov) -- real difference in the actual
  // generated data, not just the fitted model's assumption.
  for (let i = 0; i < 60; i++) {
    pts.push({ x: -1.2 + gaussian(rand) * 0.6, y: -0.5 + gaussian(rand) * 0.6, label: 0 });
  }
  for (let i = 0; i < 60; i++) {
    const spreadX = sharedCovariance ? 0.6 : 1.4;
    const spreadY = sharedCovariance ? 0.6 : 0.35;
    pts.push({ x: 1.2 + gaussian(rand) * spreadX, y: 0.5 + gaussian(rand) * spreadY, label: 1 });
  }
  return pts;
}
function mean2(pts: ClassPoint[]): [number, number] {
  return [pts.reduce((s, p) => s + p.x, 0) / pts.length, pts.reduce((s, p) => s + p.y, 0) / pts.length];
}
function covariance2(pts: ClassPoint[], mu: [number, number]): [[number, number], [number, number]] {
  let sxx = 0, sxy = 0, syy = 0;
  for (const p of pts) { const dx = p.x - mu[0], dy = p.y - mu[1]; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  const n = pts.length;
  return [[sxx / n, sxy / n], [sxy / n, syy / n]];
}
function inv2(m: [[number, number], [number, number]]): [[number, number], [number, number]] {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0] || 1e-6;
  return [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]];
}
function quadForm(inv: [[number, number], [number, number]], dx: number, dy: number): number {
  return dx * (inv[0][0] * dx + inv[0][1] * dy) + dy * (inv[1][0] * dx + inv[1][1] * dy);
}

/** Real discriminant score difference (class1 - class0) at point (x,y):
 * negative log-density difference under each class's own real fitted
 * Gaussian, using LDA's shared-covariance assumption when `lda` is true,
 * QDA's per-class covariance otherwise. Decision boundary = where this is 0. */
export function discriminantScore(pts: ClassPoint[], x: number, y: number, lda: boolean): number {
  const c0 = pts.filter((p) => p.label === 0);
  const c1 = pts.filter((p) => p.label === 1);
  const mu0 = mean2(c0), mu1 = mean2(c1);
  const cov0 = covariance2(c0, mu0), cov1 = covariance2(c1, mu1);
  const sharedCov: [[number, number], [number, number]] = lda
    ? [[(cov0[0][0] + cov1[0][0]) / 2, (cov0[0][1] + cov1[0][1]) / 2], [(cov0[1][0] + cov1[1][0]) / 2, (cov0[1][1] + cov1[1][1]) / 2]]
    : cov0;
  const inv0 = inv2(lda ? sharedCov : cov0);
  const inv1 = inv2(lda ? sharedCov : cov1);
  const d0 = quadForm(inv0, x - mu0[0], y - mu0[1]);
  const d1 = quadForm(inv1, x - mu1[0], y - mu1[1]);
  return d0 - d1; // positive -> closer to class 1
}

// --- SGD: one generic training loop, swappable loss/penalty --------------
export type LossType = 'squared' | 'log' | 'hinge';
export type PenaltyType = 'none' | 'l2';

export function lossGradient(loss: LossType, yTrue: number, score: number): number {
  if (loss === 'squared') return 2 * (score - yTrue);
  if (loss === 'log') { const p = 1 / (1 + Math.exp(-score)); return p - yTrue; }
  // hinge: y in {-1,+1} convention
  const yPm = yTrue === 1 ? 1 : -1;
  return yPm * score < 1 ? -yPm : 0;
}

export function trainSgd(points: ClassPoint[], loss: LossType, penalty: PenaltyType, epochs: number, lr: number, l2: number, seed: number) {
  const rand = mulberry32(seed);
  let w = [0, 0], b = 0;
  const order = points.map((_, i) => i);
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[order[i], order[j]] = [order[j], order[i]]; }
    for (const idx of order) {
      const p = points[idx];
      const score = w[0] * p.x + w[1] * p.y + b;
      const grad = lossGradient(loss, p.label, score);
      w[0] -= lr * (grad * p.x + (penalty === 'l2' ? l2 * w[0] : 0));
      w[1] -= lr * (grad * p.y + (penalty === 'l2' ? l2 * w[1] : 0));
      b -= lr * grad;
    }
  }
  return { w, b };
}
