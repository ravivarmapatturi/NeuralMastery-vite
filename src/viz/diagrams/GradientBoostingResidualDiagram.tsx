import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { BOOST_DATA, boostingRounds } from '../lib/ensembles';

const ROUNDS = 5;
const LR = 0.6;

export default function GradientBoostingResidualDiagram() {
  const t = useVizTokens();
  const history = useMemo(() => boostingRounds(BOOST_DATA, ROUNDS, LR), []);
  const controller = useStepController(history.length);
  const current = history[controller.step];

  const width = 380, height = 220;
  const xDomain: [number, number] = [0, 9];
  const yDomain: [number, number] = [0, 11];
  const px = (x: number) => ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * width;
  const py = (y: number) => height - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * height;

  const mse = BOOST_DATA.reduce((s, d, i) => s + (current.F[i] - d.y) ** 2, 0) / BOOST_DATA.length;

  return (
    <VisualizationContainer footer={`Round ${controller.step}/${ROUNDS}: real MSE = ${mse.toFixed(3)}. Each round fits a real single-split stump to the CURRENT residuals (search over every candidate threshold, minimize squared error of the two resulting leaf constants) and adds it, scaled by η=${LR}, to the running prediction -- exactly the algorithm in the prose, with real numbers at every step.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {BOOST_DATA.map((d, i) => (
          <circle key={i} cx={px(d.x)} cy={py(d.y)} r={4} fill={t.accentSecondary} />
        ))}
        <polyline points={BOOST_DATA.map((d, i) => `${px(d.x)},${py(current.F[i])}`).join(' ')} fill="none" stroke={t.accentPrimary} strokeWidth={2} />
        {BOOST_DATA.map((d, i) => (
          <circle key={`f${i}`} cx={px(d.x)} cy={py(current.F[i])} r={3.5} fill={t.accentPrimary} />
        ))}
        {controller.step > 0 && (
          <text x={px(current.stump.threshold)} y={12} textAnchor="middle" fontSize={10} fill={t.accentWarn}>split @ x={current.stump.threshold.toFixed(1)}</text>
        )}
      </svg>
      <VisualizationStepController controller={controller} totalSteps={history.length} stepLabel={(s) => `round ${s}`} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        <span><span style={{ color: t.accentSecondary }}>⬤</span> real data</span>
        <span><span style={{ color: t.accentPrimary }}>⬤</span> ensemble prediction F_t(x)</span>
      </div>
    </VisualizationContainer>
  );
}
