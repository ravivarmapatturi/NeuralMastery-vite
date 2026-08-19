import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Canary rollout, made concrete: drag the traffic split and watch the
 * request stream actually route between v1 and v2 in that proportion,
 * instead of just being told "gradually increase traffic to v2." */
export default function VersioningAndCanaryDiagram() {
  const t = useVizTokens();
  const [v2Pct, setV2Pct] = useState(10);
  const v1Color = getConceptColor(t, 'query');
  const v2Color = getConceptColor(t, 'attention');
  const width = 560;
  const requests = Array.from({ length: 20 }, (_, i) => (i % 10 < v2Pct / 10 ? 'v2' : 'v1'));

  return (
    <VisualizationContainer footer="Canary rollout: send a small, controlled percentage of live traffic to the new version, watch its error rate/latency, and ramp up only if it looks healthy -- versioned endpoints (/v1, /v2) are what makes this possible without breaking existing callers.">
      <Slider label={`Traffic to v2: ${v2Pct}%`} min={0} max={100} step={10} value={v2Pct} onChange={setV2Pct} />
      <svg width="100%" viewBox={`0 0 ${width} 90`} style={{ display: 'block', marginTop: 8 }}>
        <text x={20} y={20} fontSize={10} fontWeight={700} fill={t.textMuted}>Incoming requests →</text>
        {requests.map((v, i) => {
          const x = 20 + (i % 10) * 52;
          const row = Math.floor(i / 10);
          const y = 35 + row * 30;
          const color = v === 'v1' ? v1Color : v2Color;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={9} fill={`${color}30`} stroke={color} strokeWidth={1.5} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize={7} fontWeight={700} fill={color}>{v}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4, fontSize: DIAGRAM_TYPE.caption.size }}>
        <span style={{ color: v1Color }}>● v1 (stable) — {100 - v2Pct}%</span>
        <span style={{ color: v2Color }}>● v2 (canary) — {v2Pct}%</span>
      </div>
    </VisualizationContainer>
  );
}
