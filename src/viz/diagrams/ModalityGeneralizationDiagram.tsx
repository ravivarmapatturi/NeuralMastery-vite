import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** Same attention block, two different embedding sources feeding it --
 * click a modality to see what actually changes (the tokenizer/patchifier
 * and embedding table) and what doesn't (everything after the embedding). */
export default function ModalityGeneralizationDiagram() {
  const t = useVizTokens();
  const [modality, setModality] = useState<'text' | 'image'>('text');
  const tokenColor = getConceptColor(t, 'token');
  const embColor = getConceptColor(t, 'embedding');
  const attnColor = getConceptColor(t, 'attention');

  const width = 500;
  const height = 130;
  const inX = 60, embX = 200, attnX = 380;

  return (
    <VisualizationContainer
      footer={
        modality === 'text'
          ? 'Text: a BPE tokenizer splits text into subword tokens, each looked up in an embedding table.'
          : 'Image: a vision encoder splits the image into fixed-size patches, each linearly projected into a vector the same shape as a text embedding.'
      }
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {(['text', 'image'] as const).map((m) => (
          <div
            key={m}
            onClick={() => setModality(m)}
            style={{ flex: 1, padding: '6px 12px', borderRadius: 999, textAlign: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: modality === m ? t.accentPrimary : t.surfaceAlt, color: modality === m ? t.background : t.textSecondary }}
          >
            {m === 'text' ? 'Text input' : 'Image input'}
          </div>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="modal-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        <rect x={inX - 40} y={20} width={80} height={30} rx={6} fill={t.surfaceAlt} stroke={tokenColor} strokeWidth={1.5} />
        <text x={inX} y={40} textAnchor="middle" fontSize={9} fill={tokenColor}>{modality === 'text' ? 'BPE tokens' : 'image patches'}</text>
        <line x1={inX + 40} y1={35} x2={embX - 40} y2={35} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#modal-arrow)" />
        <rect x={embX - 40} y={20} width={80} height={30} rx={6} fill={`${embColor}18`} stroke={embColor} strokeWidth={1.5} />
        <text x={embX} y={40} textAnchor="middle" fontSize={9} fill={embColor}>{modality === 'text' ? 'embedding lookup' : 'linear projection'}</text>
        <line x1={embX + 40} y1={35} x2={attnX - 55} y2={35} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#modal-arrow)" />
        <rect x={attnX - 55} y={15} width={110} height={100} rx={8} fill={`${attnColor}18`} stroke={attnColor} strokeWidth={2} />
        <text x={attnX} y={40} textAnchor="middle" fontSize={10} fontWeight={700} fill={attnColor}>Transformer</text>
        <text x={attnX} y={56} textAnchor="middle" fontSize={9} fill={attnColor}>blocks</text>
        <text x={attnX} y={80} textAnchor="middle" fontSize={8} fill={t.textMuted}>(identical</text>
        <text x={attnX} y={92} textAnchor="middle" fontSize={8} fill={t.textMuted}>either way)</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        Toggle modality — only the box before the Transformer changes.
      </div>
    </VisualizationContainer>
  );
}
