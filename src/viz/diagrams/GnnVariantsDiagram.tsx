import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const VARIANTS = [
  { key: 'gcn', label: 'GCN', desc: 'Aggregates neighbor features via a (normalized) weighted average -- the most direct graph generalization of convolution.' },
  { key: 'sage', label: 'GraphSAGE', desc: 'Samples a fixed-size subset of neighbors and learns a general aggregation function instead of using the full neighborhood -- enables inductive learning on nodes/graphs never seen during training.' },
  { key: 'gat', label: 'GAT', desc: 'Replaces GCN\'s fixed averaging with learned attention weights over neighbors -- the model learns which neighbors matter more, the same core idea as self-attention applied to a graph\'s actual edges.' },
];

/** Three ways to aggregate a node's neighbors -- click one for how it
 * differs from plain averaging. */
export default function GnnVariantsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('gat');
  const color = getConceptColor(t, 'attention');
  const v = VARIANTS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={v.desc}>
      <div style={{ display: 'flex', gap: 5 }}>
        {VARIANTS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', flex: 1, textAlign: 'center', padding: '0.5rem 0.4rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
