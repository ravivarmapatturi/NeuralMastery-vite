import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STACKS = [
  { key: 'elk', label: 'ELK', parts: 'Logstash (ingest) → Elasticsearch (index/store) → Kibana (visualize)', when: 'The classic self-hosted stack -- full-content indexing.' },
  { key: 'opensearch', label: 'OpenSearch', parts: 'API-compatible fork of Elasticsearch', when: 'Increasingly the default when avoiding Elastic\'s licensing terms matters.' },
  { key: 'loki', label: 'Loki', parts: 'Indexes only metadata (labels), not full log content', when: 'Cheaper to run than Elasticsearch -- pairs naturally with Grafana/Prometheus.' },
];

/** Three logging stacks, click one for its actual pipeline shape and
 * what it trades off. */
export default function LogStackComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('loki');
  const color = getConceptColor(t, 'attention');
  const active = STACKS.find((s) => s.key === selected)!;

  return (
    <VisualizationContainer footer={active.when}>
      <div style={{ display: 'flex', gap: 6 }}>
        {STACKS.map((s) => {
          const isSelected = selected === s.key;
          return (
            <div key={s.key} onClick={() => setSelected(s.key)} onMouseEnter={() => setSelected(s.key)} style={{ flex: 1, cursor: 'pointer', padding: '0.6rem', borderRadius: 8, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: isSelected ? color : t.textPrimary }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, padding: '0.6rem 0.8rem', borderRadius: 7, background: `${color}12`, fontSize: 10.5, color: t.textSecondary, fontFamily: 'monospace' }}>
        {active.parts}
      </div>
    </VisualizationContainer>
  );
}
