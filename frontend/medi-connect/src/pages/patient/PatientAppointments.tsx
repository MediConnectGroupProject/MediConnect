import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MockApi } from '../../services/mockApi';
import type { Appointment } from '../../types';

import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, UserIcon } from 'lucide-react';

export function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await MockApi.getPatientAppointments('u2'); // Hardcoded 'u2' for Jane Patient
        setAppointments(data);
      } catch (e) {
        console.error("Failed to fetch appointments", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-lg">{appt.doctorName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{appt.time}</span>
                    </div>
                  </div>
                  {appt.reason && <p className="text-sm text-gray-500">Reason: {appt.reason}</p>}
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge variant={appt.status === 'CONFIRMED' ? 'default' : 'outline'} className={appt.status === 'CONFIRMED' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {appt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
