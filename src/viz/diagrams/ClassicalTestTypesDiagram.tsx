import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TYPES = [
  { key: 'unit', label: 'Unit', desc: 'Individual functions in isolation -- a feature-computation function, a custom loss function\'s math.' },
  { key: 'data', label: 'Data', desc: 'Incoming data matches expected schema, types, ranges.' },
  { key: 'schema', label: 'Schema', desc: 'The SHAPE of the data matches a contract exactly -- catches a renamed column before it silently breaks downstream.' },
  { key: 'statistical', label: 'Statistical', desc: 'Properties of a DISTRIBUTION, not a single value -- PSI/KS drift math, run as an automated test.' },
  { key: 'model', label: 'Model', desc: 'Behavior on a known edge case, graceful handling of malformed input, determinism when expected.' },
  { key: 'regression', label: 'Regression', desc: 'Fixed benchmark, metrics haven\'t dropped below threshold.' },
  { key: 'performance', label: 'Performance', desc: 'Completes within an acceptable time/resource budget -- accuracy-focused testing alone won\'t catch this.' },
];

/** All 7 classical ML test types, click one for what it actually
 * checks. */
export default function ClassicalTestTypesDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('statistical');
  const color = getConceptColor(t, 'attention');
  const info = TYPES.find((x) => x.key === active)!;

  return (
    <VisualizationContainer footer={info.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {TYPES.map((x) => {
          const isActive = active === x.key;
          return (
            <div key={x.key} onClick={() => setActive(x.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(x.key); } }} onMouseEnter={() => setActive(x.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.8rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{x.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
