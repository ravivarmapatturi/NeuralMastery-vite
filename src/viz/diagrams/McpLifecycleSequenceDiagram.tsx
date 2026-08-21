import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STEPS = [
  { key: 'init-req', label: '1. Client → initialize', msg: '{"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{...},"clientInfo":{...}}}', desc: 'The client MUST send this first, declaring the protocol version it supports (its latest) plus its own capabilities (roots, sampling, elicitation) and identity.' },
  { key: 'init-res', label: '2. Server → initialize response', msg: '{"result":{"protocolVersion":"2025-06-18","capabilities":{...},"serverInfo":{...}}}', desc: 'The server responds with the SAME version if it supports it, or another version it does support otherwise. If the client can\'t accept that, it SHOULD disconnect.' },
  { key: 'init-notify', label: '3. Client → initialized notification', msg: '{"method":"notifications/initialized"}', desc: 'A one-way notification (no response expected) telling the server the client is ready. Neither side should send real requests before this point -- only pings are allowed earlier.' },
  { key: 'operation', label: '4. Operation phase', msg: 'tools/list, tools/call, resources/read, ...', desc: 'Normal traffic, using only the capabilities that were actually negotiated in steps 1-2.' },
  { key: 'shutdown', label: '5. Shutdown', msg: 'stdio: close stdin → SIGTERM → SIGKILL. HTTP: close connection.', desc: 'No MCP-level shutdown message exists -- termination is signaled at the transport layer itself.' },
];

/** The five-phase MCP connection lifecycle, with the actual message
 * shapes at each step -- click through in order. */
export default function McpLifecycleSequenceDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('init-req');
  const color = getConceptColor(t, 'attention');
  const s = STEPS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.desc}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {STEPS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.45rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 8.5, padding: '0.6rem', borderRadius: 7, background: t.surfaceAlt, color: t.textSecondary, wordBreak: 'break-word' }}>
        {s.msg}
      </div>
    </VisualizationContainer>
  );
}
