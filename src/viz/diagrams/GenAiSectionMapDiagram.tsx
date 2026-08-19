import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

const PAGES = [
  { key: 'internals', label: 'Foundation Model Internals', desc: 'The architecture: tokenization, attention variants, MoE, sampling.' },
  { key: 'training', label: 'Training Pipeline', desc: 'How weights are produced: pretraining, then SFT/RLHF/DPO/GRPO, PEFT.' },
  { key: 'prompt', label: 'Prompt Engineering', desc: 'Get more out of frozen weights: few-shot, CoT, ReAct, injection defenses.' },
  { key: 'rag', label: 'RAG', desc: 'Ground responses in retrieved external knowledge, still frozen weights.' },
  { key: 'eval', label: 'Evaluation & Serving', desc: 'Measure it and run it affordably: benchmarks, batching, Paged Attention.' },
  { key: 'multimodal', label: 'Multimodal & Generative', desc: 'Same architecture, other modalities: VLMs, VLAs, diffusion.' },
];

/** The section's 6 pages as a clickable map instead of a flat bullet
 * list -- click a page to see what it actually covers before jumping in. */
export default function GenAiSectionMapDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('training');
  const color = t.accentPrimary;
  const active = PAGES.find((p) => p.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.label}: ${active.desc}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {PAGES.map((p) => {
          const isSelected = selected === p.key;
          return (
            <div
              key={p.key}
              onClick={() => setSelected(p.key)}
              onMouseEnter={() => setSelected(p.key)}
              style={{ padding: '10px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, textAlign: 'center', background: isSelected ? `${color}20` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`, color: isSelected ? color : t.textSecondary }}
            >
              {p.label}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Click a page for what it actually covers.
      </div>
    </VisualizationContainer>
  );
}
