import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

const BUILD_STAGE = ['gcc / build-essential', 'dev headers', 'source code', 'compiled binary'];
const RUNTIME_ONLY = ['compiled binary'];

/** Two FROM stages -- the build stage's compilers and dev headers never
 * reach the final image, only the artifact they produced does. Click
 * "copy to final stage" to watch the size actually drop. */
export default function MultiStageBuildDiagram() {
  const t = useVizTokens();
  const [copied, setCopied] = useState(true);
  const buildColor = t.textMuted;
  const finalColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer={copied ? 'Only the compiled binary crosses into the final image -- gcc, dev headers, and all build-time weight stay behind in the discarded build stage.' : 'Both stages exist during the build, but the final image starts from a fresh minimal base -- nothing carries over unless explicitly COPYed.'}>
      <button type="button" onClick={() => setCopied((c) => !c)} style={{ marginBottom: 10, padding: '6px 12px', borderRadius: 6, border: `1px solid ${finalColor}`, background: copied ? `${finalColor}15` : 'transparent', color: finalColor, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 }}>
        {copied ? 'Artifact copied to final stage' : 'Show build stage only'}
      </button>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, padding: '0.7rem', borderRadius: 8, background: t.surfaceAlt, border: `1.5px dashed ${buildColor}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: buildColor, marginBottom: 6 }}>BUILD STAGE (discarded)</div>
          {BUILD_STAGE.map((item) => (
            <div key={item} style={{ fontSize: 10, color: buildColor, padding: '2px 0' }}>{item}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '0.7rem', borderRadius: 8, background: `${finalColor}12`, border: `1.5px solid ${finalColor}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: finalColor, marginBottom: 6 }}>FINAL STAGE (shipped)</div>
          {copied ? RUNTIME_ONLY.map((item) => (
            <div key={item} style={{ fontSize: 10, color: finalColor, padding: '2px 0', fontWeight: 700 }}>{item}</div>
          )) : (
            <div style={{ fontSize: 9.5, color: t.textMuted, fontStyle: 'italic' }}>empty minimal base, nothing copied yet</div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
}
