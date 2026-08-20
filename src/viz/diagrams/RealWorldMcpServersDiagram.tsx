import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const SERVERS = [
  { key: 'fs', label: 'Filesystem', desc: 'Read/write/list files in a sandboxed directory tree -- one of the first reference servers published, and the on-ramp for most local coding-agent setups.' },
  { key: 'github', label: 'GitHub', desc: 'Search code, read/create issues and PRs, inspect repo contents -- lets an agent operate directly against a real GitHub account\'s permissions.' },
  { key: 'slack', label: 'Slack', desc: 'Read channel history, post messages -- brings a team\'s communication context into an agent\'s reach.' },
  { key: 'postgres', label: 'Postgres', desc: 'Run read-only queries and inspect schemas against a real database -- the same "give the model real data access" pattern as RAG, but for structured data.' },
  { key: 'puppeteer', label: 'Puppeteer/Browser', desc: 'Drive a real browser -- navigate, click, read page content -- for tasks that need actual web interaction, not just an API.' },
];

/** A sample of widely-used MCP servers -- click one for what it
 * actually exposes. */
export default function RealWorldMcpServersDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('github');
  const color = getConceptColor(t, 'attention');
  const s = SERVERS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {SERVERS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
