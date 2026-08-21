import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const LAYERS = [
  { key: 'iam', label: 'IAM', desc: 'Who, and what service, can do what. Over-permissioned roles are the single most common source of real security incidents, not exotic exploits.' },
  { key: 'secrets', label: 'Secrets management', desc: 'API keys, DB credentials, model-provider tokens live in a secrets manager, injected at runtime -- never in a config file, Dockerfile, or git-committed .env.' },
  { key: 'auth', label: 'API auth/RBAC', desc: 'Every serving endpoint needs authentication and role-based access control -- not every caller should have access to every model or capability.' },
  { key: 'tls', label: 'TLS', desc: 'Encrypt traffic in transit, always -- between users and the API gateway, and ideally between internal services too.' },
  { key: 'scanning', label: 'Container/dependency scanning', desc: 'Scan images and dependency trees for known CVEs as part of CI -- catching a vulnerable base image or package before it ships, not after.' },
];

/** Five general security layers -- click one for what it actually
 * guards against. */
export default function SecurityLayerChecklistDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('iam');
  const color = getConceptColor(t, 'attention');
  const l = LAYERS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={l.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {LAYERS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
