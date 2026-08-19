import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

/** A Deployment declares "3 replicas should exist" -- kill one and watch
 * the controller notice the gap between desired and actual state, then
 * replace it. Click a Pod to simulate a crash. */
export default function ReconciliationLoopDiagram() {
  const t = useVizTokens();
  const [pods, setPods] = useState([true, true, true]);
  const [reconciling, setReconciling] = useState(false);
  const okColor = t.accentPrimary;
  const crashColor = t.accentDanger;

  function crashPod(i: number) {
    if (!pods[i]) return;
    const next = [...pods];
    next[i] = false;
    setPods(next);
    setReconciling(true);
    setTimeout(() => {
      setPods((p) => p.map(() => true));
      setReconciling(false);
    }, 1400);
  }

  return (
    <VisualizationContainer footer={reconciling ? 'Controller detects actual state (2/3 running) doesn\'t match desired state (3/3) -- scheduling a replacement now.' : 'Desired state: 3/3 replicas running. Click a Pod to simulate a crash.'}>
      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8 }}>Deployment desired state: <strong style={{ color: t.textPrimary }}>replicas: 3</strong></div>
      <div style={{ display: 'flex', gap: 10 }}>
        {pods.map((up, i) => (
          <div
            key={i}
            onClick={() => crashPod(i)}
            style={{ cursor: up ? 'pointer' : 'default', flex: 1, padding: '0.9rem', borderRadius: 9, textAlign: 'center', background: up ? `${okColor}18` : `${crashColor}18`, border: `2px solid ${up ? okColor : crashColor}` }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: up ? okColor : crashColor }}>Pod {i + 1}</div>
            <div style={{ fontSize: 9, color: t.textMuted, marginTop: 3 }}>{up ? 'Running' : 'Crashed'}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        This loop runs continuously, not just on crash -- it's the same mechanism behind rolling updates and scaling.
      </div>
    </VisualizationContainer>
  );
}
