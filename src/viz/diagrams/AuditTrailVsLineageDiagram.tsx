import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Lineage is the technical capability; an audit trail is what that
 * capability gets used for -- the difference between having the data
 * and being able to produce it, verified and complete, when asked. */
export default function AuditTrailVsLineageDiagram() {
  const t = useVizTokens();
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="A regulator, legal team, or internal investigation needs the second box, not just the first -- having the data and being able to produce a verified, complete accounting of it are different bars.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: `${color}12`, border: `1.5px solid ${color}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 4 }}>Lineage</div>
          <div style={{ fontSize: 9.5, color: t.textSecondary }}>The technical capability -- can you trace which model version served a prediction, which data trained it.</div>
        </div>
        <span style={{ color: t.textMuted, fontSize: 16 }}>→</span>
        <div style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: `${t.accentPrimary}12`, border: `1.5px solid ${t.accentPrimary}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.accentPrimary, marginBottom: 4 }}>Audit trail</div>
          <div style={{ fontSize: 9.5, color: t.textSecondary }}>What that capability gets used for -- a verified, complete accounting produced when a regulator or investigation actually asks.</div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
