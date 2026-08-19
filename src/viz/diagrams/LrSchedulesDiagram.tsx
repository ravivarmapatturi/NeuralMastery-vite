import { VisualizationContainer } from '../primitives';
import MultiCurveChart from './MultiCurveChart';
import { useVizTokens } from '../../theme/vizTokens';

const T = 100; // total training steps shown
const WARMUP = 20;

function stepDecay(t: number) {
  return 0.5 ** Math.floor(t / 20);
}
function expDecayWithWarmup(t: number) {
  if (t < WARMUP) return t / WARMUP;
  const k = -Math.log(0.05) / (T - WARMUP);
  return Math.exp(-k * (t - WARMUP));
}
function cosineWithWarmup(t: number) {
  if (t < WARMUP) return t / WARMUP;
  return 0.5 * (1 + Math.cos((Math.PI * (t - WARMUP)) / (T - WARMUP)));
}
function cosineWarmRestarts(t: number) {
  const period = 25;
  const phase = t % period;
  return 0.5 * (1 + Math.cos((Math.PI * phase) / period));
}
function oneCycle(t: number) {
  const peakAt = 40;
  return t < peakAt ? t / peakAt : Math.max(0, 1 - (t - peakAt) / (T - peakAt));
}

/** All five schedules as real functions of training step, sharing one
 * axis so the actual shape differences (sudden drops vs. smooth decay vs.
 * periodic resets) are directly comparable, not five separate images. */
export default function LrSchedulesDiagram() {
  const t = useVizTokens();
  const curves = [
    { label: 'Step Decay', color: t.accentPrimary, fn: stepDecay },
    { label: 'Exponential Decay', color: t.accentSecondary, fn: expDecayWithWarmup },
    { label: 'Cosine Annealing', color: t.accentWarn, fn: cosineWithWarmup },
    { label: 'Cosine Warm Restarts', color: t.accentDanger, fn: cosineWarmRestarts },
    { label: 'One-Cycle Policy', color: t.textMuted, fn: oneCycle, dashed: true },
  ];

  return (
    <VisualizationContainer footer="Hover a schedule to isolate it. Step Decay's sudden drops vs. Cosine Annealing's smooth curve vs. Warm Restarts' periodic resets vs. One-Cycle's ramp-up-then-down are all visible directly, not just described. Warmup shows in the first 20 steps of Exponential and Cosine.">
      <MultiCurveChart curves={curves} xMin={0} xMax={T} yMin={0} yMax={1.05} xLabel="training step" yLabel="LR (relative to base)" />
    </VisualizationContainer>
  );
}
