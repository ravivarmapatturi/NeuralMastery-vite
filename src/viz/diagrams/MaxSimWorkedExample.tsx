import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader } from '../primitives';
import DiagramMatrix from './DiagramMatrix';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const QUERY_TOKENS = ['cat', 'sat', 'mat'];
const DOC_TOKENS = ['the', 'cat', 'was', 'on', 'mat'];
const DIM_LABELS = ['d1', 'd2', 'd3', 'd4'];

// Toy per-token embeddings, small enough to verify by hand. Each row is
// (loosely) one semantic axis so the story is visible in the raw numbers:
// d1~animal, d2~action/verb, d3~furniture/object, d4~function-word.
const Q = [
  [1, 0, 0, 0], // cat
  [0.2, 0.8, 0, 0], // sat -- mostly "action", a little "animal-agent"
  [0, 0, 1, 0], // mat
];
const D = [
  [0, 0, 0, 1], // the
  [1, 0, 0, 0], // cat
  [0, 1, 0, 0], // was
  [0, 0, 0, 1], // on
  [0, 0, 1, 0], // mat
];

// Real dot-product similarity, computed live -- not hardcoded.
const SIM = Q.map((qRow) => D.map((dRow) => qRow.reduce((sum, qv, i) => sum + qv * dRow[i], 0)));
const MAX_SIMS = SIM.map((row) => Math.max(...row));
const MAX_INDICES = SIM.map((row) => row.indexOf(Math.max(...row)));
const MAXSIM_SCORE = MAX_SIMS.reduce((a, b) => a + b, 0);

/**
 * Late-interaction (ColBERT-style) scoring, worked out with real numbers:
 * per-token query/doc embeddings, the full similarity matrix, and MaxSim --
 * for each query token, the single highest-similarity doc token, summed.
 * No pooling anywhere: every number here is an individual token embedding
 * or a real dot product between two of them.
 */
export default function MaxSimWorkedExample() {
  const t = useVizTokens();
  const queryColor = getConceptColor(t, 'query');
  const docColor = getConceptColor(t, 'key');
  const scoreColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="Every number above is a real dot product between two of the token embeddings on the left -- nothing pooled, nothing hardcoded. Notice 'sat' has no exact match in the document, yet still scores 0.8 against 'was' -- a semantic near-match a pure keyword/BM25 match would miss entirely, captured here because the comparison happens per token instead of after pooling into one vector each.">
      <VisualizationHeader eyebrow="Worked Example · MaxSim" title="Late-interaction scoring, computed for real" />

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: DIAGRAM_TYPE.label.size, fontWeight: 700, color: queryColor, marginBottom: 6 }}>
            Query tokens ({QUERY_TOKENS.length} × {DIM_LABELS.length})
          </div>
          <DiagramMatrix data={Q} concept="query" rowLabels={QUERY_TOKENS} colLabels={DIM_LABELS} cellSize={42} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: DIAGRAM_TYPE.label.size, fontWeight: 700, color: docColor, marginBottom: 6 }}>
            Doc tokens ({DOC_TOKENS.length} × {DIM_LABELS.length}) -- precomputed &amp; indexed
          </div>
          <DiagramMatrix data={D} concept="key" rowLabels={DOC_TOKENS} colLabels={DIM_LABELS} cellSize={42} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: DIAGRAM_TYPE.label.size, fontWeight: 700, color: scoreColor, marginBottom: 6 }}>
          Similarity matrix: every query token × every doc token
        </div>
        <DiagramMatrix data={SIM} concept="attention" rowLabels={QUERY_TOKENS} colLabels={DOC_TOKENS} cellSize={46} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: t.textMuted, fontWeight: 600 }}>Query token</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: t.textMuted, fontWeight: 600 }}>Best-matching doc token (argmax)</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: t.textMuted, fontWeight: 600 }}>MaxSim contribution</th>
            </tr>
          </thead>
          <tbody>
            {QUERY_TOKENS.map((qt, i) => (
              <tr key={qt} style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: queryColor }}>{qt}</td>
                <td style={{ padding: '6px 8px', color: docColor }}>{DOC_TOKENS[MAX_INDICES[i]]}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{MAX_SIMS[i].toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ padding: '8px 8px', fontWeight: 700, textAlign: 'right' }}>
                MaxSim(query, doc) = sum of contributions
              </td>
              <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: scoreColor, fontVariantNumeric: 'tabular-nums' }}>
                {MAXSIM_SCORE.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VisualizationContainer>
  );
}
