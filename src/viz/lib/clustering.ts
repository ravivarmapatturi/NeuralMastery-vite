// Shared math for DBSCAN/HDBSCAN and GMM/Spectral diagrams: a real DBSCAN
// implementation (core/border/noise classification + cluster expansion)
// and a real Gaussian Mixture Model trained via EM.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rand: () => number): number { return (rand() + rand() + rand() - 1.5) * 1.4; }

// --- Real DBSCAN ----------------------------------------------------------
export interface Point { x: number; y: number }
export function generateDbscanPoints(seed: number): Point[] {
  const rand = mulberry32(seed);
  const pts: Point[] = [];
  for (let i = 0; i < 35; i++) pts.push({ x: -1.5 + gaussian(rand) * 0.35, y: -1 + gaussian(rand) * 0.35 });
  for (let i = 0; i < 35; i++) pts.push({ x: 1.5 + gaussian(rand) * 0.35, y: 1 + gaussian(rand) * 0.35 });
  for (let i = 0; i < 10; i++) pts.push({ x: (rand() - 0.5) * 6, y: (rand() - 0.5) * 5 }); // scattered noise
  return pts;
}
function dist(a: Point, b: Point): number { return Math.hypot(a.x - b.x, a.y - b.y); }

export type DbscanLabel = { role: 'core' | 'border' | 'noise'; cluster: number | null };
export function runDbscan(points: Point[], eps: number, minSamples: number): DbscanLabel[] {
  const n = points.length;
  const neighbors = points.map((p) => points.map((q, j) => (dist(p, q) <= eps ? j : -1)).filter((j) => j >= 0));
  const isCore = neighbors.map((nb) => nb.length >= minSamples);
  const labels: DbscanLabel[] = points.map(() => ({ role: 'noise', cluster: null }));
  let clusterId = 0;

  for (let i = 0; i < n; i++) {
    if (labels[i].cluster !== null || !isCore[i]) continue;
    const cluster = clusterId++;
    const queue = [i];
    labels[i] = { role: 'core', cluster };
    while (queue.length) {
      const cur = queue.shift()!;
      for (const j of neighbors[cur]) {
        if (labels[j].cluster === null) {
          labels[j] = { role: isCore[j] ? 'core' : 'border', cluster };
          if (isCore[j]) queue.push(j);
        }
      }
    }
  }
  return labels;
}

// --- Real GMM via Expectation-Maximization --------------------------------
export interface GmmPoint { x: number; y: number }
export function generateGmmPoints(seed: number): GmmPoint[] {
  const rand = mulberry32(seed);
  const pts: GmmPoint[] = [];
  for (let i = 0; i < 40; i++) pts.push({ x: -0.9 + gaussian(rand) * 0.55, y: 0 + gaussian(rand) * 0.55 });
  for (let i = 0; i < 40; i++) pts.push({ x: 0.9 + gaussian(rand) * 0.55, y: 0.3 + gaussian(rand) * 0.55 });
  return pts;
}
interface GmmComponent { mu: [number, number]; sigma: number; pi: number }
function gaussDensity2(p: GmmPoint, comp: GmmComponent): number {
  const dx = p.x - comp.mu[0], dy = p.y - comp.mu[1];
  const s2 = comp.sigma * comp.sigma;
  return (1 / (2 * Math.PI * s2)) * Math.exp(-(dx * dx + dy * dy) / (2 * s2));
}
export function trainGmm(points: GmmPoint[], iterations: number, seed: number) {
  const rand = mulberry32(seed);
  let comps: GmmComponent[] = [
    { mu: [-1.5 + rand(), rand()], sigma: 1, pi: 0.5 },
    { mu: [1.5 + rand(), rand()], sigma: 1, pi: 0.5 },
  ];
  let responsibilities: number[][] = [];

  for (let it = 0; it < iterations; it++) {
    // E-step: real posterior responsibility per point per component
    responsibilities = points.map((p) => {
      const densities = comps.map((c) => c.pi * gaussDensity2(p, c));
      const sum = densities.reduce((a, b) => a + b, 0) || 1e-9;
      return densities.map((d) => d / sum);
    });
    // M-step: real weighted re-estimation
    comps = comps.map((_, j) => {
      const weights = responsibilities.map((r) => r[j]);
      const nEff = weights.reduce((a, b) => a + b, 0) || 1e-9;
      const mu: [number, number] = [
        points.reduce((s, p, i) => s + weights[i] * p.x, 0) / nEff,
        points.reduce((s, p, i) => s + weights[i] * p.y, 0) / nEff,
      ];
      const variance = points.reduce((s, p, i) => s + weights[i] * ((p.x - mu[0]) ** 2 + (p.y - mu[1]) ** 2), 0) / (2 * nEff);
      return { mu, sigma: Math.sqrt(Math.max(variance, 0.05)), pi: nEff / points.length };
    });
  }
  return { comps, responsibilities };
}
