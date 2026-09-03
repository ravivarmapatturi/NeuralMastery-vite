import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const COMPONENTS = [
  { id: 'apiserver', side: 'control', label: 'kube-apiserver', detail: 'The front door -- every request (kubectl, other control-plane components, kubelet) goes through it. Handles auth and admission control, then reads/writes cluster state in etcd.' },
  { id: 'etcd', side: 'control', label: 'etcd', detail: "The cluster's source of truth: a consistent, highly-available key-value store holding all API-server data (every object's desired state, and its last observed status)." },
  { id: 'scheduler', side: 'control', label: 'kube-scheduler', detail: 'Watches for Pods with no node assigned yet, and picks a suitable node for each one based on resource requests, constraints, and current node capacity.' },
  { id: 'controller-manager', side: 'control', label: 'kube-controller-manager', detail: 'Runs the reconciliation loops -- the exact mechanism the diagram above (Deployment desired-state vs. actual-state) visualizes. Watches cluster state and keeps nudging reality toward what was declared.' },
  { id: 'kubelet', side: 'worker', label: 'kubelet', detail: "The node's own agent: watches the API server for Pods assigned to this node, and tells the container runtime to start/stop their containers accordingly. Reports node and Pod status back up." },
  { id: 'kube-proxy', side: 'worker', label: 'kube-proxy', detail: 'Maintains the network rules on this node that implement Service routing -- the reason a Service address reaches whichever Pod is actually behind it right now.' },
  { id: 'runtime', side: 'worker', label: 'Container runtime', detail: "The software that actually runs containers on this node -- containerd or CRI-O, talking to runc underneath via the same OCI-standardized chain Docker uses (see Containers). kubelet talks to it through the Container Runtime Interface (CRI), not a runtime-specific API." },
];

/** The real cluster topology underneath every object in this page: a
 * control plane (4 components) and N worker nodes (3 components each),
 * click any one for what it actually does. */
export default function ClusterArchitectureDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState('apiserver');
  const controlColor = getConceptColor(t, 'query');
  const workerColor = getConceptColor(t, 'attention');

  const active = COMPONENTS.find((c) => c.id === selected)!;

  function renderBox(c: (typeof COMPONENTS)[number]) {
    const color = c.side === 'control' ? controlColor : workerColor;
    const isSelected = selected === c.id;
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => setSelected(c.id)}
        style={{
          width: '100%',
          padding: '0.4rem 0.6rem',
          marginBottom: 6,
          borderRadius: 7,
          background: isSelected ? `${color}25` : `${color}12`,
          border: `${isSelected ? 2 : 1.5}px solid ${color}`,
          fontSize: 10.5,
          fontWeight: 700,
          color,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {c.label}
      </button>
    );
  }

  return (
    <VisualizationContainer footer={active.detail}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, padding: '0.6rem', borderRadius: 10, border: `1.5px dashed ${controlColor}`, background: `${controlColor}08` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: controlColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Control Plane
          </div>
          {COMPONENTS.filter((c) => c.side === 'control').map(renderBox)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 16, color: t.textMuted }}>⇄</div>
        <div style={{ flex: 1, minWidth: 180, padding: '0.6rem', borderRadius: 10, border: `1.5px dashed ${workerColor}`, background: `${workerColor}08` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: workerColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Worker Node (×N)
          </div>
          {COMPONENTS.filter((c) => c.side === 'worker').map(renderBox)}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        Click a component. Real flow: kubectl apply → apiserver (auth + writes to etcd) → scheduler assigns a node → that node's kubelet starts the container via the runtime → kube-proxy updates routing.
      </div>
    </VisualizationContainer>
  );
}
