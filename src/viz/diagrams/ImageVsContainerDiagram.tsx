import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** One image, many running containers -- click "run" to spin up
 * independent instances, each with its own isolated filesystem view but
 * sharing the same read-only image underneath (and the host's kernel). */
export default function ImageVsContainerDiagram() {
  const t = useVizTokens();
  const [instances, setInstances] = useState(1);
  const imageColor = getConceptColor(t, 'query');
  const containerColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="A container shares the host's KERNEL (unlike a full VM, which virtualizes hardware and runs its own kernel) -- that's what makes containers so much lighter weight to start and run.">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ padding: '0.8rem 1.4rem', borderRadius: 10, background: `${imageColor}18`, border: `2px solid ${imageColor}`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: imageColor }}>Image</div>
          <div style={{ fontSize: 9.5, color: t.textMuted }}>read-only template, built once</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ width: 2, height: 20, background: i < 1 ? t.textMuted : 'transparent' }} />
          ))}
        </div>
        <button type="button" onClick={() => setInstances((n) => Math.min(5, n + 1))} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${containerColor}`, background: 'transparent', color: containerColor, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
          docker run (+1 instance)
        </button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: instances }, (_, i) => (
            <div key={i} style={{ padding: '0.5rem 0.8rem', borderRadius: 8, background: `${containerColor}18`, border: `1.5px solid ${containerColor}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: containerColor }}>container {i + 1}</div>
              <div style={{ fontSize: 8.5, color: t.textMuted }}>own filesystem view</div>
            </div>
          ))}
        </div>
        {instances > 1 && (
          <button type="button" onClick={() => setInstances(1)} style={{ fontSize: 10, color: t.textMuted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            reset
          </button>
        )}
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 8 }}>
        Every container instance is independent, but all read from the same underlying image -- built once, run many times.
      </div>
    </VisualizationContainer>
  );
}
