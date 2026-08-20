import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Where MCP sits relative to the agent tool-calling loop -- it's the
 * standardized transport underneath the "act" step, not a
 * replacement for the loop itself. */
export default function McpInAgentLoopDiagram() {
  const t = useVizTokens();
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="MCP doesn't change how an agent decides to call a tool -- it standardizes HOW that call actually reaches the tool, so the same agent framework works against any MCP-compatible server without bespoke integration code per data source.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: 7, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, textAlign: 'center' }}>
          <span style={{ fontSize: 9.5, color: t.textPrimary }}>Agent reasons: &ldquo;I need to call a tool&rdquo;</span>
        </div>
        <span style={{ color: t.textMuted, fontSize: 14 }}>→</span>
        <div style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: 7, background: `${color}18`, border: `1.5px solid ${color}`, textAlign: 'center' }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color }}>MCP: standardized tools/call</span>
        </div>
        <span style={{ color: t.textMuted, fontSize: 14 }}>→</span>
        <div style={{ flex: 1, padding: '0.6rem 0.5rem', borderRadius: 7, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, textAlign: 'center' }}>
          <span style={{ fontSize: 9.5, color: t.textPrimary }}>Result feeds back into the loop</span>
        </div>
      </div>
    </VisualizationContainer>
  );
}
