import { useEffect, useRef } from 'react'
import { dayNumber, lastDays, weekdayShort } from '../lib/dates'
import { dayScore } from '../lib/score'
import type { Habit, Logs } from '../lib/types'

interface Props {
  today: string
  selected: string
  habits: Habit[]
  logs: Logs
  onSelect: (key: string) => void
}

const R = 17
const C = 2 * Math.PI * R

export function DayStrip({ today, selected, habits, logs, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const days = lastDays(21, today)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div className="daystrip" ref={scroller} role="tablist" aria-label="Choose a day">
      {days.map((key) => {
        const score = dayScore(habits, logs, key) ?? 0
        const on = key === selected
        return (
          <button key={key} role="tab" aria-selected={on} className={`day ${on ? 'on' : ''}`} onClick={() => onSelect(key)}>
            <small>{weekdayShort(key).slice(0, 3)}</small>
            <span className="day-ring">
              <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden>
                <circle cx="19" cy="19" r={R} fill="none" style={{ stroke: 'var(--track)' }} strokeWidth="2" />
                <circle
                  cx="19"
                  cy="19"
                  r={R}
                  fill="none"
                  style={{ stroke: 'var(--accent)', transition: 'stroke-dashoffset .6s ease' }}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - score)}
                  transform="rotate(-90 19 19)"
                />
              </svg>
              <b>{dayNumber(key)}</b>
            </span>
          </button>
        )
      })}
    </div>
  )
}
