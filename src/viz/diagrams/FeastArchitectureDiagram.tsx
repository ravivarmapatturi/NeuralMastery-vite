import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

/** One feature definition, fanning out to both stores -- click to see
 * the single source of truth that eliminates skew by construction. */
export default function FeastArchitectureDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<'offline' | 'online'>('online');
  const defColor = getConceptColor(t, 'query');
  const offlineColor = t.textMuted;
  const onlineColor = getConceptColor(t, 'attention');
  const width = 480;

  return (
    <VisualizationContainer footer={active === 'offline' ? 'The offline store materializes this same definition into training datasets.' : 'The online store materializes this same definition into low-latency serving values -- defined once, computed once, consistent everywhere.'}>
      <svg width="100%" viewBox={`0 0 ${width} 120`} style={{ display: 'block' }}>
        <defs>
          <marker id="feast-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        <rect x={170} y={10} width={140} height={36} rx={8} fill={`${defColor}25`} stroke={defColor} strokeWidth={2} />
        <text x={240} y={32} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={defColor}>Feature definition</text>

        <line x1={220} y1={46} x2={130} y2={80} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#feast-arrow)" />
        <line x1={260} y1={46} x2={350} y2={80} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#feast-arrow)" />

        <g onClick={() => setActive('offline')} onMouseEnter={() => setActive('offline')} style={{ cursor: 'pointer' }} opacity={active === 'offline' ? 1 : 0.4}>
          <rect x={60} y={82} width={140} height={32} rx={7} fill={active === 'offline' ? `${offlineColor}25` : t.surfaceAlt} stroke={offlineColor} strokeWidth={active === 'offline' ? 2.5 : 1.5} />
          <text x={130} y={102} textAnchor="middle" fontSize={9} fill={t.textPrimary}>Offline store</text>
        </g>
        <g onClick={() => setActive('online')} onMouseEnter={() => setActive('online')} style={{ cursor: 'pointer' }} opacity={active === 'online' ? 1 : 0.4}>
          <rect x={280} y={82} width={140} height={32} rx={7} fill={active === 'online' ? `${onlineColor}25` : t.surfaceAlt} stroke={onlineColor} strokeWidth={active === 'online' ? 2.5 : 1.5} />
          <text x={350} y={102} textAnchor="middle" fontSize={9} fill={onlineColor}>Online store</text>
        </g>
      </svg>
    </VisualizationContainer>
  );
}
