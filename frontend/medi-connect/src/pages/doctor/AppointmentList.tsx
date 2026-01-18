import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { RouteNames } from '../../utils/RouteNames';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';



import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

import { Button } from '../../components/ui/button';
import { MockApi } from '../../services/mockApi';
import type { Appointment } from '../../types';

import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

export function AppointmentList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await MockApi.getDoctorAppointments('u1'); // Hardcoded ID for now or get from Auth
        setAppointments(data);
      } catch (e) {
        console.error("Failed to fetch appointments", e);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments for today.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{appt.patientName}</span>
                  </div>
                  {/* ... date, time, reason ... */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{appt.time}</span>
                    </div>
                  </div>
                   {appt.reason && <p className="text-sm text-gray-600 italic">"{appt.reason}"</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={appt.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {appt.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setSelectedPatient(appt)}>View</Button>
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
                         <Badge variant={selectedPatient.status === 'CONFIRMED' ? 'default' : 'secondary'}>
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
                     <p className="text-sm text-gray-600">No previous records found for this dummy patient.</p>
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

