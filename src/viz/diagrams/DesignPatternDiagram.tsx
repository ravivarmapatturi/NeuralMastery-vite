import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Pattern = 'strategy' | 'factory' | 'observer' | 'decorator';

const PATTERNS: Record<Pattern, { name: string; code: string; note: string }> = {
  strategy: {
    name: 'Strategy',
    code: 'training_loop(model, optimizer: Optimizer)\n  optimizer.step()  # SGD, Adam, AdamW -- any implementation',
    note: 'The training loop only depends on the Optimizer interface, never a specific implementation -- which is exactly why swapping SGD for Adam is a one-line change.',
  },
  factory: {
    name: 'Factory',
    code: 'build_model(config) -> Model\n  # returns the right architecture based on config.yaml',
    note: '"Swap the model by changing one YAML value" only works because construction is centralized in one function, not scattered SomeClass(...) calls everywhere.',
  },
  observer: {
    name: 'Observer',
    code: 'trainer.on_epoch_end(callback)\n  # callback fires; trainer never inspects what it does',
    note: 'The event source (the trainer) doesn\'t know or care what a callback does with the notification -- logging, checkpointing, early stopping can all subscribe independently.',
  },
  decorator: {
    name: 'Decorator',
    code: '@torch.no_grad()\ndef predict(x):\n  ...',
    note: 'predict() runs without gradient tracking, without predict() itself needing to know anything about gradients at all -- behavior added from outside, not by modifying the function.',
  },
};

export default function DesignPatternDiagram() {
  const t = useVizTokens();
  const [pattern, setPattern] = useState<Pattern>('strategy');
  const info = PATTERNS[pattern];
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer={info.note}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(Object.keys(PATTERNS) as Pattern[]).map((p) => (
          <VizButton key={p} variant={pattern === p ? 'primary' : 'secondary'} onClick={() => setPattern(p)}>
            {PATTERNS[p].name}
          </VizButton>
        ))}
      </div>
      <pre style={{ background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 8, padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color, margin: 0, whiteSpace: 'pre-wrap' }}>
        {info.code}
      </pre>
    </VisualizationContainer>
  );
}
