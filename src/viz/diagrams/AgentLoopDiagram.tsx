import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const STEPS = [
  { stage: 'Model decides', detail: 'Given the input + history so far, decide: call a tool, or answer now?' },
  { stage: 'Call tool', detail: 'Emit a structured request — function name + arguments — instead of a plain text answer.' },
  { stage: 'Observe result', detail: 'The calling application executes the function and feeds the result back into context.' },
  { stage: 'Model decides', detail: 'With the new result in context: call another tool, or is this enough to answer?' },
  { stage: 'Final answer', detail: 'Enough information has accumulated in context — produce the final answer and stop.' },
];

/** Step through the actual agent loop one decision at a time -- the same
 * "decide, act, observe" cycle repeats until the model itself decides it
 * has enough to answer, which is exactly what separates it from a single
 * LLM call. */
export default function AgentLoopDiagram() {
  const t = useVizTokens();
  const [step, setStep] = useState(0);
  const color = getConceptColor(t, 'attention');
  const width = 480;
  const height = 170;
  const cx = width / 2;
  const cy = 75;
  const r = 60;
  const nodeAngles = [-90, -18, 54, 126, 198].map((d) => (d * Math.PI) / 180);

  return (
    <VisualizationContainer footer={STEPS[step].detail}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {STEPS.slice(0, 4).map((_, i) => {
          const a1 = nodeAngles[i];
          const a2 = nodeAngles[(i + 1) % 4];
          const x1 = cx + r * Math.cos(a1);
          const y1 = cy + r * Math.sin(a1);
          const x2 = cx + r * Math.cos(a2);
          const y2 = cy + r * Math.sin(a2);
          const isActive = step === i || (step === 3 && i === 3);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isActive ? color : t.border} strokeWidth={isActive ? 2.5 : 1.5} opacity={isActive ? 1 : 0.5} />;
        })}
        {STEPS.map((s, i) => {
          const isLast = i === 4;
          const pos = isLast ? { x: cx + r + 90, y: cy } : { x: cx + r * Math.cos(nodeAngles[i]), y: cy + r * Math.sin(nodeAngles[i]) };
          const isActive = step === i;
          return (
            <g key={i} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
              <circle cx={pos.x} cy={pos.y} r={30} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} opacity={isActive || isLast ? 1 : 0.6} />
              <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize={8} fontWeight={isActive ? 700 : 400} fill={isActive ? color : t.textSecondary}>{s.stage}</text>
            </g>
          );
        })}
        {step === 3 && <line x1={cx} y1={cy - r} x2={cx + r + 60} y2={cy} stroke={color} strokeWidth={2} strokeDasharray="3 2" />}
      </svg>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
        <VizButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← prev</VizButton>
        <VizButton onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>next →</VizButton>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color, fontWeight: 700, marginTop: 6 }}>
        Step {step + 1} of {STEPS.length}: {STEPS[step].stage}
      </div>
    </VisualizationContainer>
  );
}
