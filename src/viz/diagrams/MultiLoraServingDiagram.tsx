import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Four task-specific fine-tunes, served either as four separately
 * stored/deployed full models or as one base model with four
 * swappable LoRA adapters -- click to compare. */
export default function MultiLoraServingDiagram() {
  const t = useVizTokens();
  const [shared, setShared] = useState(true);
  const color = getConceptColor(t, 'attention');
  const okColor = t.accentPrimary;
  const ADAPTERS = ['support', 'legal', 'billing', 'onboarding'];

  return (
    <VisualizationContainer footer={shared ? 'One base model deployed once, with 4 small swappable LoRA adapters loaded alongside it -- a request specifies which adapter to apply, applied on the fly. vLLM supports this natively.' : 'Each fine-tune fully merged into its own complete model -- 4x the storage, 4x the deployment/scaling overhead, even though most of each model\'s weights are identical to the base.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setShared(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !shared ? 700 : 500, background: !shared ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!shared ? color : t.border}`, color: !shared ? color : t.textSecondary, cursor: 'pointer' }}>
          Full model per fine-tune
        </button>
        <button type="button" onClick={() => setShared(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: shared ? 700 : 500, background: shared ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${shared ? color : t.border}`, color: shared ? color : t.textSecondary, cursor: 'pointer' }}>
          Multi-LoRA on one base
        </button>
      </div>
      {shared ? (
        <div>
          <div style={{ padding: '0.6rem', borderRadius: 7, background: `${okColor}18`, border: `1.5px solid ${okColor}`, textAlign: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: okColor }}>base model (deployed once)</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {ADAPTERS.map((a) => (
              <div key={a} style={{ flex: 1, padding: '0.4rem', borderRadius: 6, background: `${color}12`, border: `1px solid ${color}40`, textAlign: 'center' }}>
                <span style={{ fontSize: 8.5, color }}>{a} adapter</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 4 }}>
          {ADAPTERS.map((a) => (
            <div key={a} style={{ flex: 1, padding: '0.6rem 0.3rem', borderRadius: 7, background: `${t.accentDanger}12`, border: `1.5px solid ${t.accentDanger}40`, textAlign: 'center' }}>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: t.accentDanger }}>{a} model (full copy)</span>
            </div>
          ))}
        </div>
      )}
    </VisualizationContainer>
  );
}
