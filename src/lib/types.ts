export type HabitKind = 'check' | 'progress'

export interface Habit {
  id: string
  name: string
  /** Key into HABIT_ICONS */
  icon: string
  color: string
  kind: HabitKind
  /** Goal for `progress` habits (e.g. 10000 steps). Always 1 for `check` habits. */
  target: number
  unit: string
  /** Amount added by the + / − buttons. */
  step: number
  order: number
  /** YYYY-MM-DD the habit started counting from. */
  createdDate: string
}

export type HabitInput = Omit<Habit, 'id' | 'order' | 'createdDate'> & { id?: string }

/** habitId -> value logged for one day */
export type DayValues = Record<string, number>
/** YYYY-MM-DD -> values */
export type Logs = Record<string, DayValues>
