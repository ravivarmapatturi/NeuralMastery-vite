import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** A plain block versus a residual block -- click to see why
 * y = F(x) + x lets a block default to the identity function when
 * added depth isn't helping, solving the degradation problem. */
export default function ResNetSkipConnectionDiagram() {
  const t = useVizTokens();
  const [residual, setResidual] = useState(true);
  const color = getConceptColor(t, 'attention');
  const okColor = t.accentPrimary;
  const badColor = t.accentDanger;

  return (
    <VisualizationContainer footer={residual ? 'If F(x) learns to output ~0, the block just passes x through unchanged -- depth can never make things WORSE than a shallower network, because every added block can fall back to identity.' : 'A plain block must learn a useful transformation to avoid hurting accuracy -- with enough stacked plain blocks, very deep plain networks get WORSE, not just harder to train (the degradation problem).'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button type="button" onClick={() => setResidual(false)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: !residual ? 700 : 500, background: !residual ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${!residual ? color : t.border}`, color: !residual ? color : t.textSecondary, cursor: 'pointer' }}>
          Plain block
        </button>
        <button type="button" onClick={() => setResidual(true)} style={{ flex: 1, padding: '6px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: residual ? 700 : 500, background: residual ? `${color}20` : t.surfaceAlt, border: `1.25px solid ${residual ? color : t.border}`, color: residual ? color : t.textSecondary, cursor: 'pointer' }}>
          Residual block
        </button>
      </div>
      <svg width="100%" viewBox="0 0 280 110" style={{ display: 'block' }}>
        <rect x={20} y={10} width={60} height={20} rx={5} fill={t.surfaceAlt} stroke={t.border} />
        <text x={50} y={24} textAnchor="middle" fontSize={9} fill={t.textPrimary}>x (input)</text>
        <line x1={50} y1={30} x2={50} y2={50} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#rnarrow)" />
        <rect x={20} y={50} width={60} height={20} rx={5} fill={`${color}18`} stroke={color} />
        <text x={50} y={64} textAnchor="middle" fontSize={9} fill={color}>F(x)</text>
        {residual && (
          <path d="M 15,20 C -15,20 -15,80 15,80" fill="none" stroke={okColor} strokeWidth={1.5} />
        )}
        <line x1={50} y1={70} x2={50} y2={90} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#rnarrow)" />
        <rect x={140} y={40} width={80} height={30} rx={6} fill={residual ? `${okColor}18` : `${badColor}12`} stroke={residual ? okColor : badColor} strokeWidth={1.5} />
        <text x={180} y={59} textAnchor="middle" fontSize={9} fontWeight={700} fill={residual ? okColor : badColor}>{residual ? 'y = F(x) + x' : 'y = F(x)'}</text>
        <line x1={80} y1={55} x2={140} y2={55} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#rnarrow)" />
        <defs>
          <marker id="rnarrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={t.textMuted} />
          </marker>
        </defs>
      </svg>
    </VisualizationContainer>
  );
}
