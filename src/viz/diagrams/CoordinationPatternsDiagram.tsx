import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Pattern = 'hierarchical' | 'peer' | 'blackboard';

const DESC: Record<Pattern, string> = {
  hierarchical: 'One orchestrator delegates to specialized sub-agents and combines results. Easiest to reason about and debug -- there\'s a clear owner of the overall task.',
  peer: 'Agents communicate directly with each other as equals, no central coordinator. More flexible, but harder to guarantee convergence or debug when something goes wrong.',
  blackboard: 'Agents don\'t talk to each other directly -- they read/write shared state and react to changes in it. Useful when the set of contributing agents isn\'t fixed in advance.',
};

/** The three topologies from Multi-Agent Systems, drawn as actual graphs
 * instead of described in prose -- the shape difference (star vs. mesh vs.
 * shared-node) is the entire tradeoff between debuggability and
 * flexibility. */
export default function CoordinationPatternsDiagram() {
  const t = useVizTokens();
  const [pattern, setPattern] = useState<Pattern>('hierarchical');
  const color = getConceptColor(t, 'attention');
  const width = 300;
  const height = 180;
  const cx = width / 2;
  const cy = height / 2;

  const agents = [0, 1, 2, 3].map((i) => {
    const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + 55 * Math.cos(angle), y: cy + 55 * Math.sin(angle) };
  });

  return (
    <VisualizationContainer footer={DESC[pattern]}>
      <PillSelect<Pattern>
        label="Coordination pattern"
        value={pattern}
        onChange={setPattern}
        options={[{ value: 'hierarchical', label: 'Hierarchical' }, { value: 'peer', label: 'Peer-to-peer' }, { value: 'blackboard', label: 'Blackboard' }]}
      />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        {pattern === 'hierarchical' && agents.map((a, i) => <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke={color} strokeWidth={1.5} />)}
        {pattern === 'peer' && agents.map((a, i) => agents.slice(i + 1).map((b, j) => <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={1} opacity={0.6} />))}
        {pattern === 'blackboard' && agents.map((a, i) => <line key={i} x1={a.x} y1={a.y} x2={cx} y2={cy} stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />)}

        {pattern === 'hierarchical' && (
          <>
            <circle cx={cx} cy={cy} r={16} fill={`${color}30`} stroke={color} strokeWidth={2} />
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize={7} fill={color}>orch.</text>
          </>
        )}
        {pattern === 'blackboard' && (
          <>
            <rect x={cx - 24} y={cy - 12} width={48} height={24} rx={4} fill={t.surfaceAlt} stroke={t.textMuted} strokeWidth={1.5} />
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize={6.5} fill={t.textMuted}>shared state</text>
          </>
        )}

        {agents.map((a, i) => (
          <g key={i}>
            <circle cx={a.x} cy={a.y} r={16} fill={`${color}18`} stroke={color} strokeWidth={1.5} />
            <text x={a.x} y={a.y + 3} textAnchor="middle" fontSize={7} fill={color}>A{i + 1}</text>
          </g>
        ))}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Same 4 agents, 3 different topologies -- the shape IS the tradeoff.
      </div>
    </VisualizationContainer>
  );
}
