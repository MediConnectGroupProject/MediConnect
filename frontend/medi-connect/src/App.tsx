import React from 'react'
import {createBrowserRouter , RouterProvider} from 'react-router-dom' 
import Login from './pages/Login'
import DoctorPortal from './pages/DoctorPortal'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/doctor-portal',
    element: <DoctorPortal />
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
