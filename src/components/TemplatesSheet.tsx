import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { HabitIcon } from '../lib/habitIcons'
import { fmt } from '../lib/score'
import { TEMPLATE_PACKS, toHabitInput, type TemplateHabit, type TemplatePack } from '../lib/templates'
import { useData } from '../hooks/useData'

const tint = (color: string): CSSProperties => ({ ['--hc' as string]: color })

const SECTIONS: { id: TemplatePack['section']; title: string }[] = [
  { id: 'pregnancy', title: 'Pregnancy planning' },
  { id: 'popular', title: 'Popular starter packs' },
]

const goalText = (h: TemplateHabit) => (h.kind === 'check' ? 'Yes / No' : `Goal: ${fmt(h.target)} ${h.unit}`)

export function TemplatesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { habits, addHabits } = useData()
  const [packId, setPackId] = useState<string | null>(null)
  // Added during this session; covers the moment before Firestore echoes the write back.
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) setPackId(null)
  }, [open])

  const have = new Set<string>(justAdded)
  habits.forEach((h) => h.templateId && have.add(h.templateId))

  const pack = TEMPLATE_PACKS.find((p) => p.id === packId) ?? null

  const add = (items: TemplateHabit[]) => {
    const fresh = items.filter((t) => !have.has(t.id))
    if (!fresh.length) return
    addHabits(fresh.map(toHabitInput))
    setJustAdded((prev) => new Set([...prev, ...fresh.map((t) => t.id)]))
    navigator.vibrate?.(10)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={pack ? pack.title : 'Habit templates'}>
      <AnimatePresence mode="wait" initial={false}>
        {pack ? (
          <motion.div key={pack.id} className="stack" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.18 }}>
            <button className="tpl-back" onClick={() => setPackId(null)}>
              <ChevronLeft size={16} /> All templates
            </button>
            <p className="hint">{pack.description}</p>
            {pack.disclaimer && <p className="tpl-note">{pack.disclaimer}</p>}

            <div className="group">
              {pack.habits.map((t) => {
                const added = have.has(t.id)
                return (
                  <div key={t.id} className="tpl-item" style={tint(t.color)}>
                    <span className="tile">
                      <HabitIcon name={t.icon} />
                    </span>
                    <span className="habit-text">
                      <strong>{t.name}</strong>
                      <small>{t.note ?? goalText(t)}</small>
                      {t.note && <small>{goalText(t)}</small>}
                    </span>
                    <button className={`add-pill ${added ? 'added' : ''}`} disabled={added} onClick={() => add([t])} aria-label={added ? `${t.name} added` : `Add ${t.name}`}>
                      {added ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                )
              })}
            </div>

            {(() => {
              const left = pack.habits.filter((t) => !have.has(t.id)).length
              return (
                <button className="btn primary" disabled={left === 0} onClick={() => add(pack.habits)}>
                  {left === 0 ? 'All added' : left === pack.habits.length ? `Add all ${left} habits` : `Add remaining ${left}`}
                </button>
              )
            })()}
          </motion.div>
        ) : (
          <motion.div key="list" className="stack" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
            {SECTIONS.map((s) => (
              <section key={s.id} className="tpl-section">
                <h4 className="section-title">{s.title}</h4>
                <div className="group">
                  {TEMPLATE_PACKS.filter((p) => p.section === s.id).map((p) => {
                    const n = p.habits.filter((t) => have.has(t.id)).length
                    return (
                      <button key={p.id} className="tpl-row" style={tint(p.color)} onClick={() => setPackId(p.id)}>
                        <span className="tile">
                          <HabitIcon name={p.icon} />
                        </span>
                        <span className="habit-text">
                          <strong>{p.title}</strong>
                          <small>
                            {p.subtitle} · {p.habits.length} habits{n > 0 ? ` · ${n} added` : ''}
                          </small>
                        </span>
                        <ChevronRight size={18} className="chev" />
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}
