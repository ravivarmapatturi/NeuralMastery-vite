import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** A Model class that also loads data and serializes API responses --
 * click to see it split into three classes, each changeable
 * independently without breaking the others. */
export default function SingleResponsibilityDiagram() {
  const t = useVizTokens();
  const [split, setSplit] = useState(true);
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;

  return (
    <VisualizationContainer footer={split ? 'A change to the API response format now touches only ApiSerializer -- DataLoader and Model are untouched, and can\'t accidentally break.' : 'A single Model class handling data loading, training, AND API serialization -- changing the API response format risks breaking training code that happens to share the same class.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setSplit(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !split ? 700 : 500, background: !split ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!split ? color : t.border}`, color: !split ? color : t.textSecondary, cursor: 'pointer' }}>
          One class, everything
        </button>
        <button type="button" onClick={() => setSplit(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: split ? 700 : 500, background: split ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${split ? color : t.border}`, color: split ? color : t.textSecondary, cursor: 'pointer' }}>
          Split by responsibility
        </button>
      </div>
      {!split ? (
        <div style={{ padding: '0.8rem', borderRadius: 8, background: `${badColor}12`, border: `1.5px solid ${badColor}`, textAlign: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: badColor }}>Model (data loading + training + API serialization)</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          {['DataLoader', 'Model', 'ApiSerializer'].map((c) => (
            <div key={c} style={{ flex: 1, padding: '0.6rem 0.4rem', borderRadius: 7, background: `${okColor}12`, border: `1.5px solid ${okColor}`, textAlign: 'center' }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: okColor }}>{c}</span>
            </div>
          ))}
        </div>
      )}
    </VisualizationContainer>
  );
}
