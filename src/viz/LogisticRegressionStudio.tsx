import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3';
import { useVizTokens, SPACING, type VizTokens } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, VisualizationCanvas, Slider, PillSelect, VizButton, ControlRow } from './primitives';
import LossLandscapeHeatmap from './patterns/LossLandscapeHeatmap';
import { X_DOMAIN, W_DOMAIN, B_DOMAIN, sigmoid, generateData, statsFor, gradientStep, type LogPoint, type LogGDStep, type LossType } from './lib/logreg';

type Mode = 'fit' | 'gd';

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'fit', label: 'Fit It Yourself' },
  { value: 'gd', label: 'Gradient Descent Lab' },
];
const LOSS_OPTIONS: { value: LossType; label: string }[] = [
  { value: 'ce', label: 'Cross-Entropy' },
  { value: 'mse', label: 'MSE (naive)' },
];

const BAD_START = { w: -1.5, b: 8 };

/** Points at y=0/1, the real sigmoid curve at (w, b), and the decision boundary. */
function SigmoidPanel({ points, w, b, t }: { points: LogPoint[]; w: number; b: number; t: VizTokens }) {
  return (
    <VisualizationCanvas aspect={16 / 10} minHeight={260} maxHeight={340}>
      {({ width, height }) => {
        const margin = 30;
        const xScale = scaleLinear().domain(X_DOMAIN).range([margin, width - margin]);
        const yScale = scaleLinear().domain([0, 1]).range([height - margin, margin]);

        const N = 60;
        const curvePts: string[] = [];
        for (let i = 0; i <= N; i++) {
          const x = X_DOMAIN[0] + (i / N) * (X_DOMAIN[1] - X_DOMAIN[0]);
          curvePts.push(`${xScale(x)},${yScale(sigmoid(w * x + b))}`);
        }

        const boundaryX = w !== 0 ? -b / w : null;
        const boundaryInRange = boundaryX !== null && boundaryX >= X_DOMAIN[0] && boundaryX <= X_DOMAIN[1];

        return (
          <svg width={width} height={height} style={{ display: 'block' }}>
            <rect x={0} y={0} width={width} height={height} fill={t.background} />
            <line x1={margin} y1={yScale(0.5)} x2={width - margin} y2={yScale(0.5)} stroke={t.border} strokeWidth={1} strokeDasharray="3 3" />
            {boundaryInRange && boundaryX !== null && (
              <line x1={xScale(boundaryX)} y1={margin} x2={xScale(boundaryX)} y2={height - margin} stroke={t.accentWarn} strokeWidth={1.5} strokeDasharray="4 3" />
            )}
            <polyline points={curvePts.join(' ')} fill="none" stroke={t.accentSecondary} strokeWidth={2.5} />
            {points.map((p, i) => {
              const phat = sigmoid(w * p.x + b);
              const pred = phat >= 0.5 ? 1 : 0;
              const correct = pred === p.label;
              return (
                <circle key={i} cx={xScale(p.x)} cy={yScale(p.label)} r={4.5} fill={correct ? t.accentPrimary : t.accentDanger} stroke={t.background} strokeWidth={1.5} opacity={0.9} />
              );
            })}
          </svg>
        );
      }}
    </VisualizationCanvas>
  );
}

