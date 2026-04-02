import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { requireEnv } from "./env"

const firebaseConfig = {
  apiKey: requireEnv(
    "VITE_FIREBASE_API_KEY",
    import.meta.env.VITE_FIREBASE_API_KEY
  ),
  authDomain: requireEnv(
    "VITE_FIREBASE_AUTH_DOMAIN",
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  ),
  projectId: requireEnv(
    "VITE_FIREBASE_PROJECT_ID",
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  ),
  storageBucket: requireEnv(
    "VITE_FIREBASE_STORAGE_BUCKET",
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  ),
  messagingSenderId: requireEnv(
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: requireEnv(
    "VITE_FIREBASE_APP_ID",
    import.meta.env.VITE_FIREBASE_APP_ID
  ),
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
/** Long-polling fallback when WebSockets are blocked — often snappier on restrictive networks. */
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
})
export const storage = getStorage(app)
