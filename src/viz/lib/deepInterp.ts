// Shared math for the deep-learning/LLM interpretability diagrams --
// saliency vs. integrated gradients, activation-maximization gradient
// ascent, probing-classifier logistic regression, and toy superposition
// interference. Every function here is real, closed-form or numerically
// integrated math over small fixed toy models -- not decorative numbers.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

// --- Saliency vs. Integrated Gradients ---------------------------------
// A toy scorer F(x) = sigmoid(k * w·x). At the real input x, F is deeply
// saturated (F≈1), so the RAW gradient dF/dx_i = F(1-F)*k*w_i is tiny for
// EVERY pixel, regardless of how large its weight w_i actually is -- a
// real instance of gradient saturation hiding true importance. Integrated
// Gradients instead averages that same gradient along the whole straight
// line path from a zero baseline to x, which is not saturated for most of
// the path, and recovers the correct x_i*w_i ranking.
export function saliencyVsIG(w: number[][], x: number[][], k = 6, steps = 40) {
  const flatW = w.flat();
  const flatX = x.flat();
  const dot = flatW.reduce((s, wi, i) => s + wi * flatX[i], 0);
  const scoreAtInput = sigmoid(k * dot);

  // integral of F(alpha*dot)*(1-F(alpha*dot)) d(alpha) over [0,1], Riemann midpoint rule
  let G = 0;
  for (let s = 0; s < steps; s++) {
    const alpha = (s + 0.5) / steps;
    const f = sigmoid(k * alpha * dot);
    G += f * (1 - f);
  }
  G /= steps;

  const rawFactor = scoreAtInput * (1 - scoreAtInput) * k;
  const raw = w.map((row) => row.map((wi) => rawFactor * wi));
  const integrated = w.map((row, r) => row.map((wi, c) => x[r][c] * k * wi * G));

  return { raw, integrated, scoreAtInput, G, dot };
}

// --- Activation Maximization: gradient ascent on a toy 2D neuron -------
// act(x,y) is a "neuron" with one real maximum (a Gaussian bump) and one
// smaller distractor bump -- gradient ascent from a fixed start point
// climbs the real analytic gradient of this function step by step.
export function neuronActivationValue(x: number, y: number): number {
  const main = Math.exp(-((x - 1.1) ** 2 + (y - 0.6) ** 2) / 0.5);
  const distractor = 0.55 * Math.exp(-((x + 1.0) ** 2 + (y + 0.9) ** 2) / 0.5);
  return main + distractor;
}

function neuronGradient(x: number, y: number): [number, number] {
  const eps = 1e-4;
  const dx = (neuronActivationValue(x + eps, y) - neuronActivationValue(x - eps, y)) / (2 * eps);
  const dy = (neuronActivationValue(x, y + eps) - neuronActivationValue(x, y - eps)) / (2 * eps);
  return [dx, dy];
}

export function gradientAscentPath(start: [number, number], steps: number, lr: number): { x: number; y: number; activation: number }[] {
  const path: { x: number; y: number; activation: number }[] = [];
  let [x, y] = start;
  for (let i = 0; i <= steps; i++) {
    path.push({ x, y, activation: neuronActivationValue(x, y) });
    const [gx, gy] = neuronGradient(x, y);
    x += lr * gx;
    y += lr * gy;
  }
  return path;
}

// --- Probing classifiers: real 2D logistic regression per "layer" ------
export interface ProbePoint { x: number; y: number; label: 0 | 1 }

/** Higher `separation` = classes further apart = easier for a linear probe. */
export function generateProbeLayer(seed: number, separation: number, n = 40): ProbePoint[] {
  const rand = mulberry32(seed);
  const pts: ProbePoint[] = [];
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = i % 2 === 0 ? 0 : 1;
    const cx = label === 0 ? -separation / 2 : separation / 2;
    const cy = label === 0 ? -separation / 4 : separation / 4;
    const x = cx + (rand() - 0.5) * 1.6;
    const y = cy + (rand() - 0.5) * 1.6;
    pts.push({ x, y, label });
  }
  return pts;
}

export function fitLogisticProbe(points: ProbePoint[], iters = 400, lr = 0.3) {
  let w1 = 0, w2 = 0, b = 0;
  for (let it = 0; it < iters; it++) {
    let dw1 = 0, dw2 = 0, db = 0;
    for (const p of points) {
      const z = w1 * p.x + w2 * p.y + b;
      const err = sigmoid(z) - p.label;
      dw1 += err * p.x; dw2 += err * p.y; db += err;
    }
    const n = points.length;
    w1 -= lr * dw1 / n; w2 -= lr * dw2 / n; b -= lr * db / n;
  }
  let correct = 0;
  for (const p of points) {
    const pred = sigmoid(w1 * p.x + w2 * p.y + b) >= 0.5 ? 1 : 0;
    if (pred === p.label) correct++;
  }
  return { w1, w2, b, accuracy: correct / points.length };
}

// --- Superposition: interference among unit feature directions ---------
/** N feature directions, each a unit vector in `dim` dimensions, spread
 * deterministically around the circle/sphere (not learned -- illustrating
 * the geometry, not a trained model). Returns their real Gram matrix
 * (pairwise dot products) and a scalar interference score (mean |off-diag|). */
export function featureGeometry(n: number, dim: number) {
  const rand = mulberry32(dim * 1000 + n);
  const vectors: number[][] = [];
  for (let i = 0; i < n; i++) {
    const v = Array.from({ length: dim }, () => rand() * 2 - 1);
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    vectors.push(v.map((x) => x / norm));
  }
  const gram = vectors.map((vi) => vectors.map((vj) => vi.reduce((s, x, d) => s + x * vj[d], 0)));
  let offDiagSum = 0;
  let count = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) { offDiagSum += Math.abs(gram[i][j]); count++; }
  const interference = count > 0 ? offDiagSum / count : 0;
  return { vectors, gram, interference };
}
