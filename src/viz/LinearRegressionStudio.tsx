import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3';
import { useVizTokens, SPACING, type VizTokens } from '../theme/vizTokens';
import {
  VisualizationContainer,
  VisualizationHeader,
  VisualizationCanvas,
  Slider,
  PillSelect,
  VizButton,
  ControlRow,
} from './primitives';
import LossLandscapeHeatmap from './patterns/LossLandscapeHeatmap';
import {
  X_DOMAIN,
  Y_DOMAIN,
  W_DOMAIN,
  B_DOMAIN,
  OUTLIER_POINT,
  generateData,
  computeStats,
  gradientStep,
  type Point,
  type GDStep,
} from './lib/linreg';

type Mode = 'fit' | 'gd';

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'fit', label: 'Fit It Yourself' },
  { value: 'gd', label: 'Gradient Descent Lab' },
];

/** Scatter + fitted line + residuals, shared between both modes. */
function DataSpacePanel({ points, w, b, t }: { points: Point[]; w: number; b: number; t: VizTokens }) {
  return (
    <VisualizationCanvas aspect={16 / 10} minHeight={260} maxHeight={340}>
      {({ width, height }) => {
        const margin = 30;
        const xScale = scaleLinear().domain(X_DOMAIN).range([margin, width - margin]);
        const yScale = scaleLinear().domain(Y_DOMAIN).range([height - margin, margin]);
        const lineX0 = X_DOMAIN[0];
        const lineX1 = X_DOMAIN[1];

        return (
          <svg width={width} height={height} style={{ display: 'block' }}>
            <rect x={0} y={0} width={width} height={height} fill={t.background} />
            {points.map((p, i) => {
              const pred = w * p.x + b;
              const isOutlier = p === OUTLIER_POINT;
              return (
                <line
                  key={`r${i}`}
                  x1={xScale(p.x)}
                  y1={yScale(p.y)}
                  x2={xScale(p.x)}
                  y2={yScale(pred)}
                  stroke={isOutlier ? t.accentDanger : t.accentWarn}
                  strokeWidth={1.5}
                  opacity={0.6}
                  style={{ transition: 'y1 150ms ease, y2 150ms ease' }}
                />
              );
            })}
            <line
              x1={xScale(lineX0)}
              y1={yScale(w * lineX0 + b)}
              x2={xScale(lineX1)}
              y2={yScale(w * lineX1 + b)}
              stroke={t.accentSecondary}
              strokeWidth={2.5}
              style={{ transition: 'y1 150ms ease, y2 150ms ease' }}
            />
            {points.map((p, i) => (
              <circle
                key={`p${i}`}
                cx={xScale(p.x)}
                cy={yScale(p.y)}
                r={p === OUTLIER_POINT ? 6 : 4.5}
                fill={p === OUTLIER_POINT ? t.accentDanger : t.accentPrimary}
                stroke={t.background}
                strokeWidth={1.5}
              />
            ))}
          </svg>
        );
      }}
    </VisualizationCanvas>
  );
}

