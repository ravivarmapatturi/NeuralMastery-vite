import { useVizTokens } from '../theme/vizTokens';
import { activityCounts, localDateString, type AwardEvent } from '../lib/gamification';

const WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Color intensity step for a day's real award count -- 5 real buckets
 * (0, 1, 2-3, 4-6, 7+), not a continuous scale, matching the same
 * discrete-bucket convention every real GitHub-style contribution
 * calendar uses (a continuous gradient reads as noise at this cell
 * size; buckets read as a clear signal). */
function intensity(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Real GitHub-contribution-style calendar of the last 12 weeks of award
 * activity -- built entirely from the real per-award event log's own
 * `date` field (see activityCounts in gamification.ts), not a separate
 * tracking mechanism. Weeks are columns (Sunday at the top of each), the
 * most recent COMPLETE week ends on the real current local week's
 * Saturday -- this week's own in-progress days are included too, in the
 * rightmost partial column.
 */
export default function ActivityHeatmap({ events }: { events: AwardEvent[] }) {
  const t = useVizTokens();
  const counts = activityCounts(events);

  // Explicit Date.now() -- a bare `new Date()` default does NOT respond to
  // vi.spyOn(Date, 'now') in tests (confirmed directly, see gamification.ts
  // module comment for the same gotcha in GamificationContext).
  const today = new Date(Date.now());
  const todayDow = today.getDay(); // 0 = Sunday
  // Walk back to the Sunday that starts this week, then WEEKS-1 more full
  // weeks before it, so the grid always begins on a real Sunday.
  const gridStart = new Date(today.getTime() - todayDow * DAY_MS - (WEEKS - 1) * 7 * DAY_MS);

  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(gridStart.getTime() + (w * 7 + d) * DAY_MS);
      if (cellDate > today) continue; // don't render future days
      const dateStr = localDateString(cellDate);
      week.push({ date: dateStr, count: counts[dateStr] ?? 0 });
    }
    weeks.push(week);
  }

  const colorForIntensity = (level: number): string => {
    if (level === 0) return t.border;
    const opacity = [0, 30, 55, 80, 100][level];
    return `color-mix(in srgb, ${t.accentPrimary} ${opacity}%, ${t.border})`;
  };

  const totalActiveDays = Object.keys(counts).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} award${cell.count === 1 ? '' : 's'}`}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 2,
                  background: colorForIntensity(intensity(cell.count)),
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 6 }}>
        {totalActiveDays} active day{totalActiveDays === 1 ? '' : 's'} in the last {WEEKS} weeks
      </div>
    </div>
  );
}
