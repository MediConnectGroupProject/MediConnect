import { PatientAppointments } from './PatientAppointments';
import { PatientPrescriptions } from './PatientPrescriptions';

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl px-2 font-bold text-gray-800">My Health Portal</h1>
         <span className="text-sm text-gray-500">Welcome back</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Appointments Section */}
        <PatientAppointments />

        {/* Prescriptions Section */}
        <PatientPrescriptions />
      </div>
    </div>
  );
}
