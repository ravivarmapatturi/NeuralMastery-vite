import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

export interface DiscoveryStep {
  name: string;
  constraint: string;
}

/** A problem-first case study's actual spine: each technology shown not
 * as a topic to learn, but as the answer to a specific constraint hit
 * along the way -- click a step to read exactly what broke and why this
 * specific piece is what fixes it, same click-a-stage interaction as the
 * site's other evolution diagrams, applied to "why does this system
 * need this" instead of "how did the field get here historically". */
export default function DiscoverySequenceDiagram({ steps }: { steps: DiscoveryStep[] }) {
  const t = useVizTokens();
  const [selected, setSelected] = useState(0);
  const width = Math.max(560, steps.length * 92);
  const height = 110;
  const nodeW = (width - 40) / steps.length;
  const y = 30;

  return (
    <VisualizationContainer footer={steps[selected].constraint}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="disc-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {steps.map((s, i) => {
          const x = 20 + i * nodeW + nodeW / 2;
          const isSelected = selected === i;
          const color = isSelected ? t.accentPrimary : t.accentSecondary;
          return (
            <g key={s.name}>
              {i > 0 && (
                <line
                  x1={20 + (i - 1) * nodeW + nodeW / 2 + 40}
                  y1={y}
                  x2={x - 40}
                  y2={y}
                  stroke={t.textMuted}
                  strokeWidth={1.5}
                  markerEnd="url(#disc-arrow)"
                />
              )}
              <g
                onClick={() => setSelected(i)}
                onMouseEnter={() => setSelected(i)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${s.name} step`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(i);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect x={x - 40} y={y - 18} width={80} height={36} rx={8} fill={isSelected ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={color}>
                  {s.name}
                </text>
              </g>
              <text x={x} y={y + 34} textAnchor="middle" fontSize={9} fill={t.textMuted}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a step -- each one exists because the previous one hit a real, specific limit.
      </div>
    </VisualizationContainer>
  );
}
