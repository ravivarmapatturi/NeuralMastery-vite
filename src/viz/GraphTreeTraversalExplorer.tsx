import { useMemo, useState } from 'react';
import { useVizTokens, SPACING, RADIUS, FONT_FAMILY } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, PillSelect, VisualizationStepController, useStepController } from './primitives';

type Mode = 'graph' | 'tree';
type Algo = 'bfs' | 'dfs';

const DEFAULT_GRAPH = 'A: B, C\nB: A, D\nC: A, D\nD: B, C, E\nE: D';

// --- Graph BFS/DFS -----------------------------------------------------

function parseGraph(text: string): { adj: Record<string, string[]>; order: string[] } {
  const adj: Record<string, string[]> = {};
  const order: string[] = [];
  const seen = new Set<string>();
  const ensure = (id: string) => {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
      adj[id] = adj[id] || [];
    }
  };
  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return;
    const node = trimmed.slice(0, colonIdx).trim();
    if (!node) return;
    ensure(node);
    const neighbors = trimmed
      .slice(colonIdx + 1)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    adj[node] = neighbors;
    neighbors.forEach(ensure);
  });
  return { adj, order };
}

interface GraphStep {
  current: string;
  frontier: string[];
  visitedOrder: string[];
}

function computeBfsSteps(adj: Record<string, string[]>, start: string): GraphStep[] {
  const visited = new Set([start]);
  const queue = [start];
  const order: string[] = [];
  const steps: GraphStep[] = [];
  while (queue.length) {
    const node = queue.shift() as string;
    order.push(node);
    for (const neighbor of adj[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
    steps.push({ current: node, frontier: [...queue], visitedOrder: [...order] });
  }
  return steps;
}

function computeDfsSteps(adj: Record<string, string[]>, start: string): GraphStep[] {
  const visited = new Set<string>();
  const stack = [start];
  const order: string[] = [];
  const steps: GraphStep[] = [];
  while (stack.length) {
    const node = stack.pop() as string;
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    const neighbors = adj[node] || [];
    for (let i = neighbors.length - 1; i >= 0; i -= 1) {
      if (!visited.has(neighbors[i])) stack.push(neighbors[i]);
    }
    steps.push({ current: node, frontier: [...stack], visitedOrder: [...order] });
  }
  return steps;
}

function layoutCircle(ids: string[], cx: number, cy: number, r: number): Record<string, { x: number; y: number }> {
  const n = ids.length;
  const pos: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
    pos[id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return pos;
}

function GraphView({ adj, order, start, algo, step, t }: {
  adj: Record<string, string[]>;
  order: string[];
  start: string;
  algo: Algo;
  step: GraphStep | undefined;
  t: ReturnType<typeof useVizTokens>;
}) {
  const width = 320;
  const height = 240;
  const pos = useMemo(() => layoutCircle(order, width / 2, height / 2, 92), [order]);

  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    const list: [string, string][] = [];
    Object.entries(adj).forEach(([node, neighbors]) => {
      neighbors.forEach((nb) => {
        if (!pos[node] || !pos[nb]) return;
        const key = [node, nb].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          list.push([node, nb]);
        }
      });
    });
    return list;
  }, [adj, pos]);

  const visitedSet = new Set(step?.visitedOrder ?? []);
  const frontierSet = new Set(step?.frontier ?? []);
  const current = step?.current;

  return (
    <div>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}>
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke={t.border} strokeWidth={2} />
        ))}
        {order.map((id) => {
          const p = pos[id];
          const isCurrent = id === current;
          const isVisited = visitedSet.has(id) && !isCurrent;
          const isFrontier = frontierSet.has(id) && !isVisited && !isCurrent;
          let fill = t.surfaceAlt;
          let stroke = t.border;
          if (isCurrent) {
            fill = t.accentPrimary;
            stroke = t.accentPrimary;
          } else if (isVisited) {
            fill = `${t.accentSecondary}33`;
            stroke = t.accentSecondary;
          } else if (isFrontier) {
            fill = `${t.accentWarn}26`;
            stroke = t.accentWarn;
          }
          const isStart = id === start;
          return (
            <g key={id}>
              <circle cx={p.x} cy={p.y} r={18} fill={fill} stroke={stroke} strokeWidth={isCurrent ? 3 : isStart ? 2.5 : 1.5} strokeDasharray={isStart && !isCurrent ? '3 2' : undefined} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={isCurrent ? t.background : t.textPrimary}>
                {id}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: SPACING.xs, fontSize: 13, color: t.textSecondary, fontFamily: 'ui-monospace, monospace' }}>
        {step ? (
          <>
            visiting <strong style={{ color: t.textPrimary }}>{step.current}</strong> -&gt; visited order so far: [{step.visitedOrder.join(', ')}]
            <br />
            {algo === 'bfs' ? 'queue' : 'stack'} now: [{step.frontier.join(', ') || 'empty'}]
          </>
        ) : (
          'No steps -- check the graph text.'
        )}
      </div>
      {algo === 'dfs' && (
        <div style={{ marginTop: 4, fontSize: 12, color: t.textMuted }}>
          Note: DFS marks a node visited when it&apos;s <em>popped</em>, not when pushed — so the stack can (correctly) contain the same node twice; the
          second copy gets skipped when popped. BFS marks visited at enqueue time instead, so its queue never has duplicates. Watch for this difference
          in the {algo === 'dfs' ? 'stack' : 'queue'} contents above.
        </div>
      )}
    </div>
  );
}

