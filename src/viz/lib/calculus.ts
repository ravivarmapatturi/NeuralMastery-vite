// Shared math for the Calculus & Optimization diagrams: real gradients on
// a 2D bowl, real Newton-vs-gradient-descent trajectories on a
// non-quadratic surface, a real forward+backward pass through a tiny
// network, real gradient descent on convex/non-convex 1D functions, real
// LR schedule formulas, and a real 2D constrained-optimization solve.

export function sigmoid(z: number): number { return 1 / (1 + Math.exp(-z)); }

// --- Simple 2D bowl, for the gradient-direction diagram ------------------
export function bowl(x: number, y: number): number { return x * x + 2 * y * y; }
export function bowlGradient(x: number, y: number): [number, number] { return [2 * x, 4 * y]; }

// --- Newton vs. gradient descent on a non-quadratic surface --------------
// f(x,y) = 0.1x^4 + 2y^2 -- quartic in x (so Newton needs real iteration,
// not a single jump), quadratic in y (Newton solves that axis exactly).
export function nonQuadratic(x: number, y: number): number { return 0.1 * x ** 4 + 2 * y * y; }
export function nonQuadraticGradient(x: number, y: number): [number, number] { return [0.4 * x ** 3, 4 * y]; }
export function nonQuadraticHessianDiag(x: number): [number, number] { return [Math.max(1.2 * x * x, 1e-3), 4]; }

export function gradientDescentPath(start: [number, number], lr: number, steps: number): [number, number][] {
  const path: [number, number][] = [start];
  let [x, y] = start;
  for (let i = 0; i < steps; i++) {
    const [gx, gy] = nonQuadraticGradient(x, y);
    x -= lr * gx; y -= lr * gy;
    path.push([x, y]);
  }
  return path;
}
export function newtonPath(start: [number, number], steps: number): [number, number][] {
  const path: [number, number][] = [start];
  let [x, y] = start;
  for (let i = 0; i < steps; i++) {
    const [gx, gy] = nonQuadraticGradient(x, y);
    const [hx, hy] = nonQuadraticHessianDiag(x);
    x -= gx / hx; y -= gy / hy;
    path.push([x, y]);
  }
  return path;
}

// --- Tiny 2-layer network: real forward + backward pass ------------------
export interface ForwardTrace { x: number; h: number; a: number; y: number; loss: number }
export interface BackwardTrace { dL_dy: number; dL_da: number; dL_dh: number; dL_dw2: number; dL_dw1: number; dL_db1: number; dL_db2: number }
export const NET = { w1: 0.8, b1: -0.2, w2: 1.5, b2: 0.1 };
export function forward(x: number, target: number): ForwardTrace {
  const h = NET.w1 * x + NET.b1;
  const a = sigmoid(h);
  const y = NET.w2 * a + NET.b2;
  const loss = 0.5 * (y - target) ** 2;
  return { x, h, a, y, loss };
}
export function backward(trace: ForwardTrace, target: number): BackwardTrace {
  const dL_dy = trace.y - target;
  const dL_da = dL_dy * NET.w2;
  const dSigmoid = trace.a * (1 - trace.a);
  const dL_dh = dL_da * dSigmoid;
  const dL_dw2 = dL_dy * trace.a;
  const dL_dw1 = dL_dh * trace.x;
  const dL_db1 = dL_dh;
  const dL_db2 = dL_dy;
  return { dL_dy, dL_da, dL_dh, dL_dw2, dL_dw1, dL_db1, dL_db2 };
}

// --- Convex vs. non-convex 1D gradient descent ---------------------------
export function convexFn(x: number): number { return (x - 2) ** 2; }
export function convexGrad(x: number): number { return 2 * (x - 2); }
export function nonConvexFn(x: number): number { return 0.3 * x ** 4 - 2 * x * x + 0.5 * x; }
export function nonConvexGrad(x: number): number { return 1.2 * x ** 3 - 4 * x + 0.5; }
export function gd1D(start: number, grad: (x: number) => number, lr: number, steps: number): number[] {
  const path = [start];
  let x = start;
  for (let i = 0; i < steps; i++) { x -= lr * grad(x); path.push(x); }
  return path;
}

// --- Learning rate schedules ---------------------------------------------
export function warmupCosine(step: number, totalSteps: number, warmupSteps: number, peakLr: number): number {
  if (step < warmupSteps) return peakLr * (step / warmupSteps);
  const progress = (step - warmupSteps) / Math.max(1, totalSteps - warmupSteps);
  return peakLr * 0.5 * (1 + Math.cos(Math.PI * Math.min(1, progress)));
}
export function warmupLinearDecay(step: number, totalSteps: number, warmupSteps: number, peakLr: number): number {
  if (step < warmupSteps) return peakLr * (step / warmupSteps);
  const progress = (step - warmupSteps) / Math.max(1, totalSteps - warmupSteps);
  return peakLr * Math.max(0, 1 - progress);
}
export function stepDecay(step: number, totalSteps: number, peakLr: number): number {
  const fraction = step / totalSteps;
  if (fraction < 0.33) return peakLr;
  if (fraction < 0.66) return peakLr * 0.3;
  return peakLr * 0.09;
}

// --- 2D constrained optimization: minimize x^2+y^2 s.t. x+y = target -----
export function constrainedSolution(target: number): { x: number; y: number; lambda: number } {
  // By symmetry (Lagrangian: 2x = lambda, 2y = lambda, x+y=target) -> x=y=target/2
  const x = target / 2, y = target / 2;
  const lambda = 2 * x;
  return { x, y, lambda };
}
