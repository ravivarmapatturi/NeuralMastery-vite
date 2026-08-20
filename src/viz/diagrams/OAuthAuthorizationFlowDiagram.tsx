import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STEPS = [
  { key: 'request', label: '1. Client → MCP server', desc: 'A request with no access token yet.' },
  { key: '401', label: '2. Server → 401 + WWW-Authenticate', desc: 'Unauthorized, with a WWW-Authenticate header pointing to the resource metadata URL.' },
  { key: 'metadata', label: '3. Client fetches protected resource metadata', desc: 'GET /.well-known/oauth-protected-resource -- returns the authorization_servers this MCP server trusts.' },
  { key: 'as-metadata', label: '4. Client fetches authorization server metadata', desc: 'GET /.well-known/oauth-authorization-server (RFC 8414) -- endpoints and capabilities of the chosen authorization server.' },
  { key: 'pkce', label: '5. Authorization request (PKCE + resource param)', desc: 'Client generates a PKCE code_challenge and includes a resource parameter identifying the exact MCP server (canonical URI) the token is for.' },
  { key: 'token', label: '6. Token exchange', desc: 'Authorization code + code_verifier + resource parameter exchanged for an access token (Client MUST implement PKCE; the resource parameter binds the token to this specific server).' },
  { key: 'authed', label: '7. Client → MCP server with token', desc: 'Authorization: Bearer <access-token> on every request -- never in the URL query string.' },
];

/** The full discovery-through-authenticated-request flow for
 * HTTP-based MCP servers -- click through in order. */
export default function OAuthAuthorizationFlowDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('pkce');
  const color = getConceptColor(t, 'attention');
  const s = STEPS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.desc}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STEPS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.4rem 0.65rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
