import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Mode = 'bi' | 'late' | 'cross';

const STEP_LABELS = ['What goes in', 'What happens', "What's lost / kept", 'Why it matters'];

/** All three retrieval/reranking architectures side by side, same visual
 * grammar, revealed as a 4-step story (what goes in -> what happens ->
 * what's lost/kept -> why it matters) so the shape difference between
 * pooling-away detail, keeping every token, and full joint attention
 * builds up instead of appearing all at once. Click any panel to focus it
 * at any step. */
export default function ThreeWayRetrievalArchitecturesDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('bi');
  const controller = useStepController(STEP_LABELS.length, 1600);
  const reveal = controller.step;
  const biColor = getConceptColor(t, 'query');
  const lateColor = getConceptColor(t, 'key');
  const crossColor = getConceptColor(t, 'attention');

  const width = 720;
  const height = 260;
  const panelW = 220;
  const gap = 30;
  const xs = [10, 10 + panelW + gap, 10 + 2 * (panelW + gap)];

  const whyItMatters: Record<Mode, string> = {
    bi: 'Because pooling happens before the query even exists, document vectors can be computed once and indexed -- this is the only one of the three fast enough to search millions of documents.',
    late: "Because document token vectors are precomputed too, this stays index-friendly like a bi-encoder -- but keeping every token means far more storage, and MaxSim still has to scan every stored token at query time.",
    cross: 'Because the score only exists once query and document are together, nothing here is precomputable -- accurate, but only practical against a small candidate set.',
  };
  const footers: Record<Mode, string[]> = {
    bi: [
      'Bi-encoder: a query and a document, each on its own -- nothing about one depends on the other yet.',
      'Each is fed through the model independently, producing token-level activations for each.',
      'Every token gets POOLED (averaged) down to ONE vector per side -- token-level detail is discarded here, before any comparison happens.',
      whyItMatters.bi,
    ],
    late: [
      'Late interaction: same starting point -- a query and a document, each with their own tokens.',
      'Each token (not the whole sequence) gets its own embedding -- nothing pooled yet on either side.',
      "Nothing is thrown away: every query token is compared against every document token, and only each query token's single BEST match is kept (MaxSim).",
      whyItMatters.late,
    ],
    cross: [
      'Cross-encoder: a query and ONE candidate document -- already narrowed down, not the full corpus.',
      'Query and document are concatenated and fed through the model TOGETHER, not separately.',
      'Every token can directly attend to every other token from both sequences at once -- full joint attention, nothing pooled or discarded.',
      whyItMatters.cross,
    ],
  };

  return (
    <VisualizationContainer footer={`Step ${reveal + 1} of ${STEP_LABELS.length} · ${STEP_LABELS[reveal]} — ${footers[mode][reveal]}`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="3way-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>

        {/* Bi-encoder panel */}
        <g
          onClick={() => setMode('bi')}
          onMouseEnter={() => setMode('bi')}
          style={{ cursor: 'pointer' }}
          opacity={mode === 'bi' ? 1 : 0.35}
        >
          <text x={xs[0]} y={16} fontSize={11} fontWeight={700} fill={biColor}>Bi-Encoder</text>
          <rect x={xs[0]} y={26} width={90} height={26} rx={5} fill={`${biColor}18`} stroke={biColor} strokeWidth={mode === 'bi' ? 2.5 : 1.5} />
          <text x={xs[0] + 45} y={43} textAnchor="middle" fontSize={9} fill={biColor}>query</text>
          <rect x={xs[0]} y={62} width={90} height={26} rx={5} fill={`${biColor}18`} stroke={biColor} strokeWidth={mode === 'bi' ? 2.5 : 1.5} />
          <text x={xs[0] + 45} y={79} textAnchor="middle" fontSize={9} fill={biColor}>doc (precomputed)</text>
          {reveal >= 1 && (
            <>
              <line x1={xs[0] + 95} y1={39} x2={xs[0] + 140} y2={39} stroke={biColor} strokeWidth={1.5} markerEnd="url(#3way-arrow)" />
              <line x1={xs[0] + 95} y1={75} x2={xs[0] + 140} y2={75} stroke={biColor} strokeWidth={1.5} markerEnd="url(#3way-arrow)" />
            </>
          )}
          {reveal >= 2 && (
            <>
              <circle cx={xs[0] + 155} cy={39} r={11} fill={t.surface} stroke={biColor} strokeWidth={2} />
              <circle cx={xs[0] + 155} cy={75} r={11} fill={t.surface} stroke={biColor} strokeWidth={2} />
              <text x={xs[0] + 155} y={42} textAnchor="middle" fontSize={7} fill={biColor}>vec</text>
              <text x={xs[0] + 155} y={78} textAnchor="middle" fontSize={7} fill={biColor}>vec</text>
              <line x1={xs[0] + 155} y1={50} x2={xs[0] + 155} y2={64} stroke={biColor} strokeWidth={1.5} strokeDasharray="2 2" />
              <text x={xs[0] + 110} y={112} fontSize={8.5} fill={t.accentDanger}>detail pooled away here</text>
            </>
          )}
          {reveal >= 3 && (
            <text x={xs[0] + 110} y={126} fontSize={8.5} fill={t.textMuted}>-- precomputable, indexable</text>
          )}
        </g>

        {/* Late interaction panel */}
        <g
          onClick={() => setMode('late')}
          onMouseEnter={() => setMode('late')}
          style={{ cursor: 'pointer' }}
          opacity={mode === 'late' ? 1 : 0.35}
        >
          <text x={xs[1]} y={16} fontSize={11} fontWeight={700} fill={lateColor}>Late Interaction</text>
          {/* query tokens (3 small vectors) */}
          {[0, 1, 2].map((i) => (
            <rect key={`q${i}`} x={xs[1]} y={26 + i * 14} width={40} height={11} rx={3} fill={`${lateColor}20`} stroke={lateColor} strokeWidth={mode === 'late' ? 2 : 1.2} />
          ))}
          <text x={xs[1] + 20} y={78} textAnchor="middle" fontSize={7.5} fill={lateColor}>query tokens</text>
          {/* doc tokens (5 small vectors) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={`d${i}`} x={xs[1] + 150} y={20 + i * 14} width={40} height={11} rx={3} fill={`${lateColor}20`} stroke={lateColor} strokeWidth={mode === 'late' ? 2 : 1.2} />
          ))}
          <text x={xs[1] + 170} y={98} textAnchor="middle" fontSize={7.5} fill={lateColor}>doc tokens (precomputed)</text>
          {reveal >= 2 && (
            <>
              {/* MaxSim: each query token -> its best doc token (thin lines, many-to-few) */}
              <line x1={xs[1] + 40} y1={31} x2={xs[1] + 150} y2={27} stroke={lateColor} strokeWidth={1} opacity={0.6} />
              <line x1={xs[1] + 40} y1={45} x2={xs[1] + 150} y2={69} stroke={lateColor} strokeWidth={1} opacity={0.6} />
              <line x1={xs[1] + 40} y1={59} x2={xs[1] + 150} y2={69} stroke={lateColor} strokeWidth={1} opacity={0.6} />
              <text x={xs[1] + 95} y={12} textAnchor="middle" fontSize={7} fill={t.textMuted}>MaxSim</text>
              <text x={xs[1] + 100} y={118} textAnchor="middle" fontSize={8.5} fill={t.accentPrimary}>nothing pooled -- best match kept</text>
            </>
          )}
          {reveal >= 3 && (
            <text x={xs[1] + 100} y={132} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>-- larger index, still precomputed</text>
          )}
        </g>

        {/* Cross-encoder panel */}
        <g
          onClick={() => setMode('cross')}
          onMouseEnter={() => setMode('cross')}
          style={{ cursor: 'pointer' }}
          opacity={mode === 'cross' ? 1 : 0.35}
        >
          <text x={xs[2]} y={16} fontSize={11} fontWeight={700} fill={crossColor}>Cross-Encoder</text>
          <rect x={xs[2]} y={26} width={130} height={26} rx={5} fill={`${crossColor}18`} stroke={crossColor} strokeWidth={mode === 'cross' ? 2.5 : 1.5} />
          <text x={xs[2] + 65} y={43} textAnchor="middle" fontSize={9} fill={crossColor}>[query; doc]</text>
          {reveal >= 1 && (
            <line x1={xs[2] + 65} y1={52} x2={xs[2] + 65} y2={68} stroke={crossColor} strokeWidth={1.5} markerEnd="url(#3way-arrow)" />
          )}
          {reveal >= 2 && (
            <>
              <rect x={xs[2]} y={70} width={130} height={26} rx={5} fill={`${crossColor}30`} stroke={crossColor} strokeWidth={mode === 'cross' ? 2.5 : 1.5} />
              <text x={xs[2] + 65} y={87} textAnchor="middle" fontSize={9} fill={crossColor}>joint attention</text>
              <text x={xs[2] + 65} y={112} textAnchor="middle" fontSize={8.5} fill={t.accentPrimary}>nothing pooled or discarded</text>
            </>
          )}
          {reveal >= 3 && (
            <text x={xs[2] + 65} y={126} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>-- but not precomputable at all</text>
          )}
        </g>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a panel to focus it. Step through to build up the full picture -- notice late interaction is the only one that never pools either side down to one vector.
      </div>
      <VisualizationStepController controller={controller} totalSteps={STEP_LABELS.length} stepLabel={(s) => STEP_LABELS[s]} />
    </VisualizationContainer>
  );
}
