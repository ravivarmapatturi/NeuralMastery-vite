import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PillSelect } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Mode = 'chatbot' | 'agent';

/** The defining difference isn't the model -- it's whether there's a loop.
 * A chatbot call is a straight line: input -> output -> stop. An agent
 * wraps the SAME model in a loop that can call tools and observe results
 * before ever producing a final answer. */
export default function ChatbotVsAgentDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('agent');
  const color = mode === 'agent' ? getConceptColor(t, 'attention') : t.textMuted;
  const width = 560;
  const height = 150;

  return (
    <VisualizationContainer footer={mode === 'chatbot' ? 'A single LLM call: input, output, stop. No loop, no tools, no way to act on what it finds.' : 'The model can decide to call a tool, observe the result, and decide what to do next -- potentially many times -- before producing a final answer. The loop is the entire difference.'}>
      <PillSelect<Mode> label="Mode" value={mode} onChange={setMode} options={[{ value: 'chatbot', label: 'Chatbot' }, { value: 'agent', label: 'Agent' }]} />
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 10 }}>
        <defs>
          <marker id="cva-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={color} />
          </marker>
        </defs>
        <rect x={20} y={55} width={90} height={36} rx={7} fill={t.surfaceAlt} stroke={t.textMuted} strokeWidth={1.5} />
        <text x={65} y={77} textAnchor="middle" fontSize={11} fill={t.textSecondary}>Input</text>
        <line x1={110} y1={73} x2={155} y2={73} stroke={color} strokeWidth={2} markerEnd="url(#cva-arrow)" />
        <rect x={160} y={55} width={100} height={36} rx={7} fill={`${color}18`} stroke={color} strokeWidth={2} />
        <text x={210} y={77} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>LLM</text>
        {mode === 'chatbot' ? (
          <>
            <line x1={260} y1={73} x2={310} y2={73} stroke={color} strokeWidth={2} markerEnd="url(#cva-arrow)" />
            <rect x={315} y={55} width={90} height={36} rx={7} fill={t.surfaceAlt} stroke={t.textMuted} strokeWidth={1.5} />
            <text x={360} y={77} textAnchor="middle" fontSize={11} fill={t.textSecondary}>Output</text>
            <text x={430} y={77} fontSize={11} fill={t.textMuted}>→ stop</text>
          </>
        ) : (
          <>
            <path d="M 210,55 C 210,10 340,10 340,55" fill="none" stroke={color} strokeWidth={2} markerEnd="url(#cva-arrow)" />
            <rect x={295} y={55} width={90} height={36} rx={7} fill={`${color}18`} stroke={color} strokeWidth={1.5} />
            <text x={340} y={73} textAnchor="middle" fontSize={9} fill={color}>call tool</text>
            <text x={340} y={85} textAnchor="middle" fontSize={9} fill={color}>observe result</text>
            <text x={270} y={20} textAnchor="middle" fontSize={8} fill={color}>loop, N times</text>
            <line x1={385} y1={73} x2={430} y2={73} stroke={color} strokeWidth={2} markerEnd="url(#cva-arrow)" />
            <rect x={435} y={55} width={100} height={36} rx={7} fill={t.surfaceAlt} stroke={t.textMuted} strokeWidth={1.5} />
            <text x={485} y={77} textAnchor="middle" fontSize={10} fill={t.textSecondary}>Final answer</text>
          </>
        )}
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Same model underneath — the loop plus the ability to act on the outside world is the entire distinction.
      </div>
    </VisualizationContainer>
  );
}
