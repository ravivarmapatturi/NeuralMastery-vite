// Shared math for the Evaluation Fundamentals diagrams: a real
// construct-validity shortcut-exploitation simulation, real contamination
// score-inflation arithmetic, a real saturation/discriminative-power
// shrinkage computation, and real golden-dataset coverage via nearest
// neighbors over a synthetic production-input cloud.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Construct validity: a shortcut model exploiting a surface cue -----
export interface BenchmarkItem { trueAnswer: 0 | 1; surfaceCue: 0 | 1 }
export function generateBenchmark(n: number, cueCorrelation: number, seed: number): BenchmarkItem[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const trueAnswer: 0 | 1 = rand() < 0.5 ? 0 : 1;
    const cueMatches = rand() < cueCorrelation;
    const surfaceCue: 0 | 1 = cueMatches ? trueAnswer : ((1 - trueAnswer) as 0 | 1);
    return { trueAnswer, surfaceCue };
  });
}
export function shortcutModelAccuracy(items: BenchmarkItem[]): number {
  return items.filter((i) => i.surfaceCue === i.trueAnswer).length / items.length;
}
export function realCapabilityAccuracy(items: BenchmarkItem[], p: number, seed: number): number {
  const rand = mulberry32(seed + 999);
  let correct = 0;
  for (const item of items) {
    const predicted = rand() < p ? item.trueAnswer : ((1 - item.trueAnswer) as 0 | 1);
    if (predicted === item.trueAnswer) correct++;
  }
  return correct / items.length;
}

// --- Contamination: real linear score inflation -------------------------
export function contaminatedScore(trueCapability: number, contaminationFraction: number): number {
  return (1 - contaminationFraction) * trueCapability + contaminationFraction * 1.0;
}

// --- Saturation: discriminative power (spread) shrinking near ceiling --
export function stddev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
export function generationScores(genIndex: number, seed: number, n = 6): number[] {
  const rand = mulberry32(seed + genIndex * 17);
  // Later generations cluster tighter and closer to the ceiling (1.0) --
  // a real, if simplified, model of benchmark saturation over time.
  const ceiling = 1 - 0.85 ** (genIndex + 1);
  const spread = 0.18 / (genIndex + 1);
  return Array.from({ length: n }, () => Math.min(0.995, Math.max(0, ceiling + (rand() - 0.5) * spread)));
}

// --- Golden dataset coverage: real nearest-neighbor distance -----------
export interface Point2D { x: number; y: number }
export function generateProductionCloud(n: number, seed: number): Point2D[] {
  const rand = mulberry32(seed);
  const pts: Point2D[] = [];
  // Two real clusters (common cases) plus a sparse tail (rare/edge cases).
  for (let i = 0; i < n; i++) {
    const isTail = rand() < 0.2;
    if (isTail) {
      pts.push({ x: (rand() - 0.5) * 3.6, y: (rand() - 0.5) * 3.6 });
    } else {
      const cx = rand() < 0.5 ? -0.9 : 0.9;
      pts.push({ x: cx + (rand() - 0.5) * 0.8, y: (rand() - 0.5) * 0.8 });
    }
  }
  return pts;
}
export function coverageFraction(production: Point2D[], golden: Point2D[], radius: number): number {
  const covered = production.filter((p) => golden.some((g) => Math.hypot(p.x - g.x, p.y - g.y) <= radius));
  return covered.length / production.length;
}
