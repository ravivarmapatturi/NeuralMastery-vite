import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const PAGES = [
  { label: 'Agent Fundamentals', href: '/docs/agents/agent-fundamentals', desc: 'The loop, tool-calling mechanics, and memory -- the mechanical building blocks.' },
  { label: 'Agent Architectures', href: '/docs/agents/agent-architectures', desc: 'ReAct, Plan-and-Execute, reflection -- concrete ways to structure the loop.' },
  { label: 'MCP', href: '/docs/agents/mcp/overview', desc: 'Standardizing how an agent talks to tools.' },
  { label: 'A2A', href: '/docs/agents/a2a/overview', desc: 'Standardizing how an agent talks to other agents.' },
  { label: 'Multi-Agent Systems', href: '/docs/agents/multi-agent-systems', desc: 'What changes once more than one agent is coordinating.' },
];

/** The reading order this section actually implies: mechanics first, then
 * how to structure them, then the protocols that let more than one agent
 * (or agent+tool) talk to each other at all. */
export default function AgentSectionMapDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState(0);
  const color = getConceptColor(t, 'attention');
  const width = 560;
  const stepX = (i: number) => 60 + i * ((width - 100) / (PAGES.length - 1));
  const y = 40;

  return (
    <VisualizationContainer footer={PAGES[active].desc}>
      <svg width="100%" viewBox={`0 0 ${width} 90`} style={{ display: 'block' }}>
        <defs>
          <marker id="asm-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {PAGES.map((_, i) => i > 0 && (
          <line key={i} x1={stepX(i - 1) + 34} y1={y} x2={stepX(i) - 34} y2={y} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#asm-arrow)" />
        ))}
        {PAGES.map((p, i) => {
          const isActive = active === i;
          return (
            <g key={p.label} onClick={() => setActive(i)} onMouseEnter={() => setActive(i)} style={{ cursor: 'pointer' }}>
              <circle cx={stepX(i)} cy={y} r={30} fill={isActive ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isActive ? 2.5 : 1.5} />
              <text x={stepX(i)} y={y + 4} textAnchor="middle" fontSize={7.5} fontWeight={700} fill={color}>{p.label}</text>
              <text x={stepX(i)} y={y + 46} textAnchor="middle" fontSize={8} fill={t.textMuted}>{i + 1}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>Click a stage for what it covers and how it builds on the one before it.</div>
    </VisualizationContainer>
  );
}
