import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Checkpoint frequency traded against two costs that move in opposite
 * directions -- drag the interval and watch both curves actually move. */
export default function CheckpointingTradeoffDiagram() {
  const t = useVizTokens();
  const [intervalMin, setIntervalMin] = useState(30);
  const lostColor = t.accentDanger;
  const overheadColor = getConceptColor(t, 'attention');

  // Toy model: expected lost work on failure ~ half the interval (failure
  // lands uniformly at random within it); overhead ~ fixed checkpoint cost
  // amortized over the interval -- illustrates the SHAPE of the tradeoff.
  const checkpointCostMin = 2;
  const expectedLostWorkMin = intervalMin / 2;
  const overheadPct = (checkpointCostMin / intervalMin) * 100;

  const width = 560;
  const height = 140;
  const chartTop = 15;
  const chartBottom = 120;
  const maxInterval = 120;
  const xFor = (v: number) => 40 + (v / maxInterval) * (width - 70);
  const maxY = 60;
  const yForLost = (v: number) => chartBottom - (Math.min(v, maxY) / maxY) * (chartBottom - chartTop);
  const yForOverhead = (pct: number) => chartBottom - (Math.min(pct, maxY) / maxY) * (chartBottom - chartTop);

  return (
    <VisualizationContainer footer={`At a ${intervalMin}-min interval: expected lost work on failure ≈ ${expectedLostWorkMin.toFixed(0)} min, checkpoint I/O overhead ≈ ${overheadPct.toFixed(1)}% of training time. Shorter interval = less lost work, more overhead; longer interval = the reverse.`}>
      <Slider label={`Checkpoint interval: ${intervalMin} min`} min={2} max={maxInterval} step={2} value={intervalMin} onChange={setIntervalMin} />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        <line x1={40} y1={chartBottom} x2={width - 20} y2={chartBottom} stroke={t.border} strokeWidth={1} />
        <line x1={40} y1={chartTop} x2={40} y2={chartBottom} stroke={t.border} strokeWidth={1} />
        <path d={Array.from({ length: maxInterval }, (_, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i + 1)},${yForLost((i + 1) / 2)}`).join(' ')} fill="none" stroke={lostColor} strokeWidth={2.5} />
        <path d={Array.from({ length: maxInterval }, (_, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i + 1)},${yForOverhead((checkpointCostMin / (i + 1)) * 100)}`).join(' ')} fill="none" stroke={overheadColor} strokeWidth={2.5} />
        <circle cx={xFor(intervalMin)} cy={yForLost(expectedLostWorkMin)} r={4.5} fill={lostColor} />
        <circle cx={xFor(intervalMin)} cy={yForOverhead(overheadPct)} r={4.5} fill={overheadColor} />
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: DIAGRAM_TYPE.caption.size }}>
        <span style={{ color: lostColor }}>● expected lost work on failure</span>
        <span style={{ color: overheadColor }}>● checkpoint I/O overhead</span>
      </div>
    </VisualizationContainer>
  );
}
