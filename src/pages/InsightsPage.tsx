import { motion } from 'framer-motion'
import { useData } from '../hooks/useData'
import { lastDays } from '../lib/dates'
import { computeSummary, dayScore, habitPct, isActive } from '../lib/score'
import { Heatmap, StatsGrid, WeekBars } from '../components/Charts'

export function InsightsPage({ today }: { today: string }) {
  const { habits, logs } = useData()
  const getScore = (k: string) => dayScore(habits, logs, k)
  const summary = computeSummary(getScore, today)

  const last30 = lastDays(30, today)
  const habitRates = habits.map((h) => {
    const eligible = last30.filter((k) => isActive(h, k))
    const done = eligible.filter((k) => habitPct(h, logs[k]?.[h.id]) >= 1).length
    return { habit: h, rate: eligible.length ? done / eligible.length : null, done, total: eligible.length }
  })

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">How you're doing</p>
          <h1 className="display">Insights</h1>
        </div>
      </header>

      <StatsGrid summary={summary} />
      <WeekBars today={today} getScore={getScore} />
      <Heatmap today={today} getScore={getScore} />

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
