import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const REGS = [
  { key: 'pii', label: 'PII controls', desc: 'Detecting, redacting, and controlling access to personal data flowing through training data, logs, and traces -- the technical layer underneath both regulations below.' },
  { key: 'gdpr', label: 'GDPR (EU)', desc: 'Grants a "right to be forgotten" -- genuinely difficult for a model trained on that person\'s data, since deleting a row has no clean equivalent for deleting influence from trained weights. Active, unresolved governance practice, not a solved checkbox.' },
  { key: 'hipaa', label: 'HIPAA (U.S. healthcare)', desc: 'Access controls scoped to legitimate need, audit logging, careful third-party data-processing agreements -- the healthcare-specific case, but the pattern generalizes to other regulated-data domains.' },
];

/** PII/GDPR/HIPAA cover overlapping but distinct ground -- click one
 * for what it actually requires. */
export default function PrivacyRegulationScopeDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('gdpr');
  const color = getConceptColor(t, 'attention');
  const r = REGS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={r.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {REGS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
