import { motion } from 'framer-motion'
import { ChartNoAxesColumn, CircleCheckBig, SlidersHorizontal, Users } from 'lucide-react'

export type Tab = 'today' | 'insights' | 'friends' | 'manage'

const TABS = [
  { id: 'today', label: 'Today', Icon: CircleCheckBig },
  { id: 'insights', label: 'Insights', Icon: ChartNoAxesColumn },
  { id: 'friends', label: 'Friends', Icon: Users },
  { id: 'manage', label: 'Habits', Icon: SlidersHorizontal },
] as const

export function TabBar({ tab, onChange, badges = {} }: { tab: Tab; onChange: (t: Tab) => void; badges?: Partial<Record<Tab, number>> }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar-inner">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => onChange(id)} aria-current={tab === id ? 'page' : undefined}>
            {tab === id && <motion.span layoutId="tab-line" className="tab-line" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <span className="tab-icon">
              <Icon size={22} strokeWidth={tab === id ? 2 : 1.6} />
              {!!badges[id] && <i className="tab-badge">{badges[id]}</i>}
            </span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
