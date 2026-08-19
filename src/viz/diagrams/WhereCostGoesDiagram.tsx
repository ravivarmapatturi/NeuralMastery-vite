import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

/** Training is a one-time cost; inference is paid per request, forever.
 * Drag daily request volume and watch cumulative inference cost overtake
 * a large fixed training cost -- concretely, not just asserted. */
export default function WhereCostGoesDiagram() {
  const t = useVizTokens();
  const [logRequests, setLogRequests] = useState(6); // per day
  const trainingCost = 5_000_000; // one-time, illustrative
  const costPerRequest = 0.0005; // illustrative
  const requestsPerDay = Math.pow(10, logRequests);
  const daysToBreakeven = trainingCost / (requestsPerDay * costPerRequest);
  const trainColor = t.accentSecondary;
  const inferColor = t.accentWarn;

  const width = 520;
  const height = 170;
  const left = 50, right = width - 20, top = 15, bottom = 130;
  const maxDays = Math.max(daysToBreakeven * 1.6, 30);
  const maxCost = trainingCost * 1.8;
  const xFor = (d: number) => left + (d / maxDays) * (right - left);
  const yFor = (c: number) => bottom - (Math.min(c, maxCost) / maxCost) * (bottom - top);
  const inferPath = Array.from({ length: 40 }, (_, i) => {
    const d = (i / 39) * maxDays;
    const c = d * requestsPerDay * costPerRequest;
    return `${i === 0 ? 'M' : 'L'} ${xFor(d)},${yFor(c)}`;
  }).join(' ');

  return (
    <VisualizationContainer footer="At high enough request volume, cumulative inference cost overtakes the one-time training cost within weeks, not years -- which is exactly why Evaluation & Serving invests so heavily in batching, speculative decoding, and Paged Attention: shaving a few percent off per-request cost compounds across every request, forever.">
      <Slider label={`~${requestsPerDay.toExponential(1)} requests/day`} min={2} max={9} step={0.1} value={logRequests} onChange={setLogRequests} />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 6 }}>
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={t.border} strokeWidth={1} />
        <line x1={left} y1={top} x2={left} y2={bottom} stroke={t.border} strokeWidth={1} />
        <line x1={left} y1={yFor(trainingCost)} x2={right} y2={yFor(trainingCost)} stroke={trainColor} strokeWidth={2} strokeDasharray="4 3" />
        <text x={left + 4} y={yFor(trainingCost) - 6} fontSize={9} fill={trainColor}>one-time training cost</text>
        <path d={inferPath} fill="none" stroke={inferColor} strokeWidth={2.5} />
        {daysToBreakeven < maxDays && (
          <>
            <circle cx={xFor(daysToBreakeven)} cy={yFor(trainingCost)} r={5} fill={inferColor} />
            <line x1={xFor(daysToBreakeven)} y1={yFor(trainingCost)} x2={xFor(daysToBreakeven)} y2={bottom} stroke={t.textMuted} strokeWidth={1} strokeDasharray="2 2" />
          </>
        )}
        <text x={right} y={bottom + 16} textAnchor="end" fontSize={9} fill={t.textMuted}>days since launch →</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: inferColor, fontWeight: 700, marginTop: 4 }}>
        {daysToBreakeven < maxDays ? `cumulative inference cost overtakes training cost after ~${daysToBreakeven.toFixed(0)} days` : 'at this volume, training cost still dominates over the window shown'}
      </div>
    </VisualizationContainer>
  );
}
