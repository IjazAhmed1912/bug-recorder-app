import { Outlet, createBrowserRouter } from "react-router-dom"
import Landing from "../pages/Landing"
import Dashboard from "../pages/Dashboard"
import NewIssue from "../pages/NewIssue"
import IssueDetail from "../pages/IssueDetail"
import NotFound from "../pages/NotFound"
import OAuthRedirectHandler from "../components/OAuthRedirectHandler"
import RouteErrorFallback from "../components/RouteErrorFallback"

function RootLayout() {
  return (
    <>
      <OAuthRedirectHandler />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <RouteErrorFallback />,
      children: [
        {
          index: true,
          element: <Landing />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "new",
          element: <NewIssue />,
        },
        {
          path: "issues/:id",
          element: <IssueDetail />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    // Must match vite.config `base` (e.g. GitHub Pages: base: '/repo-name/')
    basename: import.meta.env.BASE_URL,
  }
)
