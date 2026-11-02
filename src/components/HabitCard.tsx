import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Flame, Minus, Plus } from 'lucide-react'
import type { Habit } from '../lib/types'
import { fmt, habitPct } from '../lib/score'
import { HabitIcon } from '../lib/habitIcons'
import { BottomSheet } from './BottomSheet'

interface Props {
  habit: Habit
  value: number
  streak: number
  onChange: (value: number) => void
}

const buzz = (ms = 10) => navigator.vibrate?.(ms)
const tint = (color: string): CSSProperties => ({ ['--hc' as string]: color })

export const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
}

function Streak({ n }: { n: number }) {
  if (n < 2) return null
  return (
    <span className="streak">
      <Flame size={12} strokeWidth={2} aria-hidden /> {n}-day streak
    </span>
  )
}

export function HabitCard({ habit, value, streak, onChange }: Props) {
  const pct = habitPct(habit, value)
  const done = pct >= 1
  const [sheet, setSheet] = useState(false)

  if (habit.kind === 'check') {
    return (
      <motion.button
        variants={rowVariants}
        className={`habit habit-check ${done ? 'is-done' : ''}`}
        style={tint(habit.color)}
        onClick={() => {
          buzz(done ? 6 : 12)
          onChange(done ? 0 : 1)
        }}
        aria-pressed={done}
      >
        <span className="tile">
          <HabitIcon name={habit.icon} />
        </span>
        <span className="habit-text">
          <strong>{habit.name}</strong>
          <small>
            {done ? 'Completed' : 'Not yet'}
            <Streak n={streak} />
          </small>
        </span>
        <span className="check" aria-hidden>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={false}
              animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />
          </svg>
        </span>
      </motion.button>
    )
  }

  const bump = (dir: 1 | -1) => {
    buzz()
    onChange(Math.max(0, value + dir * habit.step))
  }

  return (
    <>
      <motion.div variants={rowVariants} className={`habit habit-progress ${done ? 'is-done' : ''}`} style={tint(habit.color)}>
        <div className="habit-row">
          <span className="tile">
            <HabitIcon name={habit.icon} />
          </span>
          <span className="habit-text">
            <strong>{habit.name}</strong>
            <button className="habit-value" onClick={() => setSheet(true)} aria-label={`Set ${habit.name} manually`}>
              <b>{fmt(value)}</b> / {fmt(habit.target)} {habit.unit}
              <Streak n={streak} />
            </button>
          </span>
          <div className="stepper">
            <button onClick={() => bump(-1)} disabled={value <= 0} aria-label={`Decrease ${habit.name}`}>
              <Minus size={16} />
            </button>
            <button onClick={() => bump(1)} aria-label={`Increase ${habit.name}`}>
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
          <motion.div className="bar-fill" initial={false} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </motion.div>

      <ValueSheet open={sheet} habit={habit} value={value} onClose={() => setSheet(false)} onSave={onChange} />
    </>
  )
}

function ValueSheet({
  open,
  habit,
  value,
  onClose,
  onSave,
}: {
  open: boolean
  habit: Habit
  value: number
  onClose: () => void
  onSave: (v: number) => void
}) {
  const [text, setText] = useState(String(value))
  const [lastOpen, setLastOpen] = useState(open)

  // Reset the field each time the sheet opens.
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) setText(String(value))
  }

  const parsed = Number(text)
  const valid = text.trim() !== '' && Number.isFinite(parsed) && parsed >= 0
  const add = (n: number) => setText(String(Math.round(((parsed || 0) + n) * 100) / 100))

  return (
    <BottomSheet open={open} onClose={onClose} title={habit.name}>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          onSave(parsed)
          onClose()
        }}
      >
        <label className="field">
          <span>Total today ({habit.unit})</span>
          <input
            className="input big"
            inputMode="decimal"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </label>
        <div className="chips">
          <button type="button" className="chip" onClick={() => add(habit.step)}>
            +{fmt(habit.step)}
          </button>
          <button type="button" className="chip" onClick={() => add(habit.step * 5)}>
            +{fmt(habit.step * 5)}
          </button>
          <button type="button" className="chip" onClick={() => setText(String(habit.target))}>
            Set to goal
          </button>
          <button type="button" className="chip" onClick={() => setText('0')}>
            Clear
          </button>
        </div>
        <button className="btn primary" type="submit" disabled={!valid}>
          Save
        </button>
      </form>
    </BottomSheet>
  )
}
