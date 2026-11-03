import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { BottomSheet } from './BottomSheet'
import { Heatmap, StatsGrid, WeekBars } from './Charts'
import { PersonAvatar } from './Avatar'
import { computeSummary } from '../lib/score'
import type { Person } from '../hooks/useFriends'

interface Props {
  open: boolean
  friend: Person | null
  today: string
  onClose: () => void
  onRemove: () => void
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; days: Record<string, number> }

export function FriendSheet({ open, friend, today, onClose, onRemove }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title={friend?.name ?? 'Friend'}>
      {friend && <Body key={friend.uid} friend={friend} today={today} onRemove={onRemove} />}
    </BottomSheet>
  )
}

function Body({ friend, today, onRemove }: { friend: Person; today: string; onRemove: () => void }) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [confirm, setConfirm] = useState(false)

  useEffect(
    () =>
      onSnapshot(
        doc(db, 'scores', friend.uid),
        (snap) => setState({ status: 'ready', days: (snap.data()?.days ?? {}) as Record<string, number> }),
        () => setState({ status: 'error' }),
      ),
    [friend.uid],
  )

  const days = state.status === 'ready' ? state.days : {}
  const getScore = (k: string) => (k in days ? days[k] : null)
  const hasData = Object.keys(days).length > 0

  return (
    <div className="stack">
      <div className="friend-head">
        <PersonAvatar name={friend.name} photo={friend.photo} size={48} />
        <p className="hint">You can see {friend.name.split(' ')[0]}'s daily scores only. Habit names and details stay private.</p>
      </div>

      {state.status === 'loading' && <div className="skeleton friend-skel" />}
      {state.status === 'error' && <p className="error">Couldn't load their days. Check your connection and try again.</p>}
      {state.status === 'ready' && !hasData && <p className="tpl-note">No days to show yet. Scores appear once they start logging habits.</p>}
      {hasData && (
        <>
          <StatsGrid summary={computeSummary(getScore, today)} />
          <WeekBars today={today} getScore={getScore} />
          <Heatmap today={today} getScore={getScore} />
        </>
      )}

      <button
        type="button"
        className={`btn danger ${confirm ? 'armed' : ''}`}
        onClick={() => {
          if (!confirm) return setConfirm(true)
          onRemove()
        }}
      >
        {confirm ? 'Tap again to remove friend' : 'Remove friend'}
      </button>
    </div>
  )
}
