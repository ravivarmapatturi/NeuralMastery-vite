import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Purpose = 'canary' | 'ab';

/** Identical mechanics (split traffic between two versions), completely
 * different question being asked -- click either to see which. */
export default function CanaryVsAbPurposeDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<Purpose>('ab');
  const canaryColor = getConceptColor(t, 'query');
  const abColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer
      footer={active === 'canary'
        ? 'Canary asks: "is the new version behaving correctly, technically?" -- cut short the moment things look fine, ramp up quickly.'
        : 'A/B testing asks: "does the new version produce a BETTER OUTCOME -- more conversions, more engagement?" -- run for a fixed, pre-committed duration with statistical significance testing, not cut short early.'}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <div onClick={() => setActive('canary')} onMouseEnter={() => setActive('canary')} style={{ flex: 1, cursor: 'pointer', padding: '0.8rem', borderRadius: 9, background: active === 'canary' ? `${canaryColor}18` : t.surfaceAlt, border: `1.5px solid ${active === 'canary' ? canaryColor : t.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: active === 'canary' ? canaryColor : t.textPrimary }}>Canary</div>
          <div style={{ fontSize: 9.5, color: t.textMuted, marginTop: 4 }}>rollout safety</div>
        </div>
        <div onClick={() => setActive('ab')} onMouseEnter={() => setActive('ab')} style={{ flex: 1, cursor: 'pointer', padding: '0.8rem', borderRadius: 9, background: active === 'ab' ? `${abColor}18` : t.surfaceAlt, border: `1.5px solid ${active === 'ab' ? abColor : t.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: active === 'ab' ? abColor : t.textPrimary }}>A/B Test</div>
          <div style={{ fontSize: 9.5, color: t.textMuted, marginTop: 4 }}>business impact</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        Same split-traffic mechanic underneath both -- the difference is entirely in the question being asked, and how long you wait for the answer.
      </div>
    </VisualizationContainer>
  );
}
