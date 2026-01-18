import { AppointmentList } from './AppointmentList';
import { PrescriptionForm } from './PrescriptionForm';
import { DoctorStats } from './DoctorStats';
import { UpNextCard } from './UpNextCard';


export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl px-2 font-bold text-gray-800">Doctor's Control Panel</h1>
         <span className="text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</span>
      </div>

      <DoctorStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Up Next & Appointments */}
        <div className="col-span-2 space-y-6">
            <UpNextCard />
            <div className="grid grid-cols-1">
                 <AppointmentList />
            </div>
        </div>

        {/* Right Column: New Prescription */}
        <div className="col-span-1">
            <PrescriptionForm />
        </div>
      </div>
    </div>
  );
}

