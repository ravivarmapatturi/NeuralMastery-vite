import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

const STEP_LABELS = ['What goes in', 'What happens', "What's lost / gained", 'Why it matters'];
const CAPTIONS = [
  'A query, and a huge corpus of candidate documents -- far too many to run an expensive model against every single one.',
  'Stage 1: a bi-encoder embeds query and each document SEPARATELY (document embeddings precomputed ahead of time) and ranks by cosine similarity, narrowing millions down to a shortlist. Stage 2: a cross-encoder takes over on just that shortlist.',
  "Bi-encoder stage: LOST the ability to compare query and document directly (each is embedded alone), GAINED speed -- fast enough for millions. Cross-encoder stage: GAINS full query-document attention on the survivors, at the cost of nothing being precomputable.",
  'This is exactly why production systems run both, in this order, not one alone: a bad reranker over a good shortlist still finds something reasonable; a great reranker over a bad shortlist never even sees the right answer.',
];

/** The two-stage retrieval funnel, revealed as a 4-step story: what goes in
 * (a query against a huge corpus) -> what happens (bi-encoder narrows,
 * cross-encoder refines) -> what's lost/gained at each stage -> why
 * production systems chain them in this order. Click a stage to see its
 * own explanation at any step. */
export default function BiEncoderVsCrossEncoderDiagram() {
  const t = useVizTokens();
  const controller = useStepController(STEP_LABELS.length, 1600);
  const reveal = controller.step;
  const biColor = getConceptColor(t, 'query');
  const crossColor = getConceptColor(t, 'attention');

  const width = 580;
  const height = 220;

  return (
    <VisualizationContainer footer={`Step ${reveal + 1} of ${STEP_LABELS.length} · ${STEP_LABELS[reveal]} — ${CAPTIONS[reveal]}`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="bce-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>

        {/* Bi-encoder stage */}
        <g opacity={reveal >= 1 ? 1 : 0.45}>
          <text x={20} y={20} fontSize={11} fontWeight={700} fill={biColor}>Bi-encoder (millions → dozens)</text>
          <rect x={20} y={30} width={90} height={34} rx={6} fill={`${biColor}18`} stroke={biColor} strokeWidth={1.5} />
          <text x={65} y={51} textAnchor="middle" fontSize={10} fill={biColor}>query</text>
          <rect x={20} y={74} width={90} height={34} rx={6} fill={`${biColor}18`} stroke={biColor} strokeWidth={1.5} />
          <text x={65} y={95} textAnchor="middle" fontSize={10} fill={biColor}>doc (precomputed)</text>
          {reveal >= 1 && (
            <>
              <line x1={110} y1={47} x2={160} y2={47} stroke={biColor} strokeWidth={1.5} markerEnd="url(#bce-arrow)" />
              <line x1={110} y1={91} x2={160} y2={91} stroke={biColor} strokeWidth={1.5} markerEnd="url(#bce-arrow)" />
              <circle cx={180} cy={47} r={14} fill={t.surface} stroke={biColor} strokeWidth={2} />
              <text x={180} y={51} textAnchor="middle" fontSize={9} fill={biColor}>vec</text>
              <circle cx={180} cy={91} r={14} fill={t.surface} stroke={biColor} strokeWidth={2} />
              <text x={180} y={95} textAnchor="middle" fontSize={9} fill={biColor}>vec</text>
              <path d="M 180,60 L 180,78" stroke={biColor} strokeWidth={1.5} strokeDasharray="2 2" />
            </>
          )}
          {reveal >= 2 && (
            <text x={180} y={130} textAnchor="middle" fontSize={9} fill={t.textMuted}>fast, but query never sees doc directly</text>
          )}
        </g>

        {/* Cross-encoder stage */}
        <g opacity={reveal >= 2 ? 1 : 0.45}>
          <text x={320} y={20} fontSize={11} fontWeight={700} fill={crossColor}>Cross-encoder (dozens → ranked)</text>
          <rect x={320} y={30} width={110} height={34} rx={6} fill={`${crossColor}18`} stroke={crossColor} strokeWidth={1.5} />
          <text x={375} y={51} textAnchor="middle" fontSize={9} fill={crossColor}>[query; doc]</text>
          {reveal >= 2 && (
            <>
              <line x1={430} y1={47} x2={470} y2={47} stroke={crossColor} strokeWidth={1.5} markerEnd="url(#bce-arrow)" />
              <rect x={470} y={30} width={90} height={34} rx={6} fill={`${crossColor}30`} stroke={crossColor} strokeWidth={1.5} />
              <text x={515} y={51} textAnchor="middle" fontSize={9} fill={crossColor}>joint attention</text>
            </>
          )}
          {reveal >= 2 && (
            <text x={320} y={100} fontSize={9} fill={t.textMuted}>full query-doc attention, but nothing here</text>
          )}
          {reveal >= 2 && (
            <text x={320} y={114} fontSize={9} fill={t.textMuted}>is precomputable -- too slow at full scale.</text>
          )}
        </g>

        {reveal >= 1 && (
          <>
            <line x1={220} y1={110} x2={300} y2={110} stroke={t.textMuted} strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#bce-arrow)" />
            <text x={260} y={102} textAnchor="middle" fontSize={8} fill={t.textMuted}>top ~50</text>
          </>
        )}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Same funnel shape as the two-tower / retrieve-then-rank pattern used across recommenders and learning-to-rank.
      </div>
      <VisualizationStepController controller={controller} totalSteps={STEP_LABELS.length} stepLabel={(s) => STEP_LABELS[s]} />
    </VisualizationContainer>
  );
}
