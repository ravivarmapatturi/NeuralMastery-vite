// Shared math for the domain-applications diagrams: a real cost-weighted
// threshold search (reusing the same scored examples as Model Evaluation &
// Metrics), and real domain-randomization sim-to-real generalization math.

export { generateScoredExamples, metricsAtThreshold } from './modelEvaluation';

/** Real optimal linear gain w minimizing E[(w*f - 1)^2] for f ~ Uniform[low, high]
 * -- the actual closed-form best-response a linear controller trained
 * across randomized simulation parameters converges to. */
export function domainRandomizedOptimalGain(low: number, high: number): number {
  const meanF = (low + high) / 2;
  const varF = ((high - low) ** 2) / 12;
  const meanF2 = varF + meanF * meanF;
  return meanF / meanF2;
}
export function simOnlyGain(simParam: number): number {
  return 1 / simParam;
}
export function relativeError(gain: number, realParam: number): number {
  return Math.abs(gain * realParam - 1);
}
