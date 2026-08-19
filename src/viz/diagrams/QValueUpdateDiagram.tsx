import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController, VisualizationMath } from '../primitives';
import DiagramMatrix from './DiagramMatrix';
import { DIAGRAM_TYPE } from './diagramSystem';
import { CORRIDOR_TRACE, applyTdUpdate } from '../lib/rl';

const ALPHA = 0.5;
const GAMMA = 0.9;

export default function QValueUpdateDiagram() {
  const t = useVizTokens();
  const controller = useStepController(CORRIDOR_TRACE.length);

  // Replay every update up to `step` to get the real Q-table at this point,
  // and the specific update that just happened.
  const { qTablesByStep } = useMemo(() => {
    let Q = [[0, 0], [0, 0], [0, 0], [0, 0]];
    const tables = [Q.map((row) => row.slice())];
    for (const s of CORRIDOR_TRACE) {
      const { newQ, aIdx } = applyTdUpdate(Q, s, ALPHA, GAMMA);
      Q = Q.map((row) => row.slice());
      Q[s.s][aIdx] = newQ;
      tables.push(Q.map((row) => row.slice()));
    }
    return { qTablesByStep: tables };
  }, []);

  const step = controller.step;
  const current = CORRIDOR_TRACE[step];
  const before = qTablesByStep[step];
  const after = qTablesByStep[step + 1];
  const { tdError, newQ, aIdx } = applyTdUpdate(before, current, ALPHA, GAMMA);

  return (
    <VisualizationContainer footer={`Update ${step + 1}/${CORRIDOR_TRACE.length}: TD error = r + γ·max Q(s',·) − Q(s,a) = ${current.r} + ${GAMMA}·${Math.max(...before[current.sNext]).toFixed(2)} − ${before[current.s][aIdx].toFixed(2)} = ${tdError.toFixed(2)}. Q(${current.s}, ${current.a}) ← ${before[current.s][aIdx].toFixed(2)} + ${ALPHA}·${tdError.toFixed(2)} = ${newQ.toFixed(2)}.`}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div>
          <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.label.size, color: t.textMuted, marginBottom: 6 }}>Q-table (states 0–3 × left/right)</div>
          <DiagramMatrix data={after} concept="value" rowLabels={['0', '1', '2', '3']} colLabels={['left', 'right']} cellSize={54} highlightRow={current.s} highlightCol={aIdx} />
        </div>
      </div>

      <VisualizationStepController controller={controller} totalSteps={CORRIDOR_TRACE.length} stepLabel={(s) => `step ${s + 1}`} />

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <VisualizationMath latex={`Q(s,a) \\leftarrow Q(s,a) + \\alpha\\big[r + \\gamma \\max_{a'} Q(s',a') - Q(s,a)\\big]`} />
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Step through the exact trace from the MDP loop diagram above, replayed twice (the corridor is walked once, then revisited) -- watch Q(2, right) rise toward the real +10 goal reward as the update propagates it backward one state at a time.
      </div>
    </VisualizationContainer>
  );
}
