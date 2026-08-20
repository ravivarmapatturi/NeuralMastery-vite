import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE, DIAGRAM_RADIUS } from './diagramSystem';
import { forward, backward, NET } from '../lib/calculus';

const X = 1.2, TARGET = 1.0;

const FORWARD_STAGES = ['x', 'h = w1·x + b1', 'a = σ(h)', 'y = w2·a + b2', 'L = ½(y−target)²'];
const BACKWARD_STAGES = ['dL/dy', 'dL/da = dL/dy · w2', 'dL/dh = dL/da · σ\'(h)', 'dL/dw1 = dL/dh · x', 'dL/dw2 = dL/dy · a'];

export default function ChainRuleBackpropDiagram() {
  const t = useVizTokens();
  const trace = useMemo(() => forward(X, TARGET), []);
  const grads = useMemo(() => backward(trace, TARGET), [trace]);
  const controller = useStepController(FORWARD_STAGES.length + BACKWARD_STAGES.length);

  const forwardValues = [trace.x, trace.h, trace.a, trace.y, trace.loss];
  const backwardValues = [grads.dL_dy, grads.dL_da, grads.dL_dh, grads.dL_dw1, grads.dL_dw2];

  const step = controller.step;
  const inForward = step < FORWARD_STAGES.length;

  return (
    <VisualizationContainer footer={
      inForward
        ? `Forward: ${FORWARD_STAGES[step]} = ${forwardValues[step].toFixed(4)} (w1=${NET.w1}, b1=${NET.b1}, w2=${NET.w2}, b2=${NET.b2}, x=${X}, target=${TARGET})`
        : `Backward: ${BACKWARD_STAGES[step - FORWARD_STAGES.length]} = ${backwardValues[step - FORWARD_STAGES.length].toFixed(4)} -- each one is the PREVIOUS local gradient multiplied by one more local derivative, the chain rule applied mechanically, step by step.`
    }>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {FORWARD_STAGES.map((label, i) => (
          <div key={`f${i}`} style={{
            padding: '6px 10px', borderRadius: DIAGRAM_RADIUS.node, fontSize: 11, fontFamily: 'monospace',
            background: i === step ? `${t.accentPrimary}25` : i < step || step >= FORWARD_STAGES.length ? t.surfaceAlt : t.surface,
            border: `1.5px solid ${i === step ? t.accentPrimary : (i < step || step >= FORWARD_STAGES.length) ? t.border : t.border}`,
            opacity: i <= step || step >= FORWARD_STAGES.length ? 1 : 0.35,
            color: t.textPrimary,
          }}>
            {label} {(i <= step || step >= FORWARD_STAGES.length) && <strong style={{ color: t.accentPrimary }}>= {forwardValues[i].toFixed(3)}</strong>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {BACKWARD_STAGES.map((label, i) => {
          const globalIdx = i + FORWARD_STAGES.length;
          const revealed = step >= globalIdx;
          return (
            <div key={`b${i}`} style={{
              padding: '6px 10px', borderRadius: DIAGRAM_RADIUS.node, fontSize: 11, fontFamily: 'monospace',
              background: globalIdx === step ? `${t.accentWarn}25` : t.surfaceAlt,
              border: `1.5px solid ${globalIdx === step ? t.accentWarn : t.border}`,
              opacity: revealed ? 1 : 0.3, color: t.textPrimary,
            }}>
              {label} {revealed && <strong style={{ color: t.accentWarn }}>= {backwardValues[i].toFixed(4)}</strong>}
            </div>
          );
        })}
      </div>

      <VisualizationStepController controller={controller} totalSteps={FORWARD_STAGES.length + BACKWARD_STAGES.length} stepLabel={(s) => (s < FORWARD_STAGES.length ? `forward ${s + 1}` : `backward ${s - FORWARD_STAGES.length + 1}`)} />
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        This is why it's called BACKWARD propagation -- the forward pass computes left to right, then the chain rule walks right to left, reusing each already-computed local gradient rather than recomputing from scratch.
      </div>
    </VisualizationContainer>
  );
}
