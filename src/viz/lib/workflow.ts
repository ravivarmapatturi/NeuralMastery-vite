// Shared math for the ML Workflow Fundamentals diagrams: real k-fold
// rotation bookkeeping, and a real before/after data-leakage accuracy
// comparison on a toy dataset with a genuinely leaky feature.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- K-fold cross-validation bookkeeping ----------------------------------
export function foldAssignment(n: number, k: number, foldIdx: number) {
  return Array.from({ length: n }, (_, i) => (i % k === foldIdx ? 'validation' : 'train'));
}

// --- Data leakage: a real, genuinely leaky feature ------------------------
export interface FraudRow { amount: number; hourOfDay: number; wasRefunded: 0 | 1; isFraud: 0 | 1 }
export function generateFraudData(seed: number, n: number): FraudRow[] {
  const rand = mulberry32(seed);
  const rows: FraudRow[] = [];
  for (let i = 0; i < n; i++) {
    const isFraud: 0 | 1 = rand() < 0.15 ? 1 : 0;
    const amount = isFraud ? 200 + rand() * 800 : 20 + rand() * 150;
    const hourOfDay = Math.floor(rand() * 24);
    // "wasRefunded" is only known AFTER the fraud investigation concludes --
    // it's a real, direct leak: almost perfectly correlated with the label
    // because refunds happen BECAUSE a transaction was flagged as fraud.
    const wasRefunded: 0 | 1 = isFraud ? (rand() < 0.92 ? 1 : 0) : (rand() < 0.03 ? 1 : 0);
    rows.push({ amount, hourOfDay, wasRefunded, isFraud });
  }
  return rows;
}
function logistic(z: number): number { return 1 / (1 + Math.exp(-z)); }
/** A real (tiny) logistic regression, trained by real gradient descent,
 * optionally including the leaky `wasRefunded` feature. */
export function trainFraudModel(rows: FraudRow[], includeLeakyFeature: boolean, epochs = 300, lr = 0.1) {
  const nFeatures = includeLeakyFeature ? 3 : 2;
  const w = new Array(nFeatures).fill(0);
  let b = 0;
  const feats = (r: FraudRow) => includeLeakyFeature ? [r.amount / 500, r.hourOfDay / 24, r.wasRefunded] : [r.amount / 500, r.hourOfDay / 24];
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const r of rows) {
      const x = feats(r);
      const z = x.reduce((s, xi, j) => s + w[j] * xi, 0) + b;
      const err = logistic(z) - r.isFraud;
      for (let j = 0; j < nFeatures; j++) w[j] -= lr * err * x[j];
      b -= lr * err;
    }
  }
  const correct = rows.filter((r) => {
    const x = feats(r);
    const z = x.reduce((s, xi, j) => s + w[j] * xi, 0) + b;
    return (logistic(z) >= 0.5 ? 1 : 0) === r.isFraud;
  }).length;
  return { w, b, accuracy: correct / rows.length };
}
