import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MockApi } from '../../services/mockApi';
import type { Appointment } from '../../types';

import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await MockApi.getDoctorAppointments('u1'); // Hardcoded ID for now or get from Auth
        setAppointments(data);
      } catch (e) {
        console.error("Failed to fetch appointments", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <div>Loading appointments...</div>;

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
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
