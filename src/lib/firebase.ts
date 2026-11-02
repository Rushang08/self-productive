import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, type Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

// Firebase web config is public by design (it identifies the project, it doesn't grant access).
// Data is protected by firestore.rules and the Auth authorized-domains list.
// VITE_FIREBASE_* env vars override these defaults, e.g. to point at another project.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBW20f5FUW_BCm1V8uxXFdJ0JjDfpOGt2E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'self-productive.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'self-productive',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'self-productive.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '263695794440',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:263695794440:web:49470dcc6046b4f2072cbd',
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
