import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, type Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

const app = isFirebaseConfigured ? initializeApp(config) : null

// When unconfigured the app renders <SetupScreen/> and never touches these.
export const auth = (app ? getAuth(app) : null) as Auth
export const db = (
  app
    ? initializeFirestore(app, {
        // Offline-first: taps feel instant and sync when the connection returns.
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      })
    : null
) as Firestore

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
