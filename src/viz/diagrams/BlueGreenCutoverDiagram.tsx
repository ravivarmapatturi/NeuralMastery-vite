import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Two full environments, one atomic switch -- click "cut over" to flip
 * the router, and "roll back" to flip it right back, instantly. */
export default function BlueGreenCutoverDiagram() {
  const t = useVizTokens();
  const [live, setLive] = useState<'blue' | 'green'>('blue');
  const blueColor = getConceptColor(t, 'query');
  const greenColor = t.accentPrimary;

  return (
    <VisualizationContainer footer={live === 'blue' ? 'Blue is live, green is fully deployed and health-checked but receiving zero traffic -- ready for an atomic switch.' : 'Green is live -- blue stays running, untouched, as an instant rollback target. If green misbehaves, flip back immediately.'}>
      <button
        type="button"
        onClick={() => setLive((l) => (l === 'blue' ? 'green' : 'blue'))}
        style={{ marginBottom: 10, padding: '6px 12px', borderRadius: 6, border: `1px solid ${live === 'blue' ? greenColor : blueColor}`, background: 'transparent', color: live === 'blue' ? greenColor : blueColor, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 }}
      >
        {live === 'blue' ? 'Cut over to green' : 'Roll back to blue'}
      </button>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, padding: '0.8rem', borderRadius: 9, background: live === 'blue' ? `${blueColor}20` : t.surfaceAlt, border: `2px solid ${blueColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: blueColor }}>Blue</div>
          <div style={{ fontSize: 9.5, color: t.textMuted, marginTop: 4 }}>{live === 'blue' ? 'LIVE -- 100% traffic' : 'standing by (rollback target)'}</div>
        </div>
        <div style={{ flex: 1, padding: '0.8rem', borderRadius: 9, background: live === 'green' ? `${greenColor}20` : t.surfaceAlt, border: `2px solid ${greenColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: greenColor }}>Green</div>
          <div style={{ fontSize: 9.5, color: t.textMuted, marginTop: 4 }}>{live === 'green' ? 'LIVE -- 100% traffic' : 'deployed, health-checked, 0% traffic'}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        The switch is atomic -- 0% or 100%, never a partial state in between. The cost: two full production environments running simultaneously.
      </div>
    </VisualizationContainer>
  );
}
