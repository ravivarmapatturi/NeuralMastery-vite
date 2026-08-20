import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VizButton } from '../primitives';
import { getConceptColor } from './diagramSystem';

export default function ProcessVsThreadDiagram() {
  const t = useVizTokens();
  const [mode, setMode] = useState<'process' | 'thread'>('thread');
  const colorA = getConceptColor(t, 'query');
  const colorB = getConceptColor(t, 'key');

  return (
    <VisualizationContainer
      footer={
        mode === 'process'
          ? 'Two processes: each gets its own private memory space, allocated by the OS. Worker A cannot accidentally read or corrupt Worker B\'s variables -- but sharing data between them needs an explicit channel (a pipe, a socket, shared memory), which is slower than just referencing a variable.'
          : 'Two threads inside one process: both directly read and write the exact same memory. Communication is free (just a shared variable) -- but so is corruption, if both threads write to the same variable without coordination (a race condition).'
      }
    >
      <div style={{ marginBottom: 12 }}>
        <VizButton variant={mode === 'process' ? 'primary' : 'secondary'} onClick={() => setMode('process')}>
          Two Processes
        </VizButton>{' '}
        <VizButton variant={mode === 'thread' ? 'primary' : 'secondary'} onClick={() => setMode('thread')}>
          Two Threads
        </VizButton>
      </div>

      {mode === 'process' ? (
        <div style={{ display: 'flex', gap: 20 }}>
          {[{ name: 'Process A', color: colorA }, { name: 'Process B', color: colorB }].map((p) => (
            <div key={p.name} style={{ flex: 1, border: `1.5px solid ${p.color}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 700, color: p.color, marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>private memory space</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, background: t.surfaceAlt, padding: '4px 8px', borderRadius: 4 }}>x = 42</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8 }}>one process, shared memory space</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, background: t.surfaceAlt, padding: '6px 10px', borderRadius: 4, marginBottom: 8, textAlign: 'center' }}>x = 42</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ name: 'Thread A', color: colorA }, { name: 'Thread B', color: colorB }].map((p) => (
              <div key={p.name} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: p.color }}>{p.name}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>reads/writes x directly ↑</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </VisualizationContainer>
  );
}
