import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { getConceptColor } from './diagramSystem';

interface Step {
  label: string;
  outcome?: 'ok' | 'error';
}

const NORMAL: Step[] = [
  { label: '__enter__() runs' },
  { label: 'block body runs' },
  { label: 'block finishes normally' },
  { label: '__exit__() runs', outcome: 'ok' },
];
const WITH_EXCEPTION: Step[] = [
  { label: '__enter__() runs' },
  { label: 'block body runs' },
  { label: 'an exception is raised mid-block', outcome: 'error' },
  { label: '__exit__() still runs (guaranteed)', outcome: 'ok' },
];

export default function ContextManagerFlowDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<'normal' | 'exception'>('exception');
  const steps = mode === 'normal' ? NORMAL : WITH_EXCEPTION;
  const okColor = getConceptColor(t, 'attention');
  const errColor = t.accentDanger;

  const colorFor = (o?: Step['outcome']) => (o === 'error' ? errColor : o === 'ok' ? okColor : t.textPrimary);

  return (
    <VisualizationContainer
      footer={
        mode === 'exception'
          ? "This is the entire point of a context manager: __exit__() is guaranteed to run whether the block finished cleanly or blew up partway through. `with open(f) as file:` closes the file either way; `with torch.no_grad():` re-enables gradient tracking either way."
          : 'The clean path: setup, body, teardown, in order. The interesting behavior only shows up once something goes wrong mid-block -- switch to "With Exception" to see it.'
      }
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <VizButton variant={mode === 'normal' ? 'primary' : 'secondary'} onClick={() => setMode('normal')}>
          Normal Completion
        </VizButton>
        <VizButton variant={mode === 'exception' ? 'primary' : 'secondary'} onClick={() => setMode('exception')}>
          With Exception
        </VizButton>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, background: t.surfaceAlt, borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: t.textSecondary }}>
        with resource() as r:{'\n'}    ... work with r ...
      </div>
      <div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderLeft: `2px solid ${t.border}`, paddingLeft: 12, marginLeft: 8 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: t.textMuted, minWidth: 16 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: colorFor(s.outcome), fontWeight: s.outcome ? 700 : 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
