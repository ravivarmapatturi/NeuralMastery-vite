import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Gate = 'manual' | 'automated';

/** Promotion is a deliberate GATE, not a side effect -- toggle between
 * the two ways that gate can be enforced. */
export default function PromotionWorkflowDiagram() {
  const t = useVizTokens();
  const [gate, setGate] = useState<Gate>('automated');
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer={gate === 'manual' ? 'Manual approval: a human reviews the candidate (metrics, a sample of predictions) and explicitly promotes it -- slower, but a person is accountable for the decision.' : 'Automated: promotion happens only if the model passes the regression checks from ML CI/CD -- faster, consistent, but only as good as the checks themselves.'}>
      <PillSelect<Gate> label="Promotion gate" value={gate} onChange={setGate} options={[{ value: 'manual', label: 'Manual approval' }, { value: 'automated', label: 'Automated (CI gate)' }]} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <div style={{ padding: '0.6rem', borderRadius: 8, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, textAlign: 'center', flex: 1 }}>
          <span style={{ fontSize: 10.5, color: t.textMuted }}>Staging</span>
        </div>
        <div style={{ fontSize: 14, color }}>{gate === 'manual' ? '👤' : '⚙'} →</div>
        <div style={{ padding: '0.6rem', borderRadius: 8, background: `${color}18`, border: `1.5px solid ${color}`, textAlign: 'center', flex: 1 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color }}>Production</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Not an implicit side effect of training finishing -- a deliberate, gated action either way.
      </div>
    </VisualizationContainer>
  );
}
