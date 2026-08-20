import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Drag request volume and watch raw-log storage grow linearly while
 * pre-aggregated metric storage stays roughly flat -- the concrete reason
 * metrics are cheap enough for high-frequency dashboards and logs aren't. */
export default function MetricsAggregationDiagram() {
  const t = useVizTokens();
  const [requestsPerSec, setRequestsPerSec] = useState(500);
  const logColor = getConceptColor(t, 'query');
  const metricColor = getConceptColor(t, 'attention');

  const logBytesPerSec = requestsPerSec * 400; // ~400 bytes per structured log line
  const metricBytesPerSec = 2000; // fixed: a handful of counters/histograms sampled per interval, regardless of request volume

  const maxBytes = 5000 * 400;
  const barH = (b: number) => Math.min(120, (b / maxBytes) * 120);

  return (
    <VisualizationContainer footer={`At ${requestsPerSec.toLocaleString()} req/s: raw logs ≈ ${(logBytesPerSec / 1000).toFixed(1)} KB/s (grows with traffic). Metrics ≈ ${(metricBytesPerSec / 1000).toFixed(1)} KB/s (roughly flat -- pre-aggregated into a fixed set of counters/histograms, not one record per request).`}>
      <Slider label={`Request volume: ${requestsPerSec.toLocaleString()}/sec`} min={10} max={5000} step={10} value={requestsPerSec} onChange={setRequestsPerSec} />
      <div style={{ display: 'flex', gap: 20, marginTop: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: barH(logBytesPerSec), background: logColor, opacity: 0.7, borderRadius: 6 }} />
          <div style={{ fontSize: 10.5, color: logColor, marginTop: 4, fontWeight: 700 }}>Raw logs</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: barH(metricBytesPerSec), background: metricColor, opacity: 0.7, borderRadius: 6 }} />
          <div style={{ fontSize: 10.5, color: metricColor, marginTop: 4, fontWeight: 700 }}>Metrics</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        This is exactly why alerting runs on metrics -- they stay cheap and fast to query at any traffic volume.
      </div>
    </VisualizationContainer>
  );
}
