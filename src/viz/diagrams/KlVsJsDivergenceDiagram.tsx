import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const P = [0.05, 0.15, 0.6, 0.15, 0.05];
const Q = [0.3, 0.3, 0.2, 0.1, 0.1];

function kl(a: number[], b: number[]) {
  return a.reduce((sum, ai, i) => sum + (ai > 0 ? ai * Math.log(ai / b[i]) : 0), 0);
}

/** KL(P‖Q) != KL(Q‖P) -- compute both directions live from the same two
 * distributions, then JS as their symmetric average via the mixture. */
export default function KlVsJsDivergenceDiagram() {
  const t = useVizTokens();
  const [direction, setDirection] = useState<'pq' | 'qp' | 'js'>('pq');
  const pColor = getConceptColor(t, 'query');
  const qColor = getConceptColor(t, 'attention');

  const klPQ = kl(P, Q);
  const klQP = kl(Q, P);
  const M = P.map((p, i) => (p + Q[i]) / 2);
  const js = 0.5 * kl(P, M) + 0.5 * kl(Q, M);

  const value = direction === 'pq' ? klPQ : direction === 'qp' ? klQP : js;
  const label = direction === 'pq' ? 'KL(P‖Q)' : direction === 'qp' ? 'KL(Q‖P)' : 'JS(P,Q)';

  return (
    <VisualizationContainer footer={direction === 'js' ? 'JS divergence: symmetric by construction -- JS(P,Q) always equals JS(Q,P), computed as the average KL divergence from each distribution to their mixture.' : `KL is asymmetric -- KL(P‖Q) = ${klPQ.toFixed(3)} but KL(Q‖P) = ${klQP.toFixed(3)}, different values for the same two distributions, just swapped which one is "reference."`}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['pq', 'qp', 'js'] as const).map((d) => (
          <button key={d} type="button" onClick={() => setDirection(d)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: direction === d ? 700 : 500, background: direction === d ? `${pColor}20` : t.surfaceAlt, border: `1.25px solid ${direction === d ? pColor : t.border}`, color: direction === d ? pColor : t.textSecondary, cursor: 'pointer', fontFamily: 'monospace' }}>
            {d === 'pq' ? 'KL(P‖Q)' : d === 'qp' ? 'KL(Q‖P)' : 'JS(P,Q)'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, height: 70, alignItems: 'flex-end' }}>
        {P.map((p, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'flex-end', height: '100%' }}>
            <div style={{ flex: 1, height: `${p * 150}%`, background: pColor, opacity: 0.7, borderRadius: 2 }} />
            <div style={{ flex: 1, height: `${Q[i] * 150}%`, background: qColor, opacity: 0.7, borderRadius: 2 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 6, fontSize: DIAGRAM_TYPE.caption.size }}>
        <span style={{ color: pColor }}>■ P (reference)</span>
        <span style={{ color: qColor }}>■ Q (current)</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: pColor, fontWeight: 700, marginTop: 6 }}>
        {label} = {value.toFixed(3)}
      </div>
    </VisualizationContainer>
  );
}
