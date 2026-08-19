import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

const STAGES = [
  { name: 'Plain RNN', fixed: '— (the baseline)', limited: 'Vanishing/exploding gradients; ~10-20 steps of usable memory' },
  { name: 'LSTM / GRU', fixed: 'Vanishing gradients, via gating', limited: 'Still strictly sequential -- no parallelism across time' },
  { name: 'Seq2Seq', fixed: 'Input/output sequences of different lengths', limited: 'Whole input squeezed through one fixed-size context vector' },
  { name: 'Seq2Seq + Attn', fixed: 'The fixed-context-vector bottleneck', limited: 'Still built on RNNs -- still sequential underneath' },
  { name: 'Transformer', fixed: 'Removes the RNN entirely', limited: 'O(n²) attention cost in sequence length' },
];

/** The comparison table above, walked as a chain: each stage inherits every
 * problem the previous one didn't solve, plus whatever it fixed. Click a
 * stage to read exactly what changed and what's still left. */
export default function ArchitectureEvolutionDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState(4);
  const width = 600;
  const height = 130;
  const nodeW = (width - 40) / STAGES.length;
  const y = 40;

  return (
    <VisualizationContainer footer="Click a stage -- every architecture up through Seq2Seq+Attention kept recurrence and patched around its consequences. The Transformer is the point where the field stopped patching recurrence and removed it.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="eve-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {STAGES.map((s, i) => {
          const x = 20 + i * nodeW + nodeW / 2;
          const isSelected = selected === i;
          const isLast = i === STAGES.length - 1;
          const color = isLast ? t.accentPrimary : t.accentSecondary;
          return (
            <g key={s.name}>
              {i > 0 && (
                <line x1={20 + (i - 1) * nodeW + nodeW / 2 + 46} y1={y} x2={x - 46} y2={y} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#eve-arrow)" />
              )}
              <g onClick={() => setSelected(i)} onMouseEnter={() => setSelected(i)} style={{ cursor: 'pointer' }}>
                <rect x={x - 46} y={y - 20} width={92} height={40} rx={8} fill={isSelected ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>{s.name}</text>
              </g>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap', fontSize: DIAGRAM_TYPE.caption.size }}>
        <div style={{ color: t.accentPrimary }}><strong>Fixed:</strong> <span style={{ color: t.textSecondary }}>{STAGES[selected].fixed}</span></div>
        <div style={{ color: t.accentDanger }}><strong>Still limited by:</strong> <span style={{ color: t.textSecondary }}>{STAGES[selected].limited}</span></div>
      </div>
    </VisualizationContainer>
  );
}
