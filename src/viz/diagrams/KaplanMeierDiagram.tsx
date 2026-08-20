import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { KM_SUBJECTS, kaplanMeier } from '../lib/specializedSupervised';

export default function KaplanMeierDiagram() {
  const t = useVizTokens();
  const steps = useMemo(() => kaplanMeier(KM_SUBJECTS), []);
  const controller = useStepController(steps.length);
  const current = steps[controller.step];

  const width = 380, height = 180;
  const maxTime = Math.max(...KM_SUBJECTS.map((s) => s.time)) + 1;
  const px = (t: number) => (t / maxTime) * width;
  const py = (s: number) => height - s * (height - 10) - 5;

  return (
    <VisualizationContainer footer={controller.step === 0
      ? `Start: Ŝ(0)=1, all ${KM_SUBJECTS.length} subjects at risk.`
      : `At real event time t=${current.time}: n_at_risk=${current.nAtRisk}, n_events=${current.nEvents}. Ŝ(t) = Ŝ(previous) × (1 − ${current.nEvents}/${current.nAtRisk}) = ${current.survival.toFixed(4)} -- the real product-formula, one real factor per step.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {steps.slice(0, controller.step + 1).map((s, i, arr) => {
          if (i === 0) return null;
          const prev = arr[i - 1];
          return (
            <g key={i}>
              <line x1={px(prev.time)} y1={py(prev.survival)} x2={px(s.time)} y2={py(prev.survival)} stroke={t.accentPrimary} strokeWidth={2.5} />
              <line x1={px(s.time)} y1={py(prev.survival)} x2={px(s.time)} y2={py(s.survival)} stroke={t.accentPrimary} strokeWidth={2.5} />
            </g>
          );
        })}
        <line x1={px(steps[Math.min(controller.step, steps.length - 1)].time)} y1={py(current.survival)} x2={px(maxTime)} y2={py(current.survival)} stroke={t.accentPrimary} strokeWidth={2.5} strokeDasharray={controller.step === steps.length - 1 ? undefined : '3 2'} />
        {KM_SUBJECTS.filter((s) => s.event === 0 && s.time <= steps[controller.step].time + 0.01).map((s, i) => {
          const stepAt = [...steps].reverse().find((st) => st.time <= s.time);
          return <text key={i} x={px(s.time)} y={py(stepAt?.survival ?? 1) - 6} textAnchor="middle" fontSize={12} fill={t.accentWarn}>+</text>;
        })}
      </svg>
      <VisualizationStepController controller={controller} totalSteps={steps.length} stepLabel={(s) => (s === 0 ? 't=0' : `t=${steps[s].time}`)} />
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        <span style={{ color: t.accentWarn }}>+</span> = a censored subject leaving the risk set without an event -- it still counted in every earlier n_at_risk.
      </div>
    </VisualizationContainer>
  );
}
