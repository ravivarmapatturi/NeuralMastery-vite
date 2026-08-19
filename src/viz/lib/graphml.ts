// Shared graph + math for the Graph ML Fundamentals diagrams -- one fixed
// toy graph reused across representation/task/embedding diagrams so the
// page reads as one consistent example, plus real node2vec-style biased
// random walk sampling and TransE vector arithmetic.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GraphNode { id: number; x: number; y: number; feature: number }

export const GRAPH_NODES: GraphNode[] = [
  { id: 0, x: 60, y: 40, feature: 0.2 },
  { id: 1, x: 60, y: 120, feature: 0.3 },
  { id: 2, x: 160, y: 80, feature: 0.8 },
  { id: 3, x: 260, y: 80, feature: 0.6 },
  { id: 4, x: 360, y: 80, feature: 0.9 },
];
export const GRAPH_EDGES: [number, number][] = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4]];

export function adjacencyList(edges: [number, number][], n: number): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  return adj.map((row) => row.slice().sort((x, y) => x - y));
}

export function adjacencyMatrix(edges: [number, number][], n: number): number[][] {
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [a, b] of edges) { m[a][b] = 1; m[b][a] = 1; }
  return m;
}

export function commonNeighbors(a: number, b: number, adj: number[][]): number[] {
  const setB = new Set(adj[b]);
  return adj[a].filter((x) => setB.has(x));
}

// --- node2vec-style 2nd-order biased random walk ------------------------
export function biasedRandomWalk(adj: number[][], start: number, length: number, p: number, q: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const walk = [start];
  let prev: number | null = null;
  let curr = start;
  for (let step = 0; step < length; step++) {
    const neighbors = adj[curr];
    if (neighbors.length === 0) break;
    const weights = neighbors.map((x) => {
      if (x === prev) return 1 / p;
      if (prev !== null && adj[prev].includes(x)) return 1;
      return prev === null ? 1 : 1 / q;
    });
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rand() * total;
    let chosen = neighbors[neighbors.length - 1];
    for (let i = 0; i < neighbors.length; i++) {
      r -= weights[i];
      if (r <= 0) { chosen = neighbors[i]; break; }
    }
    prev = curr;
    curr = chosen;
    walk.push(curr);
  }
  return walk;
}

// --- GIN: mean vs. sum neighbor aggregation ------------------------------
export function meanAgg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
export function sumAgg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

// --- TransE: subject + relation ≈ object --------------------------------
export interface Vec2 { x: number; y: number }
export function addVec(a: Vec2, b: Vec2): Vec2 { return { x: a.x + b.x, y: a.y + b.y }; }
export function dist(a: Vec2, b: Vec2): number { return Math.hypot(a.x - b.x, a.y - b.y); }
