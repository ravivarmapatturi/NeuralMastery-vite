import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const PARTS = [
  { key: 'name', label: 'get_weather', desc: 'Function name — the model chooses this from the available tool menu, exactly like picking a documented function to call.' },
  { key: 'args', label: '{"city": "Tokyo", "unit": "celsius"}', desc: 'Structured arguments, matching the tool\'s declared schema — not free text, so the calling application can execute it directly.' },
];

/** Instead of a plain-text answer, the model emits a structured request:
 * a function name plus arguments matching a declared schema. Click each
 * part to see what it actually is and why it has to be structured this
 * way for the calling application to execute it. */
export default function ToolCallAnatomyDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<'name' | 'args' | null>(null);
  const color = getConceptColor(t, 'attention');
  const nameColor = getConceptColor(t, 'query');
  const argsColor = getConceptColor(t, 'value');

  return (
    <VisualizationContainer footer={active ? PARTS.find((p) => p.key === active)!.desc : 'Click a part of the call below.'}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, fontSize: 11, fontFamily: 'monospace', color: t.textSecondary }}>
          "What's the weather in Tokyo?"
        </div>
        <div style={{ fontSize: 16, color: t.textMuted }}>→</div>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: `${color}18`, border: `1.5px solid ${color}`, fontFamily: 'monospace', fontSize: 11 }}>
          <span onMouseEnter={() => setActive('name')} onMouseLeave={() => setActive(null)} style={{ cursor: 'pointer', color: active === 'name' ? nameColor : t.textSecondary, fontWeight: active === 'name' ? 700 : 400 }}>
            get_weather
          </span>
          <span style={{ color: t.textMuted }}>(</span>
          <span onMouseEnter={() => setActive('args')} onMouseLeave={() => setActive(null)} style={{ cursor: 'pointer', color: active === 'args' ? argsColor : t.textSecondary, fontWeight: active === 'args' ? 700 : 400 }}>
            city="Tokyo", unit="celsius"
          </span>
          <span style={{ color: t.textMuted }}>)</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10, fontSize: DIAGRAM_TYPE.caption.size }}>
        <span style={{ color: nameColor }}>● name — which tool</span>
        <span style={{ color: argsColor }}>● arguments — matching the declared schema</span>
      </div>
    </VisualizationContainer>
  );
}
