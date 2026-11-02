import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import type { User } from 'firebase/auth'
import { useData } from '../hooks/useData'
import { formatLong, greeting } from '../lib/dates'
import { dayScore, habitPct, habitStreak, isActive, isDone } from '../lib/score'
import { AnimatedNumber, ProgressRing } from '../components/ProgressRing'
import { DayStrip } from '../components/DayStrip'
import { HabitCard } from '../components/HabitCard'
import { HabitForm } from '../components/HabitForm'
import { Avatar } from '../components/Avatar'

const list = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }

const message = (score: number, hasHabits: boolean) => {
  if (!hasHabits) return 'Add your first habit to get started.'
  if (isDone(score)) return 'Every habit complete. Well done.'
  if (score >= 0.6) return 'Almost there. Finish strong.'
  if (score > 0) return 'A good start. Keep going.'
  return 'A fresh day. Make it count.'
}

interface Props {
  user: User
  today: string
  onOpenAccount: () => void
}

export function TodayPage({ user, today, onOpenAccount }: Props) {
  const { habits, logs, ready, setValue } = useData()
  const [selected, setSelected] = useState(today)
  const [adding, setAdding] = useState(false)

  const day = selected > today ? today : selected
  const active = habits.filter((h) => isActive(h, day))
  const score = dayScore(habits, logs, day) ?? 0
  const values = logs[day] ?? {}
  const doneCount = active.filter((h) => habitPct(h, values[h.id]) >= 1).length
  const complete = ready && active.length > 0 && isDone(score)

  const first = user.displayName?.split(' ')[0]

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">
            {greeting()}
            {first ? `, ${first}` : ''}
          </p>
          <h1 className="display">{formatLong(day)}</h1>
        </div>
        <button className="avatar-btn" onClick={onOpenAccount} aria-label="Account and settings">
          <Avatar user={user} size={40} />
        </button>
      </header>

      <DayStrip today={today} selected={day} habits={habits} logs={logs} onSelect={setSelected} />

      <section className="summary">
        <ProgressRing value={ready ? score : 0} size={104} stroke={5}>
          <AnimatePresence mode="wait" initial={false}>
            {complete ? (
              <motion.span key="done" className="ring-done" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                <Check size={32} strokeWidth={2.2} />
              </motion.span>
            ) : (
              <motion.span key="num" className="ring-num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnimatedNumber value={Math.round(score * 100)} />
                <i>%</i>
              </motion.span>
            )}
          </AnimatePresence>
        </ProgressRing>
        <div className="summary-text">
          <h2>{ready && active.length ? `${doneCount} of ${active.length} complete` : ' '}</h2>
          <p>{message(score, active.length > 0)}</p>
          {day !== today && (
            <button className="link" onClick={() => setSelected(today)}>
              Back to today
            </button>
          )}
        </div>
      </section>

      {!ready ? (
        <div className="group">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="habit skeleton" />
          ))}
        </div>
      ) : (
        <motion.div key={day} className="group" variants={list} initial="hidden" animate="show">
          {active.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              value={values[h.id] ?? 0}
              streak={habitStreak(h, logs, today)}
              onChange={(v) => setValue(day, h.id, v)}
            />
          ))}
          <button className="group-add" onClick={() => setAdding(true)}>
            <Plus size={18} /> Add a habit
          </button>
        </motion.div>
      )}

      <HabitForm open={adding} habit={null} onClose={() => setAdding(false)} />
    </div>
  )
}
