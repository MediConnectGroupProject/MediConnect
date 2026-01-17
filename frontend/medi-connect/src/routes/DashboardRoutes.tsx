import AdminDashboard from "../pages/admin/AdminDashboard";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import MLTDashboard from "../pages/mlt/MLTDashboard";
import PatientDashboard from "../pages/patient/PatientDashboard";
import PharmacistDashboard from "../pages/pharmacist/PharmacistDashboard";

import ReceptionistDashboard from "../pages/receptionist/Receptionistdasboard";

export const DashboardRoutes = [
  {
    path: "admin",
    element: <AdminDashboard />,
    roles: ['ADMIN']
  },
  {
    path: "doctor",
    element: <DoctorDashboard />,
    roles: ['DOCTOR']
  },
  {
    path: "pharmacist",
    element: <PharmacistDashboard />,
    roles: ['PHARMACIST']
  },
  {
    path: "receptionist",
    element: <ReceptionistDashboard />,
    roles: ['RECEPTIONIST']
  },
  {
    path: "mlt",
    element: <MLTDashboard />,
    roles: ['MLT']
  },
  {
    path: "patient",
    element: <PatientDashboard />,
    roles: ['PATIENT']
  },
];