// Shared math + simulations for the RL Fundamentals / Advanced RL
// diagrams: real value iteration on a toy grid, a real tabular Q-learning
// vs. SARSA training run on the classic Cliff Walking task, and a small
// worked TD-update stepper. Every number these functions return comes
// from actually running the algorithm, not a canned result.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Value iteration on a small deterministic grid ----------------------
export interface VIGrid { rows: number; cols: number; goal: [number, number]; stepReward: number; gamma: number }
export const VI_GRID: VIGrid = { rows: 3, cols: 3, goal: [0, 2], stepReward: -0.04, gamma: 0.9 };

function inBounds(r: number, c: number, g: VIGrid) { return r >= 0 && r < g.rows && c >= 0 && c < g.cols; }
const MOVES: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right

export function valueIterationHistory(g: VIGrid, iterations: number): number[][][] {
  let V: number[][] = Array.from({ length: g.rows }, () => Array(g.cols).fill(0));
  const history: number[][][] = [V.map((row) => row.slice())];
  for (let it = 0; it < iterations; it++) {
    const next: number[][] = V.map((row) => row.slice());
    for (let r = 0; r < g.rows; r++) {
      for (let c = 0; c < g.cols; c++) {
        if (r === g.goal[0] && c === g.goal[1]) { next[r][c] = 0; continue; }
        let best = -Infinity;
        for (const [dr, dc] of MOVES) {
          const nr = r + dr, nc = c + dc;
          const [tr, tc] = inBounds(nr, nc, g) ? [nr, nc] : [r, c];
          const isGoal = tr === g.goal[0] && tc === g.goal[1];
          const reward = isGoal ? 1 : g.stepReward;
          const val = reward + g.gamma * V[tr][tc];
          if (val > best) best = val;
        }
        next[r][c] = best;
      }
    }
    V = next;
    history.push(V.map((row) => row.slice()));
  }
  return history;
}

// --- Cliff Walking: real tabular Q-learning vs. SARSA --------------------
export const CLIFF_ROWS = 4;
export const CLIFF_COLS = 6;
export const CLIFF_START: [number, number] = [3, 0];
export const CLIFF_GOAL: [number, number] = [3, 5];
export function isCliff(r: number, c: number): boolean { return r === 3 && c >= 1 && c <= 4; }

const CLIFF_MOVES: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const N_ACTIONS = 4;
function stateIdx(r: number, c: number): number { return r * CLIFF_COLS + c; }

function step(r: number, c: number, a: number): { r: number; c: number; reward: number; done: boolean } {
  const [dr, dc] = CLIFF_MOVES[a];
  let nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= CLIFF_ROWS || nc < 0 || nc >= CLIFF_COLS) { nr = r; nc = c; }
  if (isCliff(nr, nc)) return { r: CLIFF_START[0], c: CLIFF_START[1], reward: -100, done: false };
  if (nr === CLIFF_GOAL[0] && nc === CLIFF_GOAL[1]) return { r: nr, c: nc, reward: -1, done: true };
  return { r: nr, c: nc, reward: -1, done: false };
}

function epsilonGreedy(Q: number[][], s: number, eps: number, rand: () => number): number {
  if (rand() < eps) return Math.floor(rand() * N_ACTIONS);
  let best = 0;
  for (let a = 1; a < N_ACTIONS; a++) if (Q[s][a] > Q[s][best]) best = a;
  return best;
}

export function trainCliffWalker(method: 'qlearning' | 'sarsa', episodes: number, seed: number) {
  const nStates = CLIFF_ROWS * CLIFF_COLS;
  const Q: number[][] = Array.from({ length: nStates }, () => Array(N_ACTIONS).fill(0));
  const rand = mulberry32(seed);
  const alpha = 0.5, gamma = 1, eps = 0.1;

  for (let ep = 0; ep < episodes; ep++) {
    let [r, c] = CLIFF_START;
    let s = stateIdx(r, c);
    let a = epsilonGreedy(Q, s, eps, rand);
    for (let t = 0; t < 200; t++) {
      const { r: nr, c: nc, reward, done } = step(r, c, a);
      const sNext = stateIdx(nr, nc);
      if (method === 'qlearning') {
        const maxNext = Math.max(...Q[sNext]);
        Q[s][a] += alpha * (reward + gamma * maxNext - Q[s][a]);
      } else {
        const aNext = epsilonGreedy(Q, sNext, eps, rand);
        Q[s][a] += alpha * (reward + gamma * Q[sNext][aNext] - Q[s][a]);
        a = aNext;
      }
      r = nr; c = nc; s = sNext;
      if (done) break;
      if (method === 'qlearning') a = epsilonGreedy(Q, s, eps, rand);
    }
  }
  return Q;
}

/** Greedy rollout from the start under a trained Q-table (no exploration). */
export function greedyRollout(Q: number[][], maxSteps = 30): [number, number][] {
  let [r, c] = CLIFF_START;
  const path: [number, number][] = [[r, c]];
  for (let t = 0; t < maxSteps; t++) {
    const s = stateIdx(r, c);
    let best = 0;
    for (let a = 1; a < N_ACTIONS; a++) if (Q[s][a] > Q[s][best]) best = a;
    const { r: nr, c: nc, done } = step(r, c, best);
    r = nr; c = nc;
    path.push([r, c]);
    if (done) break;
  }
  return path;
}

// --- Worked Q-learning TD update, small corridor MDP ---------------------
export interface CorridorStep { s: number; a: 'left' | 'right'; r: number; sNext: number }
export const CORRIDOR_LENGTH = 4; // states 0..3, 3 is goal
export const CORRIDOR_TRACE: CorridorStep[] = [
  { s: 0, a: 'right', r: -1, sNext: 1 },
  { s: 1, a: 'right', r: -1, sNext: 2 },
  { s: 2, a: 'right', r: 10, sNext: 3 },
  { s: 1, a: 'right', r: -1, sNext: 2 },
  { s: 2, a: 'right', r: 10, sNext: 3 },
];

export function applyTdUpdate(Q: number[][], step: CorridorStep, alpha: number, gamma: number) {
  const aIdx = step.a === 'left' ? 0 : 1;
  const maxNext = Math.max(...Q[step.sNext]);
  const tdError = step.r + gamma * maxNext - Q[step.s][aIdx];
  const newQ = Q[step.s][aIdx] + alpha * tdError;
  return { tdError, newQ, aIdx };
}
