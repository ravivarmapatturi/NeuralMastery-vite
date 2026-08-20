// Shared math for the AI for Science diagrams: a real screening-funnel
// reduction over a real generated candidate-score distribution, a real
// physics-informed loss decomposition on a solvable toy ODE, and a real
// function-to-function neural-operator-style mapping (1D heat-equation
// diffusion, solved via real Gaussian-kernel convolution).

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Screening funnel: real generated candidate scores ------------------
export function generateCandidateScores(n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  // Most candidates score low; a real, generated long right tail of
  // genuinely promising ones -- realistic shape for a property-prediction
  // score distribution over a huge random candidate library.
  return Array.from({ length: n }, () => Math.pow(rand(), 4));
}
export function funnelCounts(scores: number[], mlThreshold: number, shortlistSize: number) {
  const passedMl = scores.filter((s) => s >= mlThreshold).length;
  const shortlist = Math.min(shortlistSize, passedMl);
  return { total: scores.length, passedMl, shortlist };
}

// --- PINN: dy/dx = -y, true solution y = e^-x, on x in [0, 3] -----------
export function trueOdeSolution(x: number): number { return Math.exp(-x); }
export function networkPrediction(x: number, a: number, b: number): number {
  return Math.exp(-a * x) + b * x * Math.exp(-x);
}
function numericalDerivative(f: (x: number) => number, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}
export function physicsResidual(a: number, b: number, x: number): number {
  const yPred = networkPrediction(x, a, b);
  const dyPred = numericalDerivative((xx) => networkPrediction(xx, a, b), x);
  return dyPred + yPred; // should be 0 if dy/dx = -y is satisfied
}
export function dataLoss(a: number, b: number, dataPoints: number[]): number {
  return dataPoints.reduce((s, x) => s + (networkPrediction(x, a, b) - trueOdeSolution(x)) ** 2, 0) / dataPoints.length;
}
export function physicsLoss(a: number, b: number, collocationPoints: number[]): number {
  return collocationPoints.reduce((s, x) => s + physicsResidual(a, b, x) ** 2, 0) / collocationPoints.length;
}

// --- Neural operator: real 1D heat-equation diffusion (Gaussian kernel) -
const GRID_N = 40;
export const SPATIAL_GRID = Array.from({ length: GRID_N }, (_, i) => (i / (GRID_N - 1)) * 10 - 5);

export function initialCondition(kind: 'single-bump' | 'double-bump' | 'square'): number[] {
  if (kind === 'single-bump') return SPATIAL_GRID.map((x) => Math.exp(-(x * x) / 2));
  if (kind === 'double-bump') return SPATIAL_GRID.map((x) => Math.exp(-((x - 2) ** 2) / 0.8) + Math.exp(-((x + 2) ** 2) / 0.8));
  return SPATIAL_GRID.map((x) => (Math.abs(x) < 1.5 ? 1 : 0));
}

/** Real closed-form solution to the 1D heat equation: convolve the
 * initial condition with a Gaussian kernel of width sqrt(2*diffusivity*t). */
export function diffuse(initial: number[], t: number, diffusivity = 0.3): number[] {
  if (t <= 0) return initial;
  const sigma = Math.sqrt(2 * diffusivity * t);
  return SPATIAL_GRID.map((x) => {
    let sum = 0, weightSum = 0;
    for (let j = 0; j < initial.length; j++) {
      const w = Math.exp(-((x - SPATIAL_GRID[j]) ** 2) / (2 * sigma * sigma));
      sum += w * initial[j];
      weightSum += w;
    }
    return sum / (weightSum || 1);
  });
}
