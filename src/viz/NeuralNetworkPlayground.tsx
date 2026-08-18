import { useEffect, useMemo, useRef, useState } from 'react';
import { useVizTokens, SPACING } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader, Slider, PillSelect, VizButton, ControlRow } from './primitives';
import { hexToRgb, blendColor } from './lib/colorBlend';
import { DATASETS } from './lib/datasets';
import { MLP, type HiddenActivation } from './lib/mlp';

type DatasetKey = keyof typeof DATASETS;

const DATASET_OPTIONS = (Object.entries(DATASETS) as [DatasetKey, (typeof DATASETS)[DatasetKey]][]).map(([value, d]) => ({ value, label: d.label }));
const ACTIVATION_OPTIONS: { value: HiddenActivation; label: string }[] = [
  { value: 'relu', label: 'ReLU' },
  { value: 'tanh', label: 'tanh' },
];
const DOMAIN = 1.3; // data lives roughly in [-1, 1]; render a bit wider
const GRID = 44; // heatmap resolution

export default function NeuralNetworkPlayground() {
  const t = useVizTokens();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<MLP | null>(null);
  const dataRef = useRef<{ X: [number, number][]; y: (0 | 1)[] } | null>(null);

  const [dataset, setDataset] = useState<DatasetKey>('xor');
  const [activation, setActivation] = useState<HiddenActivation>('relu');
  const [layers, setLayers] = useState(2);
  const [neurons, setNeurons] = useState(6);
  const [lr, setLr] = useState(1.2);
  const [playing, setPlaying] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState<number | null>(null);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [size, setSize] = useState(420);

  const rebuild = () => {
    const { X, y } = DATASETS[dataset].generate(220, 7);
    dataRef.current = { X, y };
    const shape = [2, ...Array(layers).fill(neurons), 1];
    netRef.current = new MLP(shape, activation, 42);
    setEpoch(0);
    setLoss(null);
    setLossHistory([]);
  };

  useEffect(() => {
    rebuild();
    setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, activation, layers, neurons]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      setSize(Math.min(480, entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    const net = netRef.current;
    const data = dataRef.current;
    if (!canvas || !net || !data) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    const classA = hexToRgb(t.accentDanger);
    const classB = hexToRgb(t.accentPrimary);

    const cell = w / GRID;
    for (let gx = 0; gx < GRID; gx++) {
      for (let gy = 0; gy < GRID; gy++) {
        const x = ((gx + 0.5) / GRID) * (2 * DOMAIN) - DOMAIN;
        const y = DOMAIN - ((gy + 0.5) / GRID) * (2 * DOMAIN);
        const p = net.predict([x, y]);
        ctx.fillStyle = blendColor(classA, classB, p);
        ctx.globalAlpha = 0.55;
        ctx.fillRect(gx * cell, gy * cell, cell + 1, cell + 1);
      }
    }
    ctx.globalAlpha = 1;

    const toPx = (x: number, y: number): [number, number] => [((x + DOMAIN) / (2 * DOMAIN)) * w, ((DOMAIN - y) / (2 * DOMAIN)) * h];
    data.X.forEach(([x, y], i) => {
      const [px, py] = toPx(x, y);
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = data.y[i] === 1 ? t.accentPrimary : t.accentDanger;
      ctx.strokeStyle = t.background;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });
  };

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch, size, dataset, activation, layers, neurons, t]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const net = netRef.current;
      const data = dataRef.current;
      if (!net || !data) return;
      const l = net.step(data.X, data.y, lr);
      setLoss(l);
      setEpoch((e) => e + 1);
      setLossHistory((h) => [...h, l].slice(-120));
    }, 50);
    return () => clearInterval(id);
  }, [playing, lr]);

  const stepOnce = () => {
    const net = netRef.current;
    const data = dataRef.current;
    if (!net || !data) return;
    const l = net.step(data.X, data.y, lr);
    setLoss(l);
    setEpoch((e) => e + 1);
    setLossHistory((h) => [...h, l].slice(-120));
  };

  const maxLoss = useMemo(() => Math.max(0.05, ...lossHistory), [lossHistory]);

  return (
    <VisualizationContainer footer="A real, hand-written forward/backward pass -- no TensorFlow.js -- training live in your browser on whichever toy dataset and architecture you pick.">
      <VisualizationHeader eyebrow="Interactive" title="Neural Network Playground" />
      <ControlRow>
        <PillSelect<DatasetKey> label="Dataset" value={dataset} onChange={setDataset} options={DATASET_OPTIONS} />
        <PillSelect<HiddenActivation> label="Activation" value={activation} onChange={setActivation} options={ACTIVATION_OPTIONS} />
      </ControlRow>
      <ControlRow>
        <div style={{ minWidth: 160 }}>
          <Slider label="Hidden layers" value={layers} onChange={setLayers} min={1} max={3} step={1} />
        </div>
        <div style={{ minWidth: 160 }}>
          <Slider label="Neurons / layer" value={neurons} onChange={setNeurons} min={2} max={10} step={1} />
        </div>
        <div style={{ minWidth: 200 }}>
          <Slider label="Learning rate" value={lr} onChange={setLr} min={0.05} max={3} step={0.05} format={(v) => v.toFixed(2)} />
        </div>
      </ControlRow>
      <ControlRow>
        <VizButton onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Train'}</VizButton>
        <VizButton variant="secondary" onClick={stepOnce}>
          Step
        </VizButton>
        <VizButton variant="secondary" onClick={rebuild}>
          Reset Weights
        </VizButton>
      </ControlRow>

      <div ref={wrapRef} style={{ width: '100%', display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ width: size, height: size, borderRadius: 12, border: `1px solid ${t.border}`, background: t.background }}
        />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 13, color: t.textSecondary, marginBottom: 6 }}>Loss</div>
          <svg width="100%" height={80} viewBox="0 0 160 80" preserveAspectRatio="none">
            <polyline
              points={lossHistory.map((l, i) => `${(i / Math.max(1, lossHistory.length - 1)) * 160},${80 - (l / maxLoss) * 76}`).join(' ')}
              fill="none"
              stroke={t.accentSecondary}
              strokeWidth={2}
            />
          </svg>
          <div style={{ fontSize: 13, color: t.textSecondary, marginTop: SPACING.sm }}>
            <div>Epoch {epoch}</div>
            <div>Loss {loss === null ? '—' : loss.toFixed(4)}</div>
            <div style={{ marginTop: 6 }}>Shape: 2 → {Array(layers).fill(neurons).join(' → ')} → 1</div>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
