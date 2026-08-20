import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STEPS = [
  { key: 'init', label: 'POST initialize', desc: 'Server MAY assign a session ID, returned via the Mcp-Session-Id response header -- a cryptographically secure value (UUID, JWT, or hash).' },
  { key: 'subsequent', label: 'Every later request', desc: 'Client MUST echo Mcp-Session-Id on every subsequent HTTP request. A server requiring sessions SHOULD 400 any non-init request missing it.' },
  { key: 'terminate', label: 'Server terminates session', desc: 'Server MAY end a session at any time -- after that, it MUST respond 404 to any request still carrying that session ID.' },
  { key: 'resume', label: 'Client sees 404', desc: 'On a 404 for its session ID, the client MUST start over with a fresh initialize request carrying no session ID.' },
];

/** The Mcp-Session-Id lifecycle for Streamable HTTP -- click a step
 * for the exact rule governing it. */
export default function StreamableHttpSessionDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('subsequent');
  const color = getConceptColor(t, 'attention');
  const s = STEPS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.desc}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {STEPS.map((x, i) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.6rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
                <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
              </div>
              {i < STEPS.length - 1 && <span style={{ color: t.textMuted, fontSize: 11 }}>→</span>}
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
