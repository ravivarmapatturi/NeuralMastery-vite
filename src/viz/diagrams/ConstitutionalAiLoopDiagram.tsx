import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

const STAGES = [
  { id: 'generate', label: 'Generate response', detail: 'The model produces an initial response to a prompt, same as any other generation step.' },
  { id: 'critique', label: 'Self-critique', detail: 'The SAME model is prompted to critique its own response against an explicit written principle from the constitution (e.g. "does this response avoid being harmful?").' },
  { id: 'revise', label: 'Self-revise', detail: 'The model rewrites its response to address the critique -- still no human in this loop at all.' },
  { id: 'train', label: 'Train on revised pairs', detail: 'The (original, revised) pair becomes training signal -- preferring the revised version -- replacing what a human preference label would have done in plain RLHF.' },
];

export default function ConstitutionalAiLoopDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('critique');
  const active = STAGES.find((s) => s.id === selected)!;

  const cx = 210, cy = 90, r = 70;
  const positions = STAGES.map((_, i) => {
    const angle = (i / STAGES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <VisualizationContainer footer={active.detail}>
      <svg width="100%" viewBox="0 0 420 180" style={{ display: 'block' }}>
        <defs>
          <marker id="cai-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {STAGES.map((_, i) => {
          const a = positions[i];
          const b = positions[(i + 1) % STAGES.length];
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          const x2 = a.x + (dx / len) * (len - 26);
          const y2 = a.y + (dy / len) * (len - 26);
          const x1 = a.x + (dx / len) * 26;
          const y1 = a.y + (dy / len) * 26;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#cai-arrow)" />;
        })}
        {STAGES.map((s, i) => {
          const pos = positions[i];
          const isSelected = selected === s.id;
          return (
            <g key={s.id} onClick={() => setSelected(s.id)} style={{ cursor: 'pointer' }}>
              <circle cx={pos.x} cy={pos.y} r={24} fill={isSelected ? `${t.accentPrimary}25` : t.surfaceAlt} stroke={isSelected ? t.accentPrimary : t.border} strokeWidth={isSelected ? 2.5 : 1.5} />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={isSelected ? t.accentPrimary : t.textPrimary}>{s.label.split(' ')[0]}</text>
            </g>
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" fontSize={10} fill={t.textMuted}>no human</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill={t.textMuted}>in the loop</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Compare to RLHF's pipeline (Training Pipeline page): same end goal (a preferred-vs-rejected training signal), but every step of the loop above is the model itself, not a human labeler -- reducing labeling volume and making the values being trained toward an explicit, readable document instead of an implicit pattern across thousands of individual labels.
      </div>
    </VisualizationContainer>
  );
}
