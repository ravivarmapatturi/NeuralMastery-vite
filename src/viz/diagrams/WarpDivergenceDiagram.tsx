import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** All 32 threads in a warp execute in lockstep -- when they take
 * different branches, the hardware runs BOTH branches serially, masking
 * out the inactive threads each time. Toggle uniform vs. divergent. */
export default function WarpDivergenceDiagram() {
  const t = useVizTokens();
  const [divergent, setDivergent] = useState(true);
  const activeColor = getConceptColor(t, 'attention');
  const maskedColor = t.textMuted;
  const N = 16; // draw 16 of the 32 threads for clarity

  // uniform: all threads take branch A. divergent: threads alternate A/B.
  const takesA = (i: number) => (divergent ? i % 2 === 0 : true);

  return (
    <VisualizationContainer footer={divergent ? 'Threads disagree on the branch -- the warp executes BOTH branches serially, masking out the inactive half each time. Cost: roughly 2x the instructions for the same warp.' : 'All 32 threads agree on the branch -- one pass, full hardware utilization, no masking needed.'}>
      <button
        type="button"
        onClick={() => setDivergent((d) => !d)}
        style={{ marginBottom: 10, padding: '6px 12px', borderRadius: 6, border: `1px solid ${activeColor}`, background: divergent ? `${activeColor}20` : 'transparent', color: activeColor, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
      >
        {divergent ? 'Divergent branch' : 'Uniform branch'}
      </button>
      <div style={{ marginBottom: 6, fontSize: 10, color: t.textMuted }}>Pass 1 — branch A:</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
        {Array.from({ length: N }, (_, i) => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: 3, background: takesA(i) ? activeColor : maskedColor, opacity: takesA(i) ? 0.85 : 0.2 }} />
        ))}
      </div>
      {divergent && (
        <>
          <div style={{ marginBottom: 6, fontSize: 10, color: t.textMuted }}>Pass 2 — branch B (only needed because of divergence):</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: N }, (_, i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: 3, background: !takesA(i) ? t.accentWarn : maskedColor, opacity: !takesA(i) ? 0.85 : 0.2 }} />
            ))}
          </div>
        </>
      )}
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        Bright = active this pass, dim = masked out. This is exactly why GPU code favors branch-free, uniform computation.
      </div>
    </VisualizationContainer>
  );
}