// --- Tree: find the LCA --------------------------------------------------

interface TreeNodeSpec {
  id: string;
  x: number;
  y: number;
  left?: string;
  right?: string;
}

const TREE_NODES: Record<string, TreeNodeSpec> = {
  '1': { id: '1', x: 160, y: 24, left: '2', right: '3' },
  '2': { id: '2', x: 95, y: 84, left: '4', right: '5' },
  '3': { id: '3', x: 225, y: 84, right: '6' },
  '4': { id: '4', x: 55, y: 144 },
  '5': { id: '5', x: 135, y: 144 },
  '6': { id: '6', x: 260, y: 144, left: '7' },
  '7': { id: '7', x: 225, y: 204 },
};
const TREE_NODE_IDS = ['1', '2', '3', '4', '5', '6', '7'];

interface LcaStep {
  activePath: string[];
  node: string;
  phase: 'match' | 'visit' | 'combine';
  detail: string;
  result?: string | null;
}

function buildLcaSteps(pId: string, qId: string): { steps: LcaStep[]; finalResult: string | null } {
  const steps: LcaStep[] = [];

  function visit(nodeId: string | undefined, path: string[]): string | null {
    if (nodeId === undefined) return null;
    const curPath = [...path, nodeId];
    if (nodeId === pId || nodeId === qId) {
      steps.push({ activePath: curPath, node: nodeId, phase: 'match', detail: `Node ${nodeId} matches a target -> returns itself immediately, without checking its own children.` });
      return nodeId;
    }
    steps.push({ activePath: curPath, node: nodeId, phase: 'visit', detail: `Visiting node ${nodeId} (not a target) -> recurse into both children.` });
    const node = TREE_NODES[nodeId];
    const left = visit(node.left, curPath);
    const right = visit(node.right, curPath);
    let result: string | null;
    if (left && right) {
      result = nodeId;
      steps.push({ activePath: curPath, node: nodeId, phase: 'combine', detail: `Both children found a target (left=${left}, right=${right}) -> node ${nodeId} is the LCA!`, result });
    } else {
      result = left || right;
      steps.push({
        activePath: curPath,
        node: nodeId,
        phase: 'combine',
        detail: result ? `Only one side found a target (${result}) -> pass it up unchanged.` : 'Neither side found a target -> pass null up.',
        result,
      });
    }
    return result;
  }

  // The root's own return value is the true, final LCA -- not necessarily
  // the node whose OWN combine step set result===itself. When one target is
  // an ancestor of the other, that ancestor returns itself via a 'match'
  // step and is never itself the subject of a "both sides found it" combine
  // -- so the final answer has to be read off the root's return value, not
  // inferred from any single step in isolation.
  const finalResult = visit('1', []);
  return { steps, finalResult };
}

