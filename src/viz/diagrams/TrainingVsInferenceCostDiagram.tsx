import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { Slider, VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Cumulative spend over a model's lifetime -- training happens once
 * (or periodically) while inference accrues on every request,
 * indefinitely. Click a point in the timeline to see which dominates
 * at that stage. */
export default function TrainingVsInferenceCostDiagram() {
  const t = useVizTokens();
  const [month, setMonth] = useState(6);
  const trainColor = getConceptColor(t, 'attention');
  const infColor = t.accentPrimary;
  const width = 400;
  const months = 12;

  const trainingCost = 400;
  const trainCumAt = (m: number) => (m >= 1 ? trainingCost : trainingCost * m);
  const inferenceCumAt = (m: number) => m * 55;

  const trainNow = trainCumAt(month);
  const infNow = inferenceCumAt(month);

  const points = (fn: (m: number) => number) =>
    Array.from({ length: months + 1 }).map((_, m) => {
      const x = 30 + (m / months) * (width - 60);
      const y = 100 - (fn(m) / 700) * 90;
      return `${x},${y}`;
    }).join(' ');

  return (
    <VisualizationContainer footer={month <= 1 ? 'Early on, the one-time training spend dominates cumulative cost.' : `By month ${month}, cumulative inference spend ($${infNow}) has ${infNow > trainNow ? 'overtaken' : 'nearly caught up to'} the one-time training cost ($${trainNow}) -- inference happens on every request, indefinitely.`}>
      <Slider label="Month" value={month} onChange={setMonth} min={0} max={months} step={1} />
      <svg width="100%" viewBox={`0 0 ${width} 110`} style={{ display: 'block' }}>
        <polyline points={points(trainCumAt)} fill="none" stroke={trainColor} strokeWidth={2} opacity={0.85} />
        <polyline points={points(inferenceCumAt)} fill="none" stroke={infColor} strokeWidth={2} opacity={0.85} />
        <line x1={30 + (month / months) * (width - 60)} y1={5} x2={30 + (month / months) * (width - 60)} y2={100} stroke={t.textMuted} strokeWidth={1} strokeDasharray="3,3" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: DIAGRAM_TYPE.caption.size }}>
        <span style={{ color: trainColor }}>● training (cumulative)</span>
        <span style={{ color: infColor }}>● inference (cumulative)</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 9, color: t.textMuted, marginTop: 2 }}>month {month}</div>
    </VisualizationContainer>
  );
}
