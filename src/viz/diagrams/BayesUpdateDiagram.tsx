import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider, VisualizationMath } from '../primitives';
import { bayesUpdate } from '../lib/probstat';

export default function BayesUpdateDiagram() {
  const t = useVizTokens();
  const [prior, setPrior] = useState(0.01);
  const [likelihoodTrue, setLikelihoodTrue] = useState(0.95);
  const [likelihoodFalse, setLikelihoodFalse] = useState(0.05);

  const posterior = bayesUpdate(prior, likelihoodTrue, likelihoodFalse);

  return (
    <VisualizationContainer footer={`P(disease | positive test) = P(positive|disease)·P(disease) / P(positive) = ${posterior.toFixed(4)} -- real Bayes' theorem, computed live. Even with a ${(likelihoodTrue * 100).toFixed(0)}%-accurate test, a rare enough prior (${(prior * 100).toFixed(2)}%) means most positive results are still false positives -- the classic, real-consequence lesson base rates teach.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Slider label="prior P(disease)" value={prior} onChange={setPrior} min={0.001} max={0.5} step={0.001} format={(v) => (v * 100).toFixed(2) + '%'} />
        <Slider label="P(positive test | has disease)" value={likelihoodTrue} onChange={setLikelihoodTrue} min={0.5} max={0.999} step={0.005} format={(v) => (v * 100).toFixed(1) + '%'} />
        <Slider label="P(positive test | no disease) — false positive rate" value={likelihoodFalse} onChange={setLikelihoodFalse} min={0.001} max={0.3} step={0.005} format={(v) => (v * 100).toFixed(1) + '%'} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.textSecondary, fontFamily: 'monospace' }}>{(prior * 100).toFixed(2)}%</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>prior belief</div>
        </div>
        <div style={{ fontSize: 20, color: t.textMuted, alignSelf: 'center' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.accentPrimary, fontFamily: 'monospace' }}>{(posterior * 100).toFixed(2)}%</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>posterior after evidence</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <VisualizationMath latex={`P(A|B) = \\frac{P(B|A)P(A)}{P(B)} = ${posterior.toFixed(4)}`} display={false} />
      </div>
    </VisualizationContainer>
  );
}
