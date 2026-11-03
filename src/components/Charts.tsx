import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatShort, fromKey, lastDays, weekdayShort } from '../lib/dates'
import { STREAK_THRESHOLD, type ScoreFn, type Summary } from '../lib/score'

const mondayIndex = (key: string) => (fromKey(key).getDay() + 6) % 7

/** Discrete 0–4 intensity so the heatmap reads cleanly. */
const level = (s: number | null) => (s === null ? -1 : s <= 0 ? 0 : s < 0.34 ? 1 : s < 0.67 ? 2 : s < 0.9999 ? 3 : 4)

export function StatsGrid({ summary }: { summary: Summary }) {
  const stats = [
    { label: 'Current streak', value: summary.current, unit: summary.current === 1 ? 'day' : 'days' },
    { label: 'Best streak', value: summary.best, unit: summary.best === 1 ? 'day' : 'days' },
    { label: 'Complete days', value: summary.perfect, unit: 'in 30 days' },
    { label: 'Average score', value: summary.avg, unit: '% in 30 days' },
  ]
  return (
    <>
      <section className="stats">
        {stats.map((t, i) => (
          <motion.div key={t.label} className="stat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
            <em>{t.label}</em>
            <b>{t.value}</b>
            <small>{t.unit}</small>
          </motion.div>
        ))}
      </section>
      <p className="hint">A streak counts each day with at least {Math.round(STREAK_THRESHOLD * 100)}% of habits complete.</p>
    </>
  )
}

export function WeekBars({ today, getScore }: { today: string; getScore: ScoreFn }) {
  return (
    <section className="panel">
      <h3>This week</h3>
      <div className="bars">
        {lastDays(7, today).map((k, i) => {
          const s = getScore(k) ?? 0
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
  )
}

export function Heatmap({ today, getScore }: { today: string; getScore: ScoreFn }) {
  const [picked, setPicked] = useState<string | null>(null)

  // 12 weeks, laid out as columns of Mon→Sun with today's weekday on the last column.
  const days = lastDays(84, today)
  const cells: (string | null)[] = [...Array(mondayIndex(days[0])).fill(null), ...days]
  while (cells.length % 7) cells.push(null)

  return (
    <section className="panel">
      <h3>Last 12 weeks</h3>
      <div className="heat" role="grid" aria-label="Daily score heatmap" style={{ ['--cols' as string]: cells.length / 7 }}>
        {cells.map((k, i) => {
          if (!k || k > today) return <span key={i} className="heat-cell empty" />
          const s = getScore(k)
          return (
            <button
              key={k}
              className={`heat-cell ${picked === k ? 'picked' : ''}`}
              data-l={level(s)}
              onClick={() => setPicked(picked === k ? null : k)}
              aria-label={`${formatShort(k)}: ${s === null ? 'no data' : Math.round(s * 100) + '%'}`}
            />
          )
        })}
      </div>
      <div className="heat-foot">
        <span>{picked ? `${formatShort(picked)} · ${isNaN(getScore(picked) ?? NaN) ? 'no data' : Math.round((getScore(picked) ?? 0) * 100) + '%'}` : 'Tap a day for details'}</span>
        <span className="legend" aria-hidden>
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className="heat-cell" data-l={l} />
          ))}
          More
        </span>
      </div>
    </section>
  )
}
