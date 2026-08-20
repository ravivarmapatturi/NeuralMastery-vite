import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STEPS = [
  { key: 'define', label: 'Define + register a tool', code: '@mcp.tool()\nasync def get_alerts(state: str) -> str:\n    """Get weather alerts for a US state.\n\n    Args:\n        state: Two-letter US state code\n    """\n    ...', desc: 'The SDK derives the tool\'s name, description, and inputSchema straight from the function signature, type hints, and docstring -- no separate schema to hand-write.' },
  { key: 'execute', label: 'Execute + return', code: 'data = await make_nws_request(url)\nif not data:\n    return "Unable to fetch alerts."\nreturn "\\n---\\n".join(alerts)', desc: 'A plain return value becomes the tool result\'s text content automatically -- the SDK handles wrapping it in the content array.' },
  { key: 'run', label: 'Run over a transport', code: 'if __name__ == "__main__":\n    mcp.run(transport="stdio")', desc: 'One line picks the transport -- the SDK handles the JSON-RPC framing, the initialize handshake, and capability declaration underneath.' },
];

/** A real minimal MCP server (Python FastMCP SDK, from the official
 * quickstart) -- click a step to see what the SDK is doing for you
 * at each one. */
export default function McpServerBuildStepsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('define');
  const color = getConceptColor(t, 'attention');
  const s = STEPS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.desc}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {STEPS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 9, padding: '0.7rem', borderRadius: 7, background: t.surfaceAlt, color: t.textSecondary, whiteSpace: 'pre', overflowX: 'auto' }}>
        {s.code}
      </div>
    </VisualizationContainer>
  );
}
