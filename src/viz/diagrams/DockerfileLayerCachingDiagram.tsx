import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const GOOD_ORDER = ['FROM python:3.12-slim', 'COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'COPY app/ .', 'CMD ["python", "app.py"]'];
const BAD_ORDER = ['FROM python:3.12-slim', 'COPY app/ .', 'RUN pip install -r requirements.txt', 'CMD ["python", "app.py"]'];

/** Changing application code invalidates every layer AFTER it in the
 * Dockerfile -- ordering rarely-changing layers first keeps the
 * dependency-install layer cached across code changes. Toggle order,
 * simulate an app-code edit, watch which layers actually rebuild. */
export default function DockerfileLayerCachingDiagram() {
  const t = useVizTokens();
  const [order, setOrder] = useState<'good' | 'bad'>('good');
  const [codeChanged, setCodeChanged] = useState(true);
  const cachedColor = getConceptColor(t, 'attention');
  const rebuildColor = t.accentDanger;

  const lines = order === 'good' ? GOOD_ORDER : BAD_ORDER;
  const codeLineIdx = order === 'good' ? 3 : 1;
  const invalidated = (i: number) => codeChanged && i >= codeLineIdx;

  return (
    <VisualizationContainer footer={order === 'good' ? 'Dependencies installed BEFORE app code is copied -- an app-code-only change invalidates just the last 2 layers, the (often slow) pip install layer stays cached.' : 'App code copied BEFORE dependencies are installed -- an app-code-only change invalidates the pip install layer too, forcing a full reinstall on every code edit.'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button type="button" onClick={() => setOrder('good')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: order === 'good' ? 700 : 500, background: order === 'good' ? `${cachedColor}20` : t.surfaceAlt, border: `1.25px solid ${order === 'good' ? cachedColor : t.border}`, color: order === 'good' ? cachedColor : t.textSecondary, cursor: 'pointer' }}>Good order</button>
        <button type="button" onClick={() => setOrder('bad')} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: order === 'bad' ? 700 : 500, background: order === 'bad' ? `${rebuildColor}20` : t.surfaceAlt, border: `1.25px solid ${order === 'bad' ? rebuildColor : t.border}`, color: order === 'bad' ? rebuildColor : t.textSecondary, cursor: 'pointer' }}>Bad order</button>
        <button type="button" onClick={() => setCodeChanged((c) => !c)} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 6, fontSize: 11, background: 'transparent', border: `1.25px solid ${t.border}`, color: t.textSecondary, cursor: 'pointer' }}>{codeChanged ? 'app code: changed' : 'app code: unchanged'}</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 5, background: invalidated(i) ? `${rebuildColor}15` : `${cachedColor}15`, fontFamily: 'monospace', fontSize: 10.5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: invalidated(i) ? rebuildColor : cachedColor, width: 60, flexShrink: 0 }}>{invalidated(i) ? 'REBUILD' : 'cached'}</span>
            <span style={{ color: t.textSecondary }}>{line}</span>
          </div>
        ))}
      </div>
    </VisualizationContainer>
  );
}
