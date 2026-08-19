import { useEffect, useMemo, useRef, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PlaybackControls } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { gradientAscentPath, neuronActivationValue } from '../lib/deepInterp';

const START: [number, number] = [-1.6, 1.6];
const STEPS = 24;
const LR = 0.35;

export default function ActivationMaximizationDiagram() {
  const t = useVizTokens();
  const path = useMemo(() => gradientAscentPath(START, STEPS, LR), []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setStep((s) => {
          if (s >= path.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 220);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, path.length]);

  const width = 420;
  const height = 380;
  const domain: [number, number] = [-2.2, 2.2];
  const scale = width / (domain[1] - domain[0]);
  const px = (x: number) => (x - domain[0]) * scale;
  const py = (y: number) => height - (y - domain[0]) * scale;

  // background field: sample a coarse grid of the real activation function
  const cells = 24;
  const field: { x: number; y: number; v: number }[] = [];
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const x = domain[0] + ((i + 0.5) / cells) * (domain[1] - domain[0]);
      const y = domain[0] + ((j + 0.5) / cells) * (domain[1] - domain[0]);
      field.push({ x, y, v: neuronActivationValue(x, y) });
    }
  }
  const maxV = Math.max(...field.map((f) => f.v));
  const cellSize = width / cells;

  const current = path[step];

  return (
    <VisualizationContainer footer={`Step ${step}/${STEPS}: activation = ${current.activation.toFixed(3)} at (${current.x.toFixed(2)}, ${current.y.toFixed(2)}). Every step really is x,y ← x,y + lr·∇activation(x,y), a numerically-estimated real gradient of the function shaded behind the path -- climbing toward whichever bump is locally uphill from the start, not necessarily the global maximum.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: 420, margin: '0 auto' }}>
        {field.map((f, i) => (
          <rect key={i} x={px(f.x) - cellSize / 2} y={py(f.y) - cellSize / 2} width={cellSize + 0.5} height={cellSize + 0.5} fill={t.accentPrimary} fillOpacity={Math.max(0, f.v / maxV) * 0.55} />
        ))}
        <polyline
          points={path.slice(0, step + 1).map((p) => `${px(p.x)},${py(p.y)}`).join(' ')}
          fill="none" stroke={t.accentWarn} strokeWidth={2}
        />
        {path.slice(0, step + 1).map((p, i) => (
          <circle key={i} cx={px(p.x)} cy={py(p.y)} r={i === step ? 6 : 2.5} fill={t.accentWarn} fillOpacity={i === step ? 1 : 0.5} />
        ))}
        <circle cx={px(START[0])} cy={py(START[1])} r={5} fill="none" stroke={t.textSecondary} strokeWidth={1.5} />
        <text x={px(START[0]) + 8} y={py(START[1]) - 8} fontSize={10} fill={t.textSecondary}>start</text>
      </svg>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <PlaybackControls
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          onReset={() => { setPlaying(false); setStep(0); }}
          onStepBack={() => setStep((s) => Math.max(0, s - 1))}
          onStepForward={() => setStep((s) => Math.min(path.length - 1, s + 1))}
          disableBack={step === 0}
          disableForward={step === path.length - 1}
        />
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        This is exactly how feature-visualization tools (e.g. the classic "what does this neuron want to see" images) generate their inputs -- not by inspecting weights directly, but by optimizing an input to maximize one neuron's real activation.
      </div>
    </VisualizationContainer>
  );
}
