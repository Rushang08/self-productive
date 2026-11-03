import { fromKey } from './dates'

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAYS = [1, 2, 3, 4, 5]
export const WEEKENDS = [0, 6]
/** Display order Monday → Sunday. Values follow Date#getDay (0 = Sunday). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const isScheduled = (days: number[], key: string) => days.includes(fromKey(key).getDay())

const same = (a: number[], b: number[]) => a.length === b.length && b.every((d) => a.includes(d))

export function scheduleLabel(days: number[]) {
  if (same(days, ALL_DAYS)) return 'Every day'
  if (same(days, WEEKDAYS)) return 'Weekdays'
  if (same(days, WEEKENDS)) return 'Weekends'
  return DAY_ORDER.filter((d) => days.includes(d))
    .map((d) => DAY_SHORT[d])
    .join(', ')
}
