import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

type Mode = 'dependency' | 'constituency';
const SENTENCE = ['The', 'dog', 'chases', 'the', 'cat'];

export default function DependencyVsConstituencyDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('dependency');

  const wordX = (i: number) => 40 + i * 90;
  const baseY = 140;

  return (
    <VisualizationContainer footer={
      mode === 'dependency'
        ? '"chases" is the root -- both "dog" (subject) and "cat" (object) depend directly on it, "The"/"the" depend on their nouns. A directed graph exposing "who did what to whom" directly, useful for information extraction.'
        : 'Nested phrase structure: [S [NP The dog] [VP chases [NP the cat]]] -- a formal-grammar tree, the structure a sentence diagram represents, made rigorous.'
    }>
      <PillSelect label="Representation" value={mode} onChange={(v) => setMode(v as Mode)} options={[
        { value: 'dependency', label: 'Dependency parse' },
        { value: 'constituency', label: 'Constituency parse' },
      ]} />

      {mode === 'dependency' ? (
        <svg width="100%" viewBox="0 0 500 170" style={{ display: 'block', marginTop: 8 }}>
          <defs>
            <marker id="dep-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill={t.accentPrimary} />
            </marker>
          </defs>
          {SENTENCE.map((w, i) => (
            <text key={i} x={wordX(i)} y={baseY + 20} textAnchor="middle" fontSize={13} fontFamily="monospace" fill={t.textPrimary}>{w}</text>
          ))}
          {/* chases -> dog */}
          <path d={`M ${wordX(2)} ${baseY - 4} Q ${(wordX(2) + wordX(1)) / 2} ${baseY - 50} ${wordX(1)} ${baseY - 4}`} fill="none" stroke={t.accentPrimary} strokeWidth={2} markerEnd="url(#dep-arrow)" />
          <text x={(wordX(2) + wordX(1)) / 2} y={baseY - 40} textAnchor="middle" fontSize={10} fill={t.accentPrimary}>subj</text>
          {/* chases -> cat */}
          <path d={`M ${wordX(2)} ${baseY - 4} Q ${(wordX(2) + wordX(4)) / 2} ${baseY - 60} ${wordX(4)} ${baseY - 4}`} fill="none" stroke={t.accentPrimary} strokeWidth={2} markerEnd="url(#dep-arrow)" />
          <text x={(wordX(2) + wordX(4)) / 2} y={baseY - 50} textAnchor="middle" fontSize={10} fill={t.accentPrimary}>obj</text>
          {/* dog -> The */}
          <path d={`M ${wordX(1)} ${baseY - 4} Q ${(wordX(1) + wordX(0)) / 2} ${baseY - 28} ${wordX(0)} ${baseY - 4}`} fill="none" stroke={t.accentSecondary} strokeWidth={1.5} markerEnd="url(#dep-arrow)" />
          {/* cat -> the */}
          <path d={`M ${wordX(4)} ${baseY - 4} Q ${(wordX(4) + wordX(3)) / 2} ${baseY - 28} ${wordX(3)} ${baseY - 4}`} fill="none" stroke={t.accentSecondary} strokeWidth={1.5} markerEnd="url(#dep-arrow)" />
          <text x={wordX(2)} y={baseY + 40} textAnchor="middle" fontSize={10} fontWeight={700} fill={t.textMuted}>root</text>
        </svg>
      ) : (
        <svg width="100%" viewBox="0 0 500 170" style={{ display: 'block', marginTop: 8 }}>
          <text x={250} y={20} textAnchor="middle" fontSize={12} fontWeight={700} fill={t.accentPrimary}>S</text>
          <line x1={250} y1={26} x2={120} y2={50} stroke={t.border} strokeWidth={1.5} />
          <line x1={250} y1={26} x2={330} y2={50} stroke={t.border} strokeWidth={1.5} />
          <text x={120} y={64} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentSecondary}>NP</text>
          <text x={330} y={64} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentWarn}>VP</text>

          <line x1={120} y1={70} x2={50} y2={95} stroke={t.border} strokeWidth={1.5} />
          <line x1={120} y1={70} x2={130} y2={95} stroke={t.border} strokeWidth={1.5} />
          <text x={50} y={110} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={t.textPrimary}>The</text>
          <text x={130} y={110} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={t.textPrimary}>dog</text>

          <line x1={330} y1={70} x2={280} y2={95} stroke={t.border} strokeWidth={1.5} />
          <line x1={330} y1={70} x2={400} y2={95} stroke={t.border} strokeWidth={1.5} />
          <text x={280} y={110} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={t.textPrimary}>chases</text>
          <text x={400} y={64} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentSecondary}>NP</text>
          <line x1={400} y1={70} x2={370} y2={95} stroke={t.border} strokeWidth={1.5} />
          <line x1={400} y1={70} x2={430} y2={95} stroke={t.border} strokeWidth={1.5} />
          <text x={370} y={110} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={t.textPrimary}>the</text>
          <text x={430} y={110} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={t.textPrimary}>cat</text>
        </svg>
      )}
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Same sentence, same real grammatical relationships -- dependency parsing has become the more commonly used representation in modern pipelines because it exposes those relationships more directly.
      </div>
    </VisualizationContainer>
  );
}
