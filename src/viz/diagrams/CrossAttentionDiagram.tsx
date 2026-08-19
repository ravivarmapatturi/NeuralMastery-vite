import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Self-attention draws Q, K, V from the same source; cross-attention draws
 * Q from the decoder's own (masked) self-attention output, but K and V from
 * the encoder's output -- the one wiring that lets the decoder pull
 * information from the input sequence at every generation step. */
export default function CrossAttentionDiagram() {
  const t = useVizTokens();
  const qColor = getConceptColor(t, 'query');
  const kColor = getConceptColor(t, 'key');
  const vColor = getConceptColor(t, 'value');
  const attnColor = getConceptColor(t, 'attention');

  const panelW = 280;
  const panelH = 170;

  function Panel({ title, qFrom, kvFrom, crossWire }: { title: string; qFrom: string; kvFrom: string; crossWire: boolean }) {
    const srcX = 40;
    const srcY = panelH / 2;
    const attnX = panelW - 60;
    return (
      <div style={{ flex: '1 1 260px', minWidth: 240 }}>
        <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.label.size, fontWeight: DIAGRAM_TYPE.label.weight, color: t.textPrimary, marginBottom: 6 }}>{title}</div>
        <svg width="100%" viewBox={`0 0 ${panelW} ${panelH}`} style={{ display: 'block' }}>
          {crossWire ? (
            <>
              <rect x={srcX - 32} y={20} width={64} height={30} rx={5} fill={t.surfaceAlt} stroke={t.textSecondary} strokeWidth={1.5} />
              <text x={srcX} y={40} textAnchor="middle" fontSize={10} fontWeight={700} fill={t.textSecondary}>decoder</text>
              <rect x={srcX - 32} y={panelH - 50} width={64} height={30} rx={5} fill={t.surfaceAlt} stroke={t.accentSecondary} strokeWidth={1.5} />
              <text x={srcX} y={panelH - 30} textAnchor="middle" fontSize={10} fontWeight={700} fill={t.accentSecondary}>encoder</text>

              <line x1={srcX + 32} y1={35} x2={attnX - 45} y2={srcY - 24} stroke={qColor} strokeWidth={2} />
              <text x={(srcX + attnX) / 2 - 20} y={srcY - 40} textAnchor="middle" fontSize={11} fontWeight={700} fill={qColor}>Q</text>

              <line x1={srcX + 32} y1={panelH - 35} x2={attnX - 45} y2={srcY + 12} stroke={kColor} strokeWidth={2} />
              <text x={(srcX + attnX) / 2 - 20} y={panelH - 42} textAnchor="middle" fontSize={11} fontWeight={700} fill={kColor}>K</text>

              <line x1={srcX + 32} y1={panelH - 25} x2={attnX - 45} y2={srcY + 20} stroke={vColor} strokeWidth={2} />
              <text x={(srcX + attnX) / 2 + 30} y={panelH - 18} textAnchor="middle" fontSize={11} fontWeight={700} fill={vColor}>V</text>
            </>
          ) : (
            <>
              <circle cx={srcX} cy={srcY} r={28} fill={t.surfaceAlt} stroke={t.textSecondary} strokeWidth={1.5} />
              <text x={srcX} y={srcY + 4} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="monospace" fill={t.textSecondary}>X</text>

              <line x1={srcX + 28} y1={srcY - 14} x2={attnX - 45} y2={srcY - 24} stroke={qColor} strokeWidth={2} />
              <text x={(srcX + attnX) / 2} y={srcY - 34} textAnchor="middle" fontSize={11} fontWeight={700} fill={qColor}>Q</text>
              <line x1={srcX + 28} y1={srcY} x2={attnX - 45} y2={srcY} stroke={kColor} strokeWidth={2} />
              <text x={(srcX + attnX) / 2} y={srcY - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill={kColor}>K</text>
              <line x1={srcX + 28} y1={srcY + 14} x2={attnX - 45} y2={srcY + 24} stroke={vColor} strokeWidth={2} />
              <text x={(srcX + attnX) / 2} y={srcY + 38} textAnchor="middle" fontSize={11} fontWeight={700} fill={vColor}>V</text>
            </>
          )}

          <circle cx={attnX} cy={srcY} r={30} fill={`${attnColor}22`} stroke={attnColor} strokeWidth={2} />
          <text x={attnX} y={srcY - 2} textAnchor="middle" fontSize={10} fontWeight={700} fill={attnColor}>Attn</text>
          <text x={attnX} y={srcY + 12} textAnchor="middle" fontSize={9} fill={t.textMuted}>(Q,K,V)</text>
        </svg>
        <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 2 }}>
          Q from {qFrom}, K &amp; V from {kvFrom}
        </div>
      </div>
    );
  }

  return (
    <VisualizationContainer footer="Everything else about the attention computation -- QK^T, scale, softmax, weighted sum of V -- is identical between the two. The only thing that changes is where K and V come from.">
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Panel title="SELF-ATTENTION" qFrom="X" kvFrom="the same X" crossWire={false} />
        <Panel title="CROSS-ATTENTION" qFrom="the decoder" kvFrom="the encoder's output" crossWire />
      </div>
    </VisualizationContainer>
  );
}
