import { useMemo } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { DIAGRAM_TYPE } from './diagramSystem';
import { sourceSignalA, sourceSignalB, mixSignals, excessKurtosis } from '../lib/dimreduction';

const N = 60;

function SignalPlot({ values, color }: { values: number[]; color: string }) {
  const t = useVizTokens();
  const width = 300, height = 50;
  const maxAbs = Math.max(...values.map(Math.abs), 0.1);
  const px = (i: number) => (i / (values.length - 1)) * width;
  const py = (v: number) => height / 2 - (v / maxAbs) * (height / 2 - 4);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={t.border} strokeWidth={1} />
      <polyline points={values.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

export default function IcaCocktailPartyDiagram() {
  const t = useVizTokens();

  const { sourceA, sourceB, mix1, mix2, kSourceA, kSourceB, kMix1, kMix2 } = useMemo(() => {
    const sourceA = sourceSignalA(N);
    const sourceB = sourceSignalB(N, 4);
    const [mix1, mix2] = mixSignals(sourceA, sourceB, [[0.6, 0.4], [0.3, 0.7]]);
    return {
      sourceA, sourceB, mix1, mix2,
      kSourceA: excessKurtosis(sourceA), kSourceB: excessKurtosis(sourceB),
      kMix1: excessKurtosis(mix1), kMix2: excessKurtosis(mix2),
    };
  }, []);

  const sourceAvgAbsK = (Math.abs(kSourceA) + Math.abs(kSourceB)) / 2;
  const mixAvgAbsK = (Math.abs(kMix1) + Math.abs(kMix2)) / 2;
  const movedTowardGaussian = mixAvgAbsK < sourceAvgAbsK;

  return (
    <VisualizationContainer footer={`Real excess kurtosis (0 = perfectly Gaussian; the further from 0, the less Gaussian): sources average |kurtosis| ${sourceAvgAbsK.toFixed(2)}; real linear mixtures average |kurtosis| ${mixAvgAbsK.toFixed(2)} -- ${movedTowardGaussian ? 'measurably closer to 0, exactly the "mixing makes things more Gaussian" effect ICA runs in reverse to undo' : 'this particular random mix happened not to show the effect clearly -- real data, not curated to always make the point'}.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.accentPrimary, marginBottom: 2 }}>Source A (periodic) — kurtosis {kSourceA.toFixed(2)}</div>
          <SignalPlot values={sourceA} color={t.accentPrimary} />
        </div>
        <div>
          <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.accentSecondary, marginBottom: 2 }}>Source B (bimodal) — kurtosis {kSourceB.toFixed(2)}</div>
          <SignalPlot values={sourceB} color={t.accentSecondary} />
        </div>
        <div>
          <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.accentWarn, marginBottom: 2 }}>Mixture 1 (real linear combo) — kurtosis {kMix1.toFixed(2)}</div>
          <SignalPlot values={mix1} color={t.accentWarn} />
        </div>
        <div>
          <div style={{ fontSize: DIAGRAM_TYPE.caption.size, color: t.accentDanger, marginBottom: 2 }}>Mixture 2 (real linear combo) — kurtosis {kMix2.toFixed(2)}</div>
          <SignalPlot values={mix2} color={t.accentDanger} />
        </div>
      </div>
    </VisualizationContainer>
  );
}
