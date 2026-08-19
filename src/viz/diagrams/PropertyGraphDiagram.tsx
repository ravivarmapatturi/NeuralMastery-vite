import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE, getConceptColor } from './diagramSystem';

interface GNode {
  id: string;
  label: string;
  type: 'Person' | 'Document';
  props: Record<string, string>;
  x: number;
  y: number;
}
interface GEdge {
  from: string;
  to: string;
  label: string;
  props?: Record<string, string>;
}

const NODES: GNode[] = [
  { id: 'ada', label: 'Ada', type: 'Person', props: { role: 'researcher' }, x: 60, y: 130 },
  { id: 'doc1', label: 'Paper A', type: 'Document', props: { year: '2023' }, x: 220, y: 60 },
  { id: 'doc2', label: 'Paper B', type: 'Document', props: { year: '2024' }, x: 380, y: 130 },
  { id: 'grace', label: 'Grace', type: 'Person', props: { role: 'reviewer' }, x: 220, y: 210 },
];
const EDGES: GEdge[] = [
  { from: 'ada', to: 'doc1', label: 'WROTE', props: { date: '2023-04-02' } },
  { from: 'doc2', to: 'doc1', label: 'CITES' },
  { from: 'grace', to: 'doc2', label: 'WROTE' },
];

const WIDTH = 460;
const HEIGHT = 260;

export default function PropertyGraphDiagram() {
  const t = useVizTokens();
  const [selected, setSelected] = useState<string | null>('ada');
  const node = NODES.find((n) => n.id === selected);

  const personColor = getConceptColor(t, 'query');
  const docColor = getConceptColor(t, 'attention');

  return (
    <VisualizationContainer footer="Click a node to see its properties. Edges carry their own properties too (WROTE has a date) -- both nodes and relationships are first-class, queryable data, not just foreign keys implied by a schema.">
      <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ display: 'block' }}>
        {EDGES.map((e, i) => {
          const from = NODES.find((n) => n.id === e.from)!;
          const to = NODES.find((n) => n.id === e.to)!;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={t.textMuted} strokeWidth={1.5} markerEnd="url(#pg-arrow)" />
              <rect x={midX - 24} y={midY - 10} width={48} height={16} fill={t.surface} />
              <text x={midX} y={midY + 2} textAnchor="middle" fontSize={9} fontWeight={700} fill={t.textSecondary}>
                {e.label}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="pg-arrow" markerWidth="8" markerHeight="8" refX="20" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={t.textMuted} />
          </marker>
        </defs>
        {NODES.map((n) => {
          const color = n.type === 'Person' ? personColor : docColor;
          const isSelected = n.id === selected;
          return (
            <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(n.id)}>
              <circle cx={n.x} cy={n.y} r={isSelected ? 30 : 26} fill={`${color}22`} stroke={color} strokeWidth={isSelected ? 3 : 1.5} />
              <text x={n.x} y={n.y - 2} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
                {n.label}
              </text>
              <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize={8} fill={t.textMuted}>
                :{n.type}
              </text>
            </g>
          );
        })}
      </svg>
      {node && (
        <div style={{ marginTop: 8, fontSize: 13, fontFamily: 'monospace', background: t.surfaceAlt, borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ color: t.textSecondary, marginBottom: 2 }}>
            ({node.label}:{node.type})
          </div>
          {Object.entries(node.props).map(([k, v]) => (
            <div key={k} style={{ color: t.textMuted, fontSize: 12 }}>
              {k}: <span style={{ color: t.textPrimary }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: DIAGRAM_TYPE.secondaryLabel.size, color: t.textMuted, marginTop: 6 }}>
        Nodes: <span style={{ color: personColor }}>■</span> Person &nbsp; <span style={{ color: docColor }}>■</span> Document
      </div>
    </VisualizationContainer>
  );
}
