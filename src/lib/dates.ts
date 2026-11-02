const pad = (n: number) => String(n).padStart(2, '0')

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

export const addDays = (key: string, n: number) => {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/** `count` day keys in ascending order, ending at `endKey`. */
export const lastDays = (count: number, endKey: string) =>
  Array.from({ length: count }, (_, i) => addDays(endKey, i - (count - 1)))

export const formatLong = (key: string) =>
  fromKey(key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

export const weekdayShort = (key: string) =>
  fromKey(key).toLocaleDateString(undefined, { weekday: 'short' })

export const dayNumber = (key: string) => fromKey(key).getDate()

export const formatShort = (key: string) =>
  fromKey(key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}
