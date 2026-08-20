import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PlaybackControls } from '../primitives';
import { getConceptColor } from './diagramSystem';

const STEPS = [
  { code: '@log_calls\ndef train_step(batch):\n    ...', note: 'Source code: a decorator applied to a function definition.' },
  { code: 'train_step = log_calls(train_step)', note: 'What Python actually does: this line is exactly equivalent to the decorator syntax above -- train_step now refers to whatever log_calls() returned.' },
  { code: 'def wrapper(*args, **kwargs):\n    print("calling train_step")\n    return func(*args, **kwargs)\n\ntrain_step = wrapper', note: "log_calls(train_step) returns wrapper, a closure that remembers the original function as 'func' -- train_step is now this wrapper, not the original." },
  { code: 'train_step(my_batch)\n  -> wrapper(my_batch)\n       -> print("calling train_step")\n       -> func(my_batch)  # the original', note: 'Calling train_step(my_batch) now actually calls wrapper() -- which runs its own logic, then calls the original function via the closed-over "func" reference.' },
];

export default function DecoratorMechanismDiagram() {
  const t = useVizTokens();
  const [step, setStep] = useState(0);
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer={STEPS[step].note}>
      <PlaybackControls
        playing={false}
        onTogglePlay={() => {}}
        onReset={() => setStep(0)}
        onStepBack={() => setStep((s) => Math.max(0, s - 1))}
        onStepForward={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        disableBack={step === 0}
        disableForward={step === STEPS.length - 1}
      />
      <div style={{ fontSize: 12, color: t.textMuted, margin: '8px 0 4px' }}>Step {step + 1} of {STEPS.length}</div>
      <pre
        style={{
          background: t.surfaceAlt,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: '12px 16px',
          fontSize: 13,
          fontFamily: 'monospace',
          color: color,
          whiteSpace: 'pre-wrap',
          margin: 0,
        }}
      >
        {STEPS[step].code}
      </pre>
    </VisualizationContainer>
  );
}