export default function LogisticRegressionStudio() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('fit');
  const [seed, setSeed] = useState(3);
  const [noise, setNoise] = useState(4);

  const points = useMemo(() => generateData(24, noise, seed), [noise, seed]);

  const [w, setW] = useState(0.3);
  const [b, setB] = useState(-1);
  const fitStats = useMemo(() => statsFor('ce', points, w, b), [points, w, b]);

  const [lossType, setLossType] = useState<'ce' | 'mse'>('ce');
  const [lr, setLr] = useState(0.05);
  const [path, setPath] = useState<LogGDStep[]>([{ ...BAD_START, dw: 0, db: 0 }]);
  const [playing, setPlaying] = useState(false);
  const stateRef = useRef({ ...BAD_START });

  const resetGD = () => {
    setPlaying(false);
    stateRef.current = { ...BAD_START };
    setPath([{ ...BAD_START, dw: 0, db: 0 }]);
  };

  useEffect(() => {
    resetGD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, lossType]);

  const stepGD = (times = 1) => {
    let cur = stateRef.current;
    let last: LogGDStep | null = null;
    for (let i = 0; i < times; i++) {
      const next = gradientStep(lossType, points, cur.w, cur.b, lr);
      cur = { w: next.w, b: next.b };
      last = next;
    }
    stateRef.current = cur;
    setPath((p) => (p.length > 600 || !last ? p : [...p, last]));
  };

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => stepGD(4), 80);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, lr, points, lossType]);

  const gdLast = path[path.length - 1];
  const gdStats = statsFor(lossType, points, gdLast.w, gdLast.b);

  return (
    <VisualizationContainer footer="A real study-hours-vs-pass/fail dataset, a real sigmoid curve, real cross-entropy (and its non-convex MSE-on-sigmoid alternative), and real batch gradient descent -- running live.">
      <VisualizationHeader eyebrow="Interactive" title="Logistic Regression Studio" />
      <ControlRow>
        <PillSelect<Mode> label="Mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />
        <div style={{ minWidth: 160 }}>
          <Slider label="Noise" value={noise} onChange={setNoise} min={0} max={10} step={1} />
        </div>
        <VizButton variant="secondary" onClick={() => setSeed((s) => s + 1)}>
          New Dataset
        </VizButton>
      </ControlRow>

      {mode === 'fit' && (
        <>
          <ControlRow>
            <div style={{ minWidth: 220 }}>
              <Slider label="w (slope)" value={w} onChange={setW} min={W_DOMAIN[0]} max={W_DOMAIN[1]} step={0.05} format={(v) => v.toFixed(2)} />
            </div>
            <div style={{ minWidth: 220 }}>
              <Slider label="b (intercept)" value={b} onChange={setB} min={B_DOMAIN[0]} max={B_DOMAIN[1]} step={0.2} format={(v) => v.toFixed(1)} />
            </div>
          </ControlRow>
          <SigmoidPanel points={points} w={w} b={b} t={t} />
          <div style={{ display: 'flex', gap: SPACING.md, fontSize: 14, marginTop: 8 }}>
            <span style={{ fontWeight: 700, color: t.textPrimary }}>Cross-entropy loss {fitStats.loss.toFixed(3)}</span>
            <span style={{ color: t.textSecondary }}>accuracy {(fitStats.accuracy * 100).toFixed(0)}%</span>
          </div>
        </>
      )}

      {mode === 'gd' && (
        <>
          <ControlRow>
            <PillSelect<LossType> label="Loss function" value={lossType} onChange={setLossType} options={LOSS_OPTIONS} />
            <div style={{ minWidth: 200 }}>
              <Slider label="Learning rate" value={lr} onChange={setLr} min={0.005} max={0.3} step={0.005} format={(v) => v.toFixed(3)} />
            </div>
            <VizButton onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</VizButton>
            <VizButton variant="secondary" onClick={() => stepGD(1)}>
              Step
            </VizButton>
            <VizButton variant="secondary" onClick={resetGD}>
              Reset
            </VizButton>
          </ControlRow>

          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>
            Starting from a deliberately bad initialization (w={BAD_START.w}, b={BAD_START.b}) so the difference between the two loss functions is visible, not just asserted.
          </div>

          <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', minWidth: 260 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Sigmoid fit</div>
              <SigmoidPanel points={points} w={gdLast.w} b={gdLast.b} t={t} />
            </div>
            <div style={{ flex: '1 1 300px', minWidth: 260 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Loss landscape</div>
              <LossLandscapeHeatmap
                wDomain={W_DOMAIN}
                bDomain={B_DOMAIN}
                costFn={(wv, bv) => statsFor(lossType, points, wv, bv).loss}
                path={path}
                t={t}
                caption={`${lossType === 'mse' ? 'MSE-on-sigmoid' : 'Cross-entropy'} loss over real (w, b) -- green = low cost, red = high cost.`}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: SPACING.md, fontSize: 14, margin: '8px 0' }}>
            <span>Step {path.length - 1}</span>
            <span style={{ fontWeight: 700, color: t.textPrimary }}>Loss {gdStats.loss.toFixed(4)}</span>
            <span style={{ color: t.textSecondary }}>accuracy {(gdStats.accuracy * 100).toFixed(0)}%</span>
            <span style={{ color: t.textSecondary }}>w = {gdLast.w.toFixed(3)}, b = {gdLast.b.toFixed(3)}</span>
          </div>

          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Step log</div>
          <div style={{ maxHeight: 140, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11.5 }}>
            {path.slice(-30).map((s, i) => {
              const stepNum = path.length - Math.min(30, path.length) + i;
              return (
                <div key={stepNum} style={{ color: t.textSecondary, padding: '2px 0', borderBottom: `1px solid ${t.border}` }}>
                  step {stepNum}: w={s.w.toFixed(3)} b={s.b.toFixed(3)} dw={s.dw.toFixed(4)} db={s.db.toFixed(4)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </VisualizationContainer>
  );
}
