import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'ragas', label: 'Ragas', focus: 'RAG pipelines specifically', detail: 'Computes faithfulness, answer relevance, context precision/recall from just a query, retrieved context, and generated answer -- no hand-labeled ground truth required for every metric.' },
  { key: 'deepeval', label: 'DeepEval', focus: 'General LLM eval, pytest-style', detail: 'Designed to run inside CI/CD -- turns "did this prompt/model change regress quality" into an automated test rather than a manual spot-check.' },
  { key: 'langsmith', label: 'LangSmith', focus: 'Tracing + dataset eval', detail: "LangChain's observability platform -- traces every step of an LLM/agent pipeline, plus dataset-based evaluation runs." },
  { key: 'phoenix', label: 'Arize Phoenix', focus: 'Tracing + embedding drift', detail: 'Open-source LLM observability -- tracing and evaluation, plus embedding drift visualization for LLM-specific signals.' },
];

/** Four evaluation tools with different centers of gravity -- click one
 * for what it's actually built around. */
export default function EvalToolComparisonDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('ragas');
  const color = getConceptColor(t, 'attention');
  const tool = TOOLS.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={tool.detail}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {TOOLS.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '0.6rem 0.8rem', borderRadius: 7, background: `${color}10`, border: `1px solid ${color}40` }}>
        <div style={{ fontSize: 9, fontWeight: 700, color, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Built around</div>
        <div style={{ fontSize: 11, color: t.textPrimary, fontWeight: 600 }}>{tool.focus}</div>
      </div>
    </VisualizationContainer>
  );
}
