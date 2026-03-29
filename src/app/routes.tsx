import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import PageLoading from "../components/PageLoading"

const Landing = lazy(() => import("../pages/Landing"))
const Dashboard = lazy(() => import("../pages/Dashboard"))
const NewIssue = lazy(() => import("../pages/NewIssue"))
const IssueDetail = lazy(() => import("../pages/IssueDetail"))

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Suspense fallback={<PageLoading />}>
          <Landing />
        </Suspense>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <Suspense fallback={<PageLoading />}>
          <Dashboard />
        </Suspense>
      ),
    },
    {
      path: "/new",
      element: (
        <Suspense fallback={<PageLoading />}>
          <NewIssue />
        </Suspense>
      ),
    },
    {
      path: "/issues/:id",
      element: (
        <Suspense fallback={<PageLoading />}>
          <IssueDetail />
        </Suspense>
      ),
    },
  ],
  {
    // Must match vite.config `base` (e.g. GitHub Pages: base: '/repo-name/')
    basename: import.meta.env.BASE_URL,
  }
)
