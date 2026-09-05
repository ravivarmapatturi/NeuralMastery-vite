import { describe, expect, it } from 'vitest'
import {
  localDateString,
  weekStartDateString,
  weeklyPoints,
  computeStreak,
  hasAward,
  totalPoints,
  mergeEvents,
  computeDisplayName,
  MARK_UNDERSTOOD_POINTS,
  PROBLEM_COMPLETED_POINTS,
  type AwardEvent,
} from './gamification'

describe('localDateString', () => {
  it('formats as local YYYY-MM-DD, zero-padded', () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe('2026-01-05') // month is 0-indexed in the Date constructor
    expect(localDateString(new Date(2026, 10, 23))).toBe('2026-11-23')
  })

  it('uses LOCAL getters, not UTC -- a date built from local Y/M/D round-trips exactly regardless of the runner\'s timezone', () => {
    const d = new Date(2026, 5, 15, 23, 59, 59) // 11:59:59pm local
    expect(localDateString(d)).toBe('2026-06-15')
  })
})

describe('weekStartDateString', () => {
  it('anchors to Monday for every day of a real week', () => {
    // 2026-09-07 is a real Monday (verified: Sep 2026 starts on a Tuesday).
    const monday = new Date(2026, 8, 7)
    expect(weekStartDateString(monday)).toBe('2026-09-07')
    expect(weekStartDateString(new Date(2026, 8, 8))).toBe('2026-09-07') // Tuesday
    expect(weekStartDateString(new Date(2026, 8, 10))).toBe('2026-09-07') // Thursday
    expect(weekStartDateString(new Date(2026, 8, 13))).toBe('2026-09-07') // Sunday -- still the SAME week as the Monday before it
    expect(weekStartDateString(new Date(2026, 8, 14))).toBe('2026-09-14') // next Monday -- new week
  })
})

describe('weeklyPoints', () => {
  it('sums only events dated within the current local week', () => {
    const today = new Date(2026, 8, 10) // Thursday, week starts 2026-09-07
    const events: AwardEvent[] = [
      { permalink: '/a', kind: 'mark', date: '2026-09-07', points: 10 }, // this week (Monday)
      { permalink: '/b', kind: 'mark', date: '2026-09-09', points: 10 }, // this week (Wednesday)
      { permalink: '/c', kind: 'complete', date: '2026-09-06', points: 50 }, // LAST week (Sunday before)
      { permalink: '/d', kind: 'complete', date: '2026-08-01', points: 50 }, // long ago
    ]
    expect(weeklyPoints(events, today)).toBe(20)
  })

  it('is 0 for an empty event log', () => {
    expect(weeklyPoints([], new Date(2026, 8, 10))).toBe(0)
  })
})

describe('computeStreak', () => {
  it('is 0 with no activity at all', () => {
    expect(computeStreak([], new Date(2026, 8, 10))).toBe(0)
  })

  it('counts today alone as a 1-day streak', () => {
    expect(computeStreak(['2026-09-10'], new Date(2026, 8, 10))).toBe(1)
  })

  it('counts N genuinely consecutive days ending today', () => {
    const dates = ['2026-09-08', '2026-09-09', '2026-09-10']
    expect(computeStreak(dates, new Date(2026, 8, 10))).toBe(3)
  })

  it('stays "alive" (does not show 0) when today has no activity yet but yesterday did', () => {
    const dates = ['2026-09-08', '2026-09-09'] // last active yesterday (the 9th), today is the 10th
    expect(computeStreak(dates, new Date(2026, 8, 10))).toBe(2)
  })

  it('resets to 0 on a genuinely missed day (gap before yesterday too)', () => {
    const dates = ['2026-09-05', '2026-09-06'] // nothing on the 7th, 8th, or 9th -- today is the 10th
    expect(computeStreak(dates, new Date(2026, 8, 10))).toBe(0)
  })

  it('a gap in the MIDDLE of the history stops the backward count exactly at the gap', () => {
    // Active today, yesterday, then a gap, then more (older, disconnected) activity.
    const dates = ['2026-09-01', '2026-09-02', '2026-09-09', '2026-09-10']
    expect(computeStreak(dates, new Date(2026, 8, 10))).toBe(2) // only the 9th+10th are consecutive-to-today
  })

  it('is correct across a real month boundary (no off-by-one from days-in-month)', () => {
    const dates = ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02']
    expect(computeStreak(dates, new Date(2026, 8, 2))).toBe(4)
  })

  it('duplicate dates in the log do not inflate the streak', () => {
    const dates = ['2026-09-10', '2026-09-10', '2026-09-09']
    expect(computeStreak(dates, new Date(2026, 8, 10))).toBe(2)
  })
})

