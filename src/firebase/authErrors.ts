import type { AuthError } from "firebase/auth"

function authCode(err: unknown): string | undefined {
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as AuthError).code === "string"
  ) {
    return (err as AuthError).code
  }
  return undefined
}

/** Maps Firebase Auth codes to short, actionable copy */
export function getAuthErrorMessage(err: unknown): string {
  const code = authCode(err)

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Wrong email or password. If you’re new here, use “Create an account” first."
    case "auth/user-not-found":
      return "No account for this email yet. Create an account or check the address."
    case "auth/invalid-email":
      return "That email doesn’t look valid. Check for typos."
    case "auth/user-disabled":
      return "This account has been disabled. Contact support."
    case "auth/email-already-in-use":
      return "This email is already registered. Sign in instead."
    case "auth/weak-password":
      return "Password must be at least 6 characters."
    case "auth/too-many-requests":
      return "Too many attempts. Wait a minute and try again."
    case "auth/network-request-failed":
      return "Network error. Check your connection."
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow popups for this site, or use the full-page sign-in we opened instead."
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. Try again when you’re ready."
    case "auth/cancelled-popup-request":
      return "Only one sign-in popup at a time. Close other popups and try again."
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method."
    case "auth/operation-not-allowed":
      return "This sign-in method isn’t enabled. Ask the developer to enable it in Firebase."
    case "auth/invalid-api-key":
    case "auth/configuration-not-found":
      return "App configuration error. Ask the developer to check Firebase setup."
    default:
      if (err instanceof Error && err.message) return err.message
      return "Something went wrong. Try again."
  }
}
