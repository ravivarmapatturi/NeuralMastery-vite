import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { softmax, argmax } from '../lib/nlpTasks';

const PASSAGE = ['The', 'Eiffel', 'Tower', 'was', 'completed', 'in', '1889', 'in', 'Paris', '.'];
// Toy start/end logits -- a real model outputs one such vector per
// position; these are hand-set to peak at the real answer span "1889"
// but with a plausible secondary peak at the wrong span "Paris" to keep
// the softmax genuinely competitive rather than a giveaway.
const START_LOGITS = [-2, -3, -3, -2, -1, 0.5, 4.2, -1, 1.8, -3];
const END_LOGITS = [-3, -3, -2, -2, -1, -0.5, 4.5, -1, 1.5, -3];

export default function ExtractiveQaSpanDiagram() {
  const t = useVizTokens();
  const { startProbs, endProbs, startIdx, endIdx } = useMemo(() => {
    const startProbs = softmax(START_LOGITS);
    const endProbs = softmax(END_LOGITS);
    return { startProbs, endProbs, startIdx: argmax(startProbs), endIdx: argmax(endProbs) };
  }, []);

  const answer = PASSAGE.slice(startIdx, endIdx + 1).join(' ');

  return (
    <VisualizationContainer footer={`Real softmax over start/end logits, then real argmax: predicted span = "${answer}" (position ${startIdx} to ${endIdx}), with start probability ${(startProbs[startIdx] * 100).toFixed(1)}% and end probability ${(endProbs[endIdx] * 100).toFixed(1)}%. This is the entire extractive-QA mechanism -- two independent per-token classification heads over the passage, not free-form generation.`}>
      <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>Question: "When was the Eiffel Tower completed?"</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {PASSAGE.map((word, i) => {
          const isAnswer = i >= startIdx && i <= endIdx;
          const startP = startProbs[i];
          const endP = endProbs[i];
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ padding: '4px 8px', borderRadius: 6, fontFamily: 'monospace', fontSize: 13, background: isAnswer ? `${t.accentPrimary}25` : t.surfaceAlt, border: `1.5px solid ${isAnswer ? t.accentPrimary : t.border}`, color: t.textPrimary }}>
                {word}
              </div>
              <div style={{ fontSize: 8, color: t.accentSecondary, marginTop: 2 }}>{i === startIdx ? `start ${(startP * 100).toFixed(0)}%` : ' '}</div>
              <div style={{ fontSize: 8, color: t.accentWarn }}>{i === endIdx ? `end ${(endP * 100).toFixed(0)}%` : ' '}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <VisualizationMath latex={`\\text{span} = [\\arg\\max(\\text{start probs}),\\ \\arg\\max(\\text{end probs})] = [${startIdx}, ${endIdx}]`} display={false} />
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        A structurally simpler, more constrained task than free-form generation -- the model can only ever point at something already in the passage, which is exactly why it can't hallucinate an answer not present in the source.
      </div>
    </VisualizationContainer>
  );
}
