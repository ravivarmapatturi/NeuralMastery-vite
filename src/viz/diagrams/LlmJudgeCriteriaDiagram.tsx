import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const CRITERIA = [
  { key: 'faithfulness', label: 'Faithfulness', question: 'Does the output only claim things supported by the provided context?', fail: 'The answer adds a fact that was never in the source document.' },
  { key: 'relevance', label: 'Relevance', question: 'Does the output actually address the question that was asked?', fail: 'The answer is accurate but talks about a related, different question.' },
  { key: 'groundedness', label: 'Groundedness', question: 'Can each specific claim be traced back to a specific piece of source material?', fail: 'A claim is technically true but cannot be pinned to any retrieved chunk.' },
];

/** Three LLM-as-judge criteria that sound similar but check different
 * things -- click one to see the question it asks and a concrete
 * failure example. */
export default function LlmJudgeCriteriaDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('faithfulness');
  const color = getConceptColor(t, 'attention');
  const c = CRITERIA.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={c.question}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {CRITERIA.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '0.6rem 0.8rem', borderRadius: 7, background: `${t.accentDanger}12`, border: `1px solid ${t.accentDanger}40` }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: t.accentDanger, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 }}>Fails when</div>
        <div style={{ fontSize: 10.5, color: t.textSecondary }}>{c.fail}</div>
      </div>
    </VisualizationContainer>
  );
}
