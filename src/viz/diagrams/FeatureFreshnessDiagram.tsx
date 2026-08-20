import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Drag staleness and watch a real-time feature actually stop meaning
 * what its name claims. */
export default function FeatureFreshnessDiagram() {
  const t = useVizTokens();
  const [staleMin, setStaleMin] = useState(3);
  const okColor = t.accentPrimary;
  const badColor = t.accentDanger;
  const color = getConceptColor(t, 'attention');
  const isStale = staleMin > 5;

  return (
    <VisualizationContainer footer={isStale ? `"user's last-hour click count" is ${staleMin} minutes old -- for a fraud-detection model reacting to what a user just did, this is functionally the same as not having the feature at all.` : `"user's last-hour click count" is ${staleMin} minutes old -- fresh enough to reflect what actually just happened.`}>
      <Slider label={`Feature age: ${staleMin} min`} min={0} max={20} step={1} value={staleMin} onChange={setStaleMin} />
      <div style={{ marginTop: 10, padding: '0.7rem', borderRadius: 9, background: isStale ? `${badColor}15` : `${okColor}15`, border: `1.5px solid ${isStale ? badColor : okColor}`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: isStale ? badColor : okColor }}>{isStale ? '⚠ stale -- defeats the point of real-time' : '✓ fresh'}</div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        <span style={{ color }}>Freshness requirements are use-case specific</span> -- a fraud model needs seconds, a weekly-refresh recommendation feature can tolerate hours.
      </div>
    </VisualizationContainer>
  );
}
