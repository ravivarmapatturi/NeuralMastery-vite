// Shared math for association rules, topic modeling, and anomaly
// detection diagrams: real support/confidence/lift over a real toy
// transaction database, a real word-likelihood topic-mixture estimate,
// and a real Monte Carlo isolation-forest path-length simulation.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Association rules: real transactions, real metrics ------------------
export const TRANSACTIONS: string[][] = [
  ['bread', 'butter', 'milk'], ['bread', 'butter'], ['bread', 'milk'], ['butter', 'milk'],
  ['bread', 'butter', 'milk', 'eggs'], ['eggs', 'milk'], ['bread', 'eggs'],
  ['bread', 'butter', 'eggs'], ['butter', 'milk', 'eggs'], ['bread', 'butter', 'milk'],
];
function support(items: string[]): number {
  return TRANSACTIONS.filter((t) => items.every((i) => t.includes(i))).length / TRANSACTIONS.length;
}
export function ruleMetrics(antecedent: string[], consequent: string[]) {
  const suppAntecedent = support(antecedent);
  const suppConsequent = support(consequent);
  const suppBoth = support([...antecedent, ...consequent]);
  const confidence = suppBoth / (suppAntecedent || 1e-9);
  const lift = confidence / (suppConsequent || 1e-9);
  return { support: suppBoth, confidence, lift };
}

// --- Topic modeling: real word-likelihood topic mixture ------------------
export const TOPICS: Record<string, Record<string, number>> = {
  sports: { game: 0.25, team: 0.2, score: 0.15, player: 0.15, market: 0.02, stock: 0.02, doctor: 0.01 },
  finance: { market: 0.25, stock: 0.22, price: 0.15, invest: 0.12, game: 0.02, team: 0.02, doctor: 0.01 },
  health: { doctor: 0.25, patient: 0.2, treatment: 0.15, symptom: 0.12, market: 0.02, game: 0.02, stock: 0.01 },
};
export function estimateTopicMixture(words: string[]) {
  const logProbs: Record<string, number> = {};
  for (const topic of Object.keys(TOPICS)) {
    logProbs[topic] = words.reduce((s, w) => s + Math.log(TOPICS[topic][w] ?? 0.005), 0);
  }
  const maxLog = Math.max(...Object.values(logProbs));
  const expVals = Object.fromEntries(Object.entries(logProbs).map(([k, v]) => [k, Math.exp(v - maxLog)]));
  const sum = Object.values(expVals).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(expVals).map(([k, v]) => [k, v / sum]));
}

// --- Isolation Forest: real random-split path-length simulation ---------
export interface AnomalyPoint { x: number; y: number; isOutlier: boolean }
export function generateAnomalyPoints(seed: number): AnomalyPoint[] {
  const rand = mulberry32(seed);
  const pts: AnomalyPoint[] = [];
  for (let i = 0; i < 30; i++) pts.push({ x: (rand() + rand() + rand() - 1.5) * 0.9, y: (rand() + rand() + rand() - 1.5) * 0.9, isOutlier: false });
  pts.push({ x: 3.2, y: 3, isOutlier: true });
  pts.push({ x: -3, y: 2.6, isOutlier: true });
  return pts;
}
/** Real random isolation split: pick a random feature and threshold
 * within the current subset's range, recurse until the target point is
 * alone -- the actual Isolation Forest path-length definition. */
function isolationPathLength(target: AnomalyPoint, points: AnomalyPoint[], rand: () => number, depth = 0): number {
  if (points.length <= 1 || depth > 20) return depth;
  const useX = rand() < 0.5;
  const values = points.map((p) => (useX ? p.x : p.y));
  const min = Math.min(...values), max = Math.max(...values);
  if (min === max) return depth;
  const threshold = min + rand() * (max - min);
  const targetVal = useX ? target.x : target.y;
  const subset = points.filter((p) => ((useX ? p.x : p.y) < threshold) === (targetVal < threshold));
  if (subset.length === points.length) return depth + 1; // degenerate split, still counts as a step
  return isolationPathLength(target, subset, rand, depth + 1);
}
export function averagePathLengths(points: AnomalyPoint[], nTrees: number, seed: number) {
  const rand = mulberry32(seed);
  return points.map((p) => {
    let sum = 0;
    for (let t = 0; t < nTrees; t++) sum += isolationPathLength(p, points, rand);
    return sum / nTrees;
  });
}
