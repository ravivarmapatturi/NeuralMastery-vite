import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Clone, one setup command, working -- the standard every practice
 * on this page exists to make true, with no tribal knowledge step
 * hiding in the middle. */
export default function OnboardingStandardDiagram() {
  const t = useVizTokens();
  const color = getConceptColor(t, 'attention');

  const STEPS = ['git clone', 'one setup command', 'tests pass', 'linting passes', 'local pipeline runs'];

  return (
    <VisualizationContainer footer='No "ask Sarah how the data loads" step hides anywhere in this sequence -- every practice on this page exists to make that true.'>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ padding: '0.5rem 0.55rem', borderRadius: 7, background: i === STEPS.length - 1 ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${i === STEPS.length - 1 ? color : t.border}` }}>
              <span style={{ fontSize: 9, fontWeight: i === STEPS.length - 1 ? 700 : 500, color: i === STEPS.length - 1 ? color : t.textPrimary }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ color: t.textMuted, fontSize: 11 }}>→</span>}
          </div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
