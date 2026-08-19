import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer, VisualizationMath } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';

/** Two linear layers with a ReLU between -- applied identically and
 * independently to every position. The bar widths are drawn to scale
 * (512 -> 2048 -> 512) so the "expand then contract" shape is visible,
 * not just stated. */
export default function FeedForwardDiagram() {
  const t = useVizTokens();
  const width = 460;
  const height = 150;
  const barCenterY = 60;
  const inW = 16;
  const midW = 64;
  const outW = 16;
  const stageX = [40, 220, 400];

  function Bar({ x, w, label, sub }: { x: number; w: number; label: string; sub: string }) {
    return (
      <g>
        <rect x={x - w / 2} y={barCenterY - w / 2} width={w} height={w} rx={4} fill={t.accentSecondary} fillOpacity={0.18} stroke={t.accentSecondary} strokeWidth={2} />
        <text x={x} y={barCenterY + w / 2 + 20} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="monospace" fill={t.textPrimary}>{label}</text>
        <text x={x} y={barCenterY + w / 2 + 34} textAnchor="middle" fontSize={10} fill={t.textMuted}>{sub}</text>
      </g>
    );
  }

  return (
    <VisualizationContainer footer="Applied identically and independently to every position -- attention is the only place information mixes across tokens; the FFN is a per-token transform, run 512-wide -> 2048-wide -> 512-wide.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <Bar x={stageX[0]} w={inW * 2.2} label="x" sub="512" />
        <line x1={stageX[0] + inW * 1.1 + 10} y1={barCenterY} x2={stageX[1] - midW / 2 - 40} y2={barCenterY} stroke={t.textSecondary} strokeWidth={2} markerEnd="url(#ffn-arrow)" />
        <text x={(stageX[0] + stageX[1]) / 2 - 10} y={barCenterY - 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={t.textMuted}>W₁, b₁</text>

        <Bar x={stageX[1]} w={midW} label="ReLU(xW₁+b₁)" sub="2048" />
        <line x1={stageX[1] + midW / 2 + 30} y1={barCenterY} x2={stageX[2] - inW * 1.1 - 10} y2={barCenterY} stroke={t.textSecondary} strokeWidth={2} markerEnd="url(#ffn-arrow)" />
        <text x={(stageX[1] + stageX[2]) / 2 + 10} y={barCenterY - 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={t.textMuted}>W₂, b₂</text>

        <Bar x={stageX[2]} w={outW * 2.2} label="output" sub="512" />

        <defs>
          <marker id="ffn-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={t.textSecondary} />
          </marker>
        </defs>
      </svg>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <VisualizationMath latex="\text{FFN}(x) = \max(0, xW_1+b_1)W_2+b_2" />
      </div>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Bar sizes are to scale: 512 -&gt; 2048 -&gt; 512.
      </div>
    </VisualizationContainer>
  );
}
