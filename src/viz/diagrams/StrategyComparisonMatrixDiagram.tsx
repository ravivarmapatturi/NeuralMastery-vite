import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const ROWS = [
  { key: 'bg', label: 'Blue-Green', answers: 'Is the new version safe to fully cut over to?', cost: 'Double infrastructure, briefly' },
  { key: 'canary', label: 'Canary', answers: 'Is the new version safe, at gradually increasing scale?', cost: 'Extra rollout time and monitoring' },
  { key: 'shadow', label: 'Shadow', answers: 'How does the new model behave on real traffic, zero user risk?', cost: 'Extra compute, no outcome feedback' },
  { key: 'ab', label: 'A/B Test', answers: 'Does the new model actually perform better on the metric that matters?', cost: 'Statistical rigor, longer time to a decision' },
];

/** All 4 strategies, click a row to see what question it answers and
 * what it costs -- side by side instead of scanning a static table. */
export default function StrategyComparisonMatrixDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('canary');
  const color = getConceptColor(t, 'attention');
  const active = ROWS.find((r) => r.key === selected)!;

  return (
    <VisualizationContainer footer={`Cost: ${active.cost}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {ROWS.map((r) => {
          const isSelected = selected === r.key;
          return (
            <div key={r.key} onClick={() => setSelected(r.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(r.key); } }} onMouseEnter={() => setSelected(r.key)} style={{ cursor: 'pointer', padding: '0.55rem 0.8rem', borderRadius: 7, background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: isSelected ? color : t.textPrimary }}>{r.label}</div>
              <div style={{ fontSize: 10, color: t.textSecondary, marginTop: 2, fontStyle: 'italic' }}>&ldquo;{r.answers}&rdquo;</div>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
