import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

/** A candidate model scored against a fixed benchmark -- drag its
 * accuracy and watch the gate actually flip between pass and block. */
export default function ModelRegressionGateDiagram() {
  const t = useVizTokens();
  const [candidateAcc, setCandidateAcc] = useState(91.5);
  const prodAcc = 92.0;
  const okColor = t.accentPrimary;
  const blockColor = t.accentDanger;
  const passes = candidateAcc >= prodAcc;
  const color = passes ? okColor : blockColor;

  return (
    <VisualizationContainer footer={passes ? `Candidate (${candidateAcc.toFixed(1)}%) beats production (${prodAcc.toFixed(1)}%) on the fixed benchmark -- pipeline proceeds to registration and deployment.` : `Candidate (${candidateAcc.toFixed(1)}%) is BELOW production (${prodAcc.toFixed(1)}%) -- the pipeline stops here automatically. No human has to notice and block it manually.`}>
      <Slider label={`Candidate model accuracy: ${candidateAcc.toFixed(1)}%`} min={88} max={95} step={0.1} value={candidateAcc} onChange={setCandidateAcc} />
      <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: (prodAcc - 85) * 8, background: t.textMuted, opacity: 0.5, borderRadius: 6 }} />
          <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 4 }}>Production: {prodAcc.toFixed(1)}%</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ height: (candidateAcc - 85) * 8, background: color, opacity: 0.75, borderRadius: 6 }} />
          <div style={{ fontSize: 10.5, color, marginTop: 4, fontWeight: 700 }}>Candidate: {candidateAcc.toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color, fontWeight: 700, marginTop: 10 }}>
        {passes ? '✓ gate passes -- pipeline continues' : '✗ gate blocks -- pipeline stops here'}
      </div>
    </VisualizationContainer>
  );
}
