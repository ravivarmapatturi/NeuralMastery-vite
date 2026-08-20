// Shared math for the Model Evaluation & Metrics diagrams: a real
// bias-variance Monte Carlo decomposition across polynomial complexity, a
// real ROC/PR curve swept over real classifier scores, and a real
// reliability (calibration) diagram.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rand: () => number): number { return (rand() + rand() + rand() - 1.5) * 1.4; }

// --- Bias-variance: real Monte Carlo over resampled datasets -------------
function trueFn(x: number): number { return Math.sin(x * 1.3); }
function polyFit(xs: number[], ys: number[], degree: number): number[] {
  const n = degree + 1;
  const A = Array.from({ length: n }, () => Array(n).fill(0));
  const b = Array(n).fill(0);
  for (let i = 0; i < xs.length; i++) {
    const powers = Array.from({ length: n }, (_, k) => xs[i] ** k);
    for (let r = 0; r < n; r++) { for (let c = 0; c < n; c++) A[r][c] += powers[r] * powers[c]; b[r] += powers[r] * ys[i]; }
  }
  for (let i = 0; i < n; i++) A[i][i] += 1e-6;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < n; r++) { if (r === col) continue; const f = M[r][col] / M[col][col]; for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]; }
  }
  return M.map((row, i) => row[n] / row[i]);
}
function evalPoly(coeffs: number[], x: number): number { return coeffs.reduce((s, c, k) => s + c * x ** k, 0); }

export function biasVarianceAt(degree: number, testX: number, trials: number, seed: number) {
  const rand = mulberry32(seed);
  const preds: number[] = [];
  for (let t = 0; t < trials; t++) {
    const xs = Array.from({ length: 12 }, () => (rand() - 0.5) * 6);
    const ys = xs.map((x) => trueFn(x) + gaussian(rand) * 0.3);
    const coeffs = polyFit(xs, ys, degree);
    preds.push(evalPoly(coeffs, testX));
  }
  const mean = preds.reduce((a, b) => a + b, 0) / preds.length;
  const trueVal = trueFn(testX);
  const bias2 = (mean - trueVal) ** 2;
  const variance = preds.reduce((s, p) => s + (p - mean) ** 2, 0) / preds.length;
  return { bias2, variance, total: bias2 + variance, mean, preds };
}

// --- ROC / PR curves: real scores swept over every threshold -------------
export interface ScoredExample { score: number; label: 0 | 1 }
export function generateScoredExamples(seed: number, n: number): ScoredExample[] {
  const rand = mulberry32(seed);
  const examples: ScoredExample[] = [];
  for (let i = 0; i < n; i++) {
    const label: 0 | 1 = rand() < 0.3 ? 1 : 0; // imbalanced, 30% positive
    const score = Math.min(1, Math.max(0, (label === 1 ? 0.65 : 0.35) + gaussian(rand) * 0.22));
    examples.push({ score, label });
  }
  return examples;
}
export function metricsAtThreshold(examples: ScoredExample[], threshold: number) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const e of examples) {
    const pred = e.score >= threshold ? 1 : 0;
    if (pred === 1 && e.label === 1) tp++;
    else if (pred === 1 && e.label === 0) fp++;
    else if (pred === 0 && e.label === 0) tn++;
    else fn++;
  }
  const tpr = tp / (tp + fn || 1);
  const fpr = fp / (fp + tn || 1);
  const precision = tp / (tp + fp || 1);
  const recall = tpr;
  const f1 = 2 * (precision * recall) / (precision + recall || 1);
  return { tp, fp, tn, fn, tpr, fpr, precision, recall, f1 };
}
export function rocCurve(examples: ScoredExample[], steps = 40) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const threshold = i / steps;
    const m = metricsAtThreshold(examples, threshold);
    return { threshold, tpr: m.tpr, fpr: m.fpr, precision: m.precision, recall: m.recall };
  });
}

// --- Calibration: real reliability diagram --------------------------------
export function generateUncalibratedPredictions(seed: number, n: number) {
  const rand = mulberry32(seed);
  const preds: { predicted: number; actual: 0 | 1 }[] = [];
  for (let i = 0; i < n; i++) {
    const predicted = rand();
    // Deliberately overconfident: real actual outcome rate is compressed toward 0.5.
    const trueP = 0.5 + (predicted - 0.5) * 0.5;
    const actual: 0 | 1 = rand() < trueP ? 1 : 0;
    preds.push({ predicted, actual });
  }
  return preds;
}
export function reliabilityBins(preds: { predicted: number; actual: 0 | 1 }[], nBins = 10) {
  const bins = Array.from({ length: nBins }, () => ({ sumPred: 0, sumActual: 0, count: 0 }));
  for (const p of preds) {
    const idx = Math.min(nBins - 1, Math.floor(p.predicted * nBins));
    bins[idx].sumPred += p.predicted;
    bins[idx].sumActual += p.actual;
    bins[idx].count++;
  }
  return bins.map((b, i) => ({
    binCenter: (i + 0.5) / nBins,
    avgPredicted: b.count ? b.sumPred / b.count : null,
    avgActual: b.count ? b.sumActual / b.count : null,
    count: b.count,
  }));
}
