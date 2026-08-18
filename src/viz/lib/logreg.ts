// Real data + real math for the Logistic Regression Studio -- generates a
// noisy "study hours -> pass/fail" dataset and computes both real losses:
// cross-entropy (what's actually used) and MSE-on-sigmoid (the "why not
// just use this" counterexample), plus their real gradients.

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

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export interface LogPoint {
  x: number;
  label: 0 | 1;
}

export interface LogStats {
  loss: number;
  dw: number;
  db: number;
  accuracy: number;
}

export interface LogGDStep {
  w: number;
  b: number;
  dw: number;
  db: number;
}

export type LossType = 'ce' | 'mse';

export const X_DOMAIN: [number, number] = [0, 11];
export const W_DOMAIN: [number, number] = [-3, 3];
export const B_DOMAIN: [number, number] = [-15, 15];
export const THRESHOLD_X = 5.5;

export function generateData(n: number, noise: number, seed: number): LogPoint[] {
  const rand = mulberry32(seed);
  const points: LogPoint[] = [];
  const steepness = Math.max(0.15, 1.3 - noise * 0.09);
  for (let i = 0; i < n; i++) {
    const x = 1 + rand() * 9;
    const z = (x - THRESHOLD_X) * steepness;
    const p = sigmoid(z);
    const label: 0 | 1 = rand() < p ? 1 : 0;
    points.push({ x, label });
  }
  return points;
}

const EPS = 1e-9;

/** Real binary cross-entropy loss + its real gradient. */
export function crossEntropyStats(points: LogPoint[], w: number, b: number): LogStats {
  let loss = 0;
  let dw = 0;
  let db = 0;
  let correct = 0;
  points.forEach((p) => {
    const phat = sigmoid(w * p.x + b);
    loss += -(p.label * Math.log(phat + EPS) + (1 - p.label) * Math.log(1 - phat + EPS));
    const err = phat - p.label;
    dw += err * p.x;
    db += err;
    if ((phat >= 0.5 ? 1 : 0) === p.label) correct++;
  });
  const n = points.length || 1;
  return { loss: loss / n, dw: dw / n, db: db / n, accuracy: correct / n };
}

/** Real MSE-on-sigmoid loss + its real gradient -- the non-convex counterexample. */
export function mseOnSigmoidStats(points: LogPoint[], w: number, b: number): LogStats {
  let loss = 0;
  let dw = 0;
  let db = 0;
  let correct = 0;
  points.forEach((p) => {
    const phat = sigmoid(w * p.x + b);
    const err = phat - p.label;
    loss += err * err;
    const sigDeriv = phat * (1 - phat);
    dw += 2 * err * sigDeriv * p.x;
    db += 2 * err * sigDeriv;
    if ((phat >= 0.5 ? 1 : 0) === p.label) correct++;
  });
  const n = points.length || 1;
  return { loss: loss / n, dw: dw / n, db: db / n, accuracy: correct / n };
}

export function statsFor(lossType: LossType, points: LogPoint[], w: number, b: number): LogStats {
  return lossType === 'mse' ? mseOnSigmoidStats(points, w, b) : crossEntropyStats(points, w, b);
}

export function gradientStep(lossType: LossType, points: LogPoint[], w: number, b: number, lr: number): LogGDStep {
  const { dw, db } = statsFor(lossType, points, w, b);
  return { w: w - lr * dw, b: b - lr * db, dw, db };
}
