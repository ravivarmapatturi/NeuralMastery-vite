import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Drag observed CPU load and watch HPA actually add/remove replicas to
 * keep average utilization near the target. */
export default function HpaAutoscalingDiagram() {
  const t = useVizTokens();
  const [loadPct, setLoadPct] = useState(180);
  const color = getConceptColor(t, 'attention');
  const targetUtilPct = 60;
  const minReplicas = 2;
  const maxReplicas = 10;

  const desiredReplicas = Math.min(maxReplicas, Math.max(minReplicas, Math.ceil(loadPct / targetUtilPct)));

  return (
    <VisualizationContainer footer={`Target CPU utilization: ${targetUtilPct}%. Current load: ${loadPct}% (of one replica's capacity). HPA scales to ${desiredReplicas} replicas to bring average utilization back near target.`}>
      <Slider label={`Observed load: ${loadPct}%`} min={20} max={800} step={20} value={loadPct} onChange={setLoadPct} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {Array.from({ length: maxReplicas }, (_, i) => (
          <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: i < desiredReplicas ? `${color}30` : 'none', border: `1.5px solid ${i < desiredReplicas ? color : t.border}`, opacity: i < desiredReplicas ? 1 : 0.3 }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color, fontWeight: 700, marginTop: 8 }}>
        {desiredReplicas} replicas ({minReplicas}-{maxReplicas} allowed range)
      </div>
    </VisualizationContainer>
  );
}
