import { useMemo, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { generateResponses, pearsonR } from '../lib/llmEval';

export default function JudgeVerbosityBiasDiagram() {
  const t = useVizTokens();
  const [biasStrength, setBiasStrength] = useState(0.6);

  const responses = useMemo(() => generateResponses(60, biasStrength, 8), [biasStrength]);
  const r = useMemo(() => pearsonR(responses.map((x) => x.length), responses.map((x) => x.judgeScore)), [responses]);

  const width = 380;
  const height = 220;
  const px = (len: number) => (len / 400) * width;
  const py = (score: number) => height - (score / 15) * height;

  return (
    <VisualizationContainer footer={`Real quality was generated INDEPENDENT of length (by construction) -- yet the biased judge's score correlates with length at r=${r.toFixed(3)}. That's a real Pearson correlation computed from the 60 points below, the exact same statistical check the reward-hacking smoke test on Alignment & RLHF runs against a real reward model.`}>
      <Slider label="judge's length bias strength" value={biasStrength} onChange={setBiasStrength} min={0} max={1} step={0.05} />

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        {responses.map((resp, i) => (
          <circle key={i} cx={px(resp.length)} cy={py(resp.judgeScore)} r={3.5} fill={t.accentDanger} fillOpacity={0.6} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, padding: '0 4px' }}>
        <span>short response</span>
        <span>response length →</span>
        <span>long response</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        At bias=0, r stays near 0 (no real relationship) -- the mitigation is an explicit rubric criterion that doesn't reward length, which is exactly what removing the bias term does here.
      </div>
    </VisualizationContainer>
  );
}
