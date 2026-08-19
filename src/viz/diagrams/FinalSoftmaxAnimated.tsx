import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationMath, VizButton } from '../primitives';
import { DIAGRAM_TYPE, DIAGRAM_ANIMATION, getConceptColor } from './diagramSystem';
import { CANDIDATES, computeDistribution } from '../lib/sampling';

/** Decoder output projected to vocabulary-sized logits, then softmax turns
 * those logits into a real probability distribution over the next token.
 * Reuses the same candidate logits as the Inference Flow Visualizer's
 * sampling playground elsewhere on the site, at temperature=1 with no
 * top-k/top-p truncation -- plain softmax, the final step of the model. */
export default function FinalSoftmaxAnimated() {
  const t = useVizTokens();
  const [showProbs, setShowProbs] = useState(true);
  const dist = computeDistribution(1, CANDIDATES.length, 1);
  const attnColor = getConceptColor(t, 'attention');

  const maxLogit = Math.max(...CANDIDATES.map((c) => c.baseLogit));
  const minLogit = Math.min(...CANDIDATES.map((c) => c.baseLogit));

  return (
    <VisualizationContainer footer='"the cat sat on the ___" -- real logits from the LM head, turned into a real probability distribution via softmax.'>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <VizButton variant={showProbs ? 'secondary' : 'primary'} onClick={() => setShowProbs(false)}>
          Logits
        </VizButton>
        <span style={{ width: 8 }} />
        <VizButton variant={showProbs ? 'primary' : 'secondary'} onClick={() => setShowProbs(true)}>
          softmax(logits)
        </VizButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420, margin: '0 auto' }}>
        {dist.map((c) => {
          const logitFrac = (c.baseLogit - minLogit) / (maxLogit - minLogit || 1);
          const widthPct = showProbs ? c.finalProb * 100 : logitFrac * 100;
          return (
            <div key={c.token}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: DIAGRAM_TYPE.caption.size, color: t.textSecondary, marginBottom: 2 }}>
                <span style={{ fontFamily: 'monospace' }}>{c.token}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{showProbs ? `${(c.finalProb * 100).toFixed(1)}%` : c.baseLogit.toFixed(1)}</span>
              </div>
              <div style={{ height: 14, background: t.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(2, widthPct)}%`,
                    height: '100%',
                    background: attnColor,
                    borderRadius: 4,
                    transition: `width ${DIAGRAM_ANIMATION.slow}ms ${DIAGRAM_ANIMATION.easing}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <VisualizationMath latex={showProbs ? 'P(\\text{token}_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}' : 'z = \\text{LM\\_head}(h) \\in \\mathbb{R}^{|V|}'} />
      </div>
    </VisualizationContainer>
  );
}
