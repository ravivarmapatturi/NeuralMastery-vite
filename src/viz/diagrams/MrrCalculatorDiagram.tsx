import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const SLOTS = [1, 2, 3, 4, 5];

/** Click which ranked slot holds the first genuinely relevant result
 * -- MRR = 1/rank rewards it showing up early, not just somewhere in
 * the top-K the way plain Recall@K would. */
export default function MrrCalculatorDiagram() {
  const t = useVizTokens();
  const [rank, setRank] = useState(3);
  const color = getConceptColor(t, 'attention');
  const okColor = t.accentPrimary;
  const rr = 1 / rank;

  return (
    <VisualizationContainer footer={`Reciprocal rank = 1/${rank} = ${rr.toFixed(2)} -- the first relevant result landing at rank 1 scores 1.0; at rank 5 it scores only 0.20, even though Recall@5 would count both as "found."`}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {SLOTS.map((s) => {
          const isRelevant = s === rank;
          const isBefore = s < rank;
          return (
            <div key={s} onClick={() => setRank(s)} onMouseEnter={() => setRank(s)} style={{ cursor: 'pointer', flex: 1, textAlign: 'center' }}>
              <div style={{ height: 44, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRelevant ? `${okColor}22` : t.surfaceAlt, border: `1.5px solid ${isRelevant ? okColor : isBefore ? t.textMuted : t.border}`, opacity: isBefore ? 0.5 : 1 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: isRelevant ? okColor : t.textMuted }}>{isRelevant ? '✓' : isBefore ? '✗' : ''}</span>
              </div>
              <div style={{ fontSize: 9, color: t.textMuted, marginTop: 3 }}>rank {s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size + 1, fontWeight: 700, color }}>
        MRR (for this query) = 1 / {rank} = {rr.toFixed(2)}
      </div>
    </VisualizationContainer>
  );
}
