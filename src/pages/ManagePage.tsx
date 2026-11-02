import { useEffect, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { ChevronRight, Download, GripVertical, LogOut, Plus, Sparkles } from 'lucide-react'
import type { User } from 'firebase/auth'
import { useData } from '../hooks/useData'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { fmt } from '../lib/score'
import { HabitIcon } from '../lib/habitIcons'
import type { Habit } from '../lib/types'
import { HabitForm } from '../components/HabitForm'
import { TemplatesSheet } from '../components/TemplatesSheet'
import { Avatar } from '../components/Avatar'

function Row({ habit, onEdit, onDrop }: { habit: Habit; onEdit: () => void; onDrop: () => void }) {
  const controls = useDragControls()
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
          <small>{habit.kind === 'check' ? 'Yes / No' : `Goal: ${fmt(habit.target)} ${habit.unit}`}</small>
        </span>
        <ChevronRight size={18} className="chev" />
      </button>
    </Reorder.Item>
  )
}

interface Props {
  user: User
  onSignOut: () => void
}

export function ManagePage({ user, onSignOut }: Props) {
  const { habits, reorderHabits } = useData()
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
          <p className="eyebrow">Make it yours</p>
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
      </div>
      <p className="hint">Drag the handle to reorder. Tap a habit to edit it.</p>

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
