import { useMemo, useState } from 'react';
import { useVizTokens, SPACING, RADIUS, FONT_FAMILY } from '../theme/vizTokens';
import { VisualizationContainer, VisualizationHeader } from './primitives';
import { VOCAB, CATEGORIES, nearestNeighbors, analogy, pca2D, type VocabEntry } from './lib/embeddings';

const CATEGORY_COLORS: Record<string, string> = {
  royalty: '#F4B942',
  people: '#5B8CFF',
  animals: '#3DDC97',
  tech: '#B15BFF',
  food: '#FF7A45',
  weather: '#31C4D9',
  emotion: '#F45B5B',
  transport: '#D9A5FF',
};

const SIZE = 420;
const PADDING = 30;

interface LayoutPoint extends VocabEntry {
  px: number;
  py: number;
}

function layout(): LayoutPoint[] {
  const coords = pca2D(VOCAB);
  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scaleX = (SIZE - 2 * PADDING) / (maxX - minX || 1);
  const scaleY = (SIZE - 2 * PADDING) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);
  return VOCAB.map((v, i) => ({
    ...v,
    px: PADDING + (coords[i][0] - minX) * scale,
    py: PADDING + (coords[i][1] - minY) * scale,
  }));
}

export default function EmbeddingSpaceExplorer() {
  const t = useVizTokens();
  const points = useMemo(() => layout(), []);
  const [selected, setSelected] = useState('king');
  const [analogyA, setAnalogyA] = useState('king');
  const [analogyB, setAnalogyB] = useState('man');
  const [analogyC, setAnalogyC] = useState('woman');

  const neighbors = useMemo(() => nearestNeighbors(selected, 5), [selected]);
  const analogyResult = useMemo(() => analogy(analogyA, analogyB, analogyC, 3), [analogyA, analogyB, analogyC]);

  const wordOptions = VOCAB.map((v) => v.word);
  const analogyFields: [string, (v: string) => void][] = [
    [analogyA, setAnalogyA],
    [analogyB, setAnalogyB],
    [analogyC, setAnalogyC],
  ];

  return (
    <VisualizationContainer footer="Hand-authored, structured demo vectors (no trained model here) -- but cosine similarity, nearest-neighbor lookup, the A - B + C word-vector analogy, and the 2D projection below are all real math, computed from scratch, live.">
      <VisualizationHeader eyebrow="Interactive" title="Embedding Space Explorer" />
      <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
        <div>
          <svg width={SIZE} height={SIZE} style={{ background: t.background, border: `1px solid ${t.border}`, borderRadius: RADIUS.md }}>
            {points.map((p) => {
              const isSelected = p.word === selected;
              const isNeighbor = neighbors.some((n) => n.word === p.word);
              return (
                <g key={p.word} onClick={() => setSelected(p.word)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={p.px}
                    cy={p.py}
                    r={isSelected ? 7 : isNeighbor ? 5.5 : 4}
                    fill={CATEGORY_COLORS[p.category]}
                    stroke={isSelected ? t.textPrimary : t.background}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={isSelected || isNeighbor ? 1 : 0.75}
                  />
                  <text x={p.px + 8} y={p.py + 3} fontSize={isSelected ? 11 : 9} fontFamily={FONT_FAMILY} fontWeight={isSelected ? 700 : 400} fill={isSelected ? t.textPrimary : t.textMuted}>
                    {p.word}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {CATEGORIES.map((c) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.textMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: CATEGORY_COLORS[c], display: 'inline-block' }} />
                {c}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>Nearest to "{selected}"</div>
          {neighbors.map((n) => (
            <div key={n.word} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.textSecondary }}>
                <span>{n.word}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n.sim.toFixed(3)}</span>
              </div>
              <div style={{ height: 6, background: t.surfaceAlt, borderRadius: RADIUS.sm, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, n.sim) * 100}%`, height: '100%', background: t.accentPrimary }} />
              </div>
            </div>
          ))}

          <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginTop: SPACING.sm, marginBottom: 6 }}>Analogy: A − B + C ≈ ?</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {analogyFields.map(([val, setter], i) => (
              <select
                key={i}
                value={val}
                onChange={(e) => setter(e.target.value)}
                style={{ background: t.surfaceAlt, color: t.textPrimary, border: `1px solid ${t.border}`, borderRadius: RADIUS.sm, padding: '4px 6px', fontSize: 12 }}
              >
                {wordOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 6, fontStyle: 'italic' }}>
            "{analogyA}" − "{analogyB}" + "{analogyC}" ≈ ...
          </div>
          {analogyResult.map((r, i) => (
            <div key={r.word} style={{ fontSize: 13, color: i === 0 ? t.accentPrimary : t.textSecondary, fontWeight: i === 0 ? 700 : 400 }}>
              {r.word} ({r.sim.toFixed(3)})
            </div>
          ))}
        </div>
      </div>
    </VisualizationContainer>
  );
}
