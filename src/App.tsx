import { RouterProvider } from "react-router-dom"
import { router } from "./app/routes"

export default function App() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-zinc-900 antialiased">
      <RouterProvider router={router} />
    </div>
  )
}
