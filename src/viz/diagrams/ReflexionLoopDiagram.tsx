import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton, ControlRow } from '../primitives';
import { DIAGRAM_TYPE, DIAGRAM_RADIUS, getConceptColor } from './diagramSystem';

type NodeId = 'actor' | 'evaluator' | 'reflection';

interface Frame {
  node: NodeId;
  trial: 1 | 2;
  text: string;
}

// The real ALFWorld trial from Shinn et al., "Reflexion: Language Agents
// with Verbal Reinforcement Learning" (2023), arXiv:2303.11366 -- not a
// constructed example. Trial 1's actions and the self-reflection text are
// quoted from the paper.
const FRAMES: Frame[] = [
  { node: 'actor', trial: 1, text: 'Trial 1, Actor: searches for a mug, then repeatedly tries "use desklamp 1" -- no effect. The lamp was never found or turned on.' },
  { node: 'evaluator', trial: 1, text: 'Trial 1, Evaluator: binary signal -- task incomplete. No partial credit, no explanation of *why* -- just fail.' },
  { node: 'reflection', trial: 1, text: 'Trial 1, Self-Reflection (quoted from the paper): "I should have looked for the desklamp first, then looked for the mug. ...In the next trial, I will go to desk 1, find the lamp, then look for the mug." Stored in the episodic memory buffer -- available to the Actor on the next trial, not thrown away.' },
  { node: 'actor', trial: 2, text: "Trial 2, Actor: reads the stored reflection before acting -- goes directly to desk 1, takes the mug, then successfully uses the desklamp. The plan changed because of what trial 1's reflection said, not from a fresh random attempt." },
];

const POS: Record<NodeId, { x: number; y: number }> = {
  actor: { x: 100, y: 130 },
  evaluator: { x: 280, y: 60 },
  reflection: { x: 280, y: 200 },
};

const LABEL: Record<NodeId, string> = {
  actor: 'Actor',
  evaluator: 'Evaluator',
  reflection: 'Self-Reflection',
};

export default function ReflexionLoopDiagram() {
  const t = useVizTokens();
  const [i, setI] = useState(0);
  const color = getConceptColor(t, 'attention');
  const warn = t.accentWarn;
  const frame = FRAMES[i];

  const next = () => setI((v) => Math.min(v + 1, FRAMES.length - 1));
  const reset = () => setI(0);

  const edges: [NodeId, NodeId][] = [
    ['actor', 'evaluator'],
    ['evaluator', 'reflection'],
    ['reflection', 'actor'],
  ];
  const activeEdgeIndex = i === 0 ? -1 : i - 1;

  return (
    <VisualizationContainer footer={frame.text}>
      <ControlRow>
        <VizButton onClick={next} disabled={i === FRAMES.length - 1}>
          Step
        </VizButton>
        <VizButton variant="secondary" onClick={reset}>
          Reset
        </VizButton>
        <span style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted }}>
          Trial {frame.trial} · step {i + 1} / {FRAMES.length}
        </span>
      </ControlRow>
      <svg width="100%" viewBox="0 0 380 260" style={{ marginTop: 10 }}>
        <defs>
          <marker id="rfx-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.border} opacity={0.6} />
          </marker>
          <marker id="rfx-arrow-active" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={color} />
          </marker>
        </defs>
        {edges.map(([a, b], idx) => {
          const active = idx <= activeEdgeIndex;
          const p1 = POS[a];
          const p2 = POS[b];
          return (
            <line
              key={`${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={active ? color : t.border}
              strokeWidth={active ? 2.5 : 1.5}
              opacity={active ? 1 : 0.5}
              markerEnd={active ? 'url(#rfx-arrow-active)' : 'url(#rfx-arrow)'}
            />
          );
        })}
        {(Object.keys(POS) as NodeId[]).map((id) => {
          const p = POS[id];
          const isCurrent = frame.node === id;
          const isFailNode = id === 'evaluator' && frame.trial === 1 && isCurrent;
          return (
            <g key={id}>
              <rect
                x={p.x - 60}
                y={p.y - 18}
                width={120}
                height={36}
                rx={DIAGRAM_RADIUS.node}
                fill={isCurrent ? `${isFailNode ? warn : color}25` : t.surfaceAlt}
                stroke={isCurrent ? (isFailNode ? warn : color) : t.border}
                strokeWidth={isCurrent ? 2.5 : 1.5}
              />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={DIAGRAM_TYPE.secondaryLabel.size} fontWeight={isCurrent ? 700 : 500} fill={isCurrent ? (isFailNode ? warn : color) : t.textPrimary}>
                {LABEL[id]}
              </text>
            </g>
          );
        })}
        <text x={280} y={235} textAnchor="middle" fontSize={9} fill={t.textMuted}>episodic memory buffer</text>
        <line x1={280} y1={222} x2={280} y2={218} stroke={t.textMuted} strokeWidth={1} strokeDasharray="2 2" />
      </svg>
    </VisualizationContainer>
  );
}
