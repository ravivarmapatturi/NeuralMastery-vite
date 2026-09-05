// Pure, React-free gamification logic -- points, streaks, and weekly totals
// are all DERIVED from a real per-award event log, never independently
// incremented/decremented counters. That's a deliberate correctness
// choice, not just style: an independently-mutated "points" number or
// "current streak" counter can desync from real activity (double-award on
// a retry, drift after a merge across two devices) in ways that are hard
// to notice and harder to fix after the fact. A pure function of "what
// award events actually happened" can't drift -- recomputing it from
// scratch always gives the same, correct answer, and merging two devices'
// histories is a plain, safe set union (see mergeEvents) instead of a
// bespoke reconciliation for a mutable counter.

export type AwardKind = 'mark' | 'complete' | 'design';

export interface AwardEvent {
  permalink: string;
  kind: AwardKind;
  /** Local calendar date (YYYY-MM-DD) the award happened on -- used for
   * both the weekly-points window and the streak, and stored (not
   * recomputed from a raw timestamp) so a later change to how "today" is
   * computed can never rewrite history. */
  date: string;
  /** Points value at award time, stored (not looked up from the current
   * constants below) so a future point-value tuning never retroactively
   * changes a user's already-earned history. */
  points: number;
}

// Flat values, not scaled by problem difficulty -- difficulty is only
// ever prose ("Difficulty: Medium") in each practice-problem's MDX, not a
// structured, queryable field anywhere in the content pipeline. Scaling
// by it would mean either adding that structured metadata sitewide (a
// real, separate initiative) or faking a scale from unstructured text --
// a flat, honest value for "solved a problem" is the correct choice until
// that metadata genuinely exists.
export const MARK_UNDERSTOOD_POINTS = 10;
export const PROBLEM_COMPLETED_POINTS = 50;
// The biggest award in the system, deliberately -- a system-design
// challenge (write a real end-to-end design for a real problem, then
// self-assess against a rubric + the site's own real case-study
// walkthrough) is the deepest engagement this site can currently measure,
// genuinely more than a single practice problem's narrower scope.
export const SYSTEM_DESIGN_CHALLENGE_POINTS = 100;

/** Local (not UTC) calendar date as YYYY-MM-DD -- deliberately built from
 * Date's local getters, not toISOString() (which is UTC-based and would
 * flip to the next day for anyone west of UTC in their own evening) or a
 * locale-string parse (fragile/locale-dependent format). This is what
 * makes the streak reset at the user's real local midnight, not UTC
 * midnight. */
export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function hasAward(events: AwardEvent[], permalink: string, kind: AwardKind): boolean {
  return events.some((e) => e.permalink === permalink && e.kind === kind);
}

export function totalPoints(events: AwardEvent[]): number {
  return events.reduce((sum, e) => sum + e.points, 0);
}

/** Monday-anchored start of the local week containing `d`. Real, stated
 * limitation: this is each user's OWN local week, not one globally
 * synchronized boundary -- two users in different timezones have their
 * "this week" reset at different real moments. For a genuinely-minimal
 * weekly leaderboard that's an acceptable simplification (same category
 * of honest tradeoff as the WebGPU practice problem's single-workgroup
 * scoping), not something hidden. */
export function weekStartDateString(d: Date = new Date()): string {
  const day = d.getDay(); // 0=Sun .. 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return localDateString(monday);
}

/** Sum of points from events dated within the current local week --
 * string comparison against weekStart is valid chronological comparison
 * here specifically because every date is the same YYYY-MM-DD format. */
export function weeklyPoints(events: AwardEvent[], today: Date = new Date()): number {
  const start = weekStartDateString(today);
  return events.filter((e) => e.date >= start).reduce((sum, e) => sum + e.points, 0);
}

/** Consecutive-day streak ending today, counted backward from the most
 * recent active date. If today has no award yet, counts from yesterday
 * instead -- a streak that hasn't actually been broken yet (the user just
 * hasn't acted today) shouldn't show as 0, the same "still alive until
 * midnight" convention every real streak product uses. Purely a function
 * of which LOCAL dates have at least one award -- see the module comment
 * for why this is derived rather than an incremented/reset counter. */
export function computeStreak(activeDates: string[], today: Date = new Date()): number {
  const set = new Set(activeDates);
  const todayStr = localDateString(today);
  const cursor = new Date(today);
  if (!set.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(localDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Union of two devices' event logs, deduped by permalink+kind (the same
 * award can never legitimately happen twice, so the first copy found is
 * kept and the rest are dropped) -- never a raw concatenation, which
 * would double-count points for any page marked/completed on both
 * devices before they ever synced. */
export function mergeEvents(a: AwardEvent[], b: AwardEvent[]): AwardEvent[] {
  const merged = [...a];
  for (const e of b) {
    if (!hasAward(merged, e.permalink, e.kind)) merged.push(e);
  }
  return merged;
}

/** The one place a future leaderboard-identity decision (real name vs.
 * an anonymized handle) gets swapped in -- everything else reads a
 * display name through this function, never `user.displayName` directly. */
export function computeDisplayName(user: { displayName?: string | null; uid: string } | null | undefined): string {
  if (user?.displayName) return user.displayName;
  return `Learner_${user?.uid.slice(0, 6) ?? '000000'}`;
}
