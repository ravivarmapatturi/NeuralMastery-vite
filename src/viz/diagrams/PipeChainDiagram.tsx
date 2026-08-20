import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, PlaybackControls } from '../primitives';
import { getConceptColor } from './diagramSystem';

const LOG_LINES = [
  '[epoch 1] loss=2.41',
  '[epoch 1] lr=3e-4',
  '[epoch 2] loss=1.98',
  '[epoch 3] loss=1.62',
  '[epoch 3] warning: grad norm high',
  '[epoch 4] loss=1.35',
];

interface Stage {
  cmd: string;
  output: string[];
  note: string;
}
const STAGES: Stage[] = [
  { cmd: 'cat train.log', output: LOG_LINES, note: 'Full file contents, unfiltered.' },
  { cmd: '| grep "loss"', output: LOG_LINES.filter((l) => l.includes('loss')), note: 'Only lines containing "loss" survive -- grep filters, one line in, zero-or-one lines out (per input line).' },
  { cmd: '| tail -2', output: LOG_LINES.filter((l) => l.includes('loss')).slice(-2), note: 'Of what grep passed through, keep only the last 2 lines.' },
];

export default function PipeChainDiagram() {
  const t = useVizTokens();
  const [step, setStep] = useState(2);
  const color = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer={STAGES[step].note}>
      <PlaybackControls
        playing={false}
        onTogglePlay={() => {}}
        onReset={() => setStep(0)}
        onStepBack={() => setStep((s) => Math.max(0, s - 1))}
        onStepForward={() => setStep((s) => Math.min(STAGES.length - 1, s + 1))}
        disableBack={step === 0}
        disableForward={step === STAGES.length - 1}
      />
      <div style={{ fontFamily: 'monospace', fontSize: 13, margin: '10px 0', color: t.textSecondary }}>
        {STAGES.slice(0, step + 1).map((s) => s.cmd).join(' ')}
      </div>
      <div style={{ background: t.surfaceAlt, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
        {STAGES[step].output.map((line, i) => (
          <div key={i} style={{ color, padding: '2px 0' }}>{line}</div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
