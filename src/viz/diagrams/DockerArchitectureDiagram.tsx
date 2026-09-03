import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const STAGES = [
  { id: 'cli', label: 'docker CLI', desc: 'you run "docker run ..."', detail: 'The client -- sends your command to the daemon over the Docker REST API (a Unix socket locally, or a network interface for a remote daemon).' },
  { id: 'dockerd', label: 'dockerd', desc: 'the Docker daemon', detail: 'Listens for API requests and manages Docker objects (images, containers, networks, volumes) -- but delegates the actual container lifecycle work to containerd.' },
  { id: 'containerd', label: 'containerd', desc: 'container lifecycle manager', detail: 'A separate daemon (Docker is one of many adopters) that handles image pull/storage, container execution, and supervision -- the layer between dockerd\'s API surface and the low-level runtime.' },
  { id: 'runc', label: 'runc', desc: 'the OCI runtime', detail: 'Does the actual kernel-level work of creating a container: sets up namespaces and cgroups, then execs your process inside them. Implements the OCI Runtime Spec -- swap runc for another OCI-compliant runtime and the container still runs the same way.' },
  { id: 'kernel', label: 'Linux kernel', desc: 'namespaces + cgroups', detail: 'Namespaces isolate what a process can SEE (its own PIDs, network stack, filesystem mounts); cgroups limit what it can USE (CPU, memory, I/O). This is the real mechanism -- there is no separate "container" feature in the kernel, just these two primitives combined.' },
];

/** The real chain a `docker run` actually goes through, click through each
 * stage for what it does -- not a black box, five real components with
 * one job each. */
export default function DockerArchitectureDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState(0);
  const color = getConceptColor(t, 'attention');
  const registryColor = getConceptColor(t, 'query');

  return (
    <VisualizationContainer footer={STAGES[selected].detail}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ padding: '0.4rem 0.9rem', borderRadius: 8, background: `${registryColor}14`, border: `1.5px dashed ${registryColor}`, fontSize: 10, color: registryColor, fontWeight: 700, marginBottom: 4 }}>
          Registry (image pull/push, via containerd)
        </div>
        {STAGES.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <button
              type="button"
              onClick={() => setSelected(i)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.55rem 1.2rem',
                borderRadius: 10,
                background: selected === i ? `${color}22` : `${color}10`,
                border: `${selected === i ? 2.5 : 1.5}px solid ${color}`,
                cursor: 'pointer',
                minWidth: 220,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{s.label}</span>
              <span style={{ fontSize: 9.5, color: t.textMuted }}>{s.desc}</span>
            </button>
            {i < STAGES.length - 1 && <div style={{ width: 2, height: 16, background: t.textMuted }} />}
          </div>
        ))}
        <div style={{ width: 2, height: 16, background: t.textMuted }} />
        <div style={{ padding: '0.5rem 1rem', borderRadius: 8, background: `${color}30`, border: `2px solid ${color}`, fontSize: 11, fontWeight: 700, color }}>
          Running container
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        Click a stage. Same chain (containerd + runc) also runs under Kubernetes' kubelet via the Container Runtime Interface -- see Kubernetes below.
      </div>
    </VisualizationContainer>
  );
}
