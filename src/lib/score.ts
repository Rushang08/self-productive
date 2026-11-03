import { addDays, lastDays } from './dates'
import { isScheduled } from './schedule'
import type { Habit, Logs } from './types'

/** A day counts towards the streak when at least this share of habits is done. */
export const STREAK_THRESHOLD = 0.8

const targetOf = (h: Habit) => (h.kind === 'check' ? 1 : Math.max(h.target, 0.0001))

/** 0..1 completion of one habit for a given logged value. */
export const habitPct = (h: Habit, value = 0) => Math.min(1, Math.max(0, value) / targetOf(h))

/** A habit counts on `key` once it exists and only on the days it repeats. */
export const isActive = (h: Habit, key: string) => h.createdDate <= key && isScheduled(h.days, key)

/** Average completion of all habits scheduled on `key`; null if there were none. */
export function dayScore(habits: Habit[], logs: Logs, key: string): number | null {
  const active = habits.filter((h) => isActive(h, key))
  if (!active.length) return null
  const values = logs[key] ?? {}
  return active.reduce((sum, h) => sum + habitPct(h, values[h.id]), 0) / active.length
}

export const isDone = (score: number | null) => score !== null && score >= 0.9999

/** Consecutive fully-completed scheduled days for one habit. Today may still be in progress. */
export function habitStreak(h: Habit, logs: Logs, today: string): number {
  let count = 0
  for (let i = 0; i < 365; i++) {
    const key = addDays(today, -i)
    if (key < h.createdDate) break
    if (!isScheduled(h.days, key)) continue
    if (habitPct(h, logs[key]?.[h.id]) >= 1) count++
    else if (i > 0) break
  }
  return count
}

export type ScoreFn = (key: string) => number | null

/** Streaks from any per-day score source. Days with no score are skipped, not counted as misses. */
export function streaksFrom(getScore: ScoreFn, today: string, window = 365) {
  const days = lastDays(window, today)
  let best = 0
  let run = 0
  for (const key of days) {
    const s = getScore(key)
    if (s === null) continue
    run = s >= STREAK_THRESHOLD ? run + 1 : 0
    best = Math.max(best, run)
  }

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    const s = getScore(days[i])
    if (s === null) continue
    if (s >= STREAK_THRESHOLD) current++
    else if (days[i] === today) continue
    else break
  }
  return { current, best }
}

export function computeSummary(getScore: ScoreFn, today: string) {
  const { current, best } = streaksFrom(getScore, today)
  const scores = lastDays(30, today)
    .map(getScore)
    .filter((s): s is number => s !== null)
  const perfect = scores.filter(isDone).length
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : 0
  return { current, best, perfect, avg }
}

export type Summary = ReturnType<typeof computeSummary>

export function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)
}
