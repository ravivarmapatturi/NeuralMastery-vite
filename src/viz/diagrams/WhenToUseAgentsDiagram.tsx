import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

type NodeKey = 'start' | 'predictable' | 'single-call' | 'unpredictable' | 'agent';

const NODES: Record<NodeKey, { label: string; x: number; y: number }> = {
  start: { label: 'Can the steps be predicted upfront?', x: 200, y: 20 },
  predictable: { label: 'Yes, fully', x: 100, y: 90 },
  'single-call': { label: 'Single call / fixed pipeline -- no loop needed', x: 100, y: 160 },
  unpredictable: { label: "No -- depends on what a step returns", x: 300, y: 90 },
  agent: { label: 'Agentic loop earns its complexity', x: 300, y: 160 },
};

const DESC: Record<NodeKey, string> = {
  start: 'The single question that actually decides this: can every step be known in advance, or does step N depend on what step N-1 returned?',
  predictable: 'The whole sequence of actions is knowable before running it -- even if there are multiple steps.',
  'single-call': 'A single prompt, or a fixed sequence of prompts/steps, does the job -- no loop, no tool-calling decisions to make at runtime, easier to debug.',
  unpredictable: 'The right next action genuinely depends on what came back from a previous step -- it cannot be hardcoded.',
  agent: "This is the actual test for needing an agent: not \"is an LLM involved\" but \"does the next action depend on a result I can't predict beforehand.\"",
};

/** The one real decision point, not a fuzzy "agents are for complex
 * tasks" heuristic -- click any node to see exactly which branch it's on
 * and why. */
export default function WhenToUseAgentsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<NodeKey>('agent');
  const yesColor = t.accentWarn;
  const noColor = getConceptColor(t, 'attention');
  const width = 420;
  const height = 200;

  function Node({ id }: { id: NodeKey }) {
    const n = NODES[id];
    const isActive = active === id;
    const isTerminal = id === 'single-call' || id === 'agent';
    const color = id === 'agent' ? noColor : isTerminal ? yesColor : t.textMuted;
    return (
      <g onClick={() => setActive(id)} onMouseEnter={() => setActive(id)} style={{ cursor: 'pointer' }}>
        <rect x={n.x - 70} y={n.y - 16} width={140} height={40} rx={7} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
        <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={8} fill={color}>{n.label}</text>
      </g>
    );
  }

  return (
    <VisualizationContainer footer={DESC[active]}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1={NODES.start.x} y1={NODES.start.y + 16} x2={NODES.predictable.x} y2={NODES.predictable.y - 16} stroke={t.textMuted} strokeWidth={1} />
        <line x1={NODES.start.x} y1={NODES.start.y + 16} x2={NODES.unpredictable.x} y2={NODES.unpredictable.y - 16} stroke={t.textMuted} strokeWidth={1} />
        <line x1={NODES.predictable.x} y1={NODES.predictable.y + 16} x2={NODES['single-call'].x} y2={NODES['single-call'].y - 16} stroke={t.textMuted} strokeWidth={1} />
        <line x1={NODES.unpredictable.x} y1={NODES.unpredictable.y + 16} x2={NODES.agent.x} y2={NODES.agent.y - 16} stroke={t.textMuted} strokeWidth={1} />
        {(Object.keys(NODES) as NodeKey[]).map((k) => <Node key={k} id={k} />)}
      </svg>
    </VisualizationContainer>
  );
}
