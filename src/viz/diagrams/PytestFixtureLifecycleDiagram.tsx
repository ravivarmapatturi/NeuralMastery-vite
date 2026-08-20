import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PlaybackControls } from '../primitives';
import { getConceptColor } from './diagramSystem';

interface Step {
  label: string;
  phase: 'setup' | 'test' | 'teardown';
}

// db_connection has no dependencies; test_dataset depends on db_connection --
// pytest resolves the dependency graph and runs setup in dependency order,
// teardown in exactly the reverse (LIFO) order.
const STEPS: Step[] = [
  { label: 'setup: db_connection (no dependencies)', phase: 'setup' },
  { label: 'setup: test_dataset (depends on db_connection)', phase: 'setup' },
  { label: 'test function runs, using test_dataset', phase: 'test' },
  { label: 'teardown: test_dataset (reverse order)', phase: 'teardown' },
  { label: 'teardown: db_connection (reverse order, last)', phase: 'teardown' },
];

export default function PytestFixtureLifecycleDiagram() {
  const t = useVizTokens();
  const [step, setStep] = useState(2);
  const setupColor = getConceptColor(t, 'attention');
  const testColor = getConceptColor(t, 'query');
  const teardownColor = t.accentWarn;
  const colorFor = (phase: Step['phase']) => (phase === 'setup' ? setupColor : phase === 'test' ? testColor : teardownColor);

  return (
    <VisualizationContainer footer="Fixtures form a dependency graph, not just a list -- test_dataset declares db_connection as a dependency (by naming it as a parameter), so pytest runs db_connection's setup first. Teardown always unwinds in exactly the reverse order setup ran in, the same LIFO discipline as nested context managers or a call stack -- whichever fixture was set up last is torn down first.">
      <PlaybackControls
        playing={false}
        onTogglePlay={() => {}}
        onReset={() => setStep(0)}
        onStepBack={() => setStep((s) => Math.max(0, s - 1))}
        onStepForward={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        disableBack={step === 0}
        disableForward={step === STEPS.length - 1}
      />
      <div style={{ marginTop: 10 }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              padding: '7px 10px',
              borderRadius: 6,
              background: i === step ? `${colorFor(s.phase)}18` : 'transparent',
              opacity: i <= step ? 1 : 0.35,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colorFor(s.phase),
                flexShrink: 0,
              }}
            />
            <div style={{ fontFamily: 'monospace', fontSize: 12.5, color: i === step ? colorFor(s.phase) : t.textSecondary, fontWeight: i === step ? 700 : 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
