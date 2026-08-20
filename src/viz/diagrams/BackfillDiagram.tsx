import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** A bug fix in a transformation step means every past day needs
 * reprocessing -- drag the backfill range and watch the orchestrator
 * queue one run per date instead of a human re-triggering each by hand. */
export default function BackfillDiagram() {
  const t = useVizTokens();
  const [daysBack, setDaysBack] = useState(5);
  const color = getConceptColor(t, 'attention');
  const totalDays = 14;

  return (
    <VisualizationContainer footer={`Backfilling ${daysBack} past day(s) -- the orchestrator queues one full pipeline run per date, using each date's own historical inputs, without a human re-triggering each one by hand.`}>
      <Slider label={`Backfill range: last ${daysBack} days`} min={1} max={totalDays} step={1} value={daysBack} onChange={setDaysBack} />
      <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
        {Array.from({ length: totalDays }, (_, i) => {
          const dayIdx = totalDays - 1 - i; // 0 = today, increasing = further back
          const inRange = dayIdx < daysBack;
          return (
            <div key={i} style={{ flex: 1, height: 28, borderRadius: 4, background: inRange ? `${color}30` : t.surfaceAlt, border: `1.25px solid ${inRange ? color : t.border}` }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: t.textMuted, marginTop: 4 }}>
        <span>{totalDays} days ago</span>
        <span>today</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color, fontWeight: 700, marginTop: 8 }}>
        {daysBack} pipeline runs queued
      </div>
    </VisualizationContainer>
  );
}
