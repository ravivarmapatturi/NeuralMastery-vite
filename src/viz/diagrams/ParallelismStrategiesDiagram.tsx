import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Strategy = 'data' | 'model' | 'pipeline' | 'tensor' | 'fsdp' | 'expert';
const STRATEGIES: { key: Strategy; label: string; whatSplits: string; desc: string }[] = [
  { key: 'data', label: 'Data parallelism', whatSplits: 'the DATA (full model replicated per GPU)', desc: 'Each GPU holds a full copy of the model, processes a different data shard, gradients all-reduced after each step. Simplest, limited by needing the whole model on one GPU.' },
  { key: 'model', label: 'Model parallelism', whatSplits: 'the MODEL (different layers/parts per GPU)', desc: 'Necessary once the model no longer fits on a single GPU\'s VRAM.' },
  { key: 'pipeline', label: 'Pipeline parallelism', whatSplits: 'the MODEL, by STAGE (groups of layers)', desc: 'Micro-batches flow through the pipeline -- increases throughput but introduces bubble idle time unless carefully scheduled.' },
  { key: 'tensor', label: 'Tensor parallelism', whatSplits: 'a single large WEIGHT MATRIX itself', desc: 'The finest-grained split -- one layer\'s weight matrix divided across GPUs. Standard for very large individual layers, in both training and inference.' },
  { key: 'fsdp', label: 'FSDP', whatSplits: 'params + gradients + optimizer state', desc: 'Shards not just data but the model\'s own state across GPUs, gathering only what\'s needed on the fly -- dramatically less per-GPU memory than plain data parallelism, at extra communication cost.' },
  { key: 'expert', label: 'Expert parallelism', whatSplits: 'different EXPERTS (MoE only)', desc: 'Different experts live on different GPUs; each token routes to whichever GPU holds its selected expert.' },
];

/** Six strategies, all answering "what actually gets split across GPUs" --
 * click one for the specific thing it divides. */
export default function ParallelismStrategiesDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState<Strategy>('tensor');
  const color = getConceptColor(t, 'attention');
  const active = STRATEGIES.find((s) => s.key === selected)!;

  return (
    <VisualizationContainer footer={active.desc}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {STRATEGIES.map((s) => {
          const isSelected = selected === s.key;
          return (
            <div key={s.key} onClick={() => setSelected(s.key)} onMouseEnter={() => setSelected(s.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{s.label}</span>
              <span style={{ fontSize: 10, color: t.textMuted, fontStyle: 'italic' }}>splits {s.whatSplits}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Six answers to the same question: what actually gets divided across GPUs, and why.
      </div>
    </VisualizationContainer>
  );
}
