function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMuller(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** A deliberately imperfect regression model: true target is sin(2x) with
 * heteroskedastic noise (more noise where x is large) -- the model only
 * fits the mean trend, so its raw residuals genuinely vary in spread
 * across x, which is exactly the case a plain fixed-width interval gets
 * wrong and conformal prediction handles correctly via calibration. */
function trueFn(x: number): number {
  return Math.sin(2 * x);
}
function noiseScale(x: number): number {
  return 0.15 + 0.35 * Math.abs(x) / 2;
}

export interface ConformalResult {
  qHat: number;
  calibrationScores: number[];
  coverageCheck: { covered: number; total: number; rate: number };
}

/** The real split-conformal recipe (Angelopoulos & Bates, arXiv:2107.07511,
 * Section 1): fit on training data (here: just trueFn itself, standing in
 * for a fitted model that's gotten the trend right but not the noise),
 * score = |y - fhat(x)| on a fresh calibration set, qHat = the real
 * ceil((n+1)(1-alpha))/n empirical quantile of those scores, prediction
 * interval = [fhat(x) - qHat, fhat(x) + qHat]. Then actually check
 * coverage on a SEPARATE held-out test set to verify the guarantee holds,
 * rather than just asserting it. */
export function runConformalPrediction(alpha: number, nCal: number, nTest: number, seed: number): ConformalResult {
  const rand = mulberry32(seed);

  const calibrationScores: number[] = [];
  for (let i = 0; i < nCal; i++) {
    const x = rand() * 4 - 2;
    const y = trueFn(x) + boxMuller(rand) * noiseScale(x);
    calibrationScores.push(Math.abs(y - trueFn(x)));
  }
  calibrationScores.sort((a, b) => a - b);

  const qLevel = Math.ceil((nCal + 1) * (1 - alpha)) / nCal;
  const idx = Math.min(calibrationScores.length - 1, Math.ceil(qLevel * calibrationScores.length) - 1);
  const qHat = calibrationScores[Math.max(0, idx)];

  let covered = 0;
  for (let i = 0; i < nTest; i++) {
    const x = rand() * 4 - 2;
    const y = trueFn(x) + boxMuller(rand) * noiseScale(x);
    const inInterval = Math.abs(y - trueFn(x)) <= qHat;
    if (inInterval) covered++;
  }

  return { qHat, calibrationScores, coverageCheck: { covered, total: nTest, rate: covered / nTest } };
}

export { trueFn, noiseScale };
