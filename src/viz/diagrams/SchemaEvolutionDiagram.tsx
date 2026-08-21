import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

type Change = 'safe' | 'breaking';

/** A downstream consumer, and a schema change -- toggle to see whether
 * it keeps working or breaks, based on whether the new field is optional
 * or required. */
export default function SchemaEvolutionDiagram() {
  const t = useVizTokens();
  const [change, setChange] = useState<Change>('breaking');
  const okColor = t.accentPrimary;
  const badColor = t.accentDanger;
  const color = change === 'safe' ? okColor : badColor;

  return (
    <VisualizationContainer
      footer={change === 'safe'
        ? 'New field added as OPTIONAL -- existing consumers that don\'t know about it keep working unchanged. Backward-compatible.'
        : 'New field added as REQUIRED -- every existing consumer that doesn\'t send it now fails validation. A breaking change, silently rolled out.'}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div onClick={() => setChange('safe')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChange('safe'); } }} onMouseEnter={() => setChange('safe')} style={{ flex: 1, cursor: 'pointer', padding: '0.5rem', borderRadius: 7, background: change === 'safe' ? `${okColor}18` : t.surfaceAlt, border: `1.5px solid ${change === 'safe' ? okColor : t.border}`, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: change === 'safe' ? okColor : t.textPrimary }}>New field: optional</span>
        </div>
        <div onClick={() => setChange('breaking')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChange('breaking'); } }} onMouseEnter={() => setChange('breaking')} style={{ flex: 1, cursor: 'pointer', padding: '0.5rem', borderRadius: 7, background: change === 'breaking' ? `${badColor}18` : t.surfaceAlt, border: `1.5px solid ${change === 'breaking' ? badColor : t.border}`, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: change === 'breaking' ? badColor : t.textPrimary }}>New field: required</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ padding: '0.6rem', borderRadius: 8, background: `${color}12`, border: `1.5px solid ${color}`, textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 10.5, color: t.textMuted }}>Producer (new schema)</div>
        </div>
        <div style={{ fontSize: 14, color }}>→</div>
        <div style={{ padding: '0.6rem', borderRadius: 8, background: `${color}12`, border: `1.5px solid ${color}`, textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color }}>{change === 'safe' ? 'Old consumer: ✓ fine' : 'Old consumer: ✗ breaks'}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        A data contract formalizes exactly this agreement, so this decision is explicit rather than an implicit, easily-broken assumption.
      </div>
    </VisualizationContainer>
  );
}
