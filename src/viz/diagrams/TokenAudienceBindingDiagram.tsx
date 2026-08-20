import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** An MCP server that needs to call an upstream API on the user's
 * behalf -- click to compare the forbidden "confused deputy" pattern
 * against the required one, where the server acts as its own OAuth
 * client to the upstream API. */
export default function TokenAudienceBindingDiagram() {
  const t = useVizTokens();
  const [correct, setCorrect] = useState(true);
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;

  return (
    <VisualizationContainer footer={correct ? 'The MCP server validates the incoming token was issued FOR IT (audience check), then obtains a SEPARATE token as its own OAuth client to call the upstream API.' : 'MUST NOT: forwarding the client\'s token unmodified to an upstream API lets that API incorrectly trust it as validated -- the "confused deputy" problem this spec explicitly forbids.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setCorrect(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: !correct ? 700 : 500, background: !correct ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!correct ? color : t.border}`, color: !correct ? color : t.textSecondary, cursor: 'pointer' }}>
          Token passthrough (forbidden)
        </button>
        <button type="button" onClick={() => setCorrect(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: correct ? 700 : 500, background: correct ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${correct ? color : t.border}`, color: correct ? color : t.textSecondary, cursor: 'pointer' }}>
          Separate upstream token
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ padding: '0.5rem 0.5rem', borderRadius: 7, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, fontSize: 8.5, textAlign: 'center' }}>MCP client<br />token A</div>
        <span style={{ color: t.textMuted, fontSize: 12 }}>→</span>
        <div style={{ padding: '0.5rem 0.5rem', borderRadius: 7, background: `${color}12`, border: `1.5px solid ${color}`, fontSize: 8.5, textAlign: 'center' }}>MCP server</div>
        <span style={{ color: t.textMuted, fontSize: 12 }}>→</span>
        <div style={{ padding: '0.5rem 0.5rem', borderRadius: 7, background: correct ? `${okColor}18` : `${badColor}18`, border: `1.5px solid ${correct ? okColor : badColor}`, fontSize: 8.5, textAlign: 'center', fontWeight: 700, color: correct ? okColor : badColor }}>
            Upstream API<br />{correct ? 'token B (new)' : 'token A (reused!)'}
        </div>
      </div>
    </VisualizationContainer>
  );
}
