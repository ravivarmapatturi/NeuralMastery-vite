import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'mlflow', label: 'MLflow', hosted: 'Self-hosted', note: 'Open source, the closest thing to an industry standard.' },
  { key: 'wandb', label: 'Weights & Biases', hosted: 'Hosted', note: 'Polished UI, strong visualization -- most common in research-heavy teams.' },
  { key: 'neptune', label: 'Neptune', hosted: 'Hosted', note: 'Strong support for large numbers of metadata fields and team collaboration.' },
  { key: 'comet', label: 'Comet', hosted: 'Hosted', note: 'Built-in model monitoring extending past training into production.' },
];

/** Four tools solving the same core problem, click one for what actually
 * distinguishes it. */
export default function TrackingToolComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('mlflow');
  const color = getConceptColor(t, 'attention');
  const active = TOOLS.find((tool) => tool.key === selected)!;

  return (
    <VisualizationContainer footer={active.note}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TOOLS.map((tool) => {
          const isSelected = selected === tool.key;
          return (
            <div key={tool.key} onClick={() => setSelected(tool.key)} onMouseEnter={() => setSelected(tool.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? color : t.textPrimary }}>{tool.label}</div>
              <div style={{ fontSize: 8.5, color: t.textMuted, marginTop: 2 }}>{tool.hosted}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        All solve the same core problem: log everything, compare runs, never lose a result.
      </div>
    </VisualizationContainer>
  );
}
