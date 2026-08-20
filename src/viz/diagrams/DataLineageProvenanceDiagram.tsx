import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const CONCEPTS = [
  { key: 'lineage', label: 'Lineage', desc: 'Which raw sources AND transformations produced this dataset -- the full upstream chain.' },
  { key: 'provenance', label: 'Provenance', desc: 'Where a specific piece of data ORIGINALLY came from -- the single point of origin, not the whole chain.' },
  { key: 'snapshot', label: 'Snapshots/versioning', desc: 'Referencing "the exact dataset used to train model v3," reproducibly, months later.' },
  { key: 'reproducibility', label: 'Reproducibility', desc: 'Same code + same data version → same trained model, guaranteed.' },
];

/** Four distinct, often-conflated concepts -- click one for exactly
 * what it means and how it differs from its neighbors. */
export default function DataLineageProvenanceDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('lineage');
  const color = getConceptColor(t, 'attention');
  const info = CONCEPTS.find((c) => c.key === active)!;

  return (
    <VisualizationContainer footer={info.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {CONCEPTS.map((c) => {
          const isActive = active === c.key;
          return (
            <div key={c.key} onClick={() => setActive(c.key)} onMouseEnter={() => setActive(c.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{c.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Related, but genuinely distinct -- lineage is the chain, provenance is the origin point, snapshots are the reference, reproducibility is the guarantee.
      </div>
    </VisualizationContainer>
  );
}
