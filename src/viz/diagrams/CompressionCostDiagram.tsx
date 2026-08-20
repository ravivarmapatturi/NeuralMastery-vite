import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Mode = 'prompt' | 'context';

/** Click to compare shortening a prompt directly against retrieving
 * only the necessary context in a RAG/agent system -- both reduce
 * token cost, and for context specifically, also reduce the
 * "lost in the middle" quality problem. */
export default function CompressionCostDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('context');
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;

  return (
    <VisualizationContainer footer={mode === 'prompt' ? 'Shortening the prompt while preserving the needed information directly cuts input-token cost, and for long prompts, reduces prefill latency as a side benefit.' : 'Retrieving only the genuinely necessary chunks (well-tuned chunk size and top-k) controls cost AND avoids "lost in the middle" -- the cost-optimal and quality-optimal choices point the same direction here.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('prompt')} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: mode === 'prompt' ? 700 : 500, background: mode === 'prompt' ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${mode === 'prompt' ? color : t.border}`, color: mode === 'prompt' ? color : t.textSecondary, cursor: 'pointer' }}>
          Prompt compression
        </button>
        <button type="button" onClick={() => setMode('context')} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: mode === 'context' ? 700 : 500, background: mode === 'context' ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${mode === 'context' ? color : t.border}`, color: mode === 'context' ? color : t.textSecondary, cursor: 'pointer' }}>
          Context compression (RAG)
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.7rem', borderRadius: 7, background: `${badColor}12` }}>
          <span style={{ fontSize: 10, color: t.textSecondary }}>{mode === 'prompt' ? 'Verbose prompt' : '"Retrieve more, just in case" (top-k=20)'}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: badColor }}>{mode === 'prompt' ? '~1,200 tokens' : '~8,000 tokens'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.7rem', borderRadius: 7, background: `${okColor}12` }}>
          <span style={{ fontSize: 10, color: t.textSecondary }}>{mode === 'prompt' ? 'Compressed, same information' : 'Well-tuned top-k=4'}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: okColor }}>{mode === 'prompt' ? '~450 tokens' : '~1,600 tokens'}</span>
        </div>
      </div>
    </VisualizationContainer>
  );
}
