import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { RouteNames } from '../../utils/RouteNames';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { getAppointments, updateAppointmentStatus } from '../../api/doctorApi';
import type { Appointment } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, PlayCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

export function AppointmentList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments(new Date(), 'ALL');
      
      const mappedData = data.map((items: any) => ({
          id: items.appointmentId,
          patientName: `${items.patient.user.firstName} ${items.patient.user.lastName}`,
          patientId: items.patientId,
          date: new Date(items.date).toLocaleDateString(),
          time: new Date(items.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reason: items.reason || "General Consultation", 
          status: items.status,
          doctorId: items.doctorId,
          doctorName: ""
      }));

      // Filter only PENDING appointments for this list
      setAppointments(mappedData.filter((a: Appointment) => a.status === 'PENDING'));
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Poll to keep list fresh when UpNextCard active state changes
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartConsultation = async (appt: Appointment) => {
      try {
          await updateAppointmentStatus(appt.id, 'IN_PROGRESS');
          toast.success('Consultation Started');
          fetchAppointments(); // Refresh list to remove this item
          // Ideally trigger a global refresh or rely on UpNextCard's poller picking it up
      } catch (e) {
          toast.error('Failed to start consultation');
      }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No pending appointments.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{appt.patientName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{appt.time}</span>
                    </div>
                  </div>
                   {appt.reason && <p className="text-sm text-gray-600 italic">"{appt.reason}"</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">PENDING</Badge>
                  <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedPatient(appt)}>View</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStartConsultation(appt)}>
                          <PlayCircle className="h-3 w-3 mr-1" /> Start
                      </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600"/>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{selectedPatient.patientName}</h3>
                        <p className="text-sm text-gray-500">ID: {selectedPatient.patientId}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-gray-700">Appointment</p>
                        <p>{selectedPatient.date} at {selectedPatient.time}</p>
                    </div>
                     <div>
                        <p className="font-medium text-gray-700">Status</p>
                         <Badge variant="secondary">
                            {selectedPatient.status}
                        </Badge>
                    </div>
                    <div className="col-span-2">
                         <p className="font-medium text-gray-700">Reason for Visit</p>
                         <p className="bg-gray-50 p-2 rounded">{selectedPatient.reason}</p>
                    </div>
                 </div>

                 <div className="pt-2">
                     <h4 className="font-medium mb-2">History Summary</h4>
                     <p className="text-sm text-gray-600">No previous records found.</p>
                 </div>
                 
                 <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setSelectedPatient(null)}>Close</Button>
                    <Button onClick={() => {
                        navigate(RouteNames.DOCTOR_PORTAL, { state: { tab: 'patients', patientId: selectedPatient.patientId } });
                        setSelectedPatient(null);
                    }}>Full Profile</Button>


                 </div>
              </div>
            )}
           </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

