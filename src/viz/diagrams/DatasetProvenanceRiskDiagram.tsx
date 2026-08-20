import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const SOURCES = [
  { id: 1, license: 'CC-BY', risky: false },
  { id: 2, license: 'unclear', risky: true },
  { id: 3, license: 'CC-BY-SA', risky: false },
  { id: 4, license: 'scraped, no license', risky: true },
  { id: 5, license: 'public domain', risky: false },
];

/** A dataset published as "open," expanded into its actual
 * constituent sources -- click "inspect provenance" to see the mixed
 * licensing underneath a single top-level "open" label. */
export default function DatasetProvenanceRiskDiagram() {
  const t = useVizTokens();
  const [inspected, setInspected] = useState(true);
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;
  const riskyCount = SOURCES.filter((s) => s.risky).length;

  return (
    <VisualizationContainer footer={inspected ? `${riskyCount} of ${SOURCES.length} constituent sources carry unclear or absent licensing -- training a commercial model on this "open" dataset without checking provenance is a genuine legal risk.` : 'This dataset is published under an "open" label at the top level. Click to inspect what it\'s actually built from.'}>
      <button type="button" onClick={() => setInspected((v) => !v)} style={{ marginBottom: 10, padding: '6px 12px', borderRadius: 6, border: `1px solid ${color}`, background: inspected ? `${color}15` : 'transparent', color, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 }}>
        {inspected ? 'Hide provenance' : 'Inspect provenance'}
      </button>
      {!inspected ? (
        <div style={{ padding: '0.8rem', borderRadius: 8, background: `${okColor}12`, border: `1.5px solid ${okColor}`, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: okColor }}>&ldquo;Open Dataset v2&rdquo;</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SOURCES.map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: 6, background: s.risky ? `${badColor}15` : `${okColor}10` }}>
              <span style={{ fontSize: 9.5, color: t.textSecondary }}>source {s.id}</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: s.risky ? badColor : okColor }}>{s.license}</span>
            </div>
          ))}
        </div>
      )}
    </VisualizationContainer>
  );
}
