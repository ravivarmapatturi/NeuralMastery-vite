import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'evidently', label: 'Evidently', hosted: 'Open-source, self-hosted', when: 'The most common starting point -- drift and data-quality reports/dashboards.' },
  { key: 'whylabs', label: 'WhyLabs', hosted: 'Managed, data stays local', when: 'Profiles data locally, sends only statistical summaries -- ML observability without shipping raw data to a third party.' },
  { key: 'arize', label: 'Arize', hosted: 'Managed', when: 'Strong root-cause support -- tracing a performance drop back to the specific data segment actually driving it.' },
];

/** Three tools, click one for what specifically distinguishes it. */
export default function DriftToolComparisonDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('whylabs');
  const color = getConceptColor(t, 'attention');
  const active = TOOLS.find((tool) => tool.key === selected)!;

  return (
    <VisualizationContainer footer={active.when}>
      <div style={{ display: 'flex', gap: 6 }}>
        {TOOLS.map((tool) => {
          const isSelected = selected === tool.key;
          return (
            <div key={tool.key} onClick={() => setSelected(tool.key)} onMouseEnter={() => setSelected(tool.key)} style={{ flex: 1, cursor: 'pointer', padding: '0.6rem', borderRadius: 8, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: isSelected ? color : t.textPrimary }}>{tool.label}</div>
              <div style={{ fontSize: 9, color: t.textMuted, marginTop: 3 }}>{tool.hosted}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        All compute the same underlying statistical distances -- the differentiator is hosting model and what happens after drift is detected.
      </div>
    </VisualizationContainer>
  );
}