function TreeView({ pId, qId, step, resolved, isLastStep, finalResult, t }: {
  pId: string;
  qId: string;
  step: LcaStep | undefined;
  resolved: Record<string, string | null>;
  isLastStep: boolean;
  finalResult: string | null;
  t: ReturnType<typeof useVizTokens>;
}) {
  const width = 320;
  const height = 230;
  const activeSet = new Set(step?.activePath ?? []);
  const current = step?.node;
  const isFinal = isLastStep && finalResult !== null;

  const edges: [string, string][] = [];
  Object.values(TREE_NODES).forEach((n) => {
    if (n.left) edges.push([n.id, n.left]);
    if (n.right) edges.push([n.id, n.right]);
  });

  return (
    <div>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}>
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={TREE_NODES[a].x} y1={TREE_NODES[a].y} x2={TREE_NODES[b].x} y2={TREE_NODES[b].y} stroke={t.border} strokeWidth={2} />
        ))}
        {TREE_NODE_IDS.map((id) => {
          const n = TREE_NODES[id];
          const isCurrent = id === current;
          const isTheLca = isFinal && id === finalResult;
          const nodeResolved = resolved[id];
          const isTarget = id === pId || id === qId;
          let fill = t.surfaceAlt;
          let stroke = activeSet.has(id) ? t.accentSecondary : t.border;
          if (isTheLca) {
            fill = t.accentPrimary;
            stroke = t.accentPrimary;
          } else if (isCurrent) {
            fill = `${t.accentSecondary}44`;
            stroke = t.accentSecondary;
          } else if (nodeResolved !== undefined) {
            fill = nodeResolved ? `${t.accentSecondary}26` : t.surfaceAlt;
          }
          return (
            <g key={id}>
              <circle cx={n.x} cy={n.y} r={18} fill={fill} stroke={stroke} strokeWidth={isCurrent || isTheLca ? 3 : 1.5} />
              {isTarget && <circle cx={n.x} cy={n.y} r={23} fill="none" stroke={t.accentWarn} strokeWidth={2} strokeDasharray="3 2" />}
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={isTheLca ? t.background : t.textPrimary}>
                {id}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: SPACING.xs, fontSize: 13, color: t.textSecondary }}>
        {step ? step.detail : 'No steps.'}
      </div>
      {isFinal && (
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: t.accentPrimary }}>
          LCA of {pId} and {qId} is node {finalResult}.
        </div>
      )}
    </div>
  );
}

// --- Top-level component --------------------------------------------------

