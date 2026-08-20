import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { nonQuadratic, gradientDescentPath, newtonPath } from '../lib/calculus';

const START: [number, number] = [2.2, 1.8];
const GD_LR = 0.35;
const STEPS = 12;

export default function NewtonVsGradientDescentDiagram() {
  const t = useVizTokens();
  const gdPath = useMemo(() => gradientDescentPath(START, GD_LR, STEPS), []);
  const newtonPathData = useMemo(() => newtonPath(START, STEPS), []);
  const controller = useStepController(STEPS + 1);

  const width = 300, height = 260, scale = 55, ox = width / 2, oy = height - 20;
  const px = (x: number) => ox + x * scale;
  const py = (y: number) => oy - y * scale - 40;

  const gdNow = gdPath[controller.step];
  const newtonNow = newtonPathData[Math.min(controller.step, newtonPathData.length - 1)];

  return (
    <VisualizationContainer footer={`Step ${controller.step}: gradient descent (red) is at f=${nonQuadratic(...gdNow).toFixed(4)}; Newton's method (blue), using the real Hessian to jump straight toward the local quadratic approximation's minimum, is at f=${nonQuadratic(...newtonNow).toFixed(6)} -- already essentially converged. Same surface (f = 0.1x⁴ + 2y²), same start, only the update rule differs.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: 300, margin: '0 auto' }}>
        <polyline points={gdPath.slice(0, controller.step + 1).map(([x, y]) => `${px(x)},${py(y)}`).join(' ')} fill="none" stroke={t.accentDanger} strokeWidth={2} />
        {gdPath.slice(0, controller.step + 1).map(([x, y], i) => <circle key={`g${i}`} cx={px(x)} cy={py(y)} r={i === controller.step ? 4.5 : 2} fill={t.accentDanger} fillOpacity={i === controller.step ? 1 : 0.4} />)}

        <polyline points={newtonPathData.slice(0, Math.min(controller.step, newtonPathData.length - 1) + 1).map(([x, y]) => `${px(x)},${py(y)}`).join(' ')} fill="none" stroke={t.accentSecondary} strokeWidth={2} />
        {newtonPathData.slice(0, Math.min(controller.step, newtonPathData.length - 1) + 1).map(([x, y], i) => <circle key={`n${i}`} cx={px(x)} cy={py(y)} r={i === controller.step ? 4.5 : 2} fill={t.accentSecondary} fillOpacity={i === controller.step ? 1 : 0.4} />)}

        <circle cx={px(0)} cy={py(0)} r={5} fill="none" stroke={t.textMuted} strokeWidth={1.5} strokeDasharray="2 2" />
      </svg>
      <VisualizationStepController controller={controller} totalSteps={STEPS + 1} stepLabel={(s) => `step ${s}`} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        <span><span style={{ color: t.accentDanger }}>⬤</span> gradient descent (fixed step)</span>
        <span><span style={{ color: t.accentSecondary }}>⬤</span> Newton's method (uses real Hessian)</span>
      </div>
    </VisualizationContainer>
  );
}
