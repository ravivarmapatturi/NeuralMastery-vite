import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TYPES = [
  { key: 'deployment', label: 'Deployment', identity: 'interchangeable', placement: 'anywhere', desc: 'Stateless, disposable Pods -- any replica can be replaced by any other.' },
  { key: 'statefulset', label: 'StatefulSet', identity: 'stable, unique', placement: 'anywhere', desc: 'For Pods that need stable identities and storage (databases) -- Pod 0 is always Pod 0, even after a restart.' },
  { key: 'daemonset', label: 'DaemonSet', identity: 'interchangeable', placement: 'exactly 1 per node', desc: 'Ensures exactly one copy runs on every node -- log collectors, monitoring agents, GPU device plugins.' },
  { key: 'job', label: 'Job / CronJob', identity: 'run-to-completion', placement: 'anywhere', desc: 'Not a long-running service at all -- runs once (or on a schedule) and exits. A batch inference job, a nightly retrain.' },
];

/** Four workload types, each answering "how should Pods be managed"
 * differently -- click one for what makes it structurally different from
 * a plain Deployment. */
export default function WorkloadTypesDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('daemonset');
  const color = getConceptColor(t, 'attention');
  const active = TYPES.find((ty) => ty.key === selected)!;

  return (
    <VisualizationContainer footer={active.desc}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Type</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Pod identity</th>
              <th style={{ textAlign: 'left', padding: '4px 6px', color: t.textMuted, fontWeight: 600 }}>Placement</th>
            </tr>
          </thead>
          <tbody>
            {TYPES.map((ty) => {
              const isSelected = selected === ty.key;
              return (
                <tr key={ty.key} onClick={() => setSelected(ty.key)} onMouseEnter={() => setSelected(ty.key)} style={{ cursor: 'pointer', background: isSelected ? `${color}12` : 'transparent' }}>
                  <td style={{ padding: '5px 6px', fontWeight: isSelected ? 700 : 500, color: isSelected ? color : t.textPrimary }}>{ty.label}</td>
                  <td style={{ padding: '5px 6px', color: t.textSecondary }}>{ty.identity}</td>
                  <td style={{ padding: '5px 6px', color: t.textSecondary }}>{ty.placement}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </VisualizationContainer>
  );
}
