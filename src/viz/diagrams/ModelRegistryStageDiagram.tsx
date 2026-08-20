import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STAGES = ['None', 'Staging', 'Production', 'Archived'];

/** Click through a model version's actual stage transitions -- each
 * stage change is a deliberate, auditable promotion, not a silent swap. */
export default function ModelRegistryStageDiagram() {
  const t = useVizTokens();
  const [stage, setStage] = useState(2);
  const color = getConceptColor(t, 'attention');
  const width = 480;
  const y = 40;

  return (
    <VisualizationContainer footer={`Model v3 is currently: ${STAGES[stage]}. Every transition is logged with lineage back to the exact run that produced this version.`}>
      <svg width="100%" viewBox={`0 0 ${width} 70`} style={{ display: 'block' }}>
        <defs>
          <marker id="mrs-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {STAGES.map((s, i) => {
          const x = 60 + i * ((width - 100) / (STAGES.length - 1));
          const isActive = stage === i;
          return (
            <g key={s}>
              {i > 0 && <line x1={60 + (i - 1) * ((width - 100) / (STAGES.length - 1)) + 45} y1={y} x2={x - 45} y2={y} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#mrs-arrow)" />}
              <g onClick={() => setStage(i)} onMouseEnter={() => setStage(i)} style={{ cursor: 'pointer' }}>
                <rect x={x - 45} y={y - 18} width={90} height={36} rx={7} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={9.5} fontWeight={isActive ? 700 : 500} fill={color}>{s}</text>
              </g>
            </g>
          );
        })}
      </svg>
    </VisualizationContainer>
  );
}
