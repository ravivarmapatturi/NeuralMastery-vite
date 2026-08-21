import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const BRANCHES = [
  { key: '1x1', label: '1×1 conv', desc: 'Cheap dimensionality reduction -- mixes channels without looking at neighbors, used before the expensive larger filters too.' },
  { key: '3x3', label: '3×3 conv', desc: 'Captures medium-scale local patterns.' },
  { key: '5x5', label: '5×5 conv', desc: 'Captures larger-scale patterns in one step, at higher compute cost per filter.' },
  { key: 'pool', label: '3×3 max-pool', desc: 'A pooling branch alongside the convolutions -- lets the module also propagate strong local activations directly.' },
];

/** All four branches run in parallel on the SAME input and get
 * concatenated -- click a branch to see what scale it captures. The
 * network learns which scale matters rather than committing upfront. */
export default function InceptionModuleDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('1x1');
  const color = getConceptColor(t, 'attention');
  const b = BRANCHES.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={b.desc}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ padding: '0.4rem 0.8rem', borderRadius: 6, background: t.surfaceAlt, border: `1px solid ${t.border}`, fontSize: 9, color: t.textSecondary }}>input feature map</div>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
        {BRANCHES.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.5rem', borderRadius: 7, background: isActive ? `${color}20` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}`, textAlign: 'center', minWidth: 60 }}>
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '0.4rem 0.8rem', borderRadius: 6, background: `${color}18`, border: `1px solid ${color}`, fontSize: 9, fontWeight: 700, color }}>concatenated output</div>
      </div>
    </VisualizationContainer>
  );
}
