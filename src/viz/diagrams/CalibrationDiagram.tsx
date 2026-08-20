import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { generateUncalibratedPredictions, reliabilityBins } from '../lib/modelEvaluation';

export default function CalibrationDiagram() {
  const t = useVizTokens();

  const preds = useMemo(() => generateUncalibratedPredictions(3, 600), []);
  const bins = useMemo(() => reliabilityBins(preds), [preds]);

  const width = 260, height = 260;
  const px = (v: number) => v * width;
  const py = (v: number) => height - v * height;

  return (
    <VisualizationContainer footer="Real 600 predictions, binned by predicted probability, real empirical accuracy computed per bin. The model says '90% confident' but the real observed accuracy at that confidence level is far lower -- systematically overconfident, exactly what calibration is built to catch and correct (via, e.g., temperature scaling or Platt scaling).">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: 260, margin: '0 auto' }}>
        <line x1={0} y1={height} x2={width} y2={0} stroke={t.textMuted} strokeWidth={1.5} strokeDasharray="4 3" />
        <polyline
          points={bins.filter((b) => b.avgPredicted !== null).map((b) => `${px(b.avgPredicted!)},${py(b.avgActual!)}`).join(' ')}
          fill="none" stroke={t.accentDanger} strokeWidth={2.5}
        />
        {bins.filter((b) => b.avgPredicted !== null).map((b, i) => (
          <circle key={i} cx={px(b.avgPredicted!)} cy={py(b.avgActual!)} r={3 + Math.min(5, b.count / 30)} fill={t.accentDanger} fillOpacity={0.8} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        <span><span style={{ color: t.textMuted }}>┈</span> perfect calibration</span>
        <span><span style={{ color: t.accentDanger }}>⬤</span> real observed reliability (dot size = bin count)</span>
      </div>
    </VisualizationContainer>
  );
}