describe('hasAward / totalPoints', () => {
  it('hasAward is true only for a matching permalink+kind pair', () => {
    const events: AwardEvent[] = [{ permalink: '/a', kind: 'mark', date: '2026-01-01', points: 10 }]
    expect(hasAward(events, '/a', 'mark')).toBe(true)
    expect(hasAward(events, '/a', 'complete')).toBe(false) // same permalink, different kind
    expect(hasAward(events, '/b', 'mark')).toBe(false)
  })

  it('totalPoints sums every event\'s recorded points', () => {
    const events: AwardEvent[] = [
      { permalink: '/a', kind: 'mark', date: '2026-01-01', points: MARK_UNDERSTOOD_POINTS },
      { permalink: '/b', kind: 'complete', date: '2026-01-01', points: PROBLEM_COMPLETED_POINTS },
    ]
    expect(totalPoints(events)).toBe(MARK_UNDERSTOOD_POINTS + PROBLEM_COMPLETED_POINTS)
  })
})

describe('mergeEvents', () => {
  it('unions two devices\' logs without dropping either side\'s unique events', () => {
    const a: AwardEvent[] = [{ permalink: '/a', kind: 'mark', date: '2026-01-01', points: 10 }]
    const b: AwardEvent[] = [{ permalink: '/b', kind: 'mark', date: '2026-01-02', points: 10 }]
    const merged = mergeEvents(a, b)
    expect(merged).toHaveLength(2)
    expect(hasAward(merged, '/a', 'mark')).toBe(true)
    expect(hasAward(merged, '/b', 'mark')).toBe(true)
  })

  it('the exact double-counting bug this exists to prevent: the SAME page marked understood on two devices before they ever synced must count ONCE, not twice', () => {
    const deviceA: AwardEvent[] = [{ permalink: '/same-page', kind: 'mark', date: '2026-01-01', points: 10 }]
    const deviceB: AwardEvent[] = [{ permalink: '/same-page', kind: 'mark', date: '2026-01-02', points: 10 }] // different date -- still a dupe by permalink+kind
    const merged = mergeEvents(deviceA, deviceB)
    expect(merged).toHaveLength(1)
    expect(totalPoints(merged)).toBe(10) // not 20
  })

  it('a page marked AND separately completed (different kinds) both survive the merge -- not the same award', () => {
    const a: AwardEvent[] = [{ permalink: '/p', kind: 'mark', date: '2026-01-01', points: 10 }]
    const b: AwardEvent[] = [{ permalink: '/p', kind: 'complete', date: '2026-01-01', points: 50 }]
    const merged = mergeEvents(a, b)
    expect(merged).toHaveLength(2)
    expect(totalPoints(merged)).toBe(60)
  })
})

describe('computeDisplayName', () => {
  it('uses the real Google display name when present', () => {
    expect(computeDisplayName({ displayName: 'Ravi Varma', uid: 'abc123def456' })).toBe('Ravi Varma')
  })

  it('falls back to a generic Learner_<id> when no display name is set', () => {
    expect(computeDisplayName({ displayName: null, uid: 'abc123def456' })).toBe('Learner_abc123')
  })

  it('handles a null/undefined user without throwing', () => {
    expect(computeDisplayName(null)).toBe('Learner_000000')
    expect(computeDisplayName(undefined)).toBe('Learner_000000')
  })
})
