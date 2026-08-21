import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

type Kind = 'data' | 'schema';

/** Same row, two different failures -- a value out of range (data test)
 * vs. a column renamed entirely (schema test). Click either. */
export default function SchemaVsDataTestDiagram() {
  const t = useVizTokens();
  const [kind, setKind] = useState<Kind>('schema');
  const dataColor = getConceptColor(t, 'query');
  const schemaColor = getConceptColor(t, 'attention');
  const badColor = t.accentDanger;

  return (
    <VisualizationContainer
      footer={kind === 'data'
        ? 'Data test: the VALUE is out of range (age = -5) -- the column exists, the type is right, but the value itself fails a check.'
        : 'Schema test: the column itself was RENAMED (user_id -> userId) -- every downstream stage that references "user_id" breaks, even though every individual value would have been perfectly valid.'}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div onClick={() => setKind('data')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setKind('data'); } }} onMouseEnter={() => setKind('data')} style={{ flex: 1, cursor: 'pointer', padding: '0.5rem', borderRadius: 7, background: kind === 'data' ? `${dataColor}18` : t.surfaceAlt, border: `1.5px solid ${kind === 'data' ? dataColor : t.border}`, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: kind === 'data' ? dataColor : t.textPrimary }}>Data test</span>
        </div>
        <div onClick={() => setKind('schema')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setKind('schema'); } }} onMouseEnter={() => setKind('schema')} style={{ flex: 1, cursor: 'pointer', padding: '0.5rem', borderRadius: 7, background: kind === 'schema' ? `${schemaColor}18` : t.surfaceAlt, border: `1.5px solid ${kind === 'schema' ? schemaColor : t.border}`, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: kind === 'schema' ? schemaColor : t.textPrimary }}>Schema test</span>
        </div>
      </div>
      <div style={{ padding: '0.7rem 0.9rem', borderRadius: 8, background: t.surfaceAlt, fontFamily: 'monospace', fontSize: 10.5, color: t.textSecondary }}>
        {kind === 'data' ? (
          <span>{'{ '}<span style={{ color: schemaColor }}>user_id</span>: 4471, <span style={{ color: badColor, fontWeight: 700 }}>age: -5</span>{' }'}</span>
        ) : (
          <span>{'{ '}<span style={{ color: badColor, fontWeight: 700 }}>userId</span>: 4471, age: 34{' } '}<span style={{ color: t.textMuted }}>// expected "user_id"</span></span>
        )}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Both catch real bugs -- but different ones, at different layers.
      </div>
    </VisualizationContainer>
  );
}
