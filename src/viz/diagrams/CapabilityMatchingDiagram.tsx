import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TASK = 'Extract line items from this scanned invoice and flag anything unusual';
const AGENTS = [
  { name: 'invoice-processor', skills: ['extract line items', 'flag anomalies', 'match to PO'], match: true },
  { name: 'email-summarizer', skills: ['summarize threads', 'draft replies'], match: false },
  { name: 'contract-reviewer', skills: ['flag risky clauses', 'compare against template'], match: false },
];

/** The delegating agent reads capability cards the way a hiring manager
 * reads résumés for relevant skills -- click "match" to see which card's
 * skills actually cover the task at hand. */
export default function CapabilityMatchingDiagram() {
  const t = useVizTokens();
  const [matched, setMatched] = useState(false);
  const color = getConceptColor(t, 'key');
  const matchColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer={matched ? 'invoice-processor\'s skills ("extract line items", "flag anomalies") cover exactly what the task needs.' : 'Click "Match capabilities" -- the delegating agent scans published cards for one whose skills actually fit.'}>
      <div style={{ padding: '0.6rem 0.8rem', borderRadius: 7, background: t.surfaceAlt, border: `1px solid ${t.border}`, fontSize: 12, fontStyle: 'italic', color: t.textSecondary, marginBottom: 10 }}>
        Task: &ldquo;{TASK}&rdquo;
      </div>
      <button
        type="button"
        onClick={() => setMatched((m) => !m)}
        style={{ marginBottom: 10, padding: '6px 12px', borderRadius: 6, border: `1px solid ${matchColor}`, background: matched ? `${matchColor}20` : 'transparent', color: matchColor, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
      >
        {matched ? 'Reset' : 'Match capabilities →'}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {AGENTS.map((a) => {
          const highlight = matched && a.match;
          return (
            <div key={a.name} style={{ padding: '0.6rem 0.8rem', borderRadius: 7, background: highlight ? `${matchColor}18` : t.surfaceAlt, border: `1.5px solid ${highlight ? matchColor : t.border}`, opacity: matched && !a.match ? 0.4 : 1 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: highlight ? matchColor : color }}>{a.name} {highlight && '✓'}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{a.skills.join(', ')}</div>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
