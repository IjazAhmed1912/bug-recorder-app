import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { envOr } from "./env"

const firebaseConfig = {
  apiKey: envOr(
    import.meta.env.VITE_FIREBASE_API_KEY,
    "AIzaSyC8HggLN9ZwUU04UamWCD8N8lqBhMgfI00"
  ),
  authDomain: envOr(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    "bug-recorder-app.firebaseapp.com"
  ),
  projectId: envOr(
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    "bug-recorder-app"
  ),
  storageBucket: envOr(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    "bug-recorder-app.firebasestorage.app"
  ),
  messagingSenderId: envOr(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    "479791588235"
  ),
  appId: envOr(
    import.meta.env.VITE_FIREBASE_APP_ID,
    "1:479791588235:web:feff28b3844a2a2092458e"
  ),
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
