import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** The residual/skip connection: the sublayer's input travels straight
 * through (bottom path) AND through the sublayer transform (top path),
 * the two are summed, then LayerNorm normalizes the result. The skip path
 * is what lets gradients flow straight through depth without passing
 * through every sublayer's transformation. */
export default function AddNormDiagram() {
  const t = useVizTokens();
  const subColor = getConceptColor(t, 'attention');
  const width = 420;
  const height = 160;
  const inX = 30;
  const sumX = 260;
  const normX = 340;
  const outX = 400;
  const topY = 40;
  const botY = 120;

  return (
    <VisualizationContainer footer="Post-norm, as in the original paper: LayerNorm(x + Sublayer(x)). The skip connection (bottom path) means depth never forces gradients through a transformation they can't get around.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <circle cx={inX} cy={height / 2} r={16} fill={t.surfaceAlt} stroke={t.textSecondary} strokeWidth={1.5} />
        <text x={inX} y={height / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="monospace" fill={t.textSecondary}>x</text>

        {/* top path: through the sublayer */}
        <path d={`M ${inX + 16},${height / 2} C 80,${topY} 120,${topY} 150,${topY}`} fill="none" stroke={subColor} strokeWidth={2} />
        <rect x={150} y={topY - 18} width={100} height={36} rx={6} fill={`${subColor}22`} stroke={subColor} strokeWidth={2} />
        <text x={200} y={topY + 5} textAnchor="middle" fontSize={11} fontWeight={700} fill={subColor}>Sublayer(x)</text>
        <path d={`M 250,${topY} C ${sumX - 30},${topY} ${sumX - 10},${height / 2 - 12} ${sumX},${height / 2 - 8}`} fill="none" stroke={subColor} strokeWidth={2} />

        {/* bottom path: skip connection */}
        <path d={`M ${inX + 12},${height / 2 + 10} C 80,${botY} ${sumX - 40},${botY} ${sumX},${height / 2 + 8}`} fill="none" stroke={t.textSecondary} strokeWidth={2} strokeDasharray="5 3" />
        <text x={140} y={botY + 16} textAnchor="middle" fontSize={10} fill={t.textMuted}>skip connection</text>

        {/* sum node */}
        <circle cx={sumX} cy={height / 2} r={16} fill={t.surface} stroke={t.textPrimary} strokeWidth={2} />
        <text x={sumX} y={height / 2 + 5} textAnchor="middle" fontSize={16} fontWeight={700} fill={t.textPrimary}>+</text>

        <line x1={sumX + 16} y1={height / 2} x2={normX - 32} y2={height / 2} stroke={t.textPrimary} strokeWidth={2} />

        {/* LayerNorm */}
        <rect x={normX - 32} y={height / 2 - 20} width={72} height={40} rx={6} fill={t.surfaceAlt} stroke={t.accentPrimary} strokeWidth={2} />
        <text x={normX + 4} y={height / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={t.accentPrimary}>LayerNorm</text>

        <line x1={normX + 40} y1={height / 2} x2={outX - 4} y2={height / 2} stroke={t.accentPrimary} strokeWidth={2} markerEnd="url(#addnorm-arrow)" />
        <defs>
          <marker id="addnorm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={t.accentPrimary} />
          </marker>
        </defs>
      </svg>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <VisualizationMath latex="\text{LayerNorm}(x + \text{Sublayer}(x))" />
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Sublayer(x) is self-attention in one Add &amp; Norm, the feed-forward network in the other.
      </div>
    </VisualizationContainer>
  );
}
