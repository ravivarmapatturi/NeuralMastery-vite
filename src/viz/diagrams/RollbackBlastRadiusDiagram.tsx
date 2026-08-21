import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const MODES = [
  { key: 'none', label: 'No rollback path', affected: 100, detail: 'Every user is on the broken deployment, and reverting means a slow, risky redeploy -- every deploy becomes a higher-stakes decision than it needs to be.' },
  { key: 'canary', label: 'Canary (5% traffic)', affected: 5, detail: 'Only the 5% of traffic already routed to canary needs rolling back -- a small, contained blast radius.' },
  { key: 'blue-green', label: 'Blue-green', affected: 0, detail: 'The old environment stayed live the whole time -- traffic routes back to it instantly, effectively zero blast radius.' },
];

/** How much of production is exposed to a bad deploy before it's
 * caught, depending on the rollback strategy in place -- click one. */
export default function RollbackBlastRadiusDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('canary');
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const m = MODES.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={m.detail}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
        {MODES.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 2, height: 28, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${m.affected}%`, background: `${badColor}30`, border: `1px solid ${badColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.25s ease' }}>
          {m.affected > 8 && <span style={{ fontSize: 9, fontWeight: 700, color: badColor }}>{m.affected}% affected</span>}
        </div>
        <div style={{ width: `${100 - m.affected}%`, background: `${t.accentPrimary}18`, border: `1px solid ${t.accentPrimary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, color: t.accentPrimary }}>{100 - m.affected}% unaffected</span>
        </div>
      </div>
    </VisualizationContainer>
  );
}
