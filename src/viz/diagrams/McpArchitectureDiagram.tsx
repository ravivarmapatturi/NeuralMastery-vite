import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const SERVERS = [
  { key: 'fs', label: 'Filesystem server', offers: 'Tools: read_file, write_file, list_directory' },
  { key: 'gh', label: 'GitHub server', offers: 'Tools: create_issue, search_code · Resources: repo contents' },
  { key: 'db', label: 'Database server', offers: 'Tools: run_query · Resources: table schemas' },
];

/** One AI application connecting to multiple MCP servers -- click a
 * server to see what it exposes to the client. */
export default function McpArchitectureDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('gh');
  const color = getConceptColor(t, 'attention');
  const s = SERVERS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.offers}>
      <svg width="100%" viewBox="0 0 320 150" style={{ display: 'block' }}>
        <rect x={110} y={60} width={100} height={30} rx={7} fill={`${color}25`} stroke={color} strokeWidth={2} />
        <text x={160} y={80} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>MCP Client (AI app)</text>
        {SERVERS.map((x, i) => {
          const isActive = active === x.key;
          const y = 15 + i * 45;
          return (
            <g key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer' }}>
              <line x1={160} y1={60} x2={280} y2={y + 12} stroke={isActive ? color : t.textMuted} strokeWidth={isActive ? 2 : 1} opacity={isActive ? 1 : 0.35} />
              <rect x={220} y={y} width={95} height={24} rx={6} fill={isActive ? `${color}20` : t.surfaceAlt} stroke={isActive ? color : t.border} strokeWidth={isActive ? 1.5 : 1} />
              <text x={267} y={y + 15} textAnchor="middle" fontSize={7.5} fontWeight={isActive ? 700 : 500} fill={isActive ? color : t.textPrimary}>{x.label}</text>
            </g>
          );
        })}
      </svg>
    </VisualizationContainer>
  );
}
