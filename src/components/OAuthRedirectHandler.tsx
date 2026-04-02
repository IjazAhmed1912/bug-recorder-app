import { getRedirectResult } from "firebase/auth"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/config"

/**
 * After signInWithRedirect, Firebase returns the user here. Sends them to the app inbox.
 * Safe to mount on every page — getRedirectResult is a no-op when not returning from OAuth.
 */
export default function OAuthRedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    void getRedirectResult(auth)
      .then((result) => {
        if (cancelled || !result?.user) return
        navigate("/dashboard", { replace: true })
      })
      .catch(() => {
        /* invalid/expired redirect state */
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  return null
}
