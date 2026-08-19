import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Family = 'bert' | 'gpt' | 'seq2seq' | 'vit' | 'multimodal';
const FAMILIES: Record<Family, { label: string; architecture: string; objective: string; bestFor: string; examples: string[]; blocks: string[]; causal?: boolean }> = {
  bert: { label: 'BERT-style', architecture: 'encoder-only', objective: 'masked-token prediction', bestFor: 'representing, classifying, and retrieving', examples: ['BERT', 'RoBERTa', 'DeBERTa', 'SBERT'], blocks: ['input tokens', 'bidirectional encoder × N', 'pooled / token representations'] },
  gpt: { label: 'GPT-style', architecture: 'decoder-only', objective: 'next-token prediction', bestFor: 'generating and following instructions', examples: ['GPT', 'LLaMA', 'Mistral', 'Claude-family'], blocks: ['prompt tokens', 'causal decoder × N', 'next-token distribution'], causal: true },
  seq2seq: { label: 'T5 / BART', architecture: 'encoder–decoder', objective: 'conditional text generation', bestFor: 'translation, summarization, transformation', examples: ['Transformer', 'T5', 'BART', 'FLAN-T5'], blocks: ['source tokens', 'encoder × N', 'cross-attending decoder × N', 'target tokens'], causal: true },
  vit: { label: 'Vision Transformer', architecture: 'encoder-only over patches', objective: 'image classification / representation learning', bestFor: 'global image understanding', examples: ['ViT', 'DeiT', 'Swin', 'DINOv2'], blocks: ['image patches + position', 'vision encoder × N', 'class / dense head'] },
  multimodal: { label: 'Multimodal', architecture: 'encoder + projector + language model', objective: 'joint image/text prediction', bestFor: 'grounded image-language tasks', examples: ['CLIP', 'LLaVA', 'Flamingo', 'GPT-4V-style'], blocks: ['image encoder', 'projector / fusion', 'language decoder', 'text response'], causal: true },
};

export default function TransformerModelFamiliesDiagram() {
  const t = useVizTokens(); const [active, setActive] = useState<Family>('bert'); const f = FAMILIES[active]; const primary = getConceptColor(t, 'attention');
  const boxWidth = active === 'seq2seq' || active === 'multimodal' ? 125 : 170; const total = f.blocks.length * boxWidth + (f.blocks.length - 1) * 25; const start = (620 - total) / 2;
  return <VisualizationContainer footer={`${f.label} is ${f.architecture}. Trained for ${f.objective}; strongest when you need ${f.bestFor}.`}>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>{(Object.keys(FAMILIES) as Family[]).map(k => <VizButton key={k} variant={active === k ? 'primary' : 'secondary'} onClick={() => setActive(k)}>{FAMILIES[k].label}</VizButton>)}</div>
    <svg width="100%" viewBox="0 0 620 128" style={{ display: 'block' }}>
      <defs><marker id="tmf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={t.textMuted} /></marker></defs>
      {f.blocks.map((label, i) => { const x = start + i * (boxWidth + 25); const color = i === 0 ? getConceptColor(t, 'token') : i === f.blocks.length - 1 ? getConceptColor(t, 'output') : primary; const isCore = label.includes('encoder') || label.includes('decoder') || label.includes('projector'); return <g key={label}>{i > 0 && <line x1={x - 23} y1="54" x2={x - 3} y2="54" stroke={t.textMuted} strokeWidth="1.5" markerEnd="url(#tmf-arrow)" />}<rect x={x} y="28" width={boxWidth} height="52" rx="8" fill={isCore ? `${color}30` : t.surfaceAlt} stroke={color} strokeWidth={isCore ? 2.5 : 1.5}/><text x={x + boxWidth / 2} y="50" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{label}</text>{f.causal && label.includes('decoder') && <text x={x + boxWidth / 2} y="68" textAnchor="middle" fontSize="9" fill={t.textMuted}>causal mask</text>}</g>; })}
      {active === 'bert' && <path d={`M${start + boxWidth + 12} 24 C${start + boxWidth + 25} 4 ${start + boxWidth + 35} 4 ${start + boxWidth + 48} 24`} fill="none" stroke={getConceptColor(t, 'key')} strokeWidth="1.5" strokeDasharray="3 3" />}
      <text x="310" y="112" textAnchor="middle" fontSize="10" fill={t.textMuted}>Architecture determines which tokens can exchange information and what the model is trained to output.</text>
    </svg>
    <div style={{ marginTop: 7, fontSize: 12 }}><b>Representative models:</b> {f.examples.join(' · ')}</div>
  </VisualizationContainer>;
}
