import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** A token bucket, made concrete: each request consumes one token, tokens
 * refill on a timer, requests are rejected once the bucket is empty --
 * drag the incoming request rate and watch the bucket actually drain. */
export default function RateLimitingDiagram() {
  const t = useVizTokens();
  const [incomingRate, setIncomingRate] = useState(15);
  const limit = 10; // requests/sec allowed
  const color = getConceptColor(t, 'attention');
  const dangerColor = t.accentDanger;
  const overLimit = incomingRate > limit;
  const rejectedPct = overLimit ? Math.round(((incomingRate - limit) / incomingRate) * 100) : 0;

  const width = 560;
  const bucketH = 90;
  const fillPct = overLimit ? 0 : 1 - incomingRate / limit;

  return (
    <VisualizationContainer footer={overLimit ? `Incoming rate (${incomingRate}/s) exceeds the limit (${limit}/s) -- the bucket empties, roughly ${rejectedPct}% of requests get a 429 until the rate drops or tokens refill.` : `Incoming rate (${incomingRate}/s) is under the limit (${limit}/s) -- tokens refill faster than they're consumed, every request passes.`}>
      <Slider label={`Incoming request rate: ${incomingRate}/sec (limit: ${limit}/sec)`} min={1} max={25} step={1} value={incomingRate} onChange={setIncomingRate} />
      <svg width="100%" viewBox={`0 0 ${width} 120`} style={{ display: 'block', marginTop: 8 }}>
        <rect x={width / 2 - 40} y={10} width={80} height={bucketH} rx={8} fill="none" stroke={t.border} strokeWidth={2} />
        <rect x={width / 2 - 38} y={10 + bucketH * (1 - Math.max(0, fillPct)) - 2} width={76} height={bucketH * Math.max(0, fillPct)} fill={overLimit ? dangerColor : color} opacity={0.5} />
        <text x={width / 2} y={10 + bucketH + 20} textAnchor="middle" fontSize={9} fill={t.textMuted}>token bucket</text>
        <text x={40} y={50} fontSize={9} fill={t.textMuted}>requests →</text>
        <text x={width - 100} y={50} fontSize={9} fill={overLimit ? dangerColor : t.accentPrimary} fontWeight={700}>{overLimit ? '→ 429s' : '→ all pass'}</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: overLimit ? dangerColor : t.accentPrimary, fontWeight: 700, marginTop: 4 }}>
        {overLimit ? `Protecting the GPU behind this endpoint from being overwhelmed by one caller.` : 'Bucket stays full -- no throttling needed.'}
      </div>
    </VisualizationContainer>
  );
}
