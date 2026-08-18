import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useVizTokens, SPACING } from '../theme/vizTokens';
import {
  VisualizationContainer,
  VisualizationHeader,
  VisualizationCanvas,
  Slider,
  VisualizationExplanation,
  VisualizationMath,
  useStepController,
  VisualizationStepController,
} from './primitives';

// f(x) = (x-3)^2 + 1 -- a simple convex loss with a known minimum at x=3,
// so every number shown is checkable by hand. Real D3 scales drive the
// pixel mapping (d3.scaleLinear), a real derivative drives the descent --
// this is the Phase 1 proof that the D3 pipeline works end to end, and the
// seed for Phase 5's full Gradient Descent flagship visualization.
function loss(x: number): number {
  return (x - 3) ** 2 + 1;
}
function gradient(x: number): number {
  return 2 * (x - 3);
}

export default function GradientDescentDemo() {
  const t = useVizTokens();
  const [learningRate, setLearningRate] = useState(0.3);
  const [startX, setStartX] = useState(-2);

  const path = useMemo(() => {
    const xs: number[] = [startX];
    let x = startX;
    for (let i = 0; i < 24; i++) {
      x = x - learningRate * gradient(x);
      xs.push(x);
      if (Math.abs(gradient(x)) < 0.001) break;
    }
    return xs;
  }, [learningRate, startX]);

  const controller = useStepController(path.length, 500);
  const currentX = path[controller.step];
  const currentGrad = gradient(currentX);

  const width = 640;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const xScale = d3.scaleLinear().domain([-4, 8]).range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear().domain([0, loss(-4) + 2]).range([height - margin.bottom, margin.top]);

  const curvePoints = d3.range(-4, 8.01, 0.1).map((x) => [x, loss(x)] as [number, number]);
  const lineGen = d3.line<[number, number]>().x((d) => xScale(d[0])).y((d) => yScale(d[1]));
  const curveD = lineGen(curvePoints) ?? '';

  const diverged = !Number.isFinite(currentX) || Math.abs(currentX) > 50;

  return (
    <VisualizationContainer footer="Real gradient descent on f(x) = (x-3)^2 + 1 -- every position and gradient value shown is computed live, not scripted.">
      <VisualizationHeader
        eyebrow="Interactive · D3"
        title="Gradient Descent Demo"
        description="Drag the learning rate high enough and watch it overshoot instead of converge."
      />

      <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <VisualizationCanvas aspect={640 / 320} minHeight={260} maxHeight={340}>
            {({ width: w }) => {
              const scale = w / width;
              return (
                <svg width={w} height={height * scale} viewBox={`0 0 ${width} ${height}`}>
                  <path d={curveD} fill="none" stroke={t.accentSecondary} strokeWidth={2} />
                  {!diverged &&
                    path.slice(0, controller.step + 1).map((x, i) => (
                      <circle key={i} cx={xScale(x)} cy={yScale(loss(x))} r={i === controller.step ? 6 : 3} fill={i === controller.step ? t.accentPrimary : t.textMuted} opacity={i === controller.step ? 1 : 0.5} />
                    ))}
                  <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke={t.border} />
                </svg>
              );
            }}
          </VisualizationCanvas>
          <VisualizationStepController controller={controller} totalSteps={path.length} stepLabel={(s) => `step ${s}`} />
        </div>

        <div style={{ width: 220 }}>
          <Slider label="Learning rate" value={learningRate} onChange={setLearningRate} min={0.01} max={1.1} step={0.01} format={(v) => v.toFixed(2)} />
          <Slider label="Start x" value={startX} onChange={setStartX} min={-4} max={7} step={0.5} format={(v) => v.toFixed(1)} />
        </div>
      </div>

      <VisualizationExplanation>
        {diverged
          ? 'The learning rate is too high -- each step overshoots further than the last, and x is diverging instead of converging.'
          : Math.abs(currentGrad) < 0.05
            ? `Converged: x ≈ ${currentX.toFixed(3)}, essentially at the true minimum x=3.`
            : `At x = ${currentX.toFixed(3)}, the gradient is ${currentGrad.toFixed(3)} -- the next step moves x by -learning_rate × gradient.`}
      </VisualizationExplanation>
      <VisualizationMath latex={`x \\leftarrow x - \\alpha \\cdot \\nabla f(x) = ${currentX.toFixed(2)} - ${learningRate.toFixed(2)} \\times ${currentGrad.toFixed(2)}`} />
    </VisualizationContainer>
  );
}
