import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const CLIENTS = 5;
const WIDTH = 420;
const HEIGHT = 90;

function seeded(i: number): number {
  const x = Math.sin(i * 999.123) * 10000;
  return x - Math.floor(x);
}

/** Five clients whose first request all fail at the same instant --
 * click to see fixed backoff retry in lockstep (a synchronized burst
 * that re-overloads the recovering dependency) versus jittered
 * backoff spreading the retries out. */
export default function JitteredBackoffDiagram() {
  const t = useVizTokens();
  const [jittered, setJittered] = useState(false);
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;
  const baseDelay = 0.55;

  return (
    <VisualizationContainer footer={jittered ? 'With random jitter added to each delay, the retries land spread out over time -- the dependency sees a smooth trickle of requests instead of a synchronized spike.' : 'With a fixed backoff delay, every client that failed at the same instant also retries at the same instant -- a synchronized burst that can re-overload the dependency the moment it recovers.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button type="button" onClick={() => setJittered(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !jittered ? 700 : 500, background: !jittered ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!jittered ? color : t.border}`, color: !jittered ? color : t.textSecondary, cursor: 'pointer' }}>
          Fixed backoff
        </button>
        <button type="button" onClick={() => setJittered(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: jittered ? 700 : 500, background: jittered ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${jittered ? color : t.border}`, color: jittered ? color : t.textSecondary, cursor: 'pointer' }}>
          + Jitter
        </button>
      </div>
      <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ display: 'block' }}>
        <line x1={10} y1={20} x2={10} y2={HEIGHT - 10} stroke={t.border} strokeWidth={1} />
        {Array.from({ length: CLIENTS }).map((_, i) => {
          const y = 20 + i * 15;
          const xFail = 40;
          const jitterFrac = jittered ? seeded(i) * 0.7 : 0;
          const xRetry = 40 + (baseDelay + jitterFrac) * (WIDTH - 90);
          return (
            <g key={i}>
              <circle cx={xFail} cy={y} r={4} fill={badColor} />
              <line x1={xFail} y1={y} x2={xRetry} y2={y} stroke={t.textMuted} strokeWidth={1} strokeDasharray="2,2" opacity={0.5} />
              <circle cx={xRetry} cy={y} r={4} fill={okColor} />
            </g>
          );
        })}
        <text x={40} y={12} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>all fail</text>
        <text x={WIDTH - 40} y={12} textAnchor="middle" fontSize={7.5} fill={t.textMuted}>retries →</text>
      </svg>
    </VisualizationContainer>
  );
}
