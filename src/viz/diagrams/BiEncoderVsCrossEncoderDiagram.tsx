import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** The two-stage retrieval funnel: a bi-encoder embeds query and documents
 * INDEPENDENTLY (so document embeddings are precomputable and indexable),
 * narrowing millions to dozens; a cross-encoder then feeds query+doc
 * TOGETHER through the model for a far more accurate but non-precomputable
 * score, on just those few dozen survivors. Click a stage to see why. */
export default function BiEncoderVsCrossEncoderDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<'bi' | 'cross'>('bi');
  const biColor = getConceptColor(t, 'query');
  const crossColor = getConceptColor(t, 'attention');

  const width = 580;
  const height = 220;

  return (
    <VisualizationContainer
      footer={
        active === 'bi'
          ? 'Bi-encoder: query and each document are embedded through the model SEPARATELY. Document embeddings can be precomputed once and indexed -- fast enough to search millions of chunks, but the model never sees query and document together.'
          : 'Cross-encoder: query and ONE candidate document are concatenated and fed through the model TOGETHER, letting attention compare them directly. Far more accurate, but nothing can be precomputed -- too slow to run against more than a few dozen candidates.'
      }
    >
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="bce-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>

        {/* Bi-encoder stage */}
        <g onClick={() => setActive('bi')} onMouseEnter={() => setActive('bi')} style={{ cursor: 'pointer' }} opacity={active === 'bi' ? 1 : 0.4}>
          <text x={20} y={20} fontSize={11} fontWeight={700} fill={biColor}>Bi-encoder (millions → dozens)</text>
          <rect x={20} y={30} width={90} height={34} rx={6} fill={`${biColor}18`} stroke={biColor} strokeWidth={active === 'bi' ? 2.5 : 1.5} />
          <text x={65} y={51} textAnchor="middle" fontSize={10} fill={biColor}>query</text>
          <rect x={20} y={74} width={90} height={34} rx={6} fill={`${biColor}18`} stroke={biColor} strokeWidth={active === 'bi' ? 2.5 : 1.5} />
          <text x={65} y={95} textAnchor="middle" fontSize={10} fill={biColor}>doc (precomputed)</text>
          <line x1={110} y1={47} x2={160} y2={47} stroke={biColor} strokeWidth={1.5} markerEnd="url(#bce-arrow)" />
          <line x1={110} y1={91} x2={160} y2={91} stroke={biColor} strokeWidth={1.5} markerEnd="url(#bce-arrow)" />
          <circle cx={180} cy={47} r={14} fill={t.surface} stroke={biColor} strokeWidth={2} />
          <text x={180} y={51} textAnchor="middle" fontSize={9} fill={biColor}>vec</text>
          <circle cx={180} cy={91} r={14} fill={t.surface} stroke={biColor} strokeWidth={2} />
          <text x={180} y={95} textAnchor="middle" fontSize={9} fill={biColor}>vec</text>
          <text x={180} y={130} textAnchor="middle" fontSize={9} fill={t.textMuted}>cosine similarity</text>
          <path d="M 180,60 L 180,78" stroke={biColor} strokeWidth={1.5} strokeDasharray="2 2" />
        </g>

        {/* Cross-encoder stage */}
        <g onClick={() => setActive('cross')} onMouseEnter={() => setActive('cross')} style={{ cursor: 'pointer' }} opacity={active === 'cross' ? 1 : 0.4}>
          <text x={320} y={20} fontSize={11} fontWeight={700} fill={crossColor}>Cross-encoder (dozens → ranked)</text>
          <rect x={320} y={30} width={110} height={34} rx={6} fill={`${crossColor}18`} stroke={crossColor} strokeWidth={active === 'cross' ? 2.5 : 1.5} />
          <text x={375} y={51} textAnchor="middle" fontSize={9} fill={crossColor}>[query; doc]</text>
          <line x1={430} y1={47} x2={470} y2={47} stroke={crossColor} strokeWidth={1.5} markerEnd="url(#bce-arrow)" />
          <rect x={470} y={30} width={90} height={34} rx={6} fill={`${crossColor}30`} stroke={crossColor} strokeWidth={active === 'cross' ? 2.5 : 1.5} />
          <text x={515} y={51} textAnchor="middle" fontSize={9} fill={crossColor}>joint attention</text>
          <text x={320} y={100} fontSize={9} fill={t.textMuted}>single relevance score, computed fresh per (query, doc) pair --</text>
          <text x={320} y={114} fontSize={9} fill={t.textMuted}>nothing here can be precomputed or indexed ahead of time.</text>
        </g>

        <line x1={220} y1={110} x2={300} y2={110} stroke={t.textMuted} strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#bce-arrow)" />
        <text x={260} y={102} textAnchor="middle" fontSize={8} fill={t.textMuted}>top ~50</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a stage. Same funnel shape as the two-tower / retrieve-then-rank pattern used across recommenders and learning-to-rank.
      </div>
    </VisualizationContainer>
  );
}
