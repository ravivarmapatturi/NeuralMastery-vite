import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** Two concurrent "terraform apply" runs against the same
 * infrastructure -- click to see a local state file let both write
 * at once and corrupt state, versus a locked remote backend (S3 +
 * DynamoDB) serialize them safely. */
export default function RemoteStateLockingDiagram() {
  const t = useVizTokens();
  const [remote, setRemote] = useState(true);
  const color = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;
  const okColor = t.accentPrimary;

  return (
    <VisualizationContainer footer={remote ? 'The second apply blocks on the lock held by the first -- it waits, then proceeds safely once the first completes. State stays consistent.' : 'Both CI jobs read the same local state file, apply concurrently, and write back independently -- the second write silently clobbers the first\'s changes, corrupting state.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setRemote(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !remote ? 700 : 500, background: !remote ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!remote ? color : t.border}`, color: !remote ? color : t.textSecondary, cursor: 'pointer' }}>
          Local state file
        </button>
        <button type="button" onClick={() => setRemote(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: remote ? 700 : 500, background: remote ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${remote ? color : t.border}`, color: remote ? color : t.textSecondary, cursor: 'pointer' }}>
          Remote + locked (S3 + DynamoDB)
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.7rem', borderRadius: 7, background: `${okColor}12` }}>
          <span style={{ fontSize: 10.5, color: t.textSecondary }}>CI job A: terraform apply</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: okColor }}>runs</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.7rem', borderRadius: 7, background: remote ? `${t.accentWarn}12` : `${badColor}15` }}>
          <span style={{ fontSize: 10.5, color: t.textSecondary }}>CI job B: terraform apply (same time)</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: remote ? t.accentWarn : badColor }}>{remote ? 'waits for lock' : 'races — corrupts state'}</span>
        </div>
      </div>
    </VisualizationContainer>
  );
}
