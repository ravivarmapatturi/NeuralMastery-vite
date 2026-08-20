import { useMemo, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { binomialPmf } from '../lib/probstat';

/** Real majority-vote probability: with k independently sampled CoT paths,
 * each correct with probability p, the ensemble is correct iff more than
 * k/2 of them are -- a real binomial tail sum, not a made-up curve. This
 * is exactly the mechanism self-consistency's own paper (Wang et al.
 * 2022) illustrates: many sampled reasoning paths, majority vote. */
function majorityVoteAccuracy(p: number, k: number): number {
  let acc = 0;
  const threshold = k / 2;
  for (let correct = 0; correct <= k; correct++) {
    if (correct > threshold) acc += binomialPmf(correct, k, p);
  }
  return acc;
}

const K_MAX = 15;

export default function SelfConsistencyVotingDiagram() {
  const t = useVizTokens();
  const [p, setP] = useState(0.6);
  const [k, setK] = useState(5);

  const ks = useMemo(() => Array.from({ length: K_MAX }, (_, i) => i + 1).filter((x) => x % 2 === 1), []);
  const curve = useMemo(() => ks.map((kk) => majorityVoteAccuracy(p, kk)), [ks, p]);
  const ensembleAcc = majorityVoteAccuracy(p, k % 2 === 0 ? k + 1 : k);

  const width = 420, height = 160;
  const px = (kk: number) => ((kk - 1) / (K_MAX - 1)) * width;
  const py = (a: number) => height - a * (height - 10) - 5;
  const path = ks.map((kk, i) => `${px(kk)},${py(curve[i])}`).join(' ');

  const pathDots = 7;

  return (
    <VisualizationContainer footer={`Real binomial majority-vote math: with per-path accuracy p = ${p.toFixed(2)} and k = ${k % 2 === 0 ? k + 1 : k} sampled paths, P(majority correct) = ${ensembleAcc.toFixed(3)} vs. a single path's ${p.toFixed(2)} -- the exact tradeoff self-consistency exploits: extra sampled paths buy accuracy whenever p > 0.5, even if any single path is often wrong.`}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Slider label={`per-path accuracy p = ${p.toFixed(2)}`} value={p} onChange={setP} min={0.3} max={0.95} step={0.01} />
        <Slider label={`k = ${k} sampled paths`} value={k} onChange={setK} min={1} max={K_MAX} step={2} />
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 12, marginBottom: 4, flexWrap: 'wrap' }}>
        {Array.from({ length: pathDots }, (_, i) => {
          const correct = (i / pathDots) < p;
          return (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: correct ? `${t.accentPrimary}22` : `${t.accentDanger}18`, border: `1.5px solid ${correct ? t.accentPrimary : t.accentDanger}` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: correct ? t.accentPrimary : t.accentDanger }}>{correct ? '✓' : '✗'}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginBottom: 8 }}>
        {pathDots} example sampled reasoning paths at p = {p.toFixed(2)} (illustrative split, not the k used below)
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <line x1={0} y1={height - 5} x2={width} y2={height - 5} stroke={t.border} strokeWidth={1} />
        <line x1={0} y1={py(p)} x2={width} y2={py(p)} stroke={t.textMuted} strokeWidth={1} strokeDasharray="3 3" />
        <polyline points={path} fill="none" stroke={t.accentPrimary} strokeWidth={2.5} />
        <circle cx={px(k % 2 === 0 ? k + 1 : k)} cy={py(ensembleAcc)} r={4} fill={t.accentPrimary} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted }}>
        <span>k = 1</span>
        <span>majority-vote accuracy vs. k (dashed line = single-path p)</span>
        <span>k = {K_MAX}</span>
      </div>
    </VisualizationContainer>
  );
}
