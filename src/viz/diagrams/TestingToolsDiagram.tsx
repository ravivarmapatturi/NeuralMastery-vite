import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const TOOLS = [
  { key: 'pytest', label: 'pytest', desc: 'The standard Python test runner -- fixtures, parametrized tests, and plugins cover nearly everything in the test-type list above.' },
  { key: 'unittest', label: 'unittest', desc: "Python's built-in test framework -- less ergonomic than pytest, but zero extra dependencies. Still common in older codebases." },
  { key: 'mock', label: 'mock', desc: 'Replace expensive or external dependencies (a real API call, a real database) with a fake stand-in during tests, so tests run fast and don\'t depend on external services being up.' },
  { key: 'locust', label: 'Locust', desc: 'A load-testing tool -- define realistic user behavior in Python, simulate many concurrent users, report latency/throughput/error rate under load.' },
  { key: 'postman', label: 'Postman', desc: "Manual and scripted API testing/exploration -- useful for exploring and documenting an API's actual behavior before automating tests against it." },
];

/** Five tools covering different layers of the test-type list above --
 * click one for what it's actually for. */
export default function TestingToolsDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState('pytest');
  const color = getConceptColor(t, 'attention');
  const x = TOOLS.find((y) => y.key === active)!;

  return (
    <VisualizationContainer footer={x.desc}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {TOOLS.map((y) => {
          const isActive = active === y.key;
          return (
            <div key={y.key} onClick={() => setActive(y.key)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(y.key); } }} onMouseEnter={() => setActive(y.key)} style={{ cursor: 'pointer', padding: '0.5rem 0.7rem', borderRadius: 7, background: isActive ? `${color}18` : t.surfaceAlt, border: `1.5px solid ${isActive ? color : t.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, color: isActive ? color : t.textPrimary }}>{y.label}</span>
            </div>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
