import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const STEPS = [
  { label: 'Compute ŷ', desc: 'ŷ = wx + b for every example' },
  { label: 'Compute J(w,b)', desc: 'the current mean squared error' },
  { label: 'Compute ∂J/∂w, ∂J/∂b', desc: 'the gradient -- which way makes J worse' },
  { label: 'Update w, b', desc: 'w ← w − α·∂J/∂w, and the same for b -- step the OPPOSITE way' },
];

/** The loop the update rule actually runs, made explicit: predict, score,
 * differentiate, step -- repeat until the cost stops meaningfully
 * decreasing. Click a stage for what happens there. */
export default function GradientDescentLoopDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<number | null>(null);
  const color = getConceptColor(t, 'attention');
  const initColor = t.textSecondary;

  const width = 600;
  const height = 170;
  const boxY = 70;
  const boxW = 118;
  const boxH = 44;
  const gap = 22;
  const startX = 100;
  const stepX = (i: number) => startX + i * (boxW + gap);

  return (
    <VisualizationContainer footer="Click a stage. This loop is exactly what the Studio's Gradient Descent Lab mode runs live, one visible step at a time.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="gdloop-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>

        <rect x={10} y={boxY - 20} width={70} height={40} rx={6} fill={t.surfaceAlt} stroke={initColor} strokeWidth={1.5} />
        <text x={45} y={boxY - 2} textAnchor="middle" fontSize={9} fontWeight={700} fill={initColor}>init</text>
        <text x={45} y={boxY + 12} textAnchor="middle" fontSize={8} fontFamily="monospace" fill={initColor}>w,b</text>
        <line x1={80} y1={boxY} x2={stepX(0) - 6} y2={boxY} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#gdloop-arrow)" />

        {STEPS.map((s, i) => {
          const x = stepX(i);
          const isActive = active === i;
          return (
            <g key={i} onClick={() => setActive(isActive ? null : i)} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} style={{ cursor: 'pointer' }}>
              {i > 0 && <line x1={x - gap} y1={boxY} x2={x - 6} y2={boxY} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} markerEnd="url(#gdloop-arrow)" />}
              <rect x={x} y={boxY - 22} width={boxW} height={boxH} rx={6} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={x + boxW / 2} y={boxY + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>{s.label}</text>
            </g>
          );
        })}

        {/* loop-back arrow from Update back to Compute y-hat */}
        <path
          d={`M ${stepX(3) + boxW / 2},${boxY + 22} C ${stepX(3) + boxW / 2},${boxY + 60} ${stepX(0) + boxW / 2},${boxY + 60} ${stepX(0) + boxW / 2},${boxY + 22}`}
          fill="none"
          stroke={t.textMuted}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#gdloop-arrow)"
        />
        <text x={(stepX(0) + stepX(3) + boxW) / 2} y={boxY + 74} textAnchor="middle" fontSize={9} fill={t.textMuted}>repeat until J stops decreasing</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: active !== null ? color : t.textMuted, marginTop: 4, fontWeight: active !== null ? 700 : 400 }}>
        {active !== null ? STEPS[active].desc : 'w, b start at some initial value (often zero or small random values), then the loop runs.'}
      </div>
    </VisualizationContainer>
  );
}
