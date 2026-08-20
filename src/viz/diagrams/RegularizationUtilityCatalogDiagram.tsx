import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const LAYERS = [
  { key: 'dropout', label: 'Dropout', desc: 'Randomly zeroes a fraction of activations during training, forcing the network not to rely on any single unit -- turned off at inference time.' },
  { key: 'softmax', label: 'Softmax', desc: 'Converts raw scores into a probability distribution (non-negative, sums to 1) -- the standard final classification activation, and what turns attention scores into attention weights.' },
  { key: 'residual', label: 'Residual / Skip', desc: 'Adds a layer\'s input back to its output, y = F(x) + x -- not a layer with its own parameters, but the connectivity pattern that makes very deep networks trainable.' },
];

/** Three non-learnable-parameter-free (mostly) layers that make deep
 * networks actually train well -- click one for what it does. */
export default function RegularizationUtilityCatalogDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('dropout');
  const color = getConceptColor(t, 'attention');
  const l = LAYERS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={l.desc}>
      <div style={{ display: 'flex', gap: 5 }}>
        {LAYERS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', flex: 1, textAlign: 'center', padding: '0.5rem 0.4rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
