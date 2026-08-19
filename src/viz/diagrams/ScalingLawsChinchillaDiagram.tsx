import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const CHINCHILLA_RATIO = 20; // ~tokens per parameter, Chinchilla's finding

/** Fixed compute budget, split between model size and data: drag the
 * budget and see the compute-optimal (N, D) point move along the
 * Chinchilla ~20-tokens-per-parameter ratio, plus what an "old GPT-3-era"
 * split (too-large model, too little data) would have looked like at the
 * same compute cost. */
export default function ScalingLawsChinchillaDiagram() {
  const t = useVizTokens();
  const [logCompute, setLogCompute] = useState(23); // log10(FLOPs)
  const color = getConceptColor(t, 'attention');
  const oldColor = t.accentDanger;

  const compute = Math.pow(10, logCompute); // C ≈ 6ND
  // Compute-optimal: D = ratio * N  =>  C = 6*N*(ratio*N) = 6*ratio*N^2
  const nOptimal = Math.sqrt(compute / (6 * CHINCHILLA_RATIO));
  const dOptimal = CHINCHILLA_RATIO * nOptimal;
  // "Old" GPT-3-era split: much larger N, fewer tokens per param (~2x ratio smaller D/N)
  const nOld = nOptimal * 2.2;
  const dOld = compute / (6 * nOld);

  const fmt = (x: number) => (x >= 1e9 ? `${(x / 1e9).toFixed(1)}B` : x >= 1e6 ? `${(x / 1e6).toFixed(0)}M` : x.toExponential(1));

  return (
    <VisualizationContainer footer="At the SAME total compute, an old GPT-3-era split (too-large model, undertrained) lands off the compute-optimal ratio -- Chinchilla's finding is that the smaller, more-data-trained model on the ratio line reliably wins for the same cost.">
      <Slider label={`compute budget ≈ 10^${logCompute} FLOPs`} min={20} max={26} step={0.25} value={logCompute} onChange={setLogCompute} />
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <div style={{ flex: 1, padding: 12, borderRadius: 8, background: `${color}18`, border: `1.5px solid ${color}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>Compute-optimal (Chinchilla)</div>
          <div style={{ fontSize: 11, color: t.textSecondary, fontFamily: 'monospace' }}>N ≈ {fmt(nOptimal)} params</div>
          <div style={{ fontSize: 11, color: t.textSecondary, fontFamily: 'monospace' }}>D ≈ {fmt(dOptimal)} tokens</div>
          <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>ratio D/N ≈ {CHINCHILLA_RATIO}</div>
        </div>
        <div style={{ flex: 1, padding: 12, borderRadius: 8, background: `${oldColor}18`, border: `1.5px solid ${oldColor}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: oldColor, marginBottom: 6 }}>Old (too large, undertrained)</div>
          <div style={{ fontSize: 11, color: t.textSecondary, fontFamily: 'monospace' }}>N ≈ {fmt(nOld)} params</div>
          <div style={{ fontSize: 11, color: t.textSecondary, fontFamily: 'monospace' }}>D ≈ {fmt(dOld)} tokens</div>
          <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>ratio D/N ≈ {(dOld / nOld).toFixed(1)}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        Same compute cost, both satisfy C ≈ 6ND — only the split between model size and data differs.
      </div>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <VisualizationMath latex="C \approx 6ND \qquad D_{\text{optimal}} \approx 20N" />
      </div>
    </VisualizationContainer>
  );
}
