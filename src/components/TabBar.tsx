import { motion } from 'framer-motion'
import { ChartNoAxesColumn, CircleCheckBig, SlidersHorizontal } from 'lucide-react'

export type Tab = 'today' | 'insights' | 'manage'

const TABS = [
  { id: 'today', label: 'Today', Icon: CircleCheckBig },
  { id: 'insights', label: 'Insights', Icon: ChartNoAxesColumn },
  { id: 'manage', label: 'Habits', Icon: SlidersHorizontal },
] as const

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-inner">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => onChange(id)} aria-current={tab === id ? 'page' : undefined}>
            {tab === id && <motion.span layoutId="tab-line" className="tab-line" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <Icon size={22} strokeWidth={tab === id ? 2 : 1.6} />
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
