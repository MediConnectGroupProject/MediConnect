
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import { RouteNames } from './utils/RouteNames'
import { DashboardLayout } from './pages/layouts/DashboardLayout'
import { DashboardRoutes } from './routes/DashboardRoutes'
import RoleGuard from './guards/RoleGuard'
import AuthGuard from './guards/AuthGuard'
import PublicRoute from './guards/PublicRoute'
import { PortalLayout } from './pages/layouts/PortalLayout'
import { PortalRoutes } from './routes/PortalRoutes'
import { Toaster } from 'react-hot-toast'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
        <PublicRoute><LandingPage /></PublicRoute>
    )
  },
  {
    path: '/register', // Explicit path for registration
    element: (
        <PublicRoute><Register /></PublicRoute>
    )
  },
  {
    path: RouteNames.LOGIN,
    element: (
      <PublicRoute><Login /></PublicRoute>
    ),
  },
  {
    path: RouteNames.VERIFY_EMAIL,
    element: <VerifyEmail />
  },
  {
    path: RouteNames.PORTAL,
    element: (
      <AuthGuard>
        <PortalLayout />
      </AuthGuard>
    ),
    children: PortalRoutes.map(route => ({
      path: route.path,
      element: (
        <RoleGuard allowedRoles={route.roles}>
          {route.element}
        </RoleGuard>
      ),
    })),
  },
  {
    path: RouteNames.DASHBOARD,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: DashboardRoutes.map(route => ({
      path: route.path,
      element: (
        <RoleGuard allowedRoles={route.roles}>
          {route.element}
        </RoleGuard>

      ),
    })),
  },
  {
    path: '/403',
    element: <h1>403  Access Denied</h1>,
  },
])



function App() {

  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  )
}


export default App
