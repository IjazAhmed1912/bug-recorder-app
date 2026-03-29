import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "./config"

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

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  const { user } = await signInWithPopup(auth, provider)
  return user
}

export const signInWithGithub = async () => {
  const provider = new GithubAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  return user
}
