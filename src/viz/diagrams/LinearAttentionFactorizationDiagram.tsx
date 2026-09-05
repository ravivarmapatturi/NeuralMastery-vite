import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';
import { RectNode, FlowArrow, ArrowMarker, edgeToEdge, type Box } from './architectureShapes';

/**
 * The one associativity move that makes linear attention linear: standard
 * attention computes (QK^T)V left-to-right, which forces materializing the
 * n x n matrix QK^T before it can ever be multiplied by V. Linear attention
 * replaces the softmax similarity with a kernel feature map phi, which
 * makes the product associative -- so it can instead compute
 * phi(Q)(phi(K)^T V), multiplying phi(K)^T V (a d x d matrix, independent
 * of sequence length) FIRST. The n x n matrix is never built. Box SIZE
 * below is drawn roughly proportional to n=10 vs d=4 (the actual ratio
 * that matters -- attention's real advantage disappears exactly when
 * d << n, i.e. very long sequences relative to head dimension), not to
 * literal scale, so the size difference reads immediately.
 */
export default function LinearAttentionFactorizationDiagram() {
  const t = useVizTokens();
  const bigColor = t.accentDanger;
  const smallColor = getConceptColor(t, 'value');
  const ioColor = getConceptColor(t, 'embedding');
  const outColor = getConceptColor(t, 'output');

  const width = 560;
  const height = 300;
  const panelTop = 46;
  const rowY = panelTop + 20;

  // Left panel: standard attention -- Q -> (QK^T, n x n, BIG) -> Out
  const leftQ: Box = { x: 20, y: rowY + 30, w: 60, h: 34 };
  const leftA: Box = { x: 120, y: rowY, w: 100, h: 100 }; // n x n, drawn big
  const leftOut: Box = { x: 250, y: rowY + 30, w: 60, h: 34 };

  // Right panel: linear attention -- K^T V -> (S, d x d, small) -> phi(Q) -> Out
  const rightKV: Box = { x: 330, y: rowY + 40, w: 70, h: 34 };
  const rightS: Box = { x: 430, y: rowY + 34, w: 46, h: 46 }; // d x d, drawn small
  const rightOut: Box = { x: 500, y: rowY + 30, w: 60, h: 34 };

  const a1 = edgeToEdge(leftQ, leftA);
  const a2 = edgeToEdge(leftA, leftOut);
  const b1 = edgeToEdge(rightKV, rightS);
  const b2 = edgeToEdge(rightS, rightOut);

  const rn = (box: Box) => ({ x: box.x, y: box.y, width: box.w, height: box.h });

  return (
    <VisualizationContainer footer="Same result, opposite multiplication order. Standard attention must build QK^T (n x n) before it can touch V -- that matrix grows with the SQUARE of sequence length. Linear attention's kernel trick makes the product associative, so phi(K)^T V (d x d) is computed first instead -- its size depends only on the feature dimension d, never on sequence length n.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <ArrowMarker id="laf-arrow-big" color={bigColor} />
          <ArrowMarker id="laf-arrow-small" color={smallColor} />
        </defs>

        <text x={20} y={20} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Standard attention: (QK^T)V
        </text>
        <text x={20} y={panelTop - 8} fontSize={9} fill={t.textMuted}>
          compute QK^T first -&gt; forces an n x n matrix into memory
        </text>

        <RectNode {...rn(leftQ)} label="Q" sublabel="n x d" color={ioColor} t={t} />
        <FlowArrow x1={a1.from.x} y1={a1.from.y} x2={a1.to.x} y2={a1.to.y} color={bigColor} markerId="laf-arrow-big" />
        <RectNode {...rn(leftA)} label="QK^T" sublabel="n x n (BIG)" color={bigColor} t={t} strokeWidth={2} />
        <FlowArrow x1={a2.from.x} y1={a2.from.y} x2={a2.to.x} y2={a2.to.y} color={bigColor} markerId="laf-arrow-big" />
        <RectNode {...rn(leftOut)} label="Out" sublabel="n x d" color={outColor} t={t} />

        <line x1={300} y1={10} x2={300} y2={height - 10} stroke={t.border} strokeWidth={1} strokeDasharray="3 4" />

        <text x={320} y={20} fontSize={DIAGRAM_TYPE.label.size} fontWeight={700} fill={t.textPrimary}>
          Linear attention: phi(Q)(phi(K)^T V)
        </text>
        <text x={320} y={panelTop - 8} fontSize={9} fill={t.textMuted}>
          compute phi(K)^T V first -&gt; only a d x d matrix, ever
        </text>

        <RectNode {...rn(rightKV)} label="phi(K)^T V" sublabel="d x n times n x d" color={ioColor} t={t} />
        <FlowArrow x1={b1.from.x} y1={b1.from.y} x2={b1.to.x} y2={b1.to.y} color={smallColor} markerId="laf-arrow-small" />
        <RectNode {...rn(rightS)} label="S" sublabel="d x d" color={smallColor} t={t} strokeWidth={2} />
        <FlowArrow x1={b2.from.x} y1={b2.from.y} x2={b2.to.x} y2={b2.to.y} color={smallColor} markerId="laf-arrow-small" />
        <RectNode {...rn(rightOut)} label="Out" sublabel="n x d" color={outColor} t={t} />

        <text x={20} y={height - 12} fontSize={9} fill={t.textMuted}>
          n = sequence length (grows per request) · d = feature/head dimension (fixed)
        </text>
      </svg>
    </VisualizationContainer>
  );
}
