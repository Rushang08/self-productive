import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Person {
  uid: string
  name: string
  photo: string | null
}

interface Friendship {
  id: string
  members: string[]
  requester: string
  status: 'pending' | 'accepted'
  names: Record<string, string>
  photos: Record<string, string | null>
}

export interface Entry {
  friendship: Friendship
  person: Person
}

interface FriendsContextValue {
  ready: boolean
  error: string | null
  discoverable: boolean
  setDiscoverable: (v: boolean) => void
  friends: Entry[]
  incoming: Entry[]
  outgoing: Entry[]
  /** Exact-email lookup. Returns null when nobody (discoverable) has that email. */
  lookup: (email: string) => Promise<Person | null>
  sendRequest: (person: Person) => Promise<void>
  accept: (entry: Entry) => Promise<void>
  /** Decline, cancel or unfriend: all delete the friendship. */
  remove: (entry: Entry) => Promise<void>
}

const FriendsContext = createContext<FriendsContextValue | null>(null)

const pairId = (a: string, b: string) => (a < b ? `${a}_${b}` : `${b}_${a}`)

export function FriendsProvider({ user, children }: { user: User; children: ReactNode }) {
  const uid = user.uid
  const email = user.email?.toLowerCase() ?? null
  const myName = user.displayName ?? email?.split('@')[0] ?? 'Someone'
  const myPhoto = user.photoURL ?? null

  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discoverable, setDiscoverableState] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const unsubUser = onSnapshot(
      doc(db, 'users', uid),
      (snap) => setDiscoverableState(snap.data()?.discoverable !== false),
      () => setDiscoverableState(true),
    )
    const unsubFriends = onSnapshot(
      query(collection(db, 'friendships'), where('members', 'array-contains', uid)),
      (snap) => {
        setFriendships(
          snap.docs.map((d) => {
            const data = d.data()
            return {
              id: d.id,
              members: data.members as string[],
              requester: data.requester as string,
              status: data.status === 'accepted' ? 'accepted' : 'pending',
              names: (data.names ?? {}) as Record<string, string>,
              photos: (data.photos ?? {}) as Record<string, string | null>,
            }
          }),
        )
        setReady(true)
        setError(null)
      },
      (e) => {
        setReady(true)
        setError(
          (e as { code?: string }).code === 'permission-denied'
            ? 'Friends is not set up yet. Publish the latest firestore.rules in the Firebase console.'
            : 'Could not load friends. Check your connection.',
        )
      },
    )
    return () => {
      unsubUser()
      unsubFriends()
    }
  }, [uid])

  // Publish (or withdraw) the lookup entry that lets people find me by exact email.
  useEffect(() => {
    if (!email || discoverable === undefined) return
    const ref = doc(db, 'emailIndex', email)
    if (discoverable) setDoc(ref, { uid, name: myName, photo: myPhoto }).catch(() => {})
    else deleteDoc(ref).catch(() => {})
  }, [uid, email, discoverable, myName, myPhoto])

  const setDiscoverable = useCallback(
    (v: boolean) => {
      setDoc(doc(db, 'users', uid), { discoverable: v }, { merge: true }).catch(() => {})
    },
    [uid],
  )

  const lookup = useCallback(async (raw: string) => {
    const key = raw.trim().toLowerCase()
    if (!key || key.includes('/')) return null
    const snap = await getDoc(doc(db, 'emailIndex', key))
    if (!snap.exists()) return null
    const d = snap.data()
    return { uid: d.uid as string, name: (d.name as string) || key.split('@')[0], photo: (d.photo as string | null) ?? null }
  }, [])

  const sendRequest = useCallback(
    async (person: Person) => {
      const members = [uid, person.uid].sort()
      await setDoc(doc(db, 'friendships', pairId(uid, person.uid)), {
        members,
        requester: uid,
        status: 'pending',
        names: { [uid]: myName, [person.uid]: person.name },
        photos: { [uid]: myPhoto, [person.uid]: person.photo },
        createdAt: serverTimestamp(),
      })
    },
    [uid, myName, myPhoto],
  )

  const accept = useCallback(async (e: Entry) => {
    await updateDoc(doc(db, 'friendships', e.friendship.id), { status: 'accepted' })
  }, [])

  const remove = useCallback(async (e: Entry) => {
    await deleteDoc(doc(db, 'friendships', e.friendship.id))
  }, [])

  const value = useMemo<FriendsContextValue>(() => {
    const entries: Entry[] = friendships.map((f) => {
      const other = f.members.find((m) => m !== uid) ?? ''
      return { friendship: f, person: { uid: other, name: f.names[other] ?? 'Friend', photo: f.photos[other] ?? null } }
    })
    const byName = (a: Entry, b: Entry) => a.person.name.localeCompare(b.person.name)
    return {
      ready,
      error,
      discoverable: discoverable !== false,
      setDiscoverable,
      friends: entries.filter((e) => e.friendship.status === 'accepted').sort(byName),
      incoming: entries.filter((e) => e.friendship.status === 'pending' && e.friendship.requester !== uid),
      outgoing: entries.filter((e) => e.friendship.status === 'pending' && e.friendship.requester === uid),
      lookup,
      sendRequest,
      accept,
      remove,
    }
  }, [friendships, uid, ready, error, discoverable, setDiscoverable, lookup, sendRequest, accept, remove])

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
}

export function useFriends() {
  const ctx = useContext(FriendsContext)
  if (!ctx) throw new Error('useFriends must be used inside <FriendsProvider>')
  return ctx
}
