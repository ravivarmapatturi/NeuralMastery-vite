import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const DENSE_RANKING = ['Doc B', 'Doc A', 'Doc D', 'Doc C'];
const SPARSE_RANKING = ['Doc C', 'Doc B', 'Doc A', 'Doc D'];
const K = 60; // standard RRF constant

/** Reciprocal Rank Fusion combines two ranked lists using each result's
 * POSITION, not its raw (differently-scaled) score -- 1/(k+rank) per list,
 * summed. Hover a doc to see its two positions add up to its fused rank. */
export default function HybridSearchFusionDiagram() {
  const t = useVizTokens();
  const [hovered, setHovered] = useState<string | null>(null);
  const denseColor = getConceptColor(t, 'query');
  const sparseColor = t.accentWarn;
  const fusedColor = getConceptColor(t, 'attention');

  const rrfScore = (doc: string) => {
    const dRank = DENSE_RANKING.indexOf(doc) + 1;
    const sRank = SPARSE_RANKING.indexOf(doc) + 1;
    return 1 / (K + dRank) + 1 / (K + sRank);
  };
  const docs = ['Doc A', 'Doc B', 'Doc C', 'Doc D'];
  const fused = [...docs].sort((a, b) => rrfScore(b) - rrfScore(a));

  function Column({ title, ranking, color }: { title: string; ranking: string[]; color: string }) {
    return (
      <div style={{ flex: 1 }}>
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>{title}</div>
        {ranking.map((d, i) => (
          <div
            key={d}
            onMouseEnter={() => setHovered(d)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '5px 8px', marginBottom: 3, borderRadius: 5, fontSize: 11, fontFamily: 'monospace', textAlign: 'center', cursor: 'pointer',
              background: hovered === d ? `${color}30` : t.surfaceAlt, border: `1.5px solid ${hovered === d ? color : t.border}`, color: t.textSecondary,
            }}
          >
            #{i + 1} {d}
          </div>
        ))}
      </div>
    );
  }

  return (
    <VisualizationContainer footer="Hover a document -- its dense rank and sparse rank each contribute 1/(k+rank) to its fused score. A doc ranked highly by BOTH lists rises to the top even if neither single ranking put it #1.">
      <div style={{ display: 'flex', gap: 16 }}>
        <Column title="Dense ranking" ranking={DENSE_RANKING} color={denseColor} />
        <Column title="Sparse ranking" ranking={SPARSE_RANKING} color={sparseColor} />
        <Column title="Fused (RRF)" ranking={fused} color={fusedColor} />
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 10 }}>
        {hovered
          ? `${hovered}: 1/(${K}+${DENSE_RANKING.indexOf(hovered) + 1}) + 1/(${K}+${SPARSE_RANKING.indexOf(hovered) + 1}) = ${rrfScore(hovered).toFixed(4)}`
          : 'RRF score = 1/(k+rank_dense) + 1/(k+rank_sparse), k=60 (standard default)'}
      </div>
    </VisualizationContainer>
  );
}
