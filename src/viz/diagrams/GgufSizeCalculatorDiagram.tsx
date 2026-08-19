import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider, PillSelect } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const LEVELS = [
  { key: 'Q8_0', bits: 8, note: 'Near-lossless, largest of the quantized options' },
  { key: 'Q6_K', bits: 6, note: 'Very close to full quality' },
  { key: 'Q5_K_M', bits: 5, note: 'Good quality/size balance' },
  { key: 'Q4_K_M', bits: 4.5, note: 'The most common default' },
  { key: 'Q3_K_M', bits: 3.5, note: 'Noticeable quality loss' },
  { key: 'Q2_K', bits: 2, note: 'Significant quality loss' },
];

/** The exact size math from the page, made interactive -- pick a param
 * count and quant level, watch the resulting file size compute live. */
export default function GgufSizeCalculatorDiagram() {
  const t = useVizTokens();
  const [params, setParams] = useState(7);
  const [level, setLevel] = useState('Q4_K_M');
  const color = getConceptColor(t, 'attention');
  const active = LEVELS.find((l) => l.key === level)!;

  const fp16GB = (params * 2);
  const quantGB = (params * active.bits) / 8;

  return (
    <VisualizationContainer footer={`${active.note}. ${params}B params: FP16 ≈ ${fp16GB.toFixed(1)}GB → ${level} ≈ ${quantGB.toFixed(1)}GB (${(fp16GB / quantGB).toFixed(1)}x smaller).`}>
      <Slider label={`Model size: ${params}B parameters`} min={1} max={70} step={1} value={params} onChange={setParams} />
      <PillSelect label="Quant level" value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.key, label: l.key }))} />
      <div style={{ display: 'flex', gap: 20, marginTop: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: Math.min(120, fp16GB * 2), background: t.textMuted, opacity: 0.35, borderRadius: 6 }} />
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>FP16: {fp16GB.toFixed(1)} GB</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: Math.min(120, quantGB * 2), background: color, opacity: 0.7, borderRadius: 6 }} />
          <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 700 }}>{level}: {quantGB.toFixed(1)} GB</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        size ≈ params × bits/8 -- small enough at Q4_K_M to run on a consumer GPU or laptop CPU/RAM.
      </div>
    </VisualizationContainer>
  );
}
