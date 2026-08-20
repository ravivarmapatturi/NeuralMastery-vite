import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** A model that "works" in a notebook -- click to see the implicit
 * state that makes it fragile, versus what an explicit pipeline
 * module removes. */
export default function NotebookVsPipelineDiagram() {
  const t = useVizTokens();
  const [pipeline, setPipeline] = useState(false);
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;

  const NOTEBOOK_ISSUES = ['Cell execution order matters', 'Global variable set 3 cells up', 'Package version installed by hand', 'Works only on this one kernel session'];
  const PIPELINE_FIXES = ['Deterministic top-to-bottom execution', 'Explicit function arguments, no hidden globals', 'Pinned in a lockfile', 'Runs identically on any machine'];

  return (
    <VisualizationContainer footer={pipeline ? 'None of this is implicit anymore -- a second person, a second machine, or six months later gets the same behavior.' : 'None of this survives contact with a second person, a second machine, or six months of time passing.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setPipeline(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !pipeline ? 700 : 500, background: !pipeline ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!pipeline ? color : t.border}`, color: !pipeline ? color : t.textSecondary, cursor: 'pointer' }}>
          Notebook
        </button>
        <button type="button" onClick={() => setPipeline(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: pipeline ? 700 : 500, background: pipeline ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${pipeline ? color : t.border}`, color: pipeline ? color : t.textSecondary, cursor: 'pointer' }}>
          Explicit pipeline module
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(pipeline ? PIPELINE_FIXES : NOTEBOOK_ISSUES).map((s) => (
          <div key={s} style={{ padding: '0.4rem 0.65rem', borderRadius: 6, background: pipeline ? `${okColor}12` : `${badColor}12`, fontSize: 10, color: t.textSecondary }}>{s}</div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
