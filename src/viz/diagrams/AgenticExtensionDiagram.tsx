import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

const LEVELS = [
  { label: 'Base prompting', desc: 'One prompt, one response -- entirely bounded by what the model already knows.' },
  { label: 'RAG', desc: 'Retrieve relevant context first, then generate -- extends knowledge, still one pass.' },
  { label: 'Tool use', desc: 'The model can call a function (search, calculator, API) and use the result before answering.' },
  { label: 'Agents', desc: 'Multi-step: reason, act, observe, repeat autonomously -- decides *whether* and *how many times* to act.' },
];

/** Increasing levels of capability extension, all still on the same
 * frozen-or-fine-tuned model this section covers -- click a level to see
 * exactly what capability it adds over the one before it. */
export default function AgenticExtensionDiagram() {
  const t = useVizTokens();
  const [level, setLevel] = useState(3);
  const color = t.accentPrimary;
  const width = 520;
  const height = 90;
  const stepW = (width - 20) / LEVELS.length;

  return (
    <VisualizationContainer footer={LEVELS[level].desc}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="agentic-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {LEVELS.map((l, i) => {
          const x = 10 + i * stepW + stepW / 2;
          const isActive = level === i;
          const y = 45 - i * 6;
          return (
            <g key={l.label}>
              {i > 0 && <line x1={10 + (i - 1) * stepW + stepW / 2 + 55} y1={45 - (i - 1) * 6} x2={x - 55} y2={y} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#agentic-arrow)" />}
              <g onClick={() => setLevel(i)} onMouseEnter={() => setLevel(i)} style={{ cursor: 'pointer' }}>
                <rect x={x - 55} y={y - 18} width={110} height={36} rx={7} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>{l.label}</text>
              </g>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a level — each adds autonomy the one before it didn't have.
      </div>
    </VisualizationContainer>
  );
}
