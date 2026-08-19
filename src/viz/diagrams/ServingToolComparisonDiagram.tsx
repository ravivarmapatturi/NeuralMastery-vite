import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'fastapi', label: 'FastAPI (hand-rolled)', control: 3, setup: 1, gpuOpt: 1, when: 'You need full control and are willing to own batching/versioning logic yourself.' },
  { key: 'mlflow', label: 'MLflow serving', control: 1, setup: 3, gpuOpt: 1, when: 'Fastest path from a logged MLflow experiment to a running endpoint.' },
  { key: 'bentoml', label: 'BentoML', control: 2, setup: 2, gpuOpt: 2, when: 'Purpose-built packaging/serving with adaptive batching and multi-model runners built in.' },
  { key: 'torchserve', label: 'TorchServe', control: 2, setup: 2, gpuOpt: 2, when: 'PyTorch models specifically -- versioning, batching, metrics out of the box.' },
  { key: 'triton', label: 'NVIDIA Triton', control: 2, setup: 1, gpuOpt: 3, when: 'Multi-framework, GPU-heavy, high-throughput -- the standard once raw GPU throughput matters most.' },
  { key: 'rayserve', label: 'Ray Serve', control: 2, setup: 2, gpuOpt: 2, when: 'Composing multiple models/steps into one horizontally-scaling serving pipeline.' },
  { key: 'kserve', label: 'KServe', control: 2, setup: 1, gpuOpt: 2, when: 'Kubernetes-native: standardized serving, autoscaling (incl. scale-to-zero), canary rollouts.' },
];

function Dots({ n, color, t }: { n: number; color: string; t: ReturnType<typeof useVizTokens> }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= n ? color : t.border }} />)}</div>;
}

/** Seven serving tools on the axes that actually differ -- control you
 * keep, setup effort, GPU-throughput optimization. Click a row for when
 * it earns its complexity. */
export default function ServingToolComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('triton');
  const color = getConceptColor(t, 'attention');
  const active = TOOLS.find((tool) => tool.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.label}: ${active.when}`}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Tool</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Control kept</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Setup ease</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>GPU optimization</th>
            </tr>
          </thead>
          <tbody>
            {TOOLS.map((tool) => {
              const isSelected = selected === tool.key;
              return (
                <tr key={tool.key} onClick={() => setSelected(tool.key)} onMouseEnter={() => setSelected(tool.key)} style={{ cursor: 'pointer', background: isSelected ? `${color}12` : 'transparent' }}>
                  <td style={{ padding: '5px 6px', fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{tool.label}</td>
                  <td style={{ padding: '5px 6px' }}><Dots n={tool.control} color={color} t={t} /></td>
                  <td style={{ padding: '5px 6px' }}><Dots n={tool.setup} color={color} t={t} /></td>
                  <td style={{ padding: '5px 6px' }}><Dots n={tool.gpuOpt} color={color} t={t} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        A single PyTorch model behind moderate traffic: TorchServe/BentoML. Multi-model, GPU-heavy, high-throughput: Triton or KServe.
      </div>
    </VisualizationContainer>
  );
}
