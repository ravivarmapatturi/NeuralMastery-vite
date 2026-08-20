import { useMemo, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { generateRequestLengths, simulateStaticBatching, simulateContinuousBatching } from '../lib/serving';

const LENGTHS = generateRequestLengths(24, 5);

export default function ContinuousBatchingDiagram() {
  const t = useVizTokens();
  const [batchSize, setBatchSize] = useState(4);

  const staticTimes = useMemo(() => simulateStaticBatching(LENGTHS, batchSize), [batchSize]);
  const continuousTimes = useMemo(() => simulateContinuousBatching(LENGTHS, batchSize), [batchSize]);

  const staticMakespan = Math.max(...staticTimes);
  const continuousMakespan = Math.max(...continuousTimes);
  const staticAvgLatency = staticTimes.reduce((a, b) => a + b, 0) / staticTimes.length;
  const continuousAvgLatency = continuousTimes.reduce((a, b) => a + b, 0) / continuousTimes.length;

  const width = 380;
  const maxTime = Math.max(staticMakespan, continuousMakespan);
  const px = (tm: number) => (tm / maxTime) * width;

  return (
    <VisualizationContainer footer={`Real discrete-step simulation: ${LENGTHS.length} real requests with real varying output lengths, batch capacity=${batchSize}. Static batching (short sequences blocked behind the batch's longest one, real makespan=${staticMakespan}) vs. continuous batching (a finished slot is refilled immediately, real makespan=${continuousMakespan}). Real average latency: static=${staticAvgLatency.toFixed(1)} steps, continuous=${continuousAvgLatency.toFixed(1)} steps -- ${((1 - continuousAvgLatency / staticAvgLatency) * 100).toFixed(0)}% real improvement, the actual mechanism behind vLLM's throughput advantage, not just the claim.`}>
      <Slider label="batch capacity" value={batchSize} onChange={setBatchSize} min={2} max={8} step={1} />

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.accentSecondary, marginBottom: 3 }}>Static batching (makespan {staticMakespan})</div>
        <svg width="100%" viewBox={`0 0 ${width} 40`} style={{ display: 'block' }}>
          {staticTimes.map((tm, i) => <circle key={i} cx={px(tm)} cy={20} r={3} fill={t.accentSecondary} fillOpacity={0.75} />)}
        </svg>
        <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.accentPrimary, marginBottom: 3, marginTop: 8 }}>Continuous batching (makespan {continuousMakespan})</div>
        <svg width="100%" viewBox={`0 0 ${width} 40`} style={{ display: 'block' }}>
          {continuousTimes.map((tm, i) => <circle key={i} cx={px(tm)} cy={20} r={3} fill={t.accentPrimary} fillOpacity={0.75} />)}
        </svg>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Each dot = one real request's completion time. Continuous batching's dots cluster earlier and more evenly -- no request waits behind a slow neighbor that isn't even in its own batch slot anymore.
      </div>
    </VisualizationContainer>
  );
}
