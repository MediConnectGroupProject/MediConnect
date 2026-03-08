import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppointmentList } from './AppointmentList';
import { PrescriptionForm } from './PrescriptionForm';
import { DoctorStats } from './DoctorStats';
import { UpNextCard } from './UpNextCard';
import { getUpNextAppointment } from '../../api/doctorApi';
import type { Appointment } from '../../types';


export default function DoctorDashboard() {
  const location = useLocation();
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  // When true, polling will not clear activeAppt — consultation was set directly from Portal state.
  // Cleared once the API itself returns IN_PROGRESS (backend polling catches up).
  const portalSetRef = useRef(false);

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
                  portalSetRef.current = false; // backend now sees it — hand off to normal polling
                  setActiveAppt(mapped);
                  setNextAppt(null);
              } else {
                  // Only clear activeAppt if it wasn't set by Portal state
                  if (!portalSetRef.current) {
                      setActiveAppt(null);
                      setNextAppt(mapped);
                  }
              }
          } else {
              if (!portalSetRef.current) {
                  setActiveAppt(null);
                  setNextAppt(null);
              }
          }
      } catch (e) {
          console.error("Failed to fetch up next", e);
      }
  };

  useEffect(() => {
      // Skip the initial fetch if we came from Portal with a started consultation —
      // fetchUpNext() only queries TODAY and would clear the activeAppt we're about to set.
      // The 5s polling will re-sync once the backend returns IN_PROGRESS for that date.
      const hasStartedFromPortal = !!(location.state as any)?.startedConsultation;
      if (!hasStartedFromPortal) {
          fetchUpNext();
      }
      const interval = setInterval(fetchUpNext, 5000);
      return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If navigated here from Portal after starting a consultation,
  // immediately set the active appointment from state without relying on
  // fetchUpNext() — which only queries today's date and would miss appointments
  // started from other dates in the Portal Schedule tab.
  useEffect(() => {
      const state = location.state as any;
      if (state?.startedConsultation) {
          const { id, patientName, patientId } = state.startedConsultation;
          portalSetRef.current = true; // Guard polling from clearing this
          setActiveAppt({
              id,
              patientName,
              patientId,
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'IN_PROGRESS',
              reason: 'Consultation',
              doctorId: '',
              doctorName: '',
          });
          setNextAppt(null);
          window.history.replaceState({}, '');
      }
  }, [location.state]);


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

