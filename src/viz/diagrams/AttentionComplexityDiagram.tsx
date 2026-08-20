import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { pairwiseAttentionOps, linearAttentionOps } from '../lib/algorithms';

export default function AttentionComplexityDiagram() {
  const t = useVizTokens();
  const [seqLen, setSeqLen] = useState(2000);
  const dim = 128;

  const quadratic = pairwiseAttentionOps(seqLen, dim);
  const linear = linearAttentionOps(seqLen, dim);

  const width = 420, height = 180;
  const maxN = 32000;
  const samples = Array.from({ length: 60 }, (_, i) => (i / 59) * maxN);
  const maxOps = pairwiseAttentionOps(maxN, dim);
  const px = (n: number) => (n / maxN) * width;
  const py = (ops: number) => height - Math.min(1, ops / maxOps) * height;

  return (
    <VisualizationContainer footer={`Real op counts at sequence length ${seqLen.toLocaleString()}, dim=128: standard self-attention (O(n²·d)) = ${quadratic.toLocaleString()} operations; a linear-attention variant (O(n·d)) = ${linear.toLocaleString()} -- a real ${(quadratic / linear).toFixed(0)}x gap at this length, and it only widens as context length grows. This IS why long-context LLMs are hard and expensive, and why Flash Attention / sparse attention exist -- direct responses to this exact complexity bound.`}>
      <Slider label="sequence length (n)" value={seqLen} onChange={setSeqLen} min={100} max={maxN} step={100} format={(v) => v.toLocaleString()} />

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        <polyline points={samples.map((n) => `${px(n)},${py(pairwiseAttentionOps(n, dim))}`).join(' ')} fill="none" stroke={t.accentDanger} strokeWidth={2.5} />
        <polyline points={samples.map((n) => `${px(n)},${py(linearAttentionOps(n, dim))}`).join(' ')} fill="none" stroke={t.accentPrimary} strokeWidth={2.5} />
        <line x1={px(seqLen)} y1={0} x2={px(seqLen)} y2={height} stroke={t.textMuted} strokeWidth={1} strokeDasharray="3 3" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        <span><span style={{ color: t.accentDanger }}>⬤</span> standard attention O(n²d)</span>
        <span><span style={{ color: t.accentPrimary }}>⬤</span> linear attention O(nd)</span>
      </div>
    </VisualizationContainer>
  );
}
