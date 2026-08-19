import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const RUNGS = [
  { label: 'Single LLM call', desc: 'One input, one output, then stops. No memory across calls, no ability to act on anything.' },
  { label: 'Chatbot', desc: 'Holds a conversation (multi-turn memory of the dialogue), but still only produces text -- it cannot look anything up or take an action.' },
  { label: 'Agent', desc: 'Wraps the model in a loop: it can call a tool, observe the result, and decide what to do next -- potentially many times -- before answering.' },
  { label: 'Multi-agent system', desc: 'Multiple agents, each with their own loop and tools, coordinating (delegating, sharing state) to handle a task too large or too varied for one agent alone.' },
];

/** Each rung strictly adds one capability the rung below lacks -- click to
 * see exactly what's new, rather than treating "agent" as one monolithic
 * label. */
export default function AgentCapabilityLadderDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState(2);
  const color = getConceptColor(t, 'attention');
  const width = 520;
  const rungH = 42;
  const gap = 8;

  return (
    <VisualizationContainer footer={RUNGS[selected].desc}>
      <svg width="100%" viewBox={`0 0 ${width} ${RUNGS.length * (rungH + gap)}`} style={{ display: 'block' }}>
        {RUNGS.map((r, i) => {
          const y = (RUNGS.length - 1 - i) * (rungH + gap);
          const isSelected = selected === i;
          return (
            <g key={r.label} onClick={() => setSelected(i)} onMouseEnter={() => setSelected(i)} style={{ cursor: 'pointer' }}>
              <rect x={10} y={y} width={width - 20} height={rungH} rx={8} fill={isSelected ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
              <text x={26} y={y + rungH / 2 + 4} fontSize={12} fontWeight={700} fill={color}>{i + 1}. {r.label}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a rung -- each one strictly adds a capability the rung below it doesn't have.
      </div>
    </VisualizationContainer>
  );
}
