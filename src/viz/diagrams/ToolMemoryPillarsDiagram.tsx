import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Tools and memory are the only two things standing between "an agent
 * with a good idea" and "an agent that can actually execute it" -- remove
 * either pillar and the loop breaks down in a specific, different way. */
export default function ToolMemoryPillarsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<'tools' | 'memory'>('tools');
  const toolColor = getConceptColor(t, 'query');
  const memColor = getConceptColor(t, 'key');
  const width = 480;
  const height = 160;

  const without: Record<'tools' | 'memory', string> = {
    tools: 'Without tools: an agent can reason about what to do, but has no way to actually do it -- it can only ever produce text.',
    memory: "Without memory: an agent can act once, but can't accumulate context beyond a single conversation or context window -- every session starts from zero.",
  };

  function Pillar({ id, label, color, x }: { id: 'tools' | 'memory'; label: string; color: string; x: number }) {
    const isActive = active === id;
    return (
      <g onClick={() => setActive(id)} onMouseEnter={() => setActive(id)} style={{ cursor: 'pointer' }}>
        <rect x={x} y={20} width={140} height={100} rx={10} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
        <text x={x + 70} y={75} textAnchor="middle" fontSize={13} fontWeight={700} fill={color}>{label}</text>
      </g>
    );
  }

  return (
    <VisualizationContainer footer={without[active]}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <Pillar id="tools" label="Tools" color={toolColor} x={80} />
        <Pillar id="memory" label="Memory" color={memColor} x={260} />
        <rect x={30} y={135} width={420} height={4} rx={2} fill={t.textMuted} opacity={0.4} />
        <text x={width / 2} y={155} textAnchor="middle" fontSize={9} fill={t.textMuted}>the loop (Agent Fundamentals) rests on both</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>Click a pillar to see what breaks without it.</div>
    </VisualizationContainer>
  );
}
