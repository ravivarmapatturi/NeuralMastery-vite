import { useMemo, useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, Slider } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { matVec2, det2, type Mat2 } from '../lib/linalg';

const GRID_LINES = Array.from({ length: 9 }, (_, i) => i - 4); // -4..4

export default function MatrixTransformationDiagram() {
  const t = useVizTokens();
  const [a11, setA11] = useState(1.4);
  const [a12, setA12] = useState(0.6);
  const [a21, setA21] = useState(0.2);
  const [a22, setA22] = useState(1.1);
  const A: Mat2 = [[a11, a12], [a21, a22]];

  const determinant = useMemo(() => det2(A), [a11, a12, a21, a22]);

  const width = 320, height = 320, scale = 32, ox = width / 2, oy = height / 2;
  const px = (x: number) => ox + x * scale;
  const py = (y: number) => oy - y * scale;

  const e1 = matVec2(A, [1, 0]);
  const e2 = matVec2(A, [0, 1]);

  return (
    <VisualizationContainer footer={`A matrix is a function on vectors -- every point on the grid moved to A·(x,y). det(A) = ${determinant.toFixed(2)}: the area scale factor of the transformation (a unit square now has area |${determinant.toFixed(2)}|). ${Math.abs(determinant) < 0.05 ? 'Near zero -- the grid has collapsed toward a line, exactly what "rank-deficient" looks like geometrically.' : determinant < 0 ? 'Negative -- the transformation flips orientation (like a mirror), on top of scaling.' : ''}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Slider label="A[0][0]" value={a11} onChange={setA11} min={-2} max={2} step={0.1} />
        <Slider label="A[0][1]" value={a12} onChange={setA12} min={-2} max={2} step={0.1} />
        <Slider label="A[1][0]" value={a21} onChange={setA21} min={-2} max={2} step={0.1} />
        <Slider label="A[1][1]" value={a22} onChange={setA22} min={-2} max={2} step={0.1} />
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', marginTop: 8, maxWidth: 320, margin: '8px auto 0' }}>
        {GRID_LINES.map((i) => {
          const p1 = matVec2(A, [i, -4]);
          const p2 = matVec2(A, [i, 4]);
          return <line key={`v${i}`} x1={px(p1[0])} y1={py(p1[1])} x2={px(p2[0])} y2={py(p2[1])} stroke={t.accentSecondary} strokeWidth={i === 0 ? 2 : 0.75} strokeOpacity={i === 0 ? 1 : 0.4} />;
        })}
        {GRID_LINES.map((i) => {
          const p1 = matVec2(A, [-4, i]);
          const p2 = matVec2(A, [4, i]);
          return <line key={`h${i}`} x1={px(p1[0])} y1={py(p1[1])} x2={px(p2[0])} y2={py(p2[1])} stroke={t.accentWarn} strokeWidth={i === 0 ? 2 : 0.75} strokeOpacity={i === 0 ? 1 : 0.4} />;
        })}
        <defs>
          <marker id="mt-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={t.accentPrimary} /></marker>
        </defs>
        <line x1={ox} y1={oy} x2={px(e1[0])} y2={py(e1[1])} stroke={t.accentPrimary} strokeWidth={2.5} markerEnd="url(#mt-arrow)" />
        <line x1={ox} y1={oy} x2={px(e2[0])} y2={py(e2[1])} stroke={t.accentPrimary} strokeWidth={2.5} markerEnd="url(#mt-arrow)" />
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted }}>
        Bold arrows: where the original x-axis and y-axis basis vectors landed -- exactly the two columns of A. Every other grid line is just a combination of those two.
      </div>
    </VisualizationContainer>
  );
}
