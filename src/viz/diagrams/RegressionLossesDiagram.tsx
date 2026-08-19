import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';
import MultiCurveChart from './MultiCurveChart';
import { useVizTokens } from '../../theme/vizTokens';

const DELTA = 1; // Huber threshold
const TAU = 0.9; // Quantile

function huber(r: number) {
  const a = Math.abs(r);
  return a <= DELTA ? 0.5 * r * r : DELTA * (a - 0.5 * DELTA);
}
function quantile(r: number) {
  return Math.max(TAU * r, (TAU - 1) * r);
}

/** All five as real functions of the residual (predicted - actual), all
 * evaluated live and overlaid on one shared axis -- the shape differences
 * the prose describes (quadratic vs. linear vs. hybrid) are the point,
 * so they need to be directly comparable, not five separate charts. */
export default function RegressionLossesDiagram() {
  const t = useVizTokens();
  const curves = [
    { label: 'MSE', color: getConceptColor(t, 'query'), fn: (r: number) => 0.5 * r * r },
    { label: 'MAE', color: t.accentSecondary, fn: (r: number) => Math.abs(r) },
    { label: `Huber (δ=${DELTA})`, color: t.accentWarn, fn: huber },
    { label: 'Log-Cosh', color: getConceptColor(t, 'attention'), fn: (r: number) => Math.log(Math.cosh(r)), dashed: true },
    { label: `Quantile (τ=${TAU})`, color: t.accentDanger, fn: quantile },
  ];

  return (
    <VisualizationContainer footer="Hover a curve to isolate it. MSE's quadratic growth dominates for large residuals; MAE and Huber stay linear past their threshold; Log-Cosh (dashed) is nearly indistinguishable from Huber but stays twice-differentiable everywhere; Quantile is the only asymmetric one.">
      <MultiCurveChart curves={curves} xMin={-3} xMax={3} yMin={0} yMax={4.5} xLabel="residual (ŷ − y)" yLabel="loss" />
    </VisualizationContainer>
  );
}
