import { AppointmentList } from './AppointmentList';
import { PrescriptionForm } from './PrescriptionForm';

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl px-2 font-bold text-gray-800">Doctor's Control Panel</h1>
         <span className="text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Appointments */}
        <AppointmentList />

        {/* Right Column: New Prescription */}
        <PrescriptionForm />
      </div>
    </div>
  );
}
