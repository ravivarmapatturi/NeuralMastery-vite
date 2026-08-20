import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationStepController, useStepController } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { powerIteration, symmetricEigenvalues2, symmetricEigenvector2, type Mat2 } from '../lib/linalg';

const A: Mat2 = [[2, 1], [1, 1.5]];
const START: [number, number] = [1, -0.3];

export default function EigenvectorPowerIterationDiagram() {
  const t = useVizTokens();
  const path = useMemo(() => powerIteration(A, START, 10), []);
  const controller = useStepController(path.length);
  const [eig1] = useMemo(() => symmetricEigenvalues2(A), []);
  const dominantEigenvector = useMemo(() => symmetricEigenvector2(A, eig1), [eig1]);

  const width = 300, height = 300, scale = 90, ox = width / 2, oy = height / 2;
  const px = (x: number) => ox + x * scale;
  const py = (y: number) => oy - y * scale;
  const current = path[controller.step];

  return (
    <VisualizationContainer footer={`Step ${controller.step}: v = (${current[0].toFixed(3)}, ${current[1].toFixed(3)}). Real dominant eigenvalue λ = ${eig1.toFixed(3)}, real eigenvector direction = (${dominantEigenvector[0].toFixed(3)}, ${dominantEigenvector[1].toFixed(3)}). Repeatedly applying A and renormalizing (power iteration, a real algorithm used inside real eigensolvers) converges to this exact direction regardless of the starting vector -- the "natural axis" A doesn't rotate, only scales.`}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: 300, margin: '0 auto' }}>
        <defs>
          <marker id="ev-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={t.accentPrimary} /></marker>
          <marker id="ev-target" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={t.accentSecondary} /></marker>
        </defs>
        {/* dominant eigenvector direction, both ways, dashed */}
        <line x1={px(-dominantEigenvector[0])} y1={py(-dominantEigenvector[1])} x2={px(dominantEigenvector[0])} y2={py(dominantEigenvector[1])} stroke={t.accentSecondary} strokeWidth={1.5} strokeDasharray="4 3" />

        {path.slice(0, controller.step + 1).map((v, i) => (
          <line key={i} x1={ox} y1={oy} x2={px(v[0])} y2={py(v[1])} stroke={t.accentPrimary} strokeWidth={i === controller.step ? 2.5 : 1} strokeOpacity={i === controller.step ? 1 : 0.15} markerEnd={i === controller.step ? 'url(#ev-arrow)' : undefined} />
        ))}
      </svg>
      <VisualizationStepController controller={controller} totalSteps={path.length} stepLabel={(s) => `step ${s}`} />
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 6 }}>
        Dashed line: the real eigenvector direction (computed in closed form). Watch the solid arrow snap onto it within a handful of steps -- this is literally how large-scale eigensolvers (e.g. for PageRank, or PCA on huge covariance matrices) find the dominant direction without ever computing a full eigendecomposition.
      </div>
    </VisualizationContainer>
  );
}
