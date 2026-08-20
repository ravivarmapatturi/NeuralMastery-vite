import { useMemo, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { warmupCosine, warmupLinearDecay, stepDecay } from '../lib/calculus';

const TOTAL_STEPS = 1000;
const PEAK_LR = 1e-3;

export default function LrScheduleDiagram() {
  const t = useVizTokens();
  const [warmupSteps, setWarmupSteps] = useState(100);

  const samples = useMemo(() => Array.from({ length: 100 }, (_, i) => Math.round((i / 99) * TOTAL_STEPS)), []);
  const cosine = samples.map((s) => warmupCosine(s, TOTAL_STEPS, warmupSteps, PEAK_LR));
  const linear = samples.map((s) => warmupLinearDecay(s, TOTAL_STEPS, warmupSteps, PEAK_LR));
  const step = samples.map((s) => stepDecay(s, TOTAL_STEPS, PEAK_LR));

  const width = 420, height = 180;
  const px = (s: number) => (s / TOTAL_STEPS) * width;
  const py = (lr: number) => height - (lr / PEAK_LR) * (height - 10) - 5;

  const line = (values: number[]) => samples.map((s, i) => `${px(s)},${py(values[i])}`).join(' ');

  return (
    <VisualizationContainer footer={`Real formulas evaluated at every step: warmup ramps linearly from 0 to the peak LR over the first ${warmupSteps} steps, then each schedule decays differently. Watch the warmup slider -- too-short warmup means the very first, noisiest gradients get a large step; too-long wastes training time at a suboptimal LR.`}>
      <Slider label="warmup steps" value={warmupSteps} onChange={setWarmupSteps} min={10} max={400} step={10} />

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        <line x1={px(warmupSteps)} y1={0} x2={px(warmupSteps)} y2={height} stroke={t.textMuted} strokeWidth={1} strokeDasharray="3 3" />
        <polyline points={line(cosine)} fill="none" stroke={t.accentPrimary} strokeWidth={2.5} />
        <polyline points={line(linear)} fill="none" stroke={t.accentSecondary} strokeWidth={2} />
        <polyline points={line(step)} fill="none" stroke={t.accentWarn} strokeWidth={2} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted }}>
        <span><span style={{ color: t.accentPrimary }}>⬤</span> warmup + cosine decay</span>
        <span><span style={{ color: t.accentSecondary }}>⬤</span> warmup + linear decay</span>
        <span><span style={{ color: t.accentWarn }}>⬤</span> step decay</span>
      </div>
    </VisualizationContainer>
  );
}
