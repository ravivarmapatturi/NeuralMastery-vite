import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const ENGINES = [
  { key: 'vllm', label: 'vLLM', throughput: 3, hardware: 'NVIDIA GPU', when: 'The safest first choice for self-hosted LLM serving -- PagedAttention, continuous batching, OpenAI-compatible API.' },
  { key: 'sglang', label: 'SGLang', throughput: 3, hardware: 'NVIDIA GPU', when: 'RadixAttention prefix caching + structured generation -- particularly strong for agent workloads with many prefix-sharing calls.' },
  { key: 'llamacpp', label: 'llama.cpp', throughput: 1, hardware: 'CPU, Apple Metal, Vulkan', when: 'CPU and consumer hardware, GGUF format -- backbone of Ollama and LM Studio.' },
  { key: 'trtllm', label: 'TensorRT-LLM', throughput: 3, hardware: 'NVIDIA GPU', when: 'Typically the fastest option on NVIDIA hardware specifically -- heavier compile/deploy workflow, less flexible than vLLM.' },
  { key: 'tgi', label: 'HF TGI', throughput: 2, hardware: 'NVIDIA GPU', when: 'Reasonable default when everything else in the stack is already HF-centric.' },
  { key: 'onnx', label: 'ONNX Runtime', throughput: 2, hardware: 'Cross-platform (pluggable)', when: 'Needs to run across genuinely heterogeneous hardware from one exported format.' },
  { key: 'openvino', label: 'OpenVINO', throughput: 2, hardware: 'Intel CPU/iGPU/VPU', when: 'Edge and CPU-heavy deployments on Intel hardware specifically.' },
];

function Dots({ n, color, t }: { n: number; color: string; t: ReturnType<typeof useVizTokens> }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= n ? color : t.border }} />)}</div>;
}

/** The 7 must-know engines on hardware target and throughput -- click a
 * row for when it earns the pick. */
export default function Tier1EngineComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('vllm');
  const color = getConceptColor(t, 'attention');
  const active = ENGINES.find((e) => e.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.label}: ${active.when}`}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Engine</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Throughput focus</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Hardware target</th>
            </tr>
          </thead>
          <tbody>
            {ENGINES.map((e) => {
              const isSelected = selected === e.key;
              return (
                <tr key={e.key} onClick={() => setSelected(e.key)} onMouseEnter={() => setSelected(e.key)} style={{ cursor: 'pointer', background: isSelected ? `${color}12` : 'transparent' }}>
                  <td style={{ padding: '5px 6px', fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{e.label}</td>
                  <td style={{ padding: '5px 6px' }}><Dots n={e.throughput} color={color} t={t} /></td>
                  <td style={{ padding: '5px 6px', color: t.textSecondary }}>{e.hardware}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </VisualizationContainer>
  );
}
