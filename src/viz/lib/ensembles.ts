// Shared math for the tree-ensemble diagrams (Random Forest, Boosting,
// XGBoost/LightGBM/CatBoost): a real bagging-variance-reduction Monte
// Carlo simulation, a real sequential gradient-boosting residual fit with
// single-split stumps, and real level-wise vs. leaf-wise tree-growth loss
// reduction.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rand: () => number): number { return (rand() + rand() + rand() - 1.5) * 1.4; }

// --- Bagging: real variance-of-the-average simulation --------------------
const TRUE_VALUE = 10;
export function baggingSimulation(maxTrees: number, correlation: number, seed: number) {
  const rand = mulberry32(seed);
  const nTrials = 400;
  const averageVariances: number[] = [];
  for (let b = 1; b <= maxTrees; b++) {
    const trialMeans: number[] = [];
    for (let trial = 0; trial < nTrials; trial++) {
      const shared = gaussian(rand) * Math.sqrt(correlation);
      let sum = 0;
      for (let i = 0; i < b; i++) {
        const individual = gaussian(rand) * Math.sqrt(1 - correlation);
        sum += TRUE_VALUE + shared + individual;
      }
      trialMeans.push(sum / b);
    }
    const mean = trialMeans.reduce((s, v) => s + v, 0) / trialMeans.length;
    const variance = trialMeans.reduce((s, v) => s + (v - mean) ** 2, 0) / trialMeans.length;
    averageVariances.push(variance);
  }
  return { averageVariances, singleTreeVariance: averageVariances[0] };
}

// --- Gradient boosting: real sequential stump fitting ---------------------
export interface BoostPoint { x: number; y: number }
export const BOOST_DATA: BoostPoint[] = [
  { x: 1, y: 2.2 }, { x: 2, y: 2.8 }, { x: 3, y: 5.1 }, { x: 4, y: 5.6 },
  { x: 5, y: 5.9 }, { x: 6, y: 8.4 }, { x: 7, y: 8.9 }, { x: 8, y: 9.2 },
];
export interface Stump { threshold: number; leftValue: number; rightValue: number }
/** Real search over all candidate thresholds for the single split that
 * best predicts the given residuals (minimizes squared error). */
export function fitStump(xs: number[], residuals: number[]): Stump {
  const sortedX = [...new Set(xs)].sort((a, b) => a - b);
  let best: Stump = { threshold: sortedX[0], leftValue: 0, rightValue: 0 };
  let bestError = Infinity;
  for (let i = 0; i < sortedX.length - 1; i++) {
    const threshold = (sortedX[i] + sortedX[i + 1]) / 2;
    const left = residuals.filter((_, j) => xs[j] <= threshold);
    const right = residuals.filter((_, j) => xs[j] > threshold);
    if (left.length === 0 || right.length === 0) continue;
    const leftValue = left.reduce((s, v) => s + v, 0) / left.length;
    const rightValue = right.reduce((s, v) => s + v, 0) / right.length;
    const error = left.reduce((s, v) => s + (v - leftValue) ** 2, 0) + right.reduce((s, v) => s + (v - rightValue) ** 2, 0);
    if (error < bestError) { bestError = error; best = { threshold, leftValue, rightValue }; }
  }
  return best;
}
export function stumpPredict(stump: Stump, x: number): number { return x <= stump.threshold ? stump.leftValue : stump.rightValue; }

export function boostingRounds(data: BoostPoint[], rounds: number, lr: number) {
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const mean = ys.reduce((s, v) => s + v, 0) / ys.length;
  let F = ys.map(() => mean);
  const history: { F: number[]; stump: Stump; residuals: number[] }[] = [{ F: [...F], stump: { threshold: 0, leftValue: 0, rightValue: 0 }, residuals: ys.map((y, i) => y - F[i]) }];
  for (let r = 0; r < rounds; r++) {
    const residuals = ys.map((y, i) => y - F[i]);
    const stump = fitStump(xs, residuals);
    F = F.map((f, i) => f + lr * stumpPredict(stump, xs[i]));
    history.push({ F: [...F], stump, residuals });
  }
  return history;
}

// --- Level-wise vs. leaf-wise tree growth: real loss-reduction totals ----
// A fixed toy tree of possible leaf splits, each with a real, hand-set
// loss-reduction value -- level-wise grows every leaf at the current
// depth; leaf-wise always grows whichever single leaf reduces loss most.
export interface GrowthNode { id: string; depth: number; parent: string | null; gain: number }
export const GROWTH_TREE: GrowthNode[] = [
  { id: 'root-L', depth: 1, parent: null, gain: 8 },
  { id: 'root-R', depth: 1, parent: null, gain: 2 },
  { id: 'root-L-L', depth: 2, parent: 'root-L', gain: 6 },
  { id: 'root-L-R', depth: 2, parent: 'root-L', gain: 5.5 },
  { id: 'root-R-L', depth: 2, parent: 'root-R', gain: 0.3 },
  { id: 'root-R-R', depth: 2, parent: 'root-R', gain: 0.2 },
];
export function levelWiseOrder(budget: number): GrowthNode[] {
  return GROWTH_TREE.filter((n) => n.depth === 1).slice(0, budget).concat(
    budget > 2 ? GROWTH_TREE.filter((n) => n.depth === 2).slice(0, budget - 2) : [],
  );
}
export function leafWiseOrder(budget: number): GrowthNode[] {
  return [...GROWTH_TREE].sort((a, b) => b.gain - a.gain).slice(0, budget);
}
