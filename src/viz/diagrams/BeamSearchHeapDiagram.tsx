import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { beamSearchStep, type BeamCandidate } from '../lib/algorithms';

const BEAM_WIDTH = 2;

export default function BeamSearchHeapDiagram() {
  const t = useVizTokens();
  const trace = useMemo(() => {
    let beams: BeamCandidate[] = [{ sequence: '<s>', score: 0 }];
    const steps: BeamCandidate[][] = [beams];
    for (let i = 0; i < 3; i++) {
      beams = beamSearchStep(beams, BEAM_WIDTH);
      steps.push(beams);
    }
    return steps;
  }, []);
  const controller = useStepController(trace.length);
  const current = trace[controller.step];

  return (
    <VisualizationContainer footer={`Beam width k=${BEAM_WIDTH}: at every step, every surviving candidate is expanded with every possible next token, real log-probabilities are summed, and only the top-${BEAM_WIDTH} scoring sequences survive to the next step -- exactly the heap/priority-queue operation (keep the top-k, discard the rest) real LLM decoding runs at every single generation step.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {current.map((c, i) => (
          <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: t.surfaceAlt, border: `1.5px solid ${i === 0 ? t.accentPrimary : t.border}` }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: t.textPrimary }}>{c.sequence}</span>
            <span style={{ float: 'right', fontFamily: 'monospace', fontSize: 12, color: t.accentPrimary, fontWeight: 700 }}>{c.score.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <VisualizationStepController controller={controller} totalSteps={trace.length} stepLabel={(s) => `step ${s}`} />
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        Score = real cumulative sum of log-probabilities along the sequence -- higher (less negative) is better. Beam search never guarantees the single best full sequence, only the best it can find while only ever tracking k candidates at once.
      </div>
    </VisualizationContainer>
  );
}
