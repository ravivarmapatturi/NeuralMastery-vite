import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const D_MODEL = 4096; // typical hidden size, for a concrete param-count comparison

/** LoRA freezes the original weight matrix W and injects two small
 * low-rank matrices A, B alongside it -- drag the rank r and watch the
 * trainable parameter count fall dramatically below full fine-tuning's. */
export default function LoraMechanicsDiagram() {
  const t = useVizTokens();
  const [rank, setRank] = useState(8);
  const frozenColor = t.textMuted;
  const loraColor = getConceptColor(t, 'attention');

  const fullParams = D_MODEL * D_MODEL;
  const loraParams = 2 * D_MODEL * rank; // A: d×r, B: r×d
  const pct = (loraParams / fullParams) * 100;

  const width = 400;
  const height = 150;

  return (
    <VisualizationContainer footer={`At rank r=${rank}, LoRA trains ${loraParams.toLocaleString()} parameters for this ${D_MODEL}×${D_MODEL} weight matrix vs. ${fullParams.toLocaleString()} for full fine-tuning -- ${pct.toFixed(3)}% of the original, because weight UPDATES during fine-tuning empirically have low effective rank.`}>
      <Slider label={`rank r = ${rank}`} min={1} max={64} step={1} value={rank} onChange={setRank} />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 10 }}>
        <rect x={20} y={20} width={90} height={90} fill={`${frozenColor}18`} stroke={frozenColor} strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={65} y={70} textAnchor="middle" fontSize={11} fill={frozenColor}>W</text>
        <text x={65} y={125} textAnchor="middle" fontSize={9} fill={frozenColor}>frozen</text>
        <text x={65} y={10} textAnchor="middle" fontSize={8} fill={t.textMuted}>d×d</text>

        <text x={135} y={70} fontSize={16} fill={t.textMuted}>+</text>

        <rect x={160} y={20} width={Math.max(6, rank * 1.1)} height={90} fill={`${loraColor}30`} stroke={loraColor} strokeWidth={1.5} />
        <text x={160 + Math.max(6, rank * 1.1) / 2} y={125} textAnchor="middle" fontSize={9} fill={loraColor}>A</text>

        <text x={230} y={70} fontSize={12} fill={t.textMuted}>×</text>

        <rect x={250} y={20} width={90} height={Math.max(6, rank * 1.1)} fill={`${loraColor}30`} stroke={loraColor} strokeWidth={1.5} />
        <text x={295} y={20 + Math.max(6, rank * 1.1) + 14} textAnchor="middle" fontSize={9} fill={loraColor}>B</text>
        <text x={295} y={10} textAnchor="middle" fontSize={8} fill={t.textMuted}>r×d, d×r — trainable</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: loraColor, fontWeight: 700, marginTop: 4 }}>
        {loraParams.toLocaleString()} trainable params ({pct.toFixed(3)}% of full fine-tuning)
      </div>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <VisualizationMath latex="W' = W + BA \qquad B \in \mathbb{R}^{d\times r},\ A \in \mathbb{R}^{r\times d}" />
      </div>
    </VisualizationContainer>
  );
}
