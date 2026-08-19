import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor, type DiagramConcept } from './diagramSystem';

const BRANCHES: { key: DiagramConcept; weight: string; out: string; latex: string; meaning: string }[] = [
  { key: 'query', weight: 'W_Q', out: 'Q', latex: 'Q = X W_Q', meaning: 'what am I looking for?' },
  { key: 'key', weight: 'W_K', out: 'K', latex: 'K = X W_K', meaning: 'what do I contain, for others to find?' },
  { key: 'value', weight: 'W_V', out: 'V', latex: 'V = X W_V', meaning: 'what do I actually offer if selected?' },
];

/** Embedding X projected through three independent learned weight matrices
 * into Query, Key, and Value -- the same one-source-three-branches shape
 * shown consistently everywhere QKV appears on this page. */
export default function QkvProjectionDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<number | null>(null);

  const width = 560;
  const height = 220;
  const xCenter = { x: 60, y: height / 2 };
  const branchX = 300;
  const outX = 480;
  const branchYs = [40, height / 2, height - 40];

  return (
    <VisualizationContainer footer="One embedding, three independent learned projections. Hover or tap a branch to see its formula.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          {BRANCHES.map((b, i) => (
            <marker key={b.key} id={`qkv-arrow-${i}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill={getConceptColor(t, b.key)} />
            </marker>
          ))}
        </defs>

        {/* source embedding */}
        <circle cx={xCenter.x} cy={xCenter.y} r={30} fill={getConceptColor(t, 'embedding')} fillOpacity={0.18} stroke={getConceptColor(t, 'embedding')} strokeWidth={2} />
        <text x={xCenter.x} y={xCenter.y + 5} textAnchor="middle" fontSize={16} fontWeight={700} fontFamily="monospace" fill={getConceptColor(t, 'embedding')}>
          X
        </text>

        {BRANCHES.map((b, i) => {
          const y = branchYs[i];
          const isActive = active === i;
          const color = getConceptColor(t, b.key);
          return (
            <g
              key={b.key}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(isActive ? null : i)}
              style={{ cursor: 'pointer' }}
              opacity={active === null || isActive ? 1 : 0.35}
            >
              <path
                d={`M ${xCenter.x + 30},${xCenter.y} C ${xCenter.x + 100},${xCenter.y} ${branchX - 80},${y} ${branchX - 32},${y}`}
                fill="none"
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                markerEnd={`url(#qkv-arrow-${i})`}
              />
              <rect x={branchX - 30} y={y - 16} width={64} height={32} rx={6} fill={t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2 : 1.5} />
              <text x={branchX + 2} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={700} fontFamily="monospace" fill={color}>
                {b.weight}
              </text>

              <line x1={branchX + 34} y1={y} x2={outX - 30} y2={y} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} markerEnd={`url(#qkv-arrow-${i})`} />

              <circle cx={outX} cy={y} r={26} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={outX} y={y + 5} textAnchor="middle" fontSize={15} fontWeight={700} fontFamily="monospace" fill={color}>
                {b.out}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
        {BRANCHES.map((b, i) => (
          <div key={b.key} style={{ fontSize: DIAGRAM_TYPE.caption.size, color: active === i ? getConceptColor(t, b.key) : t.textMuted, fontWeight: active === i ? 700 : 400 }}>
            {b.out}: {b.meaning}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <VisualizationMath latex={active !== null ? BRANCHES[active].latex : 'Q = XW_Q,\\quad K = XW_K,\\quad V = XW_V'} />
      </div>
    </VisualizationContainer>
  );
}
