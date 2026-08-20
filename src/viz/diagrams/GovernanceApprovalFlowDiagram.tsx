import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Governance policy only matters once it's enforced technically --
 * a static flow from written policy to an actual CI/CD gate, not left
 * as a document nobody checks against before shipping. */
export default function GovernanceApprovalFlowDiagram() {
  const t = useVizTokens();
  const color = getConceptColor(t, 'attention');

  const STEPS = ['Written policy', 'Which models approved for which use cases', 'Who has deploy authority', 'Enforced via CI/CD gate'];

  return (
    <VisualizationContainer footer="A policy document nobody actually checks against before shipping isn't governance -- it becomes governance the moment it's enforced as an automated CI/CD gate, the same gate every other deploy passes through.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ padding: '0.5rem 0.6rem', borderRadius: 7, background: i === STEPS.length - 1 ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${i === STEPS.length - 1 ? color : t.border}`, maxWidth: 110 }}>
              <span style={{ fontSize: 9, fontWeight: i === STEPS.length - 1 ? 700 : 500, color: i === STEPS.length - 1 ? color : t.textPrimary }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ color: t.textMuted, fontSize: 11 }}>→</span>}
          </div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
