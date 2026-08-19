import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

/** MCP is usually deployed by one team (client + server together). A2A has
 * to survive the harder case: two orgs, two frameworks, two different
 * underlying models, neither side has seen the other's code -- click
 * either side to see what stays hidden vs. what's shared via A2A. */
export default function CrossOrgInteropDiagram() {
  const t = useVizTokens();
  const [side, setSide] = useState<'a' | 'b'>('a');
  const colorA = getConceptColor(t, 'query');
  const colorB = getConceptColor(t, 'key');
  const width = 560;
  const height = 160;

  return (
    <VisualizationContainer footer="Click either box -- its internals (framework, model, orchestration) stay completely private. Only the agent card and A2A task protocol cross the boundary.">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        <defs>
          <marker id="coi-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={t.textMuted} />
          </marker>
        </defs>
        <g onClick={() => setSide('a')} onMouseEnter={() => setSide('a')} style={{ cursor: 'pointer' }}>
          <rect x={20} y={20} width={190} height={100} rx={10} fill={side === 'a' ? `${colorA}18` : t.surfaceAlt} stroke={colorA} strokeWidth={side === 'a' ? 2.5 : 1.5} />
          <text x={115} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill={colorA}>Org A's Agent</text>
          <text x={115} y={62} textAnchor="middle" fontSize={9} fill={t.textMuted}>Framework: LangGraph</text>
          <text x={115} y={78} textAnchor="middle" fontSize={9} fill={t.textMuted}>Model: Claude</text>
          <text x={115} y={94} textAnchor="middle" fontSize={9} fill={t.textMuted}>(all private)</text>
        </g>
        <g onClick={() => setSide('b')} onMouseEnter={() => setSide('b')} style={{ cursor: 'pointer' }}>
          <rect x={350} y={20} width={190} height={100} rx={10} fill={side === 'b' ? `${colorB}18` : t.surfaceAlt} stroke={colorB} strokeWidth={side === 'b' ? 2.5 : 1.5} />
          <text x={445} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill={colorB}>Org B's Agent</text>
          <text x={445} y={62} textAnchor="middle" fontSize={9} fill={t.textMuted}>Framework: custom</text>
          <text x={445} y={78} textAnchor="middle" fontSize={9} fill={t.textMuted}>Model: in-house</text>
          <text x={445} y={94} textAnchor="middle" fontSize={9} fill={t.textMuted}>(all private)</text>
        </g>
        <line x1={210} y1={70} x2={350} y2={70} stroke={t.accentPrimary} strokeWidth={2} markerEnd="url(#coi-arrow)" />
        <line x1={350} y1={85} x2={210} y2={85} stroke={t.accentPrimary} strokeWidth={2} strokeDasharray="3 2" markerEnd="url(#coi-arrow)" />
        <text x={280} y={55} textAnchor="middle" fontSize={9} fontWeight={700} fill={t.accentPrimary}>A2A</text>
        <text x={280} y={135} textAnchor="middle" fontSize={8.5} fill={t.textMuted}>only agent card + task protocol cross this line</text>
      </svg>
      <div style={{ textAlign: 'center', fontSize: DIAGRAM_TYPE.caption.size, color: t.textMuted, marginTop: 4 }}>
        The case MCP doesn't need to solve: an MCP server/client pair is usually deployed by the same team.
      </div>
    </VisualizationContainer>
  );
}
