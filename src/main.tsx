import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

import MissingFirebaseConfig from "./components/MissingFirebaseConfig"
import { hasFirebaseEnv } from "./firebase/env"

const rootEl = document.getElementById("root")
if (!rootEl) {
  throw new Error("Missing #root element in index.html")
}

if (!hasFirebaseEnv()) {
  createRoot(rootEl).render(
    <StrictMode>
      <MissingFirebaseConfig />
    </StrictMode>
  )
} else {
  void import("./main-app").then(({ mountMainApp }) => {
    mountMainApp(rootEl)
  })
}
