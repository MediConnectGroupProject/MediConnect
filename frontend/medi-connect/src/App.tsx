import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import DoctorPortal from './pages/doctor/DoctorPortal'
import PatientPortal from './pages/patient/PatientPotral'
import VerifyEmail from './pages/VerifyEmail'
import { MLTPortal } from './pages/mlt/MLTPortal'
import { AdminPortal } from './pages/admin/Admin'
import { PharmacistPortal } from './pages/pharmacist/PharmacistPortal'
import { ReceptionistPortal } from './pages/receptionist/ReceptionistPortal'

import { RouteNames } from './utils/RouteNames'
import { DashboardLayout } from './pages/DashboardLayout'
import { DashboardRoutes } from './routes/DashboardRoutes'
import RoleGuard from './guards/RoleGuard'
import AuthGuard from './guards/AuthGuard'
import PublicRoute from './guards/PublicRoute'

const router = createBrowserRouter([
  {
    path: RouteNames.LOGIN,
    element: (
      <PublicRoute><Login /></PublicRoute>
    ),
  },
  {
    path: RouteNames.DOCTOR_PORTAL,
    element: <DoctorPortal />
  },
  {
    path: RouteNames.PATIENT_PORTAL,
    element: <PatientPortal />
  },
  {
    path: RouteNames.MLT_PORTAL,
    element: <MLTPortal />
  },
  {
    path: RouteNames.ADMIN_PORTAL,
    element: <AdminPortal />
  },
  {
    path: RouteNames.PHARMACIST_PORTAL,
    element: <PharmacistPortal />
  },
  {
    path: RouteNames.RECEPTIONIST_PORTAL,
    element: <ReceptionistPortal />
  },
  {
    path: RouteNames.VERIFY_EMAIL,
    element: <VerifyEmail />
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
      <RouterProvider router={router} />
    </>
  )
}

export default App
