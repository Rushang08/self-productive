import type { Habit } from './types'
import { ALL_DAYS } from './schedule'

/** Muted, natural tones that sit well on both the light and dark themes. */
export const COLORS = ['#5f8a6f', '#c2674a', '#c79a3b', '#5b7a99', '#8a5a83', '#a8745a', '#3f8a8a', '#7d7468']

type Seed = Omit<Habit, 'order' | 'createdDate' | 'days'>

/** Deterministic ids make seeding idempotent if it ever runs twice. */
const DEFAULTS: Seed[] = [
  { id: 'gym', name: 'Hit the gym', icon: 'dumbbell', color: '#c2674a', kind: 'check', target: 1, unit: '', step: 1 },
  { id: 'steps', name: 'Steps', icon: 'footprints', color: '#5f8a6f', kind: 'progress', target: 10000, unit: 'steps', step: 1000 },
  { id: 'water', name: 'Water', icon: 'droplets', color: '#5b7a99', kind: 'progress', target: 3, unit: 'L', step: 0.25 },
  { id: 'sunscreen', name: 'Sunscreen', icon: 'sun', color: '#c79a3b', kind: 'check', target: 1, unit: '', step: 1 },
  { id: 'early', name: 'Woke up early', icon: 'alarm', color: '#8a5a83', kind: 'check', target: 1, unit: '', step: 1 },
  { id: 'learn', name: 'Learned something new', icon: 'book', color: '#3f8a8a', kind: 'check', target: 1, unit: '', step: 1 },
]

export const DEFAULT_HABITS: (Seed & { days: number[] })[] = DEFAULTS.map((h) => ({ ...h, days: ALL_DAYS }))
