// Shared math for the specialized-supervised diagrams: real differencing
// for time series, a real Kaplan-Meier estimator, real matrix-factorization
// gradient descent, and real NDCG.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Time series: real non-stationary series + real differencing --------
export function generateTrendedSeries(n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const series: number[] = [];
  let level = 10;
  for (let i = 0; i < n; i++) {
    level += 0.6 + (rand() - 0.5) * 0.8; // real upward trend + noise
    series.push(level);
  }
  return series;
}
export function difference(series: number[], d: number): number[] {
  let s = series;
  for (let i = 0; i < d; i++) s = s.slice(1).map((v, j) => v - s[j]);
  return s;
}
export function variance(xs: number[]): number {
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return xs.reduce((s, v) => s + (v - mean) ** 2, 0) / xs.length;
}

// --- Kaplan-Meier -------------------------------------------------------
export interface Subject { time: number; event: 0 | 1 } // event=1 observed, 0=censored
export const KM_SUBJECTS: Subject[] = [
  { time: 2, event: 1 }, { time: 3, event: 1 }, { time: 4, event: 0 },
  { time: 5, event: 1 }, { time: 6, event: 1 }, { time: 6, event: 0 },
  { time: 8, event: 1 }, { time: 9, event: 0 }, { time: 11, event: 1 }, { time: 12, event: 0 },
];
export interface KmStep { time: number; nAtRisk: number; nEvents: number; survival: number }
export function kaplanMeier(subjects: Subject[]): KmStep[] {
  const sorted = [...subjects].sort((a, b) => a.time - b.time);
  const eventTimes = [...new Set(sorted.filter((s) => s.event === 1).map((s) => s.time))].sort((a, b) => a - b);
  let survival = 1;
  const steps: KmStep[] = [{ time: 0, nAtRisk: sorted.length, nEvents: 0, survival: 1 }];
  for (const t of eventTimes) {
    const nAtRisk = sorted.filter((s) => s.time >= t).length;
    const nEvents = sorted.filter((s) => s.time === t && s.event === 1).length;
    survival *= 1 - nEvents / nAtRisk;
    steps.push({ time: t, nAtRisk, nEvents, survival });
  }
  return steps;
}

// --- Matrix factorization: real SGD on a sparse ratings matrix -----------
export const RATINGS: (number | null)[][] = [
  [5, null, 4, null, 1],
  [4, null, null, 2, 1],
  [null, 3, null, 5, null],
  [1, 1, null, 4, 5],
  [null, null, 5, null, 4],
];
export function trainMatrixFactorization(k: number, epochs: number, lr: number, reg: number, seed: number) {
  const rand = mulberry32(seed);
  const m = RATINGS.length, n = RATINGS[0].length;
  const U = Array.from({ length: m }, () => Array.from({ length: k }, () => (rand() - 0.5) * 0.5));
  const V = Array.from({ length: n }, () => Array.from({ length: k }, () => (rand() - 0.5) * 0.5));
  const observed: [number, number, number][] = [];
  RATINGS.forEach((row, i) => row.forEach((r, j) => { if (r !== null) observed.push([i, j, r]); }));

  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const [i, j, r] of observed) {
      const pred = U[i].reduce((s, v, d) => s + v * V[j][d], 0);
      const err = r - pred;
      for (let d = 0; d < k; d++) {
        const ui = U[i][d], vj = V[j][d];
        U[i][d] += lr * (err * vj - reg * ui);
        V[j][d] += lr * (err * ui - reg * vj);
      }
    }
  }
  const reconstructed = U.map((urow) => V.map((vrow) => urow.reduce((s, v, d) => s + v * vrow[d], 0)));
  const mse = observed.reduce((s, [i, j, r]) => s + (reconstructed[i][j] - r) ** 2, 0) / observed.length;
  return { U, V, reconstructed, mse };
}

// --- NDCG -----------------------------------------------------------------
export function dcg(relevances: number[]): number {
  return relevances.reduce((s, rel, i) => s + (2 ** rel - 1) / Math.log2(i + 2), 0);
}
export function ndcg(relevances: number[]): number {
  const ideal = dcg([...relevances].sort((a, b) => b - a));
  return ideal === 0 ? 0 : dcg(relevances) / ideal;
}
