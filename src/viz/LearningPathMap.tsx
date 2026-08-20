import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useVizTokens, RADIUS, FONT_FAMILY, type VizTokens } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader } from './primitives';
import { SECTION_META, SECTION_ORDER, timeEstimate, completionFor, type SectionMetaEntry } from '../data/sectionMeta';
import { useProgress } from '../contexts/ProgressContext';

// The 7 top-level content groups, laid out as ONE single linear path -- there
// is no fork: each group is just the next adjacent step in one sequence.
// Laid out as a left-right switchback so it visibly reads as one path, not a
// plain column.
const COL_X = [40, 420];
const ROW_Y = 170;

const NODE_LAYOUT = SECTION_ORDER.map((key, i) => ({
  key,
  x: COL_X[i % 2],
  y: i * ROW_Y,
}));

const EDGES: [string, string][] = NODE_LAYOUT.slice(1).map((node, i) => [NODE_LAYOUT[i].key, node.key]);

function NodeLabel({ meta, pct, t }: { meta: SectionMetaEntry; pct: number; t: VizTokens }) {
  return (
    <div style={{ textAlign: 'left', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{meta.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, lineHeight: 1.2 }}>{meta.label}</span>
      </div>
      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>{timeEstimate(meta.pageCount)}</div>
      <div style={{ height: 5, borderRadius: 3, background: t.border, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: meta.color, transition: 'width 200ms ease' }} />
      </div>
    </div>
  );
}

export default function LearningPathMap() {
  const t = useVizTokens();
  const { understood } = useProgress();
  const navigate = useNavigate();

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = NODE_LAYOUT.map(({ key, x, y }) => {
      const meta = SECTION_META[key];
      const pct = completionFor(key, understood);
      return {
        id: key,
        position: { x, y },
        data: { label: <NodeLabel meta={meta} pct={pct} t={t} /> },
        style: {
          background: t.surface,
          border: `2px solid ${meta.color}`,
          borderRadius: RADIUS.md,
          fontFamily: FONT_FAMILY,
          padding: 12,
          width: 230,
          boxShadow: t.mode === 'dark' ? '0 4px 14px rgba(0,0,0,0.35)' : '0 4px 14px rgba(20,22,26,0.08)',
          cursor: 'pointer',
        },
      };
    });

    const edges: Edge[] = EDGES.map(([source, target]) => ({
      id: `${source}-${target}`,
      source,
      target,
      style: { stroke: t.edge, strokeWidth: 2 },
      animated: false,
    }));

    return { nodes, edges };
  }, [t, understood]);

  return (
    <VisualizationContainer footer="Each bar reflects your own progress (Mark as understood, tracked locally in your browser — no account). Click any section to go there.">
      <VisualizationHeader eyebrow="Learning Path" title="Where You Are, and What Comes Next" />
      <div style={{ width: '100%', height: 720, border: `1px solid ${t.border}`, borderRadius: RADIUS.md, overflow: 'hidden', background: t.background }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          onNodeClick={(_, node) => navigate(node.id)}
        >
          <Background color={t.border} gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14, fontSize: 13 }}>
        {SECTION_ORDER.map((key) => {
          const meta = SECTION_META[key];
          return (
            <Link key={key} to={key} style={{ color: meta.color, fontWeight: 600, textDecoration: 'none' }}>
              {meta.icon} {meta.label}
            </Link>
          );
        })}
      </div>
    </VisualizationContainer>
  );
}
