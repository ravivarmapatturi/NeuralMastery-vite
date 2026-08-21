import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'ollama', label: 'Ollama', desc: 'The friendly wrapper -- simple CLI/API, automatic model pulling -- around llama.cpp as the underlying engine, running GGUF models. The most common zero-setup on-ramp.' },
  { key: 'lmstudio', label: 'LM Studio', desc: 'A desktop GUI, also built on llama.cpp, for browsing, downloading, and chatting with local GGUF models without a command line.' },
  { key: 'llamaserver', label: 'llama.cpp server', desc: 'llama.cpp\'s own built-in HTTP server (llama-server) -- for when Ollama\'s abstraction is unwanted and direct control over serving behavior (including grammar-constrained generation) is needed.' },
  { key: 'vllm', label: 'Self-hosted vLLM', desc: 'The step up once real throughput matters -- the same engine used in high-scale cloud deployments, just self-managed on local/on-prem GPU hardware.' },
];

/** Four local-hosting options, three of them built on the same
 * underlying engine -- click one for where it sits. */
export default function LocalHostingStackDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('ollama');
  const color = getConceptColor(t, 'attention');
  const x = TOOLS.find((y) => y.key === active)!;

  return (
    <VisualizationContainer footer={x.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {TOOLS.map((y) => {
          const isActive = active === y.key;
          return (
            <div key={y.key} onClick={() => setActive(y.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(y.key); } }} onMouseEnter={() => setActive(y.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{y.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 8.5, color: t.textMuted, textAlign: 'center' }}>
        Ollama, LM Studio, and llama.cpp server all run on the same llama.cpp engine underneath — vLLM is the outlier, a different engine entirely
      </div>
    </VisualizationContainer>
  );
}
