import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { addDays, todayKey } from '../lib/dates'
import { DEFAULT_HABITS } from '../lib/defaults'
import type { DayValues, Habit, HabitInput, Logs } from '../lib/types'

interface DataContextValue {
  habits: Habit[]
  logs: Logs
  ready: boolean
  error: string | null
  setValue: (date: string, habitId: string, value: number) => void
  saveHabit: (input: HabitInput) => void
  removeHabit: (id: string) => void
  reorderHabits: (ids: string[]) => void
}

const DataContext = createContext<DataContextValue | null>(null)

const HISTORY_DAYS = 365

const parseHabit = (id: string, d: Record<string, unknown>): Habit => ({
  id,
  name: String(d.name ?? 'Habit'),
  icon: String(d.icon ?? 'target'),
  color: String(d.color ?? '#5f8a6f'),
  kind: d.kind === 'progress' ? 'progress' : 'check',
  target: Number(d.target ?? 1) || 1,
  unit: String(d.unit ?? ''),
  step: Number(d.step ?? 1) || 1,
  order: Number(d.order ?? 0),
  createdDate: String(d.createdDate ?? '1970-01-01'),
})

export function DataProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<Logs>({})
  const [habitsReady, setHabitsReady] = useState(false)
  const [logsReady, setLogsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onError = useCallback((e: unknown) => {
    const code = (e as { code?: string }).code
    setError(
      code === 'permission-denied'
        ? 'Firestore denied access. Deploy firestore.rules and make sure Firestore is enabled.'
        : 'Could not sync with the server. Your changes are saved on this device.',
    )
  }, [])

  useEffect(() => {
    const habitsQ = query(collection(db, 'users', uid, 'habits'), orderBy('order'))
    const unsubHabits = onSnapshot(
      habitsQ,
      (snap) => {
        setHabits(snap.docs.map((d) => parseHabit(d.id, d.data())))
        setHabitsReady(true)
        setError(null)
      },
      onError,
    )

    const startKey = addDays(todayKey(), -(HISTORY_DAYS - 1))
    const logsQ = query(collection(db, 'users', uid, 'logs'), where(documentId(), '>=', startKey))
    const unsubLogs = onSnapshot(
      logsQ,
      (snap) => {
        const next: Logs = {}
        snap.forEach((d) => {
          next[d.id] = (d.data().values ?? {}) as DayValues
        })
        setLogs(next)
        setLogsReady(true)
      },
      onError,
    )

    // First sign-in: seed the starter habits once (flag lives on the user doc).
    const userRef = doc(db, 'users', uid)
    getDocFromServer(userRef)
      .then((snap) => {
        if (snap.data()?.seeded) return
        const batch = writeBatch(db)
        const created = todayKey()
        DEFAULT_HABITS.forEach((h, order) =>
          batch.set(doc(db, 'users', uid, 'habits', h.id), { ...h, order, createdDate: created }),
        )
        batch.set(userRef, { seeded: true, createdAt: serverTimestamp() }, { merge: true })
        return batch.commit()
      })
      .catch(() => {
        /* offline: retried on next launch */
      })

    return () => {
      unsubHabits()
      unsubLogs()
    }
  }, [uid, onError])

  const setValue = useCallback(
    (date: string, habitId: string, value: number) => {
      const v = Math.max(0, Math.round(value * 100) / 100)
      setDoc(
        doc(db, 'users', uid, 'logs', date),
        { values: { [habitId]: v }, updatedAt: serverTimestamp() },
        { merge: true },
      ).catch(onError)
    },
    [uid, onError],
  )

  const saveHabit = useCallback(
    (input: HabitInput) => {
      const { id, ...fields } = input
      const data = {
        ...fields,
        name: fields.name.trim(),
        unit: fields.unit.trim(),
        target: fields.kind === 'check' ? 1 : fields.target,
        step: fields.kind === 'check' ? 1 : fields.step,
      }
      if (id) {
        setDoc(doc(db, 'users', uid, 'habits', id), data, { merge: true }).catch(onError)
      } else {
        const ref = doc(collection(db, 'users', uid, 'habits'))
        const order = habits.reduce((m, h) => Math.max(m, h.order), -1) + 1
        setDoc(ref, { ...data, order, createdDate: todayKey() }).catch(onError)
      }
    },
    [uid, habits, onError],
  )

  const removeHabit = useCallback(
    (id: string) => {
      deleteDoc(doc(db, 'users', uid, 'habits', id)).catch(onError)
    },
    [uid, onError],
  )

  const reorderHabits = useCallback(
    (ids: string[]) => {
      const batch = writeBatch(db)
      ids.forEach((id, order) => batch.update(doc(db, 'users', uid, 'habits', id), { order }))
      batch.commit().catch(onError)
    },
    [uid, onError],
  )

  const value = useMemo(
    () => ({
      habits,
      logs,
      ready: habitsReady && logsReady,
      error,
      setValue,
      saveHabit,
      removeHabit,
      reorderHabits,
    }),
    [habits, logs, habitsReady, logsReady, error, setValue, saveHabit, removeHabit, reorderHabits],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
