import { useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const REDIRECT_FALLBACK = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment']
const SILENT = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )

  const signIn = useCallback(async () => {
    setError(null)
    setSigningIn(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      if (REDIRECT_FALLBACK.includes(code)) {
        // Some mobile / installed-PWA contexts can't open popups.
        await signInWithRedirect(auth, googleProvider)
        return
      }
      if (!SILENT.includes(code)) {
        setError(
          code === 'auth/unauthorized-domain'
            ? 'This domain is not authorised in Firebase Auth. Add it under Authentication → Settings → Authorized domains.'
            : code === 'auth/network-request-failed'
              ? 'No connection. Check your internet and try again.'
              : 'Sign-in failed. Please try again.',
        )
      }
    } finally {
      setSigningIn(false)
    }
  }, [])

  const signOut = useCallback(() => fbSignOut(auth), [])

  return { user, loading, error, signingIn, signIn, signOut }
}
