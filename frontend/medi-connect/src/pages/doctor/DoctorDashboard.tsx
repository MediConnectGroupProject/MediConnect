import { AppointmentList } from './AppointmentList';
import { PrescriptionForm } from './PrescriptionForm';
import { DoctorStats } from './DoctorStats';
import { UpNextCard } from './UpNextCard';


export default function DoctorDashboard() {

  //     case 'doctor':
  //       return {
  //         title: 'Doctor Dashboard',
  //         cards: [
  //           {
  //             title: "Today's Appointments",
  //             value: '8',
  //             description: 'Next: 10:30 AM - John Doe',
  //             icon: Calendar,
  //             action: () => onNavigate('doctor')
  //           },
  //           {
  //             title: 'Patient Queue',
  //             value: '3',
  //             description: 'Real-time updates',
  //             icon: Users,
  //             action: () => onNavigate('doctor')
  //           },
  //           {
  //             title: 'Prescriptions to Review',
  //             value: '5',
  //             description: '2 urgent requests',
  //             icon: FileText,
  //             action: () => onNavigate('doctor')
  //           },
  //           {
  //             title: 'New Patient Requests',
  //             value: '12',
  //             description: 'Pending acceptance',
  //             icon: PlusCircle,
  //             action: () => onNavigate('doctor')
  //           }
  //         ]
  //       };

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

