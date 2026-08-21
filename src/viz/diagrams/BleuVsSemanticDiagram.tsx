import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const REFERENCE = 'The cat sat on the mat.';

const CANDIDATES = [
  { key: 'exact', label: 'Exact match', text: 'The cat sat on the mat.', bleu: 1.0, semantic: 1.0 },
  { key: 'paraphrase', label: 'Correct paraphrase', text: 'A feline rested on the rug.', bleu: 0.05, semantic: 0.95 },
  { key: 'wrong', label: 'Fluent but wrong', text: 'The cat sat on the chair.', bleu: 0.7, semantic: 0.15 },
];

/** Same reference, three candidate answers -- click one to see BLEU
 * (n-gram overlap) and an LLM-as-judge semantic score diverge sharply
 * for a correct paraphrase and a fluent-but-wrong answer. */
export default function BleuVsSemanticDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('paraphrase');
  const color = getConceptColor(t, 'attention');
  const c = CANDIDATES.find((x) => x.key === active)!;

  const bar = (value: number, barColor: string, label: string) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: t.textSecondary, marginBottom: 2 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: barColor }}>{value.toFixed(2)}</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: t.surfaceAlt, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 100}%`, background: barColor, borderRadius: 5, transition: 'width 0.25s ease' }} />
      </div>
    </div>
  );

  return (
    <VisualizationContainer footer={`Reference: "${REFERENCE}" -- ${c.label.toLowerCase()} scores ${c.bleu < 0.3 && c.semantic > 0.7 ? 'badly on n-gram overlap despite being correct' : c.bleu > 0.5 && c.semantic < 0.3 ? 'well on n-gram overlap despite being wrong' : 'consistently well on both'}.`}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {CANDIDATES.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: t.textPrimary, marginBottom: 12, fontStyle: 'italic' }}>&ldquo;{c.text}&rdquo;</div>
      {bar(c.bleu, t.accentWarn, 'BLEU (n-gram overlap)')}
      {bar(c.semantic, t.accentPrimary, 'LLM-as-judge (semantic)')}
    </VisualizationContainer>
  );
}
