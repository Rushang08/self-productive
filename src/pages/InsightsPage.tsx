import { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../hooks/useData'
import { formatShort, fromKey, lastDays, weekdayShort } from '../lib/dates'
import { dayScore, dayStreaks, habitPct, isActive, isDone, STREAK_THRESHOLD } from '../lib/score'

const mondayIndex = (key: string) => (fromKey(key).getDay() + 6) % 7

/** Discrete 0–4 intensity so the heatmap reads cleanly. */
const level = (s: number | null) => (s === null ? -1 : s <= 0 ? 0 : s < 0.34 ? 1 : s < 0.67 ? 2 : s < 0.9999 ? 3 : 4)

export function InsightsPage({ today }: { today: string }) {
  const { habits, logs } = useData()
  const [picked, setPicked] = useState<string | null>(null)

  const streaks = dayStreaks(habits, logs, today)
  const last30 = lastDays(30, today)
  const scores30 = last30.map((k) => dayScore(habits, logs, k)).filter((s): s is number => s !== null)
  const perfect = scores30.filter(isDone).length
  const avg = scores30.length ? Math.round((scores30.reduce((a, b) => a + b, 0) / scores30.length) * 100) : 0

  const week = lastDays(7, today)

  // 12 weeks, laid out as columns of Mon→Sun with today's weekday on the last column.
  const days = lastDays(84, today)
  const lead = mondayIndex(days[0])
  const cells: (string | null)[] = [...Array(lead).fill(null), ...days]
  while (cells.length % 7) cells.push(null)

  const habitRates = habits.map((h) => {
    const eligible = last30.filter((k) => isActive(h, k))
    const done = eligible.filter((k) => habitPct(h, logs[k]?.[h.id]) >= 1).length
    return { habit: h, rate: eligible.length ? done / eligible.length : null, done, total: eligible.length }
  })

  const stats = [
    { label: 'Current streak', value: streaks.current, unit: streaks.current === 1 ? 'day' : 'days' },
    { label: 'Best streak', value: streaks.best, unit: streaks.best === 1 ? 'day' : 'days' },
    { label: 'Complete days', value: perfect, unit: 'in 30 days' },
    { label: 'Average score', value: avg, unit: '% in 30 days' },
  ]

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">How you're doing</p>
          <h1 className="display">Insights</h1>
        </div>
      </header>

      <section className="stats">
        {stats.map((t, i) => (
          <motion.div key={t.label} className="stat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
            <em>{t.label}</em>
            <b>{t.value}</b>
            <small>{t.unit}</small>
          </motion.div>
        ))}
      </section>
      <p className="hint">A streak counts each day you complete at least {Math.round(STREAK_THRESHOLD * 100)}% of your habits.</p>

      <section className="panel">
        <h3>This week</h3>
        <div className="bars">
          {week.map((k, i) => {
            const s = dayScore(habits, logs, k) ?? 0
            return (
              <div key={k} className={`bar-col ${k === today ? 'today' : ''}`}>
                <span className="bar-num">{Math.round(s * 100)}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-v"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(s * 100, s > 0 ? 4 : 0)}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.04 }}
                  />
                </div>
                <small>{weekdayShort(k).slice(0, 1)}</small>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <h3>Last 12 weeks</h3>
        <div className="heat" role="grid" aria-label="Daily score heatmap" style={{ ['--cols' as string]: cells.length / 7 }}>
          {cells.map((k, i) => {
            if (!k || k > today) return <span key={i} className="heat-cell empty" />
            const s = dayScore(habits, logs, k)
            return (
              <button
                key={k}
                className={`heat-cell ${picked === k ? 'picked' : ''}`}
                data-l={level(s)}
                onClick={() => setPicked(picked === k ? null : k)}
                aria-label={`${formatShort(k)}: ${s === null ? 'no habits' : Math.round(s * 100) + '%'}`}
              />
            )
          })}
        </div>
        <div className="heat-foot">
          <span>
            {picked ? `${formatShort(picked)} · ${Math.round((dayScore(habits, logs, picked) ?? 0) * 100)}%` : 'Tap a day for details'}
          </span>
          <span className="legend" aria-hidden>
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <i key={l} className="heat-cell" data-l={l} />
            ))}
            More
          </span>
        </div>
      </section>

      <section className="panel">
        <h3>Consistency · last 30 days</h3>
        <div className="rates">
          {habitRates.length === 0 && <p className="hint">Add some habits to see how consistent you are.</p>}
          {habitRates.map(({ habit, rate, done, total }, i) => (
            <div key={habit.id} className="rate" style={{ ['--hc' as string]: habit.color }}>
              <div className="rate-top">
                <span>{habit.name}</span>
                <b>{rate === null ? '–' : `${Math.round(rate * 100)}%`}</b>
              </div>
              <div className="rate-track">
                <motion.div
                  className="rate-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(rate ?? 0) * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.04 }}
                />
              </div>
              <small>
                {done} of {total} days
              </small>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
