import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'dvc', label: 'DVC', model: '"Git for data" -- git tracks lightweight pointer files, data lives in remote storage.', when: 'The most common starting point -- workflow deliberately familiar to anyone who knows git.' },
  { key: 'lakefs', label: 'LakeFS', model: 'Git-like branching semantics applied directly to a data lake.', when: 'Branch a dataset, experiment, merge back -- exactly like a code branch.' },
  { key: 'delta', label: 'Delta Lake', model: 'Versioned, ACID-compliant tables on Apache Spark.', when: 'Every write creates a new queryable version -- "time travel" queries against past table states.' },
  { key: 'iceberg', label: 'Apache Iceberg', model: 'Versioned, schema-evolving tables, engine-agnostic (not Spark-specific).', when: 'Increasingly the default for new data lake infrastructure.' },
];

/** Four data versioning tools -- click one for its actual model and
 * when it's the natural pick. */
export default function DataVersioningToolComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('dvc');
  const color = getConceptColor(t, 'attention');
  const active = TOOLS.find((tool) => tool.key === selected)!;

  return (
    <VisualizationContainer footer={active.when}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {TOOLS.map((tool) => {
          const isSelected = selected === tool.key;
          return (
            <div key={tool.key} onClick={() => setSelected(tool.key)} onMouseEnter={() => setSelected(tool.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}` }}>
              <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{tool.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, padding: '0.6rem 0.8rem', borderRadius: 7, background: `${color}12`, fontSize: 10.5, color: t.textSecondary }}>
        {active.model}
      </div>
    </VisualizationContainer>
  );
}
