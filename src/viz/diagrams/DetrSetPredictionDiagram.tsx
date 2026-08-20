import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** A fixed set of learned object queries, each attending over the
 * image features and directly outputting one object -- no anchors,
 * no non-max suppression. */
export default function DetrSetPredictionDiagram() {
  const t = useVizTokens();
  const color = getConceptColor(t, 'attention');
  const QUERIES = ['query 1 → box + class', 'query 2 → box + class', 'query 3 → "no object"', 'query 4 → box + class'];

  return (
    <VisualizationContainer footer="Every prior detector needed hand-designed components (anchor boxes, non-max suppression to dedupe overlapping predictions) -- DETR eliminates both by directly predicting a fixed-size SET of objects, some of which the model learns to mark as empty.">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ padding: '0.6rem 0.5rem', borderRadius: 7, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, fontSize: 8.5, textAlign: 'center' }}>Image features<br />(encoder output)</div>
        <span style={{ color: t.textMuted, fontSize: 14 }}>→</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {QUERIES.map((q) => (
            <div key={q} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, background: q.includes('no object') ? t.surfaceAlt : `${color}15`, border: `1px solid ${q.includes('no object') ? t.border : color}40`, fontSize: 8, color: q.includes('no object') ? t.textMuted : t.textSecondary }}>{q}</div>
          ))}
        </div>
      </div>
    </VisualizationContainer>
  );
}
