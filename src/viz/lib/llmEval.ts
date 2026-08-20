// Shared math for the LLM/RAG/Agent Evaluation diagrams: real position-
// bias verdict flips, real verbosity-bias correlation (reusing a real
// Pearson-r computation), a scored toy agent trajectory, and real
// judge-vs-human agreement before/after rubric design.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Position bias --------------------------------------------------
export const RESPONSE_A_QUALITY = 7.2;
export const RESPONSE_B_QUALITY = 7.0;
export function judgeScoreWithPositionBias(trueQuality: number, isFirst: boolean, biasStrength: number): number {
  return trueQuality + (isFirst ? biasStrength : 0);
}

// --- Verbosity bias: real Pearson correlation ------------------------
export interface ScoredResponse { length: number; trueQuality: number; judgeScore: number }
export function pearsonR(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  return num / (Math.sqrt(dx2 * dy2) || 1);
}
export function generateResponses(n: number, biasStrength: number, seed: number): ScoredResponse[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const length = 20 + rand() * 380; // words, real range
    const trueQuality = 5 + (rand() - 0.5) * 4; // genuinely independent of length
    const judgeScore = trueQuality + biasStrength * (length / 400) * 5;
    return { length, trueQuality, judgeScore };
  });
}

// --- Agent trajectory -------------------------------------------------
export interface TrajectoryStep { tool: string; args: string; good: boolean; note: string }
export const TRAJECTORY: TrajectoryStep[] = [
  { tool: 'search_docs', args: 'query="refund policy"', good: true, note: 'Reasonable first step -- gathers context before acting.' },
  { tool: 'search_docs', args: 'query="refund policy 2019"', good: false, note: 'Wasted step -- re-searches near-identical query, no new information gained.' },
  { tool: 'get_order', args: 'order_id=A-113', good: true, note: 'Correct tool, correctly-formed arguments.' },
  { tool: 'issue_refund', args: 'order_id=A-113, amount=$42.00', good: true, note: 'Correct final action, matches the retrieved order exactly.' },
];
export function trajectoryQualityScore(steps: TrajectoryStep[]): number {
  return steps.filter((s) => s.good).length / steps.length;
}

// --- Judge validation: agreement with human scores ---------------------
export interface JudgeSample { human: number; judge: number }
export function generateJudgeSamples(n: number, seed: number, rubricQuality: number): JudgeSample[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const human = 1 + rand() * 9;
    const noise = (1 - rubricQuality) * (rand() - 0.5) * 8;
    const judge = Math.min(10, Math.max(1, human + noise));
    return { human, judge };
  });
}
