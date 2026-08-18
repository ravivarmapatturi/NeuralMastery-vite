import { useVizTokens, SPACING } from '../../theme/vizTokens';

interface LegendEntry {
  color: string;
  label: string;
}

export default function VisualizationLegend({ entries }: { entries: LegendEntry[] }) {
  const t = useVizTokens();
  return (
    <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap', fontSize: 12, color: t.textSecondary, marginTop: SPACING.xs }}>
      {entries.map((e) => (
        <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
          {e.label}
        </div>
      ))}
    </div>
  );
}
