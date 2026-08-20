import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { mleEstimate, mapEstimate } from '../lib/probstat';

export default function MleVsMapDiagram() {
  const t = useVizTokens();
  const [flips, setFlips] = useState(4);
  const [heads, setHeads] = useState(4);
  const [priorStrength, setPriorStrength] = useState(3);

  const clampedHeads = Math.min(heads, flips);
  const mle = mleEstimate(clampedHeads, flips);
  const map = mapEstimate(clampedHeads, flips, priorStrength);

  return (
    <VisualizationContainer footer={`With ${clampedHeads} heads out of ${flips} flips: MLE says P(heads)=${mle.toFixed(3)} -- taken completely literally, no matter how little data. MAP, with a real Beta(${priorStrength},${priorStrength}) prior centered at 0.5, gives ${map.toFixed(3)} -- pulled toward the prior. Increase flips and watch MAP converge to MLE as the data increasingly outweighs the prior -- exactly the real math behind "L2 regularization = MAP with a Gaussian prior."`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Slider label="coin flips observed" value={flips} onChange={(v) => { setFlips(v); if (heads > v) setHeads(v); }} min={1} max={100} step={1} />
        <Slider label="heads observed" value={clampedHeads} onChange={setHeads} min={0} max={flips} step={1} />
        <Slider label="prior strength (Beta α=β)" value={priorStrength} onChange={setPriorStrength} min={0.5} max={10} step={0.5} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: t.accentDanger, fontFamily: 'monospace' }}>{mle.toFixed(3)}</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>MLE estimate</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: t.accentPrimary, fontFamily: 'monospace' }}>{map.toFixed(3)}</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>MAP estimate</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <div style={{ width: 260, height: 30, position: 'relative', background: t.surfaceAlt, borderRadius: 6 }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: t.textMuted }} />
          <div style={{ position: 'absolute', left: `${mle * 100}%`, top: 4, width: 10, height: 10, borderRadius: '50%', background: t.accentDanger, transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: `${map * 100}%`, top: 16, width: 10, height: 10, borderRadius: '50%', background: t.accentPrimary, transform: 'translateX(-50%)' }} />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        With only 4 flips (the default), a run of all heads gives MLE=100% -- a real, extreme overfit to tiny data -- while MAP stays anchored much closer to 50% until real evidence accumulates.
      </div>
    </VisualizationContainer>
  );
}
