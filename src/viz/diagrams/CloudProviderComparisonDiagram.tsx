import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const PROVIDERS = [
  { key: 'general', label: 'General cloud (AWS/GCP/Azure)', control: 90, desc: 'Full control, deepest integration with the rest of a cloud-native stack -- but the most operational overhead. You own GPU provisioning, scaling, and engine deployment.' },
  { key: 'specialized', label: 'GPU-specialized (RunPod, Modal, Together, Fireworks, Groq)', control: 45, desc: 'Purpose-built for exactly this workload -- faster to get served, often cheaper per-GPU-hour, serverless-style provisioning. Groq runs custom LPU hardware for extremely low latency on supported models.' },
  { key: 'hf', label: 'Hugging Face Inference Endpoints', control: 20, desc: 'A managed layer specifically for deploying HF Hub models -- trades flexibility for the least setup of any option here.' },
];

/** Three hosting options on a control-vs-setup-speed spectrum -- click
 * one for the actual tradeoff, the same shape as SageMaker vs.
 * self-hosting from Cloud Computing for ML. */
export default function CloudProviderComparisonDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('specialized');
  const color = getConceptColor(t, 'attention');
  const p = PROVIDERS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={p.desc}>
      <div style={{ position: 'relative', height: 56, marginBottom: 10 }}>
        <div style={{ position: 'absolute', top: 24, left: 0, right: 0, height: 3, background: t.border, borderRadius: 2 }} />
        {PROVIDERS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ position: 'absolute', left: `${100 - x.control}%`, top: 0, transform: 'translateX(-50%)', cursor: 'pointer', textAlign: 'center', width: 90 }}>
              <div style={{ width: isActive ? 14 : 10, height: isActive ? 14 : 10, borderRadius: '50%', background: isActive ? color : t.textMuted, margin: '0 auto', border: `2px solid ${t.background}` }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: t.textMuted, marginBottom: 8 }}>
        <span>← least setup / most managed</span>
        <span>most control / most overhead →</span>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {PROVIDERS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: 6, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
