import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, VisualizationStepController, useStepController } from '../primitives';
import DiagramMatrix from './DiagramMatrix';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';
import {
  computeMaxSim,
  MAXSIM_EXAMPLE_DIM_LABELS as DIM_LABELS,
  MAXSIM_EXAMPLE_DOC_TOKENS as DOC_TOKENS,
  MAXSIM_EXAMPLE_D as D,
  MAXSIM_EXAMPLE_QUERY_TOKENS as QUERY_TOKENS,
  MAXSIM_EXAMPLE_Q as Q,
} from '../lib/maxsim';

// Real dot-product similarity, computed live -- not hardcoded. See
// src/viz/lib/maxsim.ts for the computation and its unit tests.
const { similarityMatrix: SIM, maxSims: MAX_SIMS, maxIndices: MAX_INDICES, score: MAXSIM_SCORE } = computeMaxSim(Q, D);

const SAT_INDEX = QUERY_TOKENS.indexOf('sat');

const STEP_LABELS = ['What goes in', 'Compare every pair', 'Keep the best match', 'Sum → MaxSim score'];
const STEP_CAPTIONS = [
  'Every query token and every document token keeps its OWN embedding -- nothing pooled into one vector per side, unlike a bi-encoder.',
  "Every query token's embedding is compared against every document token's embedding -- a real dot product for each of the 3×5=15 pairs, not just the pairs that share a word.",
  "For each query token, only its single best-matching document token counts (the row's highest value) -- everything else in that row is thrown away. Watch \"sat\": it has no exact match anywhere in the document, yet its best match is \"was\" (0.80) -- a real semantic near-match a keyword search would miss entirely, surfaced because the comparison happened per token instead of after pooling.",
  'Add up those three best-matches -- one per query token -- and that sum is the MaxSim(query, doc) score used to rank this document.',
];

/**
 * Late-interaction (ColBERT-style) scoring, worked out with real numbers,
 * revealed one step at a time: what goes in (per-token embeddings) -> what
 * happens (every pair compared) -> what's kept (only the best match per
 * query token survives) -> why it matters (those best-matches sum to the
 * ranking score). Every number is a real dot product between two of the
 * token embeddings on the left -- nothing pooled, nothing hardcoded.
 */
export default function MaxSimWorkedExample() {
  const t = useVizTokens();
  const queryColor = getConceptColor(t, 'query');
  const docColor = getConceptColor(t, 'key');
  const scoreColor = getConceptColor(t, 'attention');
  const controller = useStepController(STEP_LABELS.length, 1400);
  const step = controller.step;

  return (
    <VisualizationContainer footer={STEP_CAPTIONS[step]}>
      <VisualizationHeader eyebrow={`Worked Example · MaxSim · Step ${step + 1}: ${STEP_LABELS[step]}`} title="Late-interaction scoring, computed for real" />

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: DIAGRAM_TYPE.label.size, fontWeight: 700, color: queryColor, marginBottom: 6 }}>
            Query tokens ({QUERY_TOKENS.length} × {DIM_LABELS.length})
          </div>
          <DiagramMatrix
            data={Q}
            concept="query"
            rowLabels={QUERY_TOKENS}
            colLabels={DIM_LABELS}
            cellSize={42}
            highlightRow={step >= 2 ? SAT_INDEX : null}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: DIAGRAM_TYPE.label.size, fontWeight: 700, color: docColor, marginBottom: 6 }}>
            Doc tokens ({DOC_TOKENS.length} × {DIM_LABELS.length}) -- precomputed &amp; indexed
          </div>
          <DiagramMatrix
            data={D}
            concept="key"
            rowLabels={DOC_TOKENS}
            colLabels={DIM_LABELS}
            cellSize={42}
            highlightRow={step >= 2 ? MAX_INDICES[SAT_INDEX] : null}
          />
        </div>
      </div>

      {step >= 1 && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: DIAGRAM_TYPE.label.size, fontWeight: 700, color: scoreColor, marginBottom: 6 }}>
            Similarity matrix: every query token × every doc token
          </div>
          <DiagramMatrix
            data={SIM}
            concept="attention"
            rowLabels={QUERY_TOKENS}
            colLabels={DOC_TOKENS}
            cellSize={46}
            highlightRow={step >= 2 ? SAT_INDEX : null}
          />
        </div>
      )}

      {step >= 2 && (
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
                <tr
                  key={qt}
                  style={{
                    borderBottom: `1px solid ${t.border}`,
                    background: i === SAT_INDEX ? `${scoreColor}14` : 'transparent',
                  }}
                >
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: queryColor }}>{qt}</td>
                  <td style={{ padding: '6px 8px', color: docColor }}>{DOC_TOKENS[MAX_INDICES[i]]}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{MAX_SIMS[i].toFixed(2)}</td>
                </tr>
              ))}
              {step >= 3 && (
                <tr>
                  <td colSpan={2} style={{ padding: '8px 8px', fontWeight: 700, textAlign: 'right' }}>
                    MaxSim(query, doc) = sum of contributions
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: scoreColor, fontVariantNumeric: 'tabular-nums' }}>
                    {MAXSIM_SCORE.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <VisualizationStepController controller={controller} totalSteps={STEP_LABELS.length} stepLabel={(s) => STEP_LABELS[s]} />
    </VisualizationContainer>
  );
}
