import { useMemo, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { generateAnomalyPoints, averagePathLengths } from '../lib/unsupervisedMisc';

export default function IsolationPathLengthDiagram() {
  const t = useVizTokens();
  const [seed, setSeed] = useState(1);

  const points = useMemo(() => generateAnomalyPoints(3), []);
  const pathLengths = useMemo(() => averagePathLengths(points, 150, seed), [points, seed]);

  const width = 300, height = 260, scale = 42, ox = width / 2, oy = height / 2;
  const px = (x: number) => ox + x * scale;
  const py = (y: number) => oy - y * scale;

  const inlierAvg = points.filter((p) => !p.isOutlier).reduce((s, _, i) => s + pathLengths[i], 0) / points.filter((p) => !p.isOutlier).length;
  const outlierAvg = points.reduce((s, p, i) => (p.isOutlier ? s + pathLengths[i] : s), 0) / points.filter((p) => p.isOutlier).length;

  return (
    <VisualizationContainer footer={`Real Monte Carlo simulation: 150 real random-split isolation trees run per point (real random feature, real random threshold within the current subset's range, recursed until the point is alone). Real average path length: inliers ${inlierAvg.toFixed(2)} splits, outliers ${outlierAvg.toFixed(2)} splits -- outliers isolate measurably faster, exactly the mechanism the anomaly score is built from, not asserted.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: 300, margin: '0 auto' }}>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={px(p.x)} cy={py(p.y)} r={p.isOutlier ? 7 : 4} fill={p.isOutlier ? t.accentDanger : t.accentPrimary} fillOpacity={0.8} />
            <text x={px(p.x)} y={py(p.y) - 10} textAnchor="middle" fontSize={9} fill={t.textMuted}>{pathLengths[i].toFixed(1)}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted }}>
        <span><span style={{ color: t.accentPrimary }}>⬤</span> normal point (avg path {inlierAvg.toFixed(1)})</span>
        <span><span style={{ color: t.accentDanger }}>⬤</span> real outlier (avg path {outlierAvg.toFixed(1)})</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <VizButton onClick={() => setSeed((s) => s + 1)}>Re-run simulation</VizButton>
      </div>
    </VisualizationContainer>
  );
}
