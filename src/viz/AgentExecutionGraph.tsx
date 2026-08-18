import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useVizTokens, SPACING, RADIUS, FONT_FAMILY, type VizTokens } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, PillSelect, VizButton, ControlRow } from './primitives';
import { SCENARIOS, STEP_NODE, type StepType } from './lib/agentTrace';

const NODE_INFO: Record<StepType, string> = {
  thought: 'The model reasons about what it knows so far and what it needs to do next -- no tool call, just internal reasoning text.',
  action: 'The model calls a tool (a search, an API, a calculation) with specific arguments, based on what it just decided in its Thought step.',
  observation: 'The result the tool call actually returned, fed back into the model’s context -- this is what the next Thought reasons over.',
  answer: 'Once the model decides it has everything it needs, it stops looping and produces a final answer instead of another action.',
};

const SCENARIO_OPTIONS = Object.entries(SCENARIOS).map(([value, s]) => ({ value, label: s.label }));

function buildFlow(t: VizTokens, activeNodeId: StepType): { nodes: Node[]; edges: Edge[] } {
  const baseNode = (id: StepType, label: string, pos: { x: number; y: number }): Node => {
    const active = id === activeNodeId;
    return {
      id,
      position: pos,
      data: { label },
      style: {
        background: active ? t.accentPrimary : t.surface,
        color: active ? t.background : t.textPrimary,
        border: `1px solid ${active ? t.accentPrimary : t.border}`,
        borderRadius: RADIUS.sm,
        fontFamily: FONT_FAMILY,
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        padding: 10,
        width: 140,
        textAlign: 'center',
        transition: 'all 200ms ease',
      },
    };
  };

  const nodes: Node[] = [
    baseNode('thought', 'Thought', { x: 160, y: 0 }),
    baseNode('action', 'Action', { x: 360, y: 130 }),
    baseNode('observation', 'Observation', { x: 160, y: 260 }),
    baseNode('answer', 'Answer', { x: -40, y: 130 }),
  ];

  const edgeStyle = (id: StepType) => ({
    stroke: id === activeNodeId ? t.accentPrimary : t.edge,
    strokeWidth: id === activeNodeId ? 2.5 : 1.5,
  });

  const edges: Edge[] = [
    { id: 'e-thought-action', source: 'thought', target: 'action', style: edgeStyle('action'), animated: activeNodeId === 'action' },
    { id: 'e-action-obs', source: 'action', target: 'observation', style: edgeStyle('observation'), animated: activeNodeId === 'observation' },
    { id: 'e-obs-thought', source: 'observation', target: 'thought', style: edgeStyle('thought'), animated: activeNodeId === 'thought' },
    { id: 'e-thought-answer', source: 'thought', target: 'answer', style: edgeStyle('answer'), animated: activeNodeId === 'answer' },
  ];

  return { nodes, edges };
}

export default function AgentExecutionGraph() {
  const t = useVizTokens();
  const [scenarioKey, setScenarioKey] = useState('weather');
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const scenario = SCENARIOS[scenarioKey];
  const steps = scenario.steps;
  const currentStep = steps[stepIndex];
  const activeNodeId = STEP_NODE[currentStep.type];

  const { nodes, edges } = useMemo(() => buildFlow(t, activeNodeId), [t, activeNodeId]);

  useEffect(() => {
    if (!playing) return undefined;
    timerRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) return i; // hold on the final Answer instead of looping silently
        return i + 1;
      });
    }, 1400);
    return () => clearInterval(timerRef.current);
  }, [playing, steps.length]);

  useEffect(() => {
    if (stepIndex >= steps.length - 1) setPlaying(false);
  }, [stepIndex, steps.length]);

  function changeScenario(key: string) {
    setPlaying(false);
    setScenarioKey(key);
    setStepIndex(0);
  }

  function reset() {
    setPlaying(false);
    setStepIndex(0);
  }

  function stepForward() {
    setPlaying(false);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  return (
    <VisualizationContainer footer="A scripted, representative ReAct trace -- not a live model call -- so the shape of the reason / act / observe loop is something you can step through and click, not just read about.">
      <VisualizationHeader eyebrow="Interactive" title="Agent Execution Graph" />
      <ControlRow>
        <PillSelect<string> label="Scenario" value={scenarioKey} onChange={changeScenario} options={SCENARIO_OPTIONS} />
        <VizButton onClick={stepForward} disabled={stepIndex >= steps.length - 1}>
          Step
        </VizButton>
        <VizButton variant={playing ? 'primary' : 'secondary'} onClick={() => setPlaying((p) => !p)} disabled={stepIndex >= steps.length - 1 && !playing}>
          {playing ? 'Pause' : 'Play'}
        </VizButton>
        <VizButton variant="secondary" onClick={reset}>
          Reset
        </VizButton>
      </ControlRow>

      <div style={{ fontSize: 14, color: t.textSecondary, marginBottom: SPACING.sm, fontStyle: 'italic' }}>“{scenario.query}”</div>

      <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: 460, height: 360, border: `1px solid ${t.border}`, borderRadius: RADIUS.md, overflow: 'hidden' }}>
          <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
            <Background color={t.border} gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13, background: t.surfaceAlt, border: `1px solid ${t.accentPrimary}`, borderRadius: RADIUS.sm, padding: 10, marginBottom: SPACING.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: t.accentPrimary, fontWeight: 700, marginBottom: 4 }}>
              <span>
                Step {stepIndex + 1} / {steps.length} -- {currentStep.title}
              </span>
            </div>
            <div style={{ color: t.textPrimary, marginBottom: 6, fontFamily: currentStep.type === 'action' ? 'monospace' : FONT_FAMILY }}>{currentStep.detail}</div>
            <div style={{ color: t.textMuted, fontSize: 12 }}>{NODE_INFO[currentStep.type]}</div>
          </div>

          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 6 }}>Trace so far</div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {steps.slice(0, stepIndex + 1).map((s, i) => (
              <div
                key={i}
                onClick={() => {
                  setPlaying(false);
                  setStepIndex(i);
                }}
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  marginBottom: 3,
                  borderRadius: RADIUS.sm,
                  cursor: 'pointer',
                  background: i === stepIndex ? t.surfaceAlt : 'transparent',
                  color: i === stepIndex ? t.textPrimary : t.textSecondary,
                  border: `1px solid ${i === stepIndex ? t.border : 'transparent'}`,
                }}
              >
                <strong>{s.title}:</strong> {s.detail.length > 60 ? `${s.detail.slice(0, 60)}…` : s.detail}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
