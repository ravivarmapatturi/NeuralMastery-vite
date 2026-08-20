import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STAGES = [
  { key: 'base', label: 'Base model', desc: 'The pretrained starting point before any task-specific adaptation.' },
  { key: 'finetune', label: 'Fine-tuning framework (Unsloth, LoRA/QLoRA)', desc: "Unsloth's entire job is making LoRA/QLoRA adaptation faster and more memory-efficient. It is NOT what receives production traffic -- the single most common confusion in this space." },
  { key: 'weights', label: 'Adapter/merged weights', desc: 'The output of fine-tuning -- either standalone adapter weights or a fully merged model, handed off to serving.' },
  { key: 'engine', label: 'Inference engine (vLLM/llama.cpp/SGLang/TensorRT-LLM)', desc: 'A genuine serving engine picks up the weights from here -- this is where production traffic is actually served.' },
  { key: 'endpoint', label: 'Served endpoint', desc: 'What callers actually talk to.' },
];

/** Training and inference are different jobs, done by different
 * tools -- click a stage to see exactly where the handoff happens,
 * and why treating a fine-tuning framework as a serving solution is
 * the common mistake. */
export default function FineTuningToInferenceHandoffDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('finetune');
  const color = getConceptColor(t, 'attention');
  const s = STAGES.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={s.desc}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        {STAGES.map((x, i) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.45rem 0.5rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}`, maxWidth: 100 }}>
                <span style={{ fontSize: 8, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
              </div>
              {i < STAGES.length - 1 && <span style={{ color: t.textMuted, fontSize: 10 }}>→</span>}
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
