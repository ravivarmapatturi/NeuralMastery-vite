import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { TAGS, viterbiDecode, bestPath, type Tag } from '../lib/classicalNlp';

const SENTENCE = ['the', 'dog', 'chases', 'the', 'cat'];
const TAG_COLOR: Record<Tag, string> = { DET: 'accentSecondary', NOUN: 'accentPrimary', VERB: 'accentWarn' };

export default function PosTaggingViterbiDiagram() {
  const t = useVizTokens();
  const trellis = useMemo(() => viterbiDecode(SENTENCE), []);
  const path = useMemo(() => bestPath(trellis), [trellis]);
  const controller = useStepController(SENTENCE.length);
  const upTo = controller.step;

  const cellW = 90, cellH = 50, colGap = 20;
  const width = SENTENCE.length * (cellW + colGap);
  const height = TAGS.length * (cellH + 12) + 30;

  return (
    <VisualizationContainer footer={`Step through real Viterbi decoding, word by word: at each column, every tag's probability = max over the PREVIOUS column's tags of (that tag's probability × transition probability × this word's real emission probability for the current tag) -- the actual dynamic-programming recurrence, not an animation of it. Final path (bold): ${path.slice(0, upTo + 1).join(' → ')}`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {SENTENCE.map((word, wi) => (
          <text key={`w${wi}`} x={wi * (cellW + colGap) + cellW / 2} y={16} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="monospace" fill={t.textPrimary}>{word}</text>
        ))}
        {TAGS.map((tag, ti) => (
          <text key={`t${ti}`} x={-4} y={30 + ti * (cellH + 12) + cellH / 2 + 4} textAnchor="end" fontSize={10} fill={t.textMuted}>{tag}</text>
        ))}

        {trellis.slice(0, upTo + 1).map((col, wi) => col.map((cell, ti) => {
          const x = wi * (cellW + colGap);
          const y = 30 + ti * (cellH + 12);
          const isOnPath = path[wi] === cell.tag;
          const color = t[TAG_COLOR[cell.tag]];
          return (
            <g key={`${wi}-${ti}`}>
              <rect x={x} y={y} width={cellW} height={cellH} rx={6} fill={isOnPath ? `${color}22` : t.surfaceAlt} stroke={isOnPath ? color : t.border} strokeWidth={isOnPath ? 2.5 : 1} />
              <text x={x + cellW / 2} y={y + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>{cell.tag}</text>
              <text x={x + cellW / 2} y={y + 38} textAnchor="middle" fontSize={9} fontFamily="monospace" fill={t.textMuted}>{cell.prob.toExponential(1)}</text>
              {wi > 0 && cell.backpointer && (
                <line
                  x1={x} y1={y + cellH / 2}
                  x2={x - colGap} y2={30 + TAGS.indexOf(cell.backpointer) * (cellH + 12) + cellH / 2}
                  stroke={isOnPath ? color : t.border} strokeWidth={isOnPath ? 2 : 1} strokeOpacity={isOnPath ? 1 : 0.3}
                />
              )}
            </g>
          );
        }))}
      </svg>
      <VisualizationStepController controller={controller} totalSteps={SENTENCE.length} stepLabel={(s) => SENTENCE[s]} />
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        "the" and "chases" have near-unambiguous emission probabilities (DET, VERB respectively); "dog" and "cat" are only disambiguated as NOUN through the transition structure -- DET is overwhelmingly likely to be followed by NOUN, not by another DET or a VERB.
      </div>
    </VisualizationContainer>
  );
}
