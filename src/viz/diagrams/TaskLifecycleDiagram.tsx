import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type State = 'submitted' | 'working' | 'input-required' | 'completed' | 'failed';
const STATES: { key: State; desc: string }[] = [
  { key: 'submitted', desc: 'The task has been handed off but the receiving agent hasn\'t started yet.' },
  { key: 'working', desc: 'The receiving agent is actively processing -- may take far longer than a single function call.' },
  { key: 'input-required', desc: 'The receiving agent needs clarification before it can continue -- something a stateless tool call has no way to express.' },
  { key: 'completed', desc: 'The task finished successfully; the result is available to the delegating agent.' },
  { key: 'failed', desc: 'The task could not be completed -- the delegating agent needs to decide whether to retry, reassign, or escalate.' },
];

/** Delegation isn't call-and-return -- it's a task with real states,
 * including one (input-required) that has no equivalent in a stateless
 * tool call. Click a state for what it means. */
export default function TaskLifecycleDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<State>('input-required');
  const color = getConceptColor(t, 'key');
  const terminalColor = (s: State) => (s === 'completed' ? getConceptColor(t, 'attention') : s === 'failed' ? t.accentDanger : color);

  const width = 600;
  const y = 55;
  const xFor = (i: number) => 50 + i * ((width - 100) / (STATES.length - 1));

  return (
    <VisualizationContainer footer={STATES.find((s) => s.key === active)!.desc}>
      <svg width="100%" viewBox={`0 0 ${width} 100`} style={{ display: 'block' }}>
        <defs>
          <marker id="tl-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {STATES.map((_, i) => i > 0 && (
          <line key={`l${i}`} x1={xFor(i - 1) + 45} y1={y} x2={xFor(i) - 45} y2={y} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#tl-arrow)" />
        ))}
        {active === 'input-required' && (
          <path d={`M ${xFor(2)},${y - 18} C ${xFor(2)},${y - 45} ${xFor(1)},${y - 45} ${xFor(1)},${y - 18}`} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3 2" markerEnd="url(#tl-arrow)" />
        )}
        {STATES.map((stateInfo, i) => {
          const isActive = active === stateInfo.key;
          const c = terminalColor(stateInfo.key);
          return (
            <g key={stateInfo.key} onClick={() => setActive(stateInfo.key)} onMouseEnter={() => setActive(stateInfo.key)} style={{ cursor: 'pointer' }}>
              <rect x={xFor(i) - 44} y={y - 18} width={88} height={36} rx={7} fill={isActive ? `${c}30` : t.surfaceAlt} stroke={c} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={xFor(i)} y={y + 4} textAnchor="middle" fontSize={9} fontWeight={isActive ? 700 : 500} fill={c}>{stateInfo.key}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        The curved arrow: input-required can loop back to working once clarification arrives.
      </div>
    </VisualizationContainer>
  );
}
