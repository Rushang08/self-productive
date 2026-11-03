import { useState } from 'react'
import { motion } from 'framer-motion'
import { BottomSheet } from './BottomSheet'
import { COLORS } from '../lib/defaults'
import { HabitIcon, ICON_KEYS } from '../lib/habitIcons'
import { ALL_DAYS, DAY_LETTER, DAY_ORDER, DAY_SHORT, WEEKDAYS, WEEKENDS, scheduleLabel } from '../lib/schedule'
import { useData } from '../hooks/useData'
import type { Habit, HabitKind } from '../lib/types'

interface Props {
  open: boolean
  /** Habit being edited, or null to create a new one. */
  habit: Habit | null
  onClose: () => void
}

export function HabitForm({ open, habit, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={habit ? 'Edit habit' : 'New habit'}>
      {/* Remounted per habit so the fields always start from the right values. */}
      <FormBody key={habit?.id ?? 'new'} habit={habit} onClose={onClose} />
    </BottomSheet>
  )
}

function FormBody({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
  const { habits, saveHabit, removeHabit } = useData()
  const [name, setName] = useState(habit?.name ?? '')
  const [icon, setIcon] = useState(habit?.icon ?? 'target')
  const [color, setColor] = useState(habit?.color ?? COLORS[0])
  const [kind, setKind] = useState<HabitKind>(habit?.kind ?? 'check')
  const [target, setTarget] = useState(String(habit?.target ?? 10))
  const [unit, setUnit] = useState(habit?.unit ?? '')
  const [step, setStep] = useState(String(habit?.step ?? 1))
  const [days, setDays] = useState<number[]>(habit?.days ?? ALL_DAYS)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const targetN = Number(target)
  const stepN = Number(step)
  const duplicate = habits.some((h) => h.id !== habit?.id && h.name.trim().toLowerCase() === name.trim().toLowerCase())
  const valid =
    name.trim().length > 0 && !duplicate && days.length > 0 && (kind === 'check' || (targetN > 0 && stepN > 0 && Number.isFinite(targetN) && Number.isFinite(stepN)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    saveHabit({ id: habit?.id, name, icon, color, kind, target: targetN, unit, step: stepN, days })
    onClose()
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label className="field">
        <span>Name</span>
        <input
          className="input"
          value={name}
          maxLength={40}
          placeholder="e.g. Read 20 pages"
          autoFocus={!habit}
          onChange={(e) => setName(e.target.value)}
        />
        {duplicate && <small className="field-err">You already have a habit with this name.</small>}
      </label>

      <div className="field">
        <span>Type</span>
        <div className="segmented" role="radiogroup">
          {(
            [
              ['check', 'Yes / No'],
              ['progress', 'Target'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
              {kind === k && <motion.i layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <em>{label}</em>
            </button>
          ))}
        </div>
      </div>

      {kind === 'progress' && (
        <motion.div className="grid3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <label className="field">
            <span>Daily goal</span>
            <input className="input" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
          <label className="field">
            <span>Unit</span>
            <input className="input" value={unit} maxLength={12} placeholder="pages" onChange={(e) => setUnit(e.target.value)} />
          </label>
          <label className="field">
            <span>Step (+/−)</span>
            <input className="input" inputMode="decimal" value={step} onChange={(e) => setStep(e.target.value)} />
          </label>
        </motion.div>
      )}

      <div className="field">
        <span>Repeats · {days.length ? scheduleLabel(days) : 'Pick at least one day'}</span>
        <div className="dow" role="group" aria-label="Days this habit repeats">
          {DAY_ORDER.map((d) => (
            <button
              key={d}
              type="button"
              className={days.includes(d) ? 'on' : ''}
              aria-pressed={days.includes(d)}
              aria-label={DAY_SHORT[d]}
              onClick={() => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
            >
              {DAY_LETTER[d]}
            </button>
          ))}
        </div>
        <div className="chips">
          <button type="button" className="chip" onClick={() => setDays(ALL_DAYS)}>
            Every day
          </button>
          <button type="button" className="chip" onClick={() => setDays(WEEKDAYS)}>
            Weekdays
          </button>
          <button type="button" className="chip" onClick={() => setDays(WEEKENDS)}>
            Weekends
          </button>
        </div>
      </div>

      <div className="field">
        <span>Icon</span>
        <div className="icon-grid" style={{ ['--hc' as string]: color }}>
          {ICON_KEYS.map((k) => (
            <button key={k} type="button" className={k === icon ? 'on' : ''} onClick={() => setIcon(k)} aria-label={k} aria-pressed={k === icon}>
              <HabitIcon name={k} size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>Colour</span>
        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={c === color ? 'on' : ''}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
              aria-pressed={c === color}
            />
          ))}
        </div>
      </div>

      <button className="btn primary" type="submit" disabled={!valid}>
        {habit ? 'Save changes' : 'Add habit'}
      </button>

      {habit && (
        <button
          type="button"
          className={`btn danger ${confirmDelete ? 'armed' : ''}`}
          onClick={() => {
            if (!confirmDelete) return setConfirmDelete(true)
            removeHabit(habit.id)
            onClose()
          }}
        >
          {confirmDelete ? 'Tap again to delete permanently' : 'Delete habit'}
        </button>
      )}
    </form>
  )
}
