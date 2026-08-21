import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const DBS = [
  { key: 'postgres', label: 'PostgreSQL / MySQL', when: 'Structured application and pipeline metadata -- the relational default.' },
  { key: 'redis', label: 'Redis', when: 'In-memory caching (predictions, feature lookups) where sub-millisecond access matters more than durability.' },
  { key: 'mongo', label: 'MongoDB', when: 'Data that doesn\'t fit a rigid relational schema -- variable-structure event logs.' },
];

/** Three stores, three shapes of data -- click one for exactly when it's
 * the right fit. */
export default function DatabaseUseCaseDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('redis');
  const color = getConceptColor(t, 'attention');
  const active = DBS.find((d) => d.key === selected)!;

  return (
    <VisualizationContainer footer={active.when}>
      <div style={{ display: 'flex', gap: 6 }}>
        {DBS.map((d) => {
          const isSelected = selected === d.key;
          return (
            <div key={d.key} onClick={() => setSelected(d.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(d.key); } }} onMouseEnter={() => setSelected(d.key)} style={{ flex: 1, cursor: 'pointer', padding: '0.6rem', borderRadius: 8, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? color : t.textPrimary }}>{d.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        See Databases for the full depth on this exact decision.
      </div>
    </VisualizationContainer>
  );
}
