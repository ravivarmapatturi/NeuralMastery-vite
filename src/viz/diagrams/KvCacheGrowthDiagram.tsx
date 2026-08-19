import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** The KV cache growing linearly with sequence length x batch size,
 * drawn against a FIXED model-weights bar -- drag either slider and watch
 * the cache overtake the weights themselves, which is exactly the memory
 * crunch Paged Attention exists to solve. */
export default function KvCacheGrowthDiagram() {
  const t = useVizTokens();
  const [seqLen, setSeqLen] = useState(8000);
  const [batchSize, setBatchSize] = useState(16);
  const modelColor = getConceptColor(t, 'query');
  const cacheColor = getConceptColor(t, 'attention');

  // Toy model roughly in the shape of a 7B-class model: ~0.5MB of KV cache
  // per token per sequence (fp16, GQA-ish) -- illustrates the GROWTH SHAPE,
  // not an exact vendor number.
  const modelWeightsGB = 14; // 7B params @ fp16
  const kvPerTokenMB = 0.5;
  const cacheGB = (seqLen * batchSize * kvPerTokenMB) / 1024;

  const width = 560;
  const height = 140;
  const maxGB = 80;
  const barBottom = 120;
  const barTop = 15;
  const gbToHeight = (gb: number) => Math.min(gb, maxGB) / maxGB * (barBottom - barTop);

  return (
    <VisualizationContainer footer={`At ${seqLen.toLocaleString()} tokens x ${batchSize} concurrent sequences: KV cache ≈ ${cacheGB.toFixed(1)} GB ${cacheGB > modelWeightsGB ? `-- already bigger than the ${modelWeightsGB}GB of model weights.` : `(model weights: ${modelWeightsGB}GB fixed, regardless of traffic).`}`}>
      <Slider label={`Sequence length: ${seqLen.toLocaleString()} tokens`} min={500} max={32000} step={500} value={seqLen} onChange={setSeqLen} />
      <Slider label={`Concurrent sequences (batch): ${batchSize}`} min={1} max={64} step={1} value={batchSize} onChange={setBatchSize} />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        <line x1={40} y1={barBottom} x2={width - 20} y2={barBottom} stroke={t.border} strokeWidth={1} />
        <g>
          <rect x={140} y={barBottom - gbToHeight(modelWeightsGB)} width={90} height={gbToHeight(modelWeightsGB)} fill={modelColor} opacity={0.8} rx={3} />
          <text x={185} y={barBottom + 16} textAnchor="middle" fontSize={9.5} fill={modelColor} fontWeight={700}>Model weights</text>
          <text x={185} y={barBottom - gbToHeight(modelWeightsGB) - 6} textAnchor="middle" fontSize={9} fill={modelColor}>{modelWeightsGB} GB (fixed)</text>
        </g>
        <g>
          <rect x={340} y={barBottom - gbToHeight(cacheGB)} width={90} height={gbToHeight(cacheGB)} fill={cacheColor} opacity={0.8} rx={3} />
          <text x={385} y={barBottom + 16} textAnchor="middle" fontSize={9.5} fill={cacheColor} fontWeight={700}>KV cache</text>
          <text x={385} y={barBottom - gbToHeight(cacheGB) - 6} textAnchor="middle" fontSize={9} fill={cacheColor}>{cacheGB.toFixed(1)} GB</text>
        </g>
      </svg>
    </VisualizationContainer>
  );
}
