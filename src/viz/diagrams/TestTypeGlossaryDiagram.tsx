import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TYPES = [
  { key: 'unit', label: 'Unit', desc: 'Individual functions in isolation -- a data-cleaning function, a feature-computation function, a custom loss function\'s math.' },
  { key: 'integration', label: 'Integration', desc: 'Pieces working together -- does the full preprocessing pipeline correctly feed the model\'s expected input shape?' },
  { key: 'e2e', label: 'End-to-end', desc: 'The entire pipeline (data in, prediction out) on a small fixture dataset -- completes without error, produces reasonable output.' },
  { key: 'regression', label: 'Regression', desc: 'Does a code change accidentally degrade a metric that used to pass -- run against a fixed benchmark, assert performance hasn\'t dropped.' },
  { key: 'data', label: 'Data validation', desc: 'Incoming data matches expected schema, ranges, and types before it reaches the model.' },
  { key: 'model', label: 'Model', desc: 'Beyond accuracy -- graceful handling of empty input, determinism where expected, correct behavior on a known adversarial edge case.' },
  { key: 'api', label: 'API', desc: 'Does the serving endpoint return the correct schema, correct status codes, and handle malformed requests without crashing.' },
  { key: 'load', label: 'Load', desc: 'Does the serving endpoint hold up under realistic/peak concurrent request volume -- what\'s the latency distribution under load.' },
];

/** Eight layers of ML system testing -- click one for what it
 * actually checks. "Correct" isn't just "matches an exact expected
 * value" when a model's output is expected to vary. */
export default function TestTypeGlossaryDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('data');
  const color = getConceptColor(t, 'attention');
  const x = TYPES.find((y) => y.key === active)!;

  return (
    <VisualizationContainer footer={x.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {TYPES.map((y) => {
          const isActive = active === y.key;
          return (
            <div key={y.key} onClick={() => setActive(y.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(y.key); } }} onMouseEnter={() => setActive(y.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{y.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
