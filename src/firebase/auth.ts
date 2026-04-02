import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth"
import type { AuthError, User } from "firebase/auth"
import { auth } from "./config"

function isPopupBlocked(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as AuthError).code === "auth/popup-blocked"
  )
}

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )
  return userCredential.user
}

export const registerUser = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )
  return userCredential.user
}

export const logoutUser = async () => {
  await signOut(auth)
}

export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
}

/**
 * Tries popup first; if the browser blocks it (common with strict blockers), falls back to a full-page redirect.
 * Returns `null` when redirect was started — the page will unload; completion is handled via `getRedirectResult`.
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  try {
    const { user } = await signInWithPopup(auth, provider)
    return user
  } catch (e) {
    if (isPopupBlocked(e)) {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }
}

export const signInWithGithub = async (): Promise<User | null> => {
  const provider = new GithubAuthProvider()
  try {
    const { user } = await signInWithPopup(auth, provider)
    return user
  } catch (e) {
    if (isPopupBlocked(e)) {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }
}
