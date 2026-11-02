import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured } from './lib/firebase'
import { useAuth } from './hooks/useAuth'
import { DataProvider, useData } from './hooks/useData'
import { useToday } from './hooks/useToday'
import { TabBar, type Tab } from './components/TabBar'
import { TodayPage } from './pages/TodayPage'
import { InsightsPage } from './pages/InsightsPage'
import { ManagePage } from './pages/ManagePage'
import { LoginPage } from './pages/LoginPage'
import { SetupScreen } from './pages/SetupScreen'

function Splash() {
  return (
    <div className="splash">
      <div className="spinner" />
    </div>
  )
}

function Shell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('today')
  const today = useToday()
  const { error } = useData()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  return (
    <div className="shell">
      <AnimatePresence>
        {error && (
          <motion.div className="banner" role="status" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'today' && <TodayPage user={user} today={today} onOpenAccount={() => setTab('manage')} />}
          {tab === 'insights' && <InsightsPage today={today} />}
          {tab === 'manage' && <ManagePage user={user} onSignOut={onSignOut} />}
        </motion.main>
      </AnimatePresence>

      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}

function Root() {
  const { user, loading, error, signingIn, signIn, signOut } = useAuth()

  if (loading) return <Splash />
  if (!user) return <LoginPage onSignIn={signIn} signingIn={signingIn} error={error} />

  return (
    <DataProvider uid={user.uid}>
      <Shell user={user} onSignOut={signOut} />
    </DataProvider>
  )
}

export default function App() {
  return isFirebaseConfigured ? <Root /> : <SetupScreen />
}
