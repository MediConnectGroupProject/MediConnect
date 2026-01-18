import { AdminPortal } from "../pages/admin/AdminPortal";
import DoctorPortal from "../pages/doctor/DoctorPortal";
import { MLTPortal } from "../pages/mlt/MLTPortal";
import PatientPortal from "../pages/patient/PatientPotral";
import { PharmacistPortal } from "../pages/pharmacist/PharmacistPortal";
import { ReceptionistPortal } from "../pages/receptionist/ReceptionistPortal";


export const PortalRoutes = [
  {
    path: "admin",
    element: <AdminPortal />,
    roles: ['ADMIN']
  },
  {
    path: "doctor",
    element: <DoctorPortal />,
    roles: ['DOCTOR']
  },
  {
    path: "pharmacist",
    element: <PharmacistPortal />,
    roles: ['PHARMACIST']
  },
  {
    path: "receptionist",
    element: <ReceptionistPortal />,
    roles: ['RECEPTIONIST']
  },
  {
    path: "mlt",
    element: <MLTPortal />,
    roles: ['MLT']
  },
  {
    path: "patient",
    element: <PatientPortal />,
    roles: ['PATIENT']
  },
];