export default function GraphTreeTraversalExplorer() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('graph');

  const [graphText, setGraphText] = useState(DEFAULT_GRAPH);
  const { adj, order } = useMemo(() => parseGraph(graphText), [graphText]);
  const [start, setStart] = useState('A');
  const [algo, setAlgo] = useState<Algo>('bfs');

  const validStart = order.includes(start) ? start : order[0];
  const graphSteps = useMemo(() => {
    if (!validStart || order.length === 0) return [];
    return algo === 'bfs' ? computeBfsSteps(adj, validStart) : computeDfsSteps(adj, validStart);
  }, [adj, order, validStart, algo]);

  const [pId, setPId] = useState('4');
  const [qId, setQId] = useState('5');
  const { steps: lcaSteps, finalResult: lcaFinalResult } = useMemo(() => buildLcaSteps(pId, qId), [pId, qId]);
  const lcaResolved = (uptoIdx: number): Record<string, string | null> => {
    const result: Record<string, string | null> = {};
    for (let i = 0; i <= uptoIdx; i += 1) {
      const s = lcaSteps[i];
      if (!s) break;
      if (s.phase === 'match') result[s.node] = s.node;
      if (s.phase === 'combine') result[s.node] = s.result ?? null;
    }
    return result;
  };

  const totalSteps = mode === 'graph' ? graphSteps.length : lcaSteps.length;
  const controller = useStepController(Math.max(totalSteps, 1), 1100);
  const stepIdx = Math.min(controller.step, Math.max(totalSteps - 1, 0));

  return (
    <VisualizationContainer footer="Both modes run the real algorithm from the linked practice problem, one step at a time -- edit the graph or pick different tree nodes and every step recomputes live.">
      <VisualizationHeader eyebrow="Interactive" title="Graph &amp; Tree Traversal, Step by Step" />

      <PillSelect<Mode>
        label="Structure"
        value={mode}
        onChange={(v) => {
          setMode(v as Mode);
          controller.reset();
        }}
        options={[
          { value: 'graph', label: 'Graph: BFS vs DFS' },
          { value: 'tree', label: 'Tree: Find the LCA' },
        ]}
      />

      {mode === 'graph' ? (
        <>
          <div style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: SPACING.sm }}>
            <label style={{ flex: '1 1 220px', fontSize: 13, color: t.textSecondary }}>
              Adjacency list (one node per line, "NODE: neighbor, neighbor")
              <textarea
                value={graphText}
                onChange={(e) => {
                  setGraphText(e.target.value);
                  controller.reset();
                }}
                rows={5}
                style={{ ...inputStyle(t), fontFamily: 'ui-monospace, monospace', resize: 'vertical' }}
              />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xs, minWidth: 140 }}>
              <label style={{ fontSize: 13, color: t.textSecondary }}>
                Start node
                <select
                  value={validStart}
                  onChange={(e) => {
                    setStart(e.target.value);
                    controller.reset();
                  }}
                  style={inputStyle(t)}
                >
                  {order.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </label>
              <PillSelect<Algo>
                label="Algorithm"
                value={algo}
                onChange={(v) => {
                  setAlgo(v as Algo);
                  controller.reset();
                }}
                options={[
                  { value: 'bfs', label: 'BFS' },
                  { value: 'dfs', label: 'DFS' },
                ]}
              />
            </div>
          </div>
          {order.length === 0 ? (
            <div style={{ fontSize: 13, color: t.accentWarn }}>Enter at least one node, e.g. "A: B, C".</div>
          ) : (
            <GraphView adj={adj} order={order} start={validStart} algo={algo} step={graphSteps[stepIdx]} t={t} />
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: SPACING.sm, marginBottom: SPACING.sm }}>
            <label style={{ fontSize: 13, color: t.textSecondary }}>
              Node p
              <select
                value={pId}
                onChange={(e) => {
                  setPId(e.target.value);
                  controller.reset();
                }}
                style={inputStyle(t)}
              >
                {TREE_NODE_IDS.map((id) => (
                  <option key={id} value={id} disabled={id === qId}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 13, color: t.textSecondary }}>
              Node q
              <select
                value={qId}
                onChange={(e) => {
                  setQId(e.target.value);
                  controller.reset();
                }}
                style={inputStyle(t)}
              >
                {TREE_NODE_IDS.map((id) => (
                  <option key={id} value={id} disabled={id === pId}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <TreeView
            pId={pId}
            qId={qId}
            step={lcaSteps[stepIdx]}
            resolved={lcaResolved(stepIdx)}
            isLastStep={totalSteps > 0 && stepIdx === totalSteps - 1}
            finalResult={lcaFinalResult}
            t={t}
          />
        </>
      )}

      {totalSteps > 0 && (
        <VisualizationStepController controller={controller} totalSteps={totalSteps} stepLabel={(s) => `Step ${s + 1} / ${totalSteps}`} />
      )}
    </VisualizationContainer>
  );
}

function inputStyle(t: ReturnType<typeof useVizTokens>): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    marginTop: 4,
    padding: '6px 10px',
    borderRadius: RADIUS.sm,
    border: `1px solid ${t.border}`,
    background: t.background,
    color: t.textPrimary,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    boxSizing: 'border-box',
  };
}
