import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const OBJECTS = [
  { key: 'ingress', label: 'Ingress', desc: "Routes external HTTP(S) traffic in, based on hostname/path -- the cluster's front door." },
  { key: 'service', label: 'Service', desc: 'A stable network endpoint in front of a changing set of Pods -- Pods get new IPs as they restart, the Service address never changes.' },
  { key: 'deployment', label: 'Deployment', desc: 'Declares desired state (image, replica count) for a set of Pods -- continuously reconciled.' },
  { key: 'pod', label: 'Pod ×N', desc: 'The smallest deployable unit -- one or more tightly-coupled containers, scheduled together onto a node.' },
];

/** External traffic's actual path through 4 layered objects -- click one
 * for its job. */
export default function K8sObjectHierarchyDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('service');
  const color = getConceptColor(t, 'attention');
  const info = OBJECTS.find((o) => o.key === active)!;

  return (
    <VisualizationContainer footer={info.desc}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        {OBJECTS.map((o, i) => {
          const isActive = active === o.key;
          return (
            <div key={o.key}>
              <div
                onClick={() => setActive(o.key)}
                onMouseEnter={() => setActive(o.key)}
                style={{ cursor: 'pointer', padding: '6px 20px', borderRadius: 7, fontSize: 12, fontWeight: isActive ? 700 : 500, background: isActive ? `${color}20` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}`, color: isActive ? color : t.textPrimary }}
              >
                {o.label}
              </div>
              {i < OBJECTS.length - 1 && <div style={{ textAlign: 'center', color: t.textMuted, fontSize: 12 }}>↓</div>}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        External request → Ingress → Service → Deployment's Pods.
      </div>
    </VisualizationContainer>
  );
}
