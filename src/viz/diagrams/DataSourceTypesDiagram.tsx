import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const SOURCES = [
  { key: 'files', label: 'CSV/JSON/Parquet', shape: 'batch, at-rest files' },
  { key: 'db', label: 'Relational DB', shape: 'queryable, structured' },
  { key: 'api', label: 'REST APIs', shape: 'pull, on-demand' },
  { key: 'object', label: 'Object storage', shape: 'batch, at-rest, unstructured-friendly' },
  { key: 'stream', label: 'Streaming (Kafka)', shape: 'continuous, push' },
];

/** Five source types, each a different data-arrival SHAPE -- click one
 * for how it actually arrives, which is what determines the ingestion
 * approach downstream. */
export default function DataSourceTypesDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('stream');
  const color = getConceptColor(t, 'attention');
  const active = SOURCES.find((s) => s.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.label}: ${active.shape}. Real production systems usually pull from several of these simultaneously.`}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {SOURCES.map((s) => {
          const isSelected = selected === s.key;
          return (
            <div key={s.key} onClick={() => setSelected(s.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(s.key); } }} onMouseEnter={() => setSelected(s.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}` }}>
              <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
