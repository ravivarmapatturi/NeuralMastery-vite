import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const ITEMS = [
  { key: 'root', label: "Don't run as root", desc: "Use the USER instruction unless there's a specific reason to run as root — a compromised process shouldn't have root inside the container either." },
  { key: 'scan', label: 'Scan images in CI', desc: 'Trivy, Grype, or a registry\'s built-in scanner, run as part of CI -- not discovered after deployment.' },
  { key: 'base', label: 'Keep base images minimal + current', desc: 'Most container CVEs come from an outdated BASE image, not application code -- this is the highest-leverage fix.' },
  { key: 'secrets', label: "Don't bake secrets into layers", desc: 'Even a deleted file in an earlier layer is still recoverable from image history -- use runtime secret injection instead.' },
];

/** Four checklist items, each with a real reason -- click one for why it
 * matters, not just what to do. */
export default function ContainerSecurityChecklistDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('base');
  const color = getConceptColor(t, 'attention');
  const info = ITEMS.find((i) => i.key === active)!;

  return (
    <VisualizationContainer footer={info.desc}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <div key={item.key} onClick={() => setActive(item.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(item.key); } }} onMouseEnter={() => setActive(item.key)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 0.8rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ color, fontSize: 13 }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{item.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Click a practice for why it's on the list, not just that it is.
      </div>
    </VisualizationContainer>
  );
}
