import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Arch = 'agentic' | 'corrective' | 'self-rag';

/** Three control-loop variants on the same retrieve→generate skeleton --
 * each adds a different decision point (whether/how to retrieve, whether
 * retrieved context is good enough, whether the output is grounded).
 * Select one to see exactly where its extra loop/branch sits. */
export default function AdvancedRagArchitecturesDiagram() {
  const t = useVizTokens();
  const [arch, setArch] = useState<Arch>('agentic');
  const baseColor = t.textMuted;
  const loopColor = getConceptColor(t, 'attention');
  const width = 560;
  const height = 190;

  const STAGES = [
    { key: 'query', x: 40, label: 'Query' },
    { key: 'retrieve', x: 170, label: 'Retrieve' },
    { key: 'generate', x: 300, label: 'Generate' },
    { key: 'answer', x: 430, label: 'Answer' },
  ];
  const y = 50;

  const descriptions: Record<Arch, string> = {
    agentic: 'An agent decides whether to retrieve, what to retrieve, and how many times -- it can loop back to Retrieve with a reformulated query before ever reaching Generate.',
    corrective: 'A grader checks retrieved chunks for relevance right after Retrieve -- insufficient context triggers a fallback (rewrite the query, broaden search, or go to web search) before Generate runs.',
    'self-rag': "The model itself emits reflection tokens at Generate -- was retrieval needed, are the passages relevant, is the answer actually grounded in them -- folding the judgment into the model's own token stream instead of a separate pipeline stage.",
  };

  return (
    <VisualizationContainer footer={descriptions[arch]}>
      <PillSelect<Arch>
        label="Architecture"
        value={arch}
        onChange={setArch}
        options={[
          { value: 'agentic', label: 'Agentic RAG' },
          { value: 'corrective', label: 'Corrective RAG' },
          { value: 'self-rag', label: 'Self-RAG' },
        ]}
      />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8 }}>
        <defs>
          <marker id="ara-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={baseColor} />
          </marker>
          <marker id="ara-arrow-loop" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={loopColor} />
          </marker>
        </defs>
        {STAGES.map((s, i) => (
          <g key={s.key}>
            {i > 0 && <line x1={STAGES[i - 1].x + 45} y1={y} x2={s.x - 5} y2={y} stroke={baseColor} strokeWidth={1.5} markerEnd="url(#ara-arrow)" />}
            <rect x={s.x - 5} y={y - 16} width={80} height={32} rx={6} fill={t.surfaceAlt} stroke={baseColor} strokeWidth={1.5} />
            <text x={s.x + 35} y={y + 4} textAnchor="middle" fontSize={10} fill={t.textSecondary}>{s.label}</text>
          </g>
        ))}

        {arch === 'agentic' && (
          <>
            <path d="M 335,66 C 335,120 165,120 165,66" fill="none" stroke={loopColor} strokeWidth={2} markerEnd="url(#ara-arrow-loop)" />
            <text x={250} y={132} textAnchor="middle" fontSize={9} fill={loopColor}>agent reformulates &amp; re-retrieves</text>
          </>
        )}
        {arch === 'corrective' && (
          <>
            <rect x={165} y={95} width={90} height={30} rx={6} fill={`${loopColor}18`} stroke={loopColor} strokeWidth={1.5} />
            <text x={210} y={114} textAnchor="middle" fontSize={9} fill={loopColor}>grade relevance</text>
            <line x1={210} y1={66} x2={210} y2={93} stroke={loopColor} strokeWidth={1.5} markerEnd="url(#ara-arrow-loop)" />
            <path d="M 165,110 C 100,110 100,66 165,66" fill="none" stroke={loopColor} strokeWidth={1.5} strokeDasharray="3 2" markerEnd="url(#ara-arrow-loop)" />
            <text x={95} y={90} textAnchor="middle" fontSize={8} fill={loopColor} transform="rotate(-90 95 90)">insufficient → retry</text>
          </>
        )}
        {arch === 'self-rag' && (
          <>
            <rect x={295} y={95} width={110} height={30} rx={6} fill={`${loopColor}18`} stroke={loopColor} strokeWidth={1.5} />
            <text x={350} y={114} textAnchor="middle" fontSize={8} fill={loopColor}>reflection tokens</text>
            <line x1={340} y1={66} x2={340} y2={93} stroke={loopColor} strokeWidth={1.5} markerEnd="url(#ara-arrow-loop)" />
          </>
        )}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Same retrieve→generate skeleton (gray) — each architecture adds a different decision point (highlighted).
      </div>
    </VisualizationContainer>
  );
}
