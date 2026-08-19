import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE, DIAGRAM_RADIUS } from './diagramSystem';

// A concrete 4-state corridor MDP (0,1,2,3=goal), gamma=0.9, -1 per step,
// +10 on reaching the goal -- the SAME trace QValueUpdateDiagram trains
// on below, so the two diagrams describe one consistent example.
const TRACE = [
  { s: 0, a: 'right', r: -1, sNext: 1 },
  { s: 1, a: 'right', r: -1, sNext: 2 },
  { s: 2, a: 'right', r: 10, sNext: 3 },
];

export default function MdpLoopDiagram() {
  const t = useVizTokens();
  const controller = useStepController(TRACE.length);
  const step = controller.step;
  const current = TRACE[step];

  const agentX = 80, agentY = 60, envX = 320, envY = 60;

  return (
    <VisualizationContainer footer={`t=${step}: agent is in state s=${current.s}, takes action "${current.a}", environment returns reward r=${current.r} and next state s'=${current.sNext}. This same four-value exchange -- (s, a, r, s') -- is the entire interface every RL algorithm on this page learns from.`}>
      <svg width="100%" viewBox="0 0 480 160" style={{ display: 'block' }}>
        <defs>
          <marker id="mdp-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={t.accentPrimary} />
          </marker>
        </defs>
        <rect x={agentX - 55} y={agentY - 30} width={110} height={60} rx={DIAGRAM_RADIUS.node} fill={t.surfaceAlt} stroke={t.accentSecondary} strokeWidth={2} />
        <text x={agentX} y={agentY + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={t.accentSecondary}>Agent</text>

        <rect x={envX - 55} y={envY - 30} width={110} height={60} rx={DIAGRAM_RADIUS.node} fill={t.surfaceAlt} stroke={t.accentWarn} strokeWidth={2} />
        <text x={envX} y={envY + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={t.accentWarn}>Environment</text>

        {/* action arrow, agent -> env */}
        <line x1={agentX + 55} y1={agentY - 10} x2={envX - 55} y2={envY - 10} stroke={t.accentPrimary} strokeWidth={2.5} markerEnd="url(#mdp-arrow)" />
        <text x={(agentX + envX) / 2} y={agentY - 18} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentPrimary}>action: {current.a}</text>

        {/* reward+state arrow, env -> agent */}
        <line x1={envX - 55} y1={envY + 10} x2={agentX + 55} y2={agentY + 10} stroke={t.accentPrimary} strokeWidth={2.5} markerEnd="url(#mdp-arrow)" />
        <text x={(agentX + envX) / 2} y={agentY + 28} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentPrimary}>r={current.r}, s'={current.sNext}</text>

        <text x={agentX} y={agentY - 42} textAnchor="middle" fontSize={11} fill={t.textMuted}>state s = {current.s}</text>
      </svg>

      <VisualizationStepController controller={controller} totalSteps={TRACE.length} stepLabel={(s) => `t=${s}`} />
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        This trace reaches the goal (state 3) after 3 steps -- watch QValueUpdateDiagram below turn this exact sequence into real Q-value updates.
      </div>
    </VisualizationContainer>
  );
}
