import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Training-data copyright status sits on unsettled ground -- not a
 * clickable toggle, since there's no clean "resolved" state to switch
 * to. A static picture of where the actual uncertainty lives. */
export default function CopyrightUncertaintyDiagram() {
  const t = useVizTokens();
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="Genuinely unsettled law in multiple jurisdictions, actively being litigated -- not a solved question with a clean rule. Understand a chosen model's training-data policies and indemnification terms, and treat this as an area to monitor, not a checkbox.">
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: `${t.accentDanger}12`, border: `1.5px solid ${t.accentDanger}40` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.accentDanger, marginBottom: 4 }}>Unresolved</div>
          <div style={{ fontSize: 9.5, color: t.textSecondary }}>Does training on copyrighted material constitute infringement, or fair use/fair dealing? Actively litigated, jurisdiction-dependent.</div>
        </div>
        <div style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: `${color}12`, border: `1.5px solid ${color}40` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 4 }}>Practical signal</div>
          <div style={{ fontSize: 9.5, color: t.textSecondary }}>Some providers offer legal indemnification for output copyright claims -- itself a signal of how seriously the underlying risk is taken.</div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
