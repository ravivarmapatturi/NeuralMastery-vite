import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const PRIORITIES = [
  { key: 'general', label: 'General-purpose, high throughput', pick: 'vLLM' },
  { key: 'agent', label: 'Agent workloads, many shared-prefix calls', pick: 'SGLang' },
  { key: 'nvidia', label: 'Absolute max speed on NVIDIA hardware', pick: 'TensorRT-LLM' },
  { key: 'cpu', label: 'CPU / consumer hardware, no GPU', pick: 'llama.cpp' },
  { key: 'multi', label: 'Serving LLMs AND classical/vision models together', pick: 'NVIDIA Triton' },
  { key: 'hf', label: 'Already deep in the Hugging Face ecosystem', pick: 'HF TGI' },
  { key: 'apple', label: 'Apple Silicon specifically', pick: 'MLX or Core ML' },
];

/** The actual decision most people are trying to make when they ask
 * "which engine should I use" -- click your priority. */
export default function EngineSelectionDecisionDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('general');
  const color = getConceptColor(t, 'attention');
  const active = PRIORITIES.find((p) => p.key === selected)!;

  return (
    <VisualizationContainer footer={`If "${active.label}" is your priority: ${active.pick}.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {PRIORITIES.map((p) => {
          const isSelected = selected === p.key;
          return (
            <div
              key={p.key}
              onClick={() => setSelected(p.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}` }}
            >
              <div style={{ flex: 1, fontSize: 12, color: isSelected ? color : t.textPrimary, fontWeight: isSelected ? 700 : 400 }}>{p.label}</div>
              <div style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color, padding: '2px 9px', borderRadius: 999, border: `1px solid ${color}` }}>→ {p.pick}</div>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
