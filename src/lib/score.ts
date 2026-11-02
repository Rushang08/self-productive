import { addDays, lastDays } from './dates'
import type { Habit, Logs } from './types'

/** A day counts towards the streak when at least this share of habits is done. */
export const STREAK_THRESHOLD = 0.8

const targetOf = (h: Habit) => (h.kind === 'check' ? 1 : Math.max(h.target, 0.0001))

/** 0..1 completion of one habit for a given logged value. */
export const habitPct = (h: Habit, value = 0) => Math.min(1, Math.max(0, value) / targetOf(h))

export const isActive = (h: Habit, key: string) => h.createdDate <= key

/** Average completion of all habits that existed on `key`; null if there were none. */
export function dayScore(habits: Habit[], logs: Logs, key: string): number | null {
  const active = habits.filter((h) => isActive(h, key))
  if (!active.length) return null
  const values = logs[key] ?? {}
  return active.reduce((sum, h) => sum + habitPct(h, values[h.id]), 0) / active.length
}

export const isDone = (score: number | null) => score !== null && score >= 0.9999

/** Consecutive fully-completed days for one habit. Today may still be in progress. */
export function habitStreak(h: Habit, logs: Logs, today: string): number {
  let count = 0
  let key = today
  if (habitPct(h, logs[key]?.[h.id]) < 1) key = addDays(key, -1)
  while (isActive(h, key) && habitPct(h, logs[key]?.[h.id]) >= 1) {
    count++
    key = addDays(key, -1)
  }
  return count
}

export function dayStreaks(habits: Habit[], logs: Logs, today: string, window = 365) {
  const days = lastDays(window, today)
  const ok = (key: string) => {
    const s = dayScore(habits, logs, key)
    return s !== null && s >= STREAK_THRESHOLD
  }

  let best = 0
  let run = 0
  for (const key of days) {
    run = ok(key) ? run + 1 : 0
    best = Math.max(best, run)
  }

  let current = 0
  let key = ok(today) ? today : addDays(today, -1)
  while (ok(key) && current < window) {
    current++
    key = addDays(key, -1)
  }
  return { current, best }
}

export function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)
}
