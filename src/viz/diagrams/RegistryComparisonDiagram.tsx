import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const REGISTRIES = [
  { key: 'hub', label: 'Docker Hub', when: 'Public/open-source images -- less common for private production images.' },
  { key: 'ecr', label: 'Amazon ECR', when: 'The default choice when the rest of the stack is on AWS.' },
  { key: 'gcp', label: 'GCP Artifact Registry', when: 'The equivalent managed registry on GCP.' },
  { key: 'azure', label: 'Azure Container Registry', when: 'The equivalent managed registry on Azure.' },
];

/** Four registries, the same underlying job (store + serve images) --
 * click one for when it's the natural pick. */
export default function RegistryComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('ecr');
  const color = getConceptColor(t, 'attention');
  const active = REGISTRIES.find((r) => r.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.label}: ${active.when}`}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {REGISTRIES.map((r) => {
          const isSelected = selected === r.key;
          return (
            <div key={r.key} onClick={() => setSelected(r.key)} onMouseEnter={() => setSelected(r.key)} style={{ cursor: 'pointer', padding: '0.6rem 0.9rem', borderRadius: 8, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`, flex: '1 1 120px', textAlign: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{r.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        The choice usually follows directly from which cloud the rest of the stack already runs on.
      </div>
    </VisualizationContainer>
  );
}
