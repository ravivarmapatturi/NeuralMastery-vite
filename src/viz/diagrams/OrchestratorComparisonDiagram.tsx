import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'airflow', label: 'Airflow', model: 'Tasks, explicit DAG object', ecosystem: 3, ergonomics: 1, when: 'Safest default to learn first -- ubiquity means most job postings mean this specifically.' },
  { key: 'prefect', label: 'Prefect', model: 'Python-native @flow/@task decorators', ecosystem: 2, ergonomics: 3, when: 'A new project where Airflow\'s verbose, less-Pythonic API is a real cost.' },
  { key: 'dagster', label: 'Dagster', model: 'Software-defined assets -- DAG inferred from declared data dependencies', ecosystem: 2, ergonomics: 2, when: 'Strong built-in data quality and lineage tracking matter more than raw ubiquity.' },
];

function Dots({ n, color, t }: { n: number; color: string; t: ReturnType<typeof useVizTokens> }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= n ? color : t.border }} />)}</div>;
}

/** Three orchestrators, same underlying DAG idea, different programming
 * model -- click one for when it's the right pick. */
export default function OrchestratorComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('airflow');
  const color = getConceptColor(t, 'attention');
  const active = TOOLS.find((tool) => tool.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.label}: ${active.when}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TOOLS.map((tool) => {
          const isSelected = selected === tool.key;
          return (
            <div key={tool.key} onClick={() => setSelected(tool.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(tool.key); } }} onMouseEnter={() => setSelected(tool.key)} style={{ cursor: 'pointer', padding: '0.6rem 0.85rem', borderRadius: 8, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? color : t.textPrimary }}>{tool.label}</span>
                <div style={{ display: 'flex', gap: 12, fontSize: 9, color: t.textMuted }}>
                  <span>ecosystem <Dots n={tool.ecosystem} color={color} t={t} /></span>
                  <span>ergonomics <Dots n={tool.ergonomics} color={color} t={t} /></span>
                </div>
              </div>
              <div style={{ fontSize: 9.5, color: t.textMuted, marginTop: 3 }}>{tool.model}</div>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
