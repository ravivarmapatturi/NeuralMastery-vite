import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

const ROWS = [
  { key: 'pretrain', stage: 'Pretraining', metric: 'Loss curve, perplexity', asks: 'How well does it predict held-out text?' },
  { key: 'posttrain', stage: 'Post-training', metric: 'Reward-model score, preference accuracy', asks: 'Do humans prefer this output over alternatives?' },
  { key: 'serving', stage: 'Serving (live)', metric: 'Benchmarks, LLM-as-judge, online metrics', asks: 'Does it actually satisfy real users, in production?' },
];

/** "Evaluation" isn't one method asked once -- it's a different question,
 * with a different metric, at every stage. Click a row to see exactly
 * what's being measured and why that stage needs its own metric. */
export default function EvaluationThroughlineDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('serving');
  const color = t.accentPrimary;
  const active = ROWS.find((r) => r.key === selected)!;

  return (
    <VisualizationContainer footer={`${active.stage} asks: "${active.asks}" — measured via: ${active.metric}.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ROWS.map((r) => {
          const isSelected = selected === r.key;
          return (
            <div
              key={r.key}
              onClick={() => setSelected(r.key)}
              onMouseEnter={() => setSelected(r.key)}
              style={{
                display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                background: isSelected ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isSelected ? color : t.border}`,
              }}
            >
              <div style={{ width: 100, fontSize: 11, fontWeight: 700, color: isSelected ? color : t.textSecondary }}>{r.stage}</div>
              <div style={{ flex: 1, fontSize: 11, color: t.textMuted }}>{r.metric}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Click a stage. Same underlying question ("is this good?") answered with a different tool each time.
      </div>
    </VisualizationContainer>
  );
}
