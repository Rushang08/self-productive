import { useEffect, useState } from 'react'
import { todayKey } from '../lib/dates'

/** Today's date key; updates itself if the app stays open past midnight. */
export function useToday() {
  const [today, setToday] = useState(todayKey)

  useEffect(() => {
    const check = () => setToday((prev) => (prev === todayKey() ? prev : todayKey()))
    const id = window.setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])

  return today
}
