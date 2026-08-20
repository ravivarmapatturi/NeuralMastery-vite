import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Mode = 'response' | 'prefix';

/** Two caching layers -- click to compare skipping inference entirely
 * on a repeated request against reusing KV cache for just a shared
 * prompt prefix. */
export default function CachingSavingsDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('response');
  const color = getConceptColor(t, 'attention');
  const okColor = t.accentPrimary;

  return (
    <VisualizationContainer footer={mode === 'response' ? 'An exact or near-exact repeated request skips inference entirely on a cache hit -- the cheapest possible inference cost is the one never paid.' : 'A shared prompt prefix (system prompt, few-shot template) has its KV cache reused across requests -- only the unique suffix needs fresh computation.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode('response')} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: mode === 'response' ? 700 : 500, background: mode === 'response' ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${mode === 'response' ? color : t.border}`, color: mode === 'response' ? color : t.textSecondary, cursor: 'pointer' }}>
          Prompt/response caching
        </button>
        <button type="button" onClick={() => setMode('prefix')} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: mode === 'prefix' ? 700 : 500, background: mode === 'prefix' ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${mode === 'prefix' ? color : t.border}`, color: mode === 'prefix' ? color : t.textSecondary, cursor: 'pointer' }}>
          Prefix caching
        </button>
      </div>
      {mode === 'response' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.7rem', borderRadius: 7, background: `${okColor}12` }}>
          <span style={{ fontSize: 10.5, color: t.textSecondary }}>Identical request seen before</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: okColor }}>0 tokens computed</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ flex: 3, padding: '0.5rem', borderRadius: 7, background: `${okColor}12`, textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: okColor }}>shared prefix — cached</span>
          </div>
          <div style={{ flex: 1, padding: '0.5rem', borderRadius: 7, background: `${color}18`, textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color }}>unique — computed</span>
          </div>
        </div>
      )}
    </VisualizationContainer>
  );
}
