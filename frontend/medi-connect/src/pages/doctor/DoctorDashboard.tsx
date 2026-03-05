import { useEffect, useState } from 'react';
import { AppointmentList } from './AppointmentList';
import { PrescriptionForm } from './PrescriptionForm';
import { DoctorStats } from './DoctorStats';
import { UpNextCard } from './UpNextCard';
import { getUpNextAppointment } from '../../api/doctorApi';
import type { Appointment } from '../../types';


export default function DoctorDashboard() {
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);

  const fetchUpNext = async () => {
      try {
          const data = await getUpNextAppointment();
          if (data) {
              const mapped: Appointment = {
                  id: data.appointmentId,
                  patientName: `${data.patient.user.firstName} ${data.patient.user.lastName}`,
                  patientId: data.patientId, 
                  date: data.date,
                  time: new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: data.status,
                  reason: "Regular Consultation",
                  doctorId: data.doctorId,
                  doctorName: ""
              };

              if (mapped.status === 'IN_PROGRESS') {
                  setActiveAppt(mapped);
                  setNextAppt(null); 
              } else {
                  setActiveAppt(null);
                  setNextAppt(mapped);
              }
          } else {
              setActiveAppt(null);
              setNextAppt(null);
          }
      } catch (e) {
          console.error("Failed to fetch up next", e);
      }
  };

  useEffect(() => {
      fetchUpNext();
      const interval = setInterval(fetchUpNext, 5000); // Poll every 5s
      return () => clearInterval(interval);
  }, []);


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
            <UpNextCard 
                activeAppointment={activeAppt} 
                nextAppointment={nextAppt} 
                onRefresh={fetchUpNext} 
            />
            <div className="grid grid-cols-1">
                 <AppointmentList activeAppointment={activeAppt} />
            </div>
        </div>

        {/* Right Column: New Prescription */}
        <div className="col-span-1">
            <PrescriptionForm activeAppointment={activeAppt} />
        </div>
      </div>
    </div>
  );
}

