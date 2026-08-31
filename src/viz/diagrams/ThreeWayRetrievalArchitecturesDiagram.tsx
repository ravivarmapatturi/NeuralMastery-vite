import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Mode = 'bi' | 'late' | 'cross';

/** All three retrieval/reranking architectures side by side, same visual
 * grammar so the shape difference (independent-encode-then-pool vs
 * independent-encode-per-token-then-MaxSim vs joint-encode) is legible
 * at a glance. Click any panel to focus it. */
export default function ThreeWayRetrievalArchitecturesDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('bi');
  const biColor = getConceptColor(t, 'query');
  const lateColor = getConceptColor(t, 'key');
  const crossColor = getConceptColor(t, 'attention');

  const width = 720;
  const height = 260;
  const panelW = 220;
  const gap = 30;
  const xs = [10, 10 + panelW + gap, 10 + 2 * (panelW + gap)];

  const footers: Record<Mode, string> = {
    bi: 'Bi-encoder: query and document each collapse to ONE pooled vector, independently. Fast (document vectors precomputed), but every token-level detail gets averaged away before comparison.',
    late: 'Late interaction: query and document keep ONE vector PER TOKEN -- nothing pooled. Document token vectors are still precomputed, but MaxSim compares every query token against every document token individually at query time.',
    cross: 'Cross-encoder: query and document are concatenated and fed through the model TOGETHER -- full joint attention, most accurate, but nothing here is precomputable, so it only runs against a small candidate set.',
  };

  return (
    <VisualizationContainer footer={footers[mode]}>
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
          <line x1={xs[0] + 95} y1={39} x2={xs[0] + 140} y2={39} stroke={biColor} strokeWidth={1.5} markerEnd="url(#3way-arrow)" />
          <line x1={xs[0] + 95} y1={75} x2={xs[0] + 140} y2={75} stroke={biColor} strokeWidth={1.5} markerEnd="url(#3way-arrow)" />
          <circle cx={xs[0] + 155} cy={39} r={11} fill={t.surface} stroke={biColor} strokeWidth={2} />
          <circle cx={xs[0] + 155} cy={75} r={11} fill={t.surface} stroke={biColor} strokeWidth={2} />
          <text x={xs[0] + 155} y={42} textAnchor="middle" fontSize={7} fill={biColor}>vec</text>
          <text x={xs[0] + 155} y={78} textAnchor="middle" fontSize={7} fill={biColor}>vec</text>
          <line x1={xs[0] + 155} y1={50} x2={xs[0] + 155} y2={64} stroke={biColor} strokeWidth={1.5} strokeDasharray="2 2" />
          <text x={xs[0] + 110} y={112} fontSize={8.5} fill={t.textMuted}>one pooled vector, each</text>
          <text x={xs[0] + 110} y={124} fontSize={8.5} fill={t.textMuted}>side -- cosine similarity</text>
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
          {/* MaxSim: each query token -> its best doc token (thin lines, many-to-few) */}
          <line x1={xs[1] + 40} y1={31} x2={xs[1] + 150} y2={27} stroke={lateColor} strokeWidth={1} opacity={0.6} />
          <line x1={xs[1] + 40} y1={45} x2={xs[1] + 150} y2={69} stroke={lateColor} strokeWidth={1} opacity={0.6} />
          <line x1={xs[1] + 40} y1={59} x2={xs[1] + 150} y2={69} stroke={lateColor} strokeWidth={1} opacity={0.6} />
          <text x={xs[1] + 95} y={12} textAnchor="middle" fontSize={7} fill={t.textMuted}>MaxSim</text>
          <text x={xs[1] + 100} y={118} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>every query token vs.</text>
          <text x={xs[1] + 100} y={130} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>every doc token, take max</text>
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
          <line x1={xs[2] + 65} y1={52} x2={xs[2] + 65} y2={68} stroke={crossColor} strokeWidth={1.5} markerEnd="url(#3way-arrow)" />
          <rect x={xs[2]} y={70} width={130} height={26} rx={5} fill={`${crossColor}30`} stroke={crossColor} strokeWidth={mode === 'cross' ? 2.5 : 1.5} />
          <text x={xs[2] + 65} y={87} textAnchor="middle" fontSize={9} fill={crossColor}>joint attention</text>
          <text x={xs[2] + 65} y={112} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>one score, computed fresh</text>
          <text x={xs[2] + 65} y={124} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>-- nothing precomputable</text>
        </g>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Click a panel. Same three architectures, same visual grammar -- notice late interaction is the only one that never pools either side down to one vector.
      </div>
    </VisualizationContainer>
  );
}