export default function LinearRegressionStudio() {
  const t = useVizTokens();
  const [mode, setMode] = useState<Mode>('fit');
  const [seed, setSeed] = useState(3);
  const [noise, setNoise] = useState(6);
  const [outlierOn, setOutlierOn] = useState(false);

  const basePoints = useMemo(() => generateData(16, noise, seed), [noise, seed]);
  const points = useMemo(() => (outlierOn ? [...basePoints, OUTLIER_POINT] : basePoints), [basePoints, outlierOn]);

  const [w, setW] = useState(3);
  const [b, setB] = useState(45);
  const fitStats = useMemo(() => computeStats(points, w, b), [points, w, b]);

  const [lr, setLr] = useState(0.012);
  const [path, setPath] = useState<GDStep[]>([{ w: 0, b: 0, dw: 0, db: 0 }]);
  const [playing, setPlaying] = useState(false);
  const [diverged, setDiverged] = useState(false);
  const stateRef = useRef({ w: 0, b: 0 });

  const resetGD = () => {
    setPlaying(false);
    setDiverged(false);
    stateRef.current = { w: 0, b: 0 };
    setPath([{ w: 0, b: 0, dw: 0, db: 0 }]);
  };

  useEffect(() => {
    resetGD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const stepGD = (times = 1) => {
    let cur = stateRef.current;
    let last: GDStep | null = null;
    for (let i = 0; i < times; i++) {
      const next = gradientStep(points, cur.w, cur.b, lr);
      if (!isFinite(next.w) || !isFinite(next.b) || Math.abs(next.w) > 1e6 || Math.abs(next.b) > 1e6) {
        setDiverged(true);
        setPlaying(false);
        return;
      }
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
  }, [playing, lr, points]);

  const gdLast = path[path.length - 1];
  const gdStats = computeStats(points, gdLast.w, gdLast.b);

  return (
    <VisualizationContainer footer="A real dataset (noisy study-hours-vs-exam-score), real MSE, and real batch gradient descent -- running live as you drag, play, and step.">
      <VisualizationHeader eyebrow="Interactive" title="Linear Regression Studio" />
      <ControlRow>
        <PillSelect<Mode> label="Mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />
        <div style={{ minWidth: 160 }}>
          <Slider label="Noise" value={noise} onChange={setNoise} min={0} max={18} step={1} />
        </div>
        <PillSelect<string>
          label="Outlier"
          value={outlierOn ? 'on' : 'off'}
          onChange={(v) => setOutlierOn(v === 'on')}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'On' },
          ]}
        />
        <VizButton variant="secondary" onClick={() => setSeed((s) => s + 1)}>
          New Dataset
        </VizButton>
      </ControlRow>

      {mode === 'fit' && (
        <>
          <ControlRow>
            <div style={{ minWidth: 220 }}>
              <Slider label="w (slope)" value={w} onChange={setW} min={W_DOMAIN[0]} max={W_DOMAIN[1]} step={0.1} format={(v) => v.toFixed(1)} />
            </div>
            <div style={{ minWidth: 220 }}>
              <Slider label="b (intercept)" value={b} onChange={setB} min={B_DOMAIN[0]} max={B_DOMAIN[1]} step={0.5} format={(v) => v.toFixed(1)} />
            </div>
          </ControlRow>
          <DataSpacePanel points={points} w={w} b={b} t={t} />
          <div style={{ display: 'flex', gap: SPACING.md, fontSize: 14, marginTop: 8 }}>
            <span style={{ fontWeight: 700, color: t.textPrimary }}>MSE {fitStats.mse.toFixed(2)}</span>
            <span style={{ color: t.textSecondary }}>ŷ = {w.toFixed(1)}x + {b.toFixed(1)}</span>
            {outlierOn && <span style={{ color: t.accentDanger }}>outlier included -- watch MSE jump</span>}
          </div>
        </>
      )}

      {mode === 'gd' && (
        <>
          <ControlRow>
            <div style={{ minWidth: 220 }}>
              <Slider label="Learning rate" value={lr} onChange={setLr} min={0.0005} max={0.03} step={0.0005} format={(v) => v.toFixed(4)} />
            </div>
            <VizButton onClick={() => setPlaying((p) => !p)} disabled={diverged}>
              {playing ? 'Pause' : 'Play'}
            </VizButton>
            <VizButton variant="secondary" onClick={() => stepGD(1)} disabled={diverged}>
              Step
            </VizButton>
            <VizButton variant="secondary" onClick={resetGD}>
              Reset
            </VizButton>
          </ControlRow>

          {diverged && (
            <div style={{ color: t.accentDanger, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
              Diverged -- the learning rate is too large and the steps overshot the minimum. Reset and try a smaller value.
            </div>
          )}

          <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', minWidth: 260 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Data space</div>
              <DataSpacePanel points={points} w={diverged ? 0 : gdLast.w} b={diverged ? 0 : gdLast.b} t={t} />
            </div>
            <div style={{ flex: '1 1 300px', minWidth: 260 }}>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Loss landscape</div>
              <LossLandscapeHeatmap
                wDomain={W_DOMAIN}
                bDomain={B_DOMAIN}
                costFn={(wv, bv) => computeStats(points, wv, bv).mse}
                path={path}
                t={t}
                caption={`MSE surface over real (w, b) -- x-axis w [${W_DOMAIN[0]}, ${W_DOMAIN[1]}], y-axis b [${B_DOMAIN[0]}, ${B_DOMAIN[1]}], green = low cost, red = high cost.`}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: SPACING.md, fontSize: 14, margin: '8px 0' }}>
            <span>Step {path.length - 1}</span>
            <span style={{ fontWeight: 700, color: t.textPrimary }}>MSE {isFinite(gdStats.mse) ? gdStats.mse.toFixed(2) : '—'}</span>
            <span style={{ color: t.textSecondary }}>w = {gdLast.w.toFixed(3)}, b = {gdLast.b.toFixed(3)}</span>
          </div>

          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Step log -- watch the algorithm think</div>
          <div style={{ maxHeight: 140, overflowY: 'auto', fontFamily: 'monospace', fontSize: 11.5 }}>
            {path.slice(-30).map((s, i) => {
              const stepNum = path.length - Math.min(30, path.length) + i;
              return (
                <div key={stepNum} style={{ color: t.textSecondary, padding: '2px 0', borderBottom: `1px solid ${t.border}` }}>
                  step {stepNum}: w={s.w.toFixed(3)} b={s.b.toFixed(3)} dw={s.dw.toFixed(2)} db={s.db.toFixed(2)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </VisualizationContainer>
  );
}
