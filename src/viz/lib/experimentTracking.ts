// Shared math for the Experiment Tracking diagram: real gradient descent
// runs at different learning rates on a simple convex loss L(w) = (w-w*)^2,
// so "this run diverged" / "this run converged slowly" / "this run was
// fastest" are genuine outcomes of the update rule, not scripted curves.

const TARGET = 5; // w*
const START = 0; // w0
const STEPS = 25;

export interface Run {
  id: string;
  lr: number;
  batchSize: number;
  lossCurve: number[]; // one entry per step
  finalLoss: number;
  diverged: boolean;
}

function loss(w: number): number {
  return (w - TARGET) ** 2;
}

function gradientDescentRun(lr: number, steps: number): number[] {
  let w = START;
  const curve: number[] = [loss(w)];
  for (let t = 0; t < steps; t++) {
    const grad = 2 * (w - TARGET);
    w = w - lr * grad;
    const l = loss(w);
    curve.push(Number.isFinite(l) ? Math.min(l, 1e6) : 1e6); // cap for display, real divergence still shows as "hit the cap"
  }
  return curve;
}

// A real sweep: same model/task, five different learning rates -- the
// classic hyperparameter a tracking dashboard exists to compare across runs.
const SWEEP: { id: string; lr: number; batchSize: number }[] = [
  { id: 'run-1', lr: 0.01, batchSize: 32 },
  { id: 'run-2', lr: 0.05, batchSize: 32 },
  { id: 'run-3', lr: 0.15, batchSize: 64 },
  { id: 'run-4', lr: 0.4, batchSize: 64 },
  { id: 'run-5', lr: 1.1, batchSize: 128 },
];

export function simulateSweep(): Run[] {
  return SWEEP.map(({ id, lr, batchSize }) => {
    const lossCurve = gradientDescentRun(lr, STEPS);
    const finalLoss = lossCurve[lossCurve.length - 1];
    const diverged = finalLoss > loss(START); // ended up worse than doing nothing at all
    return { id, lr, batchSize, lossCurve, finalLoss, diverged };
  });
}
