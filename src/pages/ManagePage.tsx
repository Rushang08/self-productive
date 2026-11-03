import { useEffect, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { ChevronRight, Download, GripVertical, LogOut, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import type { User } from 'firebase/auth'
import { useData } from '../hooks/useData'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { fmt } from '../lib/score'
import { DEFAULT_HABITS } from '../lib/defaults'
import { ALL_DAYS, scheduleLabel } from '../lib/schedule'
import { HabitIcon } from '../lib/habitIcons'
import type { Habit } from '../lib/types'
import { HabitForm } from '../components/HabitForm'
import { TemplatesSheet } from '../components/TemplatesSheet'
import { Avatar } from '../components/Avatar'

function Row({ habit, onEdit, onDrop }: { habit: Habit; onEdit: () => void; onDrop: () => void }) {
  const controls = useDragControls()
  const { removeHabit } = useData()
  const [armed, setArmed] = useState(false)

  // Two taps to delete; the first one disarms itself after a few seconds.
  useEffect(() => {
    if (!armed) return
    const t = window.setTimeout(() => setArmed(false), 3000)
    return () => window.clearTimeout(t)
  }, [armed])
  return (
    <Reorder.Item
      as="div"
      value={habit}
      dragListener={false}
      dragControls={controls}
      className="manage-row"
      style={{ ['--hc' as string]: habit.color }}
      whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,.18)', zIndex: 5 }}
      onDragEnd={onDrop}
    >
      <button className="grip" onPointerDown={(e) => controls.start(e)} aria-label={`Reorder ${habit.name}`}>
        <GripVertical size={18} />
      </button>
      <button className="manage-main" onClick={onEdit}>
        <span className="tile">
          <HabitIcon name={habit.icon} />
        </span>
        <span className="habit-text">
          <strong>{habit.name}</strong>
          <small>
            {habit.kind === 'check' ? 'Yes / No' : `Goal: ${fmt(habit.target)} ${habit.unit}`}
            {habit.days.length < ALL_DAYS.length && ` · ${scheduleLabel(habit.days)}`}
          </small>
        </span>
        <ChevronRight size={18} className="chev" />
      </button>
      <button
        className={`row-del ${armed ? 'armed' : ''}`}
        onClick={() => (armed ? removeHabit(habit.id) : setArmed(true))}
        aria-label={armed ? `Confirm delete ${habit.name}` : `Delete ${habit.name}`}
      >
        {armed ? 'Delete?' : <Trash2 size={17} />}
      </button>
    </Reorder.Item>
  )
}

interface Props {
  user: User
  onSignOut: () => void
}

export function ManagePage({ user, onSignOut }: Props) {
  const { habits, reorderHabits, restoreDefaults } = useData()
  const { canInstall, iosHint, install } = useInstallPrompt()
  const [items, setItems] = useState(habits)
  const latest = useRef(items)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [browsing, setBrowsing] = useState(false)

  useEffect(() => {
    setItems(habits)
  }, [habits])
  useEffect(() => {
    latest.current = items
  }, [items])

  const missingDefaults = DEFAULT_HABITS.filter((d) => !habits.some((h) => h.id === d.id)).length

  const persistOrder = () => {
    const ids = latest.current.map((h) => h.id)
    if (ids.join() !== habits.map((h) => h.id).join()) reorderHabits(ids)
  }

  const open = (h: Habit | null) => {
    setEditing(h)
    setFormOpen(true)
  }

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">Your daily routine</p>
          <h1 className="display">Habits</h1>
        </div>
      </header>

      <div className="group">
        <Reorder.Group axis="y" values={items} onReorder={setItems} as="div">
          {items.map((h) => (
            <Row key={h.id} habit={h} onEdit={() => open(h)} onDrop={persistOrder} />
          ))}
        </Reorder.Group>
        <button className="group-add" onClick={() => open(null)}>
          <Plus size={18} /> New habit
        </button>
        <button className="group-add" onClick={() => setBrowsing(true)}>
          <Sparkles size={18} /> Browse templates
        </button>
        {missingDefaults > 0 && (
          <button className="list-btn" onClick={restoreDefaults}>
            <RotateCcw size={18} /> Restore default habits ({missingDefaults})
          </button>
        )}
      </div>
      <p className="hint">
        These repeat automatically, so there is nothing to set up each day. Tap a habit to change its goal or the days it repeats, or the bin to delete it. Drag the handle to reorder.
      </p>

      <h3 className="section-title">Account</h3>
      <div className="group">
        <div className="account">
          <Avatar user={user} size={44} />
          <div className="account-text">
            <strong>{user.displayName ?? 'Signed in'}</strong>
            <small>{user.email}</small>
          </div>
        </div>
        {canInstall && (
          <button className="list-btn" onClick={install}>
            <Download size={18} /> Install app on this device
          </button>
        )}
        <button className="list-btn" onClick={onSignOut}>
          <LogOut size={18} /> Sign out
        </button>
      </div>
      {iosHint && <p className="hint">To install on iPhone: tap Share, then “Add to Home Screen”.</p>}

      <HabitForm open={formOpen} habit={editing} onClose={() => setFormOpen(false)} />
      <TemplatesSheet open={browsing} onClose={() => setBrowsing(false)} />
    </div>
  )
}
