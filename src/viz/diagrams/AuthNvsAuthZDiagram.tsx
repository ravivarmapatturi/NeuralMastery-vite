import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Stage = 'authn' | 'authz';

/** Two different questions, two different failure modes -- a system can
 * authenticate perfectly and still be broken if authorization is missing.
 * Click either stage. */
export default function AuthNvsAuthZDiagram() {
  const t = useVizTokens();
  const [active, setActive] = useState<Stage>('authz');
  const authnColor = getConceptColor(t, 'query');
  const authzColor = getConceptColor(t, 'attention');
  const width = 560;
  const height = 130;

  return (
    <VisualizationContainer
      footer={
        active === 'authn'
          ? 'Authentication: "who are you?" -- established via an API key, password, or signed token, BEFORE anything else happens.'
          : 'Authorization: "what are you allowed to do?" -- a SEPARATE decision made after identity is known. A logged-in user can be authorized to read but not delete, or scoped to only their own data.'
      }
    >
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="aa-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        <text x={30} y={30} fontSize={11} fill={t.textMuted}>Request arrives</text>
        <line x1={140} y1={26} x2={190} y2={26} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#aa-arrow)" />

        <g onClick={() => setActive('authn')} onMouseEnter={() => setActive('authn')} style={{ cursor: 'pointer' }} opacity={active === 'authn' ? 1 : 0.4}>
          <rect x={190} y={10} width={130} height={36} rx={8} fill={active === 'authn' ? `${authnColor}30` : t.surfaceAlt} stroke={authnColor} strokeWidth={active === 'authn' ? 2.5 : 1.5} />
          <text x={255} y={32} textAnchor="middle" fontSize={10} fontWeight={700} fill={authnColor}>Authentication</text>
        </g>

        <line x1={320} y1={26} x2={370} y2={26} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#aa-arrow)" />

        <g onClick={() => setActive('authz')} onMouseEnter={() => setActive('authz')} style={{ cursor: 'pointer' }} opacity={active === 'authz' ? 1 : 0.4}>
          <rect x={370} y={10} width={130} height={36} rx={8} fill={active === 'authz' ? `${authzColor}30` : t.surfaceAlt} stroke={authzColor} strokeWidth={active === 'authz' ? 2.5 : 1.5} />
          <text x={435} y={32} textAnchor="middle" fontSize={10} fontWeight={700} fill={authzColor}>Authorization</text>
        </g>

        <line x1={500} y1={26} x2={540} y2={26} stroke={t.accentPrimary} strokeWidth={1.5} markerEnd="url(#aa-arrow)" />
        <text x={545} y={30} fontSize={10} fill={t.accentPrimary}>OK</text>

        <text x={255} y={65} textAnchor="middle" fontSize={9} fill={authnColor}>"who are you?"</text>
        <text x={435} y={65} textAnchor="middle" fontSize={9} fill={authzColor}>"what can you do?"</text>

        <text x={30} y={100} fontSize={9} fill={t.textMuted} width={500}>A system can authenticate perfectly and still be badly broken if authorization is missing --</text>
        <text x={30} y={114} fontSize={9} fill={t.textMuted}>e.g. any logged-in user able to delete any OTHER user's data.</text>
      </svg>
    </VisualizationContainer>
  );
}
