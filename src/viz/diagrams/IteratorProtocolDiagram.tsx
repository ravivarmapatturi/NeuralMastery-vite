import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PlaybackControls } from '../primitives';
import { getConceptColor } from './diagramSystem';

const ITEMS = ['batch 0', 'batch 1', 'batch 2', 'batch 3'];

interface Step {
  call: string;
  activeItem: number | null;
  done: boolean;
}

const STEPS: Step[] = [
  { call: 'for batch in dataloader:', activeItem: null, done: false },
  { call: 'iter(dataloader)  ->  calls __iter__()', activeItem: null, done: false },
  ...ITEMS.flatMap((_, i): Step[] => [{ call: `next(iterator)  ->  calls __next__()  ->  returns "${ITEMS[i]}"`, activeItem: i, done: false }]),
  { call: 'next(iterator)  ->  raises StopIteration  ->  loop ends', activeItem: null, done: true },
];

export default function IteratorProtocolDiagram() {
  const t = useVizTokens();
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="This is the entire mechanism: `for x in obj` is sugar for calling obj.__iter__() once to get an iterator, then calling __next__() on it repeatedly until it raises StopIteration. A PyTorch DataLoader implements exactly this contract -- which is why it can hand your training loop one batch at a time without ever holding the whole dataset in memory.">
      <PlaybackControls
        playing={false}
        onTogglePlay={() => {}}
        onReset={() => setStep(0)}
        onStepBack={() => setStep((x) => Math.max(0, x - 1))}
        onStepForward={() => setStep((x) => Math.min(STEPS.length - 1, x + 1))}
        disableBack={step === 0}
        disableForward={step === STEPS.length - 1}
      />
      <div style={{ fontFamily: 'monospace', fontSize: 13, background: t.surfaceAlt, borderRadius: 8, padding: '10px 14px', margin: '8px 0 12px', color: s.done ? t.accentDanger : color, minHeight: 20 }}>
        {s.call}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {ITEMS.map((item, i) => (
          <div
            key={item}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: s.activeItem === i ? `${color}22` : t.surfaceAlt,
              border: `1.5px solid ${s.activeItem === i ? color : t.border}`,
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: s.activeItem === i ? 700 : 400,
              color: s.activeItem === i ? color : t.textMuted,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
