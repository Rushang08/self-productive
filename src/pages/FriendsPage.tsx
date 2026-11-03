import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronRight, Search, X } from 'lucide-react'
import type { User } from 'firebase/auth'
import { useFriends, type Entry, type Person } from '../hooks/useFriends'
import { PersonAvatar } from '../components/Avatar'
import { FriendSheet } from '../components/FriendSheet'

type Result =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'self' }
  | { kind: 'error'; message: string }
  | { kind: 'found'; person: Person }

export function FriendsPage({ user, today }: { user: User; today: string }) {
  const f = useFriends()
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<Result>({ kind: 'idle' })
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState<Entry | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const all = [...f.friends, ...f.incoming, ...f.outgoing]
  const relation = (uid: string) => all.find((e) => e.person.uid === uid)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value) return
    if (value === user.email?.toLowerCase()) return setResult({ kind: 'self' })
    setResult({ kind: 'loading' })
    try {
      const person = await f.lookup(value)
      setResult(person ? { kind: 'found', person } : { kind: 'none' })
    } catch {
      setResult({ kind: 'error', message: "Couldn't search. Make sure the latest Firestore rules are published." })
    }
  }

  const act = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } catch {
      setResult({ kind: 'error', message: 'That did not work. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const found = result.kind === 'found' ? result.person : null
  const rel = found ? relation(found.uid) : undefined

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">Stay motivated together</p>
          <h1 className="display">Friends</h1>
        </div>
      </header>

      {f.error && <p className="error">{f.error}</p>}

      <section className="panel">
        <h3>Find a friend by email</h3>
        <form className="search" onSubmit={search}>
          <input
            className="input"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="friend@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (result.kind !== 'idle') setResult({ kind: 'idle' })
            }}
          />
          <button className="btn primary search-btn" type="submit" disabled={!email.trim() || result.kind === 'loading'} aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        {result.kind === 'loading' && <p className="hint search-note">Searching…</p>}
        {result.kind === 'self' && <p className="hint search-note">That's your own email.</p>}
        {result.kind === 'none' && (
          <p className="hint search-note">No one with that email has joined yet, or they've turned off discovery. Ask them to sign in to SelfProductive first.</p>
        )}
        {result.kind === 'error' && <p className="error search-note">{result.message}</p>}

        {found && (
          <motion.div className="person-row result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <PersonAvatar name={found.name} photo={found.photo} size={44} />
            <span className="habit-text">
              <strong>{found.name}</strong>
              <small>
                {rel?.friendship.status === 'accepted'
                  ? 'Already friends'
                  : rel
                    ? rel.friendship.requester === user.uid
                      ? 'Request sent'
                      : 'Wants to be your friend'
                    : 'On SelfProductive'}
              </small>
            </span>
            {!rel && (
              <button className="btn primary mini" disabled={busy} onClick={() => act(() => f.sendRequest(found))}>
                Add
              </button>
            )}
            {rel?.friendship.status === 'pending' && rel.friendship.requester !== user.uid && (
              <button className="btn primary mini" disabled={busy} onClick={() => act(() => f.accept(rel))}>
                Accept
              </button>
            )}
          </motion.div>
        )}
      </section>

      {f.incoming.length > 0 && (
        <>
          <h3 className="section-title">Requests</h3>
          <div className="group">
            {f.incoming.map((e) => (
              <div key={e.friendship.id} className="person-row">
                <PersonAvatar name={e.person.name} photo={e.person.photo} size={44} />
                <span className="habit-text">
                  <strong>{e.person.name}</strong>
                  <small>Wants to be your friend</small>
                </span>
                <button className="add-pill" aria-label={`Decline ${e.person.name}`} disabled={busy} onClick={() => act(() => f.remove(e))}>
                  <X size={16} />
                </button>
                <button className="add-pill added" aria-label={`Accept ${e.person.name}`} disabled={busy} onClick={() => act(() => f.accept(e))}>
                  <Check size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="section-title">Your friends</h3>
      {f.friends.length === 0 ? (
        <p className="hint">{f.ready ? 'No friends yet. Search by email above to add one.' : ' '}</p>
      ) : (
        <div className="group">
          {f.friends.map((e) => (
            <button
              key={e.friendship.id}
              className="person-row tap"
              onClick={() => {
                setSelected(e)
                setSheetOpen(true)
              }}
            >
              <PersonAvatar name={e.person.name} photo={e.person.photo} size={44} />
              <span className="habit-text">
                <strong>{e.person.name}</strong>
                <small>View productive days</small>
              </span>
              <ChevronRight size={18} className="chev" />
            </button>
          ))}
        </div>
      )}

      {f.outgoing.length > 0 && (
        <>
          <h3 className="section-title">Sent</h3>
          <div className="group">
            {f.outgoing.map((e) => (
              <div key={e.friendship.id} className="person-row">
                <PersonAvatar name={e.person.name} photo={e.person.photo} size={44} />
                <span className="habit-text">
                  <strong>{e.person.name}</strong>
                  <small>Waiting for them to accept</small>
                </span>
                <button className="chip" disabled={busy} onClick={() => act(() => f.remove(e))}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <section className="panel privacy">
        <div className="privacy-row">
          <div>
            <strong>Let people find me by email</strong>
            <p className="hint">Only someone who types your exact email can find you, and they still need your OK to see anything.</p>
          </div>
          <button
            className={`switch ${f.discoverable ? 'on' : ''}`}
            role="switch"
            aria-checked={f.discoverable}
            aria-label="Let people find me by email"
            onClick={() => f.setDiscoverable(!f.discoverable)}
          >
            <span />
          </button>
        </div>
        <p className="hint">Friends only ever see your daily score. Never your habit names, goals or notes.</p>
      </section>

      <FriendSheet
        open={sheetOpen}
        friend={selected?.person ?? null}
        today={today}
        onClose={() => setSheetOpen(false)}
        onRemove={() => {
          if (selected) void act(() => f.remove(selected)).then(() => setSheetOpen(false))
        }}
      />
    </div>
  )
}